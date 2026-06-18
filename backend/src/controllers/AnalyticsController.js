const { School, MediaSubmission, SchoolRankSnapshot, SchoolScoreComponent, ScoreCategory, DistrictPerformanceSnapshot, District } = require('../models');
const { Op } = require('sequelize');

class AnalyticsController {
  async getNationalAnalytics(req, res) {
    try {
      const activeSchools = await School.count({ where: { status: 'APPROVED' } });
      const inactiveSchools = await School.count({ where: { status: { [Op.in]: ['PENDING', 'REJECTED', 'INACTIVE'] } } });
      const totalUploads = await MediaSubmission.count();
      
      const approvalTrends = await MediaSubmission.findAll({
        attributes: ['status', [MediaSubmission.sequelize.fn('COUNT', MediaSubmission.sequelize.col('id')), 'count']],
        group: ['status'],
        raw: true
      });

      const averagePerformance = await SchoolRankSnapshot.findOne({
        attributes: [
          [SchoolRankSnapshot.sequelize.fn('AVG', SchoolRankSnapshot.sequelize.col('total_score')), 'avg_score']
        ],
        raw: true
      });

      return res.status(200).json({
        success: true,
        message: 'National analytics fetched successfully',
        data: {
          metrics: {
            activeSchools,
            inactiveSchools,
            totalUploads,
            averageScore: parseFloat(averagePerformance?.avg_score || '0').toFixed(2)
          },
          approvalTrends,
          timestamp: new Date()
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch national analytics', errors: [error.message] });
    }
  }

  async getStateAnalytics(req, res) {
    try {
      const stateId = parseInt(req.params.id, 10);

      const stateSchools = await School.findAll({
        include: [{
          model: District,
          where: { state_id: stateId },
          required: true
        }],
        raw: true
      });

      const activeSchools = stateSchools.filter(s => s.status === 'APPROVED').length;
      const inactiveSchools = stateSchools.length - activeSchools;

      const schoolIds = stateSchools.map(s => s.id);
      
      const mediaUploads = await MediaSubmission.count({
        where: {
          school_id: { [Op.in]: schoolIds.length > 0 ? schoolIds : [0] }
        }
      });

      const districtStats = await DistrictPerformanceSnapshot.findAll({
        include: [{
          model: District,
          where: { state_id: stateId },
          required: true
        }]
      });

      return res.status(200).json({
        success: true,
        message: 'State analytics fetched successfully',
        data: {
          stateId,
          metrics: {
            totalSchools: stateSchools.length,
            activeSchools,
            inactiveSchools,
            mediaUploads
          },
          districtPerformance: districtStats,
          timestamp: new Date()
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch state analytics', errors: [error.message] });
    }
  }

  async getSchoolAnalytics(req, res) {
    try {
      const schoolId = parseInt(req.params.id, 10);

      const school = await School.findByPk(schoolId);
      if (!school) {
        return res.status(404).json({ success: false, message: 'School not found', errors: [] });
      }

      const rankSnapshot = await SchoolRankSnapshot.findOne({
        where: { school_id: schoolId },
        order: [['calculated_at', 'DESC']]
      });

      const scoreComponents = rankSnapshot ? await SchoolScoreComponent.findAll({
        where: { school_id: schoolId, period_id: rankSnapshot.period_id },
        include: [{ model: ScoreCategory }]
      }) : [];

      const scores = {
        totalScore: rankSnapshot ? parseFloat(rankSnapshot.total_score || '0') : 0,
        academic: 0,
        achievements: 0,
        media: 0,
        participation: 0
      };

      scoreComponents.forEach(c => {
        const catName = c.ScoreCategory?.category_name;
        if (catName === 'Academics') scores.academic = parseFloat(c.score || '0');
        else if (catName === 'Achievements') scores.achievements = parseFloat(c.score || '0');
        else if (catName === 'Media Uploads') scores.media = parseFloat(c.score || '0');
        else if (catName === 'Participation') scores.participation = parseFloat(c.score || '0');
      });

      const totalUploads = await MediaSubmission.count({
        where: { school_id: schoolId }
      });

      return res.status(200).json({
        success: true,
        message: 'School analytics fetched successfully',
        data: {
          school: {
            id: school.id,
            name: school.school_name,
            status: school.status
          },
          scores,
          totalMediaUploads: totalUploads,
          timestamp: new Date()
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch school analytics', errors: [error.message] });
    }
  }
}

module.exports = new AnalyticsController();
