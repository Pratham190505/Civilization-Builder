const { School, MediaSubmission, SchoolRankSnapshot, SchoolScoreComponent, ScoreCategory, DistrictPerformanceSnapshot, District, RankTier, SchoolRankHistory, SchoolScorePeriod, User, InspectionRequest, RegionalAdminScope, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function test() {
  try {
    console.log('Testing activeSchools...');
    const activeSchools = await School.count({ where: { status: 'APPROVED' } });
    console.log('activeSchools:', activeSchools);

    console.log('Testing inactiveSchools...');
    const inactiveSchools = await School.count({ where: { status: { [Op.in]: ['PENDING', 'REJECTED', 'INACTIVE'] } } });
    console.log('inactiveSchools:', inactiveSchools);

    console.log('Testing totalUploads...');
    const totalUploads = await MediaSubmission.count();
    console.log('totalUploads:', totalUploads);
    
    console.log('Testing approvalTrends...');
    const approvalTrends = await MediaSubmission.findAll({
      attributes: ['status', [MediaSubmission.sequelize.fn('COUNT', MediaSubmission.sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true
    });
    console.log('approvalTrends:', approvalTrends);

    console.log('Testing averagePerformance...');
    const averagePerformance = await SchoolRankSnapshot.findOne({
      attributes: [
        [SchoolRankSnapshot.sequelize.fn('AVG', SchoolRankSnapshot.sequelize.col('total_score')), 'avg_score']
      ],
      raw: true
    });
    console.log('averagePerformance:', averagePerformance);

    console.log('Testing rankingDistribution...');
    const allTiers = await RankTier.findAll({ raw: true });
    const snapshots = await SchoolRankSnapshot.findAll({
      include: [{
        model: School,
        where: { status: 'APPROVED' },
        attributes: []
      }],
      raw: true
    });
    console.log('snapshots count:', snapshots.length);

    console.log('Testing scoreBreakdown...');
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
    console.log('categoryAverages:', categoryAverages);

  } catch (err) {
    console.error('ERROR OCCURRED:', err);
  } finally {
    process.exit(0);
  }
}

test();
