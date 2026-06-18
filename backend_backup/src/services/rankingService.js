const { 
  School, SchoolAchievement, SchoolActivity, MediaSubmission, MediaAsset,
  InspectionReport, InspectionRequest, SchoolScorePeriod, SchoolScoreComponent,
  SchoolRankHistory, SchoolRankSnapshot, RankTier, ScoreCategory, Badge, SchoolBadge,
  District, State
} = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

class RankingService {
  async recalculateSchoolScore(schoolId) {
    logger.info(`Recalculating score for School ID: ${schoolId}`);

    // 1. Academics (Max 300)
    // Derived from completed inspections. If no inspections, default to 150 points.
    const averageInspectionScore = await InspectionReport.findOne({
      attributes: [
        [InspectionReport.sequelize.fn('AVG', InspectionReport.sequelize.col('overall_rating')), 'avg_score']
      ],
      include: [{
        model: InspectionRequest,
        where: { school_id: schoolId, status: 'COMPLETED' },
        required: true,
        attributes: []
      }],
      raw: true
    });

    const avg = parseFloat(averageInspectionScore?.avg_score || '0');
    // Assuming inspection score is out of 100. Scaled to 300.
    const academicScore = avg > 0 ? Math.min(Math.round((avg / 100) * 300), 300) : 150; 

    // 2. Achievements (Max 300)
    // STATE = 40 pts, NATIONAL = 75 pts, INTERNATIONAL = 100 pts
    const achievements = await SchoolAchievement.findAll({
      where: { school_id: schoolId }
    });
    let achievementScore = 0;
    achievements.forEach(ach => {
      if (ach.achievement_level === 'STATE') achievementScore += 40;
      else if (ach.achievement_level === 'NATIONAL') achievementScore += 75;
      else if (ach.achievement_level === 'INTERNATIONAL') achievementScore += 100;
    });
    achievementScore = Math.min(achievementScore, 300);

    // 3. Media Uploads (Max 300)
    // Approved or Published submissions. 30 points per submission.
    const mediaCount = await MediaSubmission.count({
      where: {
        school_id: schoolId,
        status: { [Op.in]: ['SUPER_APPROVED', 'PUBLISHED'] }
      }
    });
    const mediaScore = Math.min(mediaCount * 30, 300);

    // 4. Participation (Max 100)
    // Count of completed activities. 10 points per activity. (Wait, let's query all completed activities)
    const activityCount = await SchoolActivity.count({
      where: {
        school_id: schoolId
      }
    });
    const participationScore = Math.min(activityCount * 10, 100);

    const totalScore = academicScore + achievementScore + mediaScore + participationScore;

    // 5. Tier Assignment
    // platinum (900-1000), gold (750-899), silver (500-749), bronze (250-499), not ranked (0-249)
    let tierName = 'Not Ranked';
    if (totalScore >= 900) tierName = 'Platinum';
    else if (totalScore >= 750) tierName = 'Gold';
    else if (totalScore >= 500) tierName = 'Silver';
    else if (totalScore >= 250) tierName = 'Bronze';

    let tier = await RankTier.findOne({ where: { tier_name: tierName } });
    if (!tier) {
      tier = await RankTier.create({
        tier_name: tierName,
        min_score: totalScore >= 900 ? 900 : totalScore >= 750 ? 750 : totalScore >= 500 ? 500 : totalScore >= 250 ? 250 : 0,
        max_score: totalScore >= 900 ? 1000 : totalScore >= 750 ? 899 : totalScore >= 500 ? 749 : totalScore >= 250 ? 499 : 249
      });
    }

    // Save/Update Period score (Current active semester / year range)
    const today = new Date();
    const startYear = today.getFullYear();
    const startDate = `${startYear}-01-01`;
    const endDate = `${startYear}-12-31`;

    let scorePeriod = await SchoolScorePeriod.findOne({
      where: { start_date: startDate }
    });

    if (!scorePeriod) {
      scorePeriod = await SchoolScorePeriod.create({
        period_name: `Period ${startYear}`,
        start_date: startDate,
        end_date: endDate,
        is_closed: 0
      });
    }

    // Load category definitions
    const categories = await ScoreCategory.findAll();
    const categoryMap = {};
    categories.forEach(c => {
      categoryMap[c.category_name] = c.id;
    });

    const scoreBreakdown = [
      { categoryName: 'Academics', value: academicScore },
      { categoryName: 'Achievements', value: achievementScore },
      { categoryName: 'Media Uploads', value: mediaScore },
      { categoryName: 'Participation', value: participationScore }
    ];

    for (const item of scoreBreakdown) {
      const catId = categoryMap[item.categoryName] || 1; // fallback
      let component = await SchoolScoreComponent.findOne({
        where: { school_id: schoolId, period_id: scorePeriod.id, category_id: catId }
      });
      if (!component) {
        await SchoolScoreComponent.create({
          school_id: schoolId,
          period_id: scorePeriod.id,
          category_id: catId,
          score: item.value,
          calculated_at: new Date()
        });
      } else {
        await component.update({
          score: item.value,
          calculated_at: new Date()
        });
      }
    }

    // Update School Rank History
    await SchoolRankHistory.create({
      school_id: schoolId,
      period_id: scorePeriod.id,
      tier_id: tier.id,
      total_score: totalScore
    });

    // Award Badge check: If Platinum, award "Top Tier Elite" badge
    if (tierName === 'Platinum') {
      const topBadge = await Badge.findOne({ where: { badge_name: 'Top Tier Elite' } });
      if (topBadge) {
        const alreadyAwarded = await SchoolBadge.findOne({
          where: { school_id: schoolId, badge_id: topBadge.id }
        });
        if (!alreadyAwarded) {
          await SchoolBadge.create({ school_id: schoolId, badge_id: topBadge.id });
        }
      }
    }

    return {
      schoolId,
      totalScore,
      tier: tierName,
      scorePeriodId: scorePeriod.id,
      breakdown: {
        academicScore,
        achievementScore,
        mediaScore,
        participationScore
      }
    };
  }

  async recalculateAllRankings() {
    logger.info('Recalculating global, state, and district ranks for all active schools');
    const schools = await School.findAll({ where: { status: 'APPROVED' } });
    
    // 1. Calculate scores for all schools
    const schoolScores = [];
    let activePeriodId = 1;
    for (const school of schools) {
      const result = await this.recalculateSchoolScore(school.id);
      activePeriodId = result.scorePeriodId;
      schoolScores.push({
        id: school.id,
        score: result.totalScore,
        tierId: (await RankTier.findOne({ where: { tier_name: result.tier } }))?.id || null,
        district_id: school.district_id
      });
    }

    // Sort schools by score descending
    schoolScores.sort((a, b) => b.score - a.score);

    // Fetch district state mappings
    const districts = await District.findAll({ include: [State] });
    const districtToStateMap = {};
    districts.forEach(d => {
      districtToStateMap[d.id] = d.state_id;
    });

    // 2. Compute Global, State, and District ranks
    const globalRanks = {};
    const stateRanks = {};
    const districtRanks = {};

    schoolScores.forEach((item, index) => {
      // Global rank
      globalRanks[item.id] = index + 1;

      // State rank
      const stateId = districtToStateMap[item.district_id];
      if (!stateRanks[stateId]) stateRanks[stateId] = [];
      stateRanks[stateId].push(item);

      // District rank
      const distId = item.district_id;
      if (!districtRanks[distId]) districtRanks[distId] = [];
      districtRanks[distId].push(item);
    });

    for (const item of schoolScores) {
      const stateId = districtToStateMap[item.district_id];
      
      const sRankArr = stateRanks[stateId] || [];
      const stateRank = sRankArr.findIndex(s => s.id === item.id) + 1;

      const dRankArr = districtRanks[item.district_id] || [];
      const districtRank = dRankArr.findIndex(d => d.id === item.id) + 1;

      const globalRank = globalRanks[item.id];

      // Read previous snapshot to calculate rank change
      const prevSnapshot = await SchoolRankSnapshot.findOne({
        where: { school_id: item.id, period_id: activePeriodId - 1 }
      });

      const previousRank = prevSnapshot ? prevSnapshot.global_rank : globalRank;
      const rankChange = previousRank - globalRank; // positive is improvement

      // Upsert snapshot
      let snapshot = await SchoolRankSnapshot.findOne({
        where: { school_id: item.id, period_id: activePeriodId }
      });

      if (!snapshot) {
        await SchoolRankSnapshot.create({
          school_id: item.id,
          period_id: activePeriodId,
          total_score: item.score,
          global_rank: globalRank,
          state_rank: stateRank,
          district_rank: districtRank,
          previous_rank: previousRank,
          rank_change: rankChange,
          tier_id: item.tierId,
          calculated_at: new Date()
        });
      } else {
        await snapshot.update({
          total_score: item.score,
          global_rank: globalRank,
          state_rank: stateRank,
          district_rank: districtRank,
          previous_rank: previousRank,
          rank_change: rankChange,
          tier_id: item.tierId,
          calculated_at: new Date()
        });
      }
    }

    logger.info('Rankings recalculation completed successfully');
    return schoolScores;
  }
}

module.exports = new RankingService();
