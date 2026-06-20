const rankingService = require('../services/rankingService');
const { SchoolRankHistory, SchoolRankSnapshot, School, RankTier, SchoolScorePeriod, SchoolScoreComponent, ScoreCategory } = require('../models');

class RankingController {
  async getRankings(req, res) {
    try {
      const activePeriod = await SchoolScorePeriod.findOne({
        order: [['start_date', 'DESC']]
      });

      const schoolInclude = {
        model: School,
        required: true,
        include: [
          {
            model: require('../models').District,
            include: [{
              model: require('../models').State,
              include: [{
                model: require('../models').RegionalAdminScope,
                include: [{
                  model: require('../models').User,
                  attributes: ['id', 'email', 'first_name', 'last_name']
                }]
              }]
            }],
            where: {}
          },
          {
            model: SchoolScoreComponent,
            required: false,
            where: activePeriod ? { period_id: activePeriod.id } : {},
            include: [{
              model: ScoreCategory
            }]
          }
        ],
        where: {}
      };

      if (req.user.rolesList.includes('REGIONAL_ADMIN')) {
        schoolInclude.include[0].where = { state_id: req.user.scope.stateIds };
      } else if (req.user.rolesList.includes('DISTRICT_ADMIN')) {
        schoolInclude.where = { district_id: req.user.scope.districtId };
      } else if (req.user.rolesList.includes('SCHOOL_ADMIN')) {
        schoolInclude.where = { id: req.user.scope.schoolId };
      }

      const rankings = await SchoolRankSnapshot.findAll({
        where: activePeriod ? { period_id: activePeriod.id } : {},
        order: [['global_rank', 'ASC']],
        include: [
          schoolInclude,
          { model: RankTier }
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'Rankings fetched successfully',
        data: rankings
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch rankings', errors: [error.message] });
    }
  }

  async getStateRankings(req, res) {
    try {
      const stateId = parseInt(req.params.id, 10);
      const activePeriod = await SchoolScorePeriod.findOne({
        order: [['start_date', 'DESC']]
      });

      const rankings = await SchoolRankSnapshot.findAll({
        where: activePeriod ? { period_id: activePeriod.id } : {},
        order: [['state_rank', 'ASC']],
        include: [
          {
            model: School,
            required: true,
            include: [
              {
                association: 'District',
                where: { state_id: stateId },
                required: true
              },
              {
                model: SchoolScoreComponent,
                required: false,
                where: activePeriod ? { period_id: activePeriod.id } : {},
                include: [{
                  model: ScoreCategory
                }]
              }
            ]
          },
          { model: RankTier }
        ]
      });

      return res.status(200).json({
        success: true,
        message: 'State rankings fetched successfully',
        data: rankings
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch state rankings', errors: [error.message] });
    }
  }

  async getSchoolRanking(req, res) {
    try {
      const schoolId = parseInt(req.params.id, 10);
      
      const history = await SchoolRankHistory.findAll({
        where: { school_id: schoolId },
        order: [['created_at', 'DESC']],
        limit: 10,
        include: [{ model: RankTier }]
      });

      const activePeriod = await SchoolScorePeriod.findOne({
        order: [['start_date', 'DESC']]
      });

      const currentSnapshot = await SchoolRankSnapshot.findOne({
        where: {
          school_id: schoolId,
          ...(activePeriod ? { period_id: activePeriod.id } : {})
        },
        include: [{ model: RankTier }]
      });

      const responsePayload = {
        current: currentSnapshot,
        history
      };
      const logger = require('../config/logger');
      logger.info(`[DEBUG_LOG] Ranking API response: ${JSON.stringify(responsePayload)}`);
      return res.status(200).json({
        success: true,
        message: 'School rank details fetched successfully',
        data: responsePayload
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch school rankings', errors: [error.message] });
    }
  }

  async recalculateRankings(req, res) {
    try {
      const scores = await rankingService.recalculateAllRankings();
      return res.status(200).json({
        success: true,
        message: 'Rankings recalculation triggered successfully',
        data: scores
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Recalculation failed', errors: [error.message] });
    }
  }
}

module.exports = new RankingController();
