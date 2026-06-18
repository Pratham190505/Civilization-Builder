const rankingService = require('../services/rankingService');
const { SchoolRankHistory, SchoolRankSnapshot, School, RankTier, SchoolScorePeriod } = require('../models');

class RankingController {
  async getRankings(req, res) {
    try {
      const activePeriod = await SchoolScorePeriod.findOne({
        order: [['start_date', 'DESC']]
      });

      const rankings = await SchoolRankSnapshot.findAll({
        where: activePeriod ? { period_id: activePeriod.id } : {},
        order: [['global_rank', 'ASC']],
        include: [{ model: School, include: ['District'] }, { model: RankTier }]
      });

      return res.status(200).json({
        success: true,
        message: 'Global rankings fetched successfully',
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
            include: [{
              association: 'District',
              where: { state_id: stateId },
              required: true
            }]
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
        order: [['calculated_at', 'DESC']],
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

      return res.status(200).json({
        success: true,
        message: 'School rank details fetched successfully',
        data: {
          current: currentSnapshot,
          history
        }
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
