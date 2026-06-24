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
    logger.info(`Bypassing automatic score calculations and reading manual score for School ID: ${schoolId}`);

    const school = await School.findByPk(schoolId);
    if (!school) {
      throw new Error(`School with ID ${schoolId} not found`);
    }

    // Default to score 0 if score is not set
    const totalScore = school.total_score !== null && school.total_score !== undefined ? school.total_score : (school.score || 0);
    
    // Look up the corresponding tier from rank_tiers dynamically by score
    let tier = await RankTier.findOne({
      where: {
        min_score: { [Op.lte]: totalScore },
        max_score: { [Op.gte]: totalScore }
      }
    });

    // If still not found, fallback to 'No Rank'
    if (!tier) {
      tier = await RankTier.findOne({ where: { tier_name: 'No Rank' } });
    }

    const tierName = tier ? tier.tier_name : 'No Rank';
    const tierId = tier ? tier.id : null;

    // Automatically synchronize school's tier_id in database
    if (school.tier_id !== tierId) {
      await school.update({ tier_id: tierId });
    }

    // Get or create SchoolScorePeriod (for matching active semester / year range)
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

    // Update School Rank History
    await SchoolRankHistory.create({
      school_id: schoolId,
      period_id: scorePeriod.id,
      tier_id: tierId,
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
        academicScore: school.academic_score || 0,
        achievementScore: school.achievement_score || 0,
        mediaScore: school.media_score || 0,
        participationScore: school.participation_score || 0
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
