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

    // 1. Academics (Max 100)
    // Derived from completed inspections. If no inspections, default to 50 points.
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
    // Inspection score is out of 100.
    const academicScore = avg > 0 ? Math.min(Math.round(avg), 100) : 50; 

    // 2. Achievements (Max 100)
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
    achievementScore = Math.min(achievementScore, 100);

    // 3. Media Uploads (Max 100)
    // Approved or Published submissions: 15 pts for standard, 20 pts for featured, capped at 100 pts.
    const mediaSubmissions = await MediaSubmission.findAll({
      where: {
        school_id: schoolId,
        status: { [Op.in]: ['APPROVED', 'SUPER_APPROVED', 'PUBLISHED'] }
      }
    });
    let mediaScore = 0;
    mediaSubmissions.forEach(sub => {
      if (sub.is_featured) {
        mediaScore += 20;
      } else {
        mediaScore += 15;
      }
    });
    mediaScore = Math.min(mediaScore, 100);

    // 4. Participation (Max 100)
    // Count of completed activities. 10 points per activity.
    const activityCount = await SchoolActivity.count({
      where: {
        school_id: schoolId
      }
    });
    const participationScore = Math.min(activityCount * 10, 100);

    // Total Score as the average of the four categories (out of 100)
    const totalScore = Math.round((academicScore + achievementScore + mediaScore + participationScore) / 4);

    // 5. Tier Assignment
    // Platinum (>= 70), Gold (>= 50), Silver (>= 20), Bronze (>= 10), Not Ranked (< 10)
    let tierName = 'Not Ranked';
    if (totalScore >= 70) tierName = 'Platinum';
    else if (totalScore >= 50) tierName = 'Gold';
    else if (totalScore >= 20) tierName = 'Silver';
    else if (totalScore >= 10) tierName = 'Bronze';

    const thresholds = {
      'Platinum': { min: 70, max: 100 },
      'Gold': { min: 50, max: 69 },
      'Silver': { min: 20, max: 49 },
      'Bronze': { min: 10, max: 19 },
      'Not Ranked': { min: 0, max: 9 }
    };
    
    const currentThreshold = thresholds[tierName] || { min: 0, max: 9 };

    // Sync all thresholds to make sure database values align perfectly
    for (const [name, bounds] of Object.entries(thresholds)) {
      let t = await RankTier.findOne({ where: { tier_name: name } });
      if (!t) {
        await RankTier.create({
          tier_name: name,
          min_score: bounds.min,
          max_score: bounds.max
        });
      } else if (t.min_score !== bounds.min || t.max_score !== bounds.max) {
        await t.update({
          min_score: bounds.min,
          max_score: bounds.max
        });
      }
    }

    let tier = await RankTier.findOne({ where: { tier_name: tierName } });

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
