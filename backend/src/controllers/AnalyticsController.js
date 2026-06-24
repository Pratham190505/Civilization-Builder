const { School, MediaSubmission, SchoolRankSnapshot, SchoolScoreComponent, ScoreCategory, DistrictPerformanceSnapshot, District, RankTier, SchoolRankHistory, SchoolScorePeriod, User, InspectionRequest, RegionalAdminScope, sequelize } = require('../models');
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

      // 1. rankingDistribution: Active schools count per tier
      const allTiers = await RankTier.findAll({ raw: true });
      const snapshots = await SchoolRankSnapshot.findAll({
        include: [{
          model: School,
          where: { status: 'APPROVED' },
          attributes: []
        }],
        raw: true
      });

      const tierCounts = {};
      snapshots.forEach(s => {
        tierCounts[s.tier_id] = (tierCounts[s.tier_id] || 0) + 1;
      });

      const rankingDistribution = allTiers.map(tier => ({
        tier: tier.tier_name,
        count: tierCounts[tier.id] || 0,
        color: tier.color || '#808080'
      }));

      // 2. scoreBreakdown: Average score for each component (Academics, Achievements, Media Uploads, Participation)
      const categoryAverages = await SchoolScoreComponent.findAll({
        attributes: [
          'category_id',
          [SchoolScoreComponent.sequelize.fn('AVG', SchoolScoreComponent.sequelize.col('SchoolScoreComponent.score')), 'avg_score']
        ],
        include: [{
          model: School,
          attributes: [],
          where: { status: 'APPROVED' }
        }, {
          model: ScoreCategory,
          attributes: ['category_name']
        }],
        group: ['category_id', 'ScoreCategory.id'],
        raw: true,
        nest: true
      });

      const scoreBreakdownMap = {
        'Academics': 0,
        'Achievements': 0,
        'Media Uploads': 0,
        'Participation': 0
      };
      categoryAverages.forEach(c => {
        const name = c.ScoreCategory?.category_name;
        if (name && scoreBreakdownMap[name] !== undefined) {
          scoreBreakdownMap[name] = parseFloat(parseFloat(c.avg_score || '0').toFixed(2));
        }
      });
      const scoreBreakdown = Object.keys(scoreBreakdownMap).map(key => ({
        category: key,
        average: scoreBreakdownMap[key]
      }));

      // 3. rankingTrends: History of average scores per period
      const trendData = await SchoolRankHistory.findAll({
        attributes: [
          'period_id',
          [SchoolRankHistory.sequelize.fn('AVG', SchoolRankHistory.sequelize.col('SchoolRankHistory.total_score')), 'avg_score']
        ],
        include: [{
          model: School,
          attributes: [],
          where: { status: 'APPROVED' }
        }, {
          model: SchoolScorePeriod,
          attributes: ['period_name', 'start_date']
        }],
        group: ['period_id', 'SchoolScorePeriod.id'],
        order: [['SchoolScorePeriod', 'start_date', 'ASC']],
        raw: true,
        nest: true
      });

      const rankingTrends = trendData.map(t => ({
        period: t.SchoolScorePeriod?.period_name || `Period ${t.period_id}`,
        averageScore: parseFloat(parseFloat(t.avg_score || '0').toFixed(2))
      }));

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
          scoreBreakdown,
          rankingDistribution,
          rankingTrends,
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

      // Media Upload Counts
      const totalUploads = await MediaSubmission.count({
        where: {
          school_id: { [Op.in]: schoolIds.length > 0 ? schoolIds : [0] }
        }
      });

      const approvedMediaCount = await MediaSubmission.count({
        where: {
          school_id: { [Op.in]: schoolIds.length > 0 ? schoolIds : [0] },
          status: 'SUPER_APPROVED'
        }
      });

      // Regional Admins
      const regionAdmins = await RegionalAdminScope.findAll({
        where: { state_id: stateId },
        include: [{
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email', 'mobile']
        }]
      });

      // Districts performance dynamically computed
      const districts = await District.findAll({
        where: { state_id: stateId }
      });

      const districtPerformance = [];
      const districtColors = ["#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#EC4899", "#F43F5E", "#F97316", "#F59E0B"];
      
      for (let idx = 0; idx < districts.length; idx++) {
        const dist = districts[idx];
        const total = await School.count({ where: { district_id: dist.id } });
        const active = await School.count({ where: { district_id: dist.id, status: 'APPROVED' } });
        const inactive = total - active;

        const distSchoolIds = await School.findAll({
          where: { district_id: dist.id },
          attributes: ['id']
        }).then(res => res.map(s => s.id));

        let platinum = 0, gold = 0, silver = 0, bronze = 0, notRanked = 0;

        if (distSchoolIds.length > 0) {
          const snapshots = await SchoolRankSnapshot.findAll({
            where: { school_id: { [Op.in]: distSchoolIds } },
            include: [{ model: RankTier }]
          });
          snapshots.forEach(snap => {
            const tier = snap.RankTier?.tier_name;
            if (tier === 'Platinum') platinum++;
            else if (tier === 'Gold') gold++;
            else if (tier === 'Silver') silver++;
            else if (tier === 'Bronze') bronze++;
            else notRanked++;
          });
        }

        districtPerformance.push({
          District: {
            id: dist.id,
            district_name: dist.district_name,
            district_code: dist.district_code
          },
          total_schools: total,
          active_schools: active,
          inactive_schools: inactive,
          platinum,
          gold,
          silver,
          bronze,
          notRanked,
          color: districtColors[idx % districtColors.length]
        });
      }

      // Inspection Status Distribution
      const inspectionStats = {
        PENDING: 0,
        SCHEDULED: 0,
        COMPLETED: 0,
        REJECTED: 0
      };
      if (schoolIds.length > 0) {
        const counts = await InspectionRequest.findAll({
          where: { school_id: { [Op.in]: schoolIds } },
          attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
          group: ['status'],
          raw: true
        });
        counts.forEach(c => {
          if (inspectionStats[c.status] !== undefined) {
            inspectionStats[c.status] = parseInt(c.count, 10);
          }
        });
      }

      // Rankings for state schools
      let rankings = [];
      if (schoolIds.length > 0) {
        rankings = await SchoolRankSnapshot.findAll({
          where: { school_id: { [Op.in]: schoolIds } },
          include: [
            {
              model: School,
              attributes: ['school_name', 'school_code']
            },
            { model: RankTier }
          ],
          order: [['state_rank', 'ASC']]
        });
      }

      // Monthly growth
      const monthlyGrowth = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

        const schoolsCount = await School.count({
          where: {
            created_at: { [Op.lte]: endOfMonth }
          },
          include: [{
            model: District,
            where: { state_id: stateId },
            required: true
          }]
        });

        const mediaCount = await MediaSubmission.count({
          where: {
            school_id: { [Op.in]: schoolIds.length > 0 ? schoolIds : [0] },
            created_at: { [Op.between]: [startOfMonth, endOfMonth] }
          }
        });

        monthlyGrowth.push({
          month: monthName,
          schools: schoolsCount,
          media: mediaCount
        });
      }

      return res.status(200).json({
        success: true,
        message: 'State analytics fetched successfully',
        data: {
          stateId,
          metrics: {
            totalSchools: stateSchools.length,
            activeSchools,
            inactiveSchools,
            mediaUploads: totalUploads,
            approvedMediaCount,
            regionAdminsCount: regionAdmins.length
          },
          regionAdmins: regionAdmins.map(ra => ra.User),
          districtPerformance,
          inspectionStats,
          rankings,
          monthlyGrowth,
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
