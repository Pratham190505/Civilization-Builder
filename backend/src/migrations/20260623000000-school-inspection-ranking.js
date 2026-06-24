'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const schoolsInfo = await queryInterface.describeTable('schools');
    
    if (!schoolsInfo.academic_score) {
      await queryInterface.addColumn('schools', 'academic_score', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      });
    }
    if (!schoolsInfo.achievement_score) {
      await queryInterface.addColumn('schools', 'achievement_score', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      });
    }
    if (!schoolsInfo.media_score) {
      await queryInterface.addColumn('schools', 'media_score', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      });
    }
    if (!schoolsInfo.participation_score) {
      await queryInterface.addColumn('schools', 'participation_score', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      });
    }
    if (!schoolsInfo.total_score) {
      await queryInterface.addColumn('schools', 'total_score', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      });
    }
    if (!schoolsInfo.inspection_status) {
      await queryInterface.addColumn('schools', 'inspection_status', {
        type: Sequelize.STRING,
        defaultValue: 'AWAITING_INSPECTION',
        allowNull: true
      });
    }

    const auditsInfo = await queryInterface.describeTable('school_inspection_audits');
    
    if (!auditsInfo.academic_score) {
      await queryInterface.addColumn('school_inspection_audits', 'academic_score', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      });
    }
    if (!auditsInfo.achievement_score) {
      await queryInterface.addColumn('school_inspection_audits', 'achievement_score', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      });
    }
    if (!auditsInfo.media_score) {
      await queryInterface.addColumn('school_inspection_audits', 'media_score', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      });
    }
    if (!auditsInfo.participation_score) {
      await queryInterface.addColumn('school_inspection_audits', 'participation_score', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      });
    }
    if (!auditsInfo.total_score) {
      await queryInterface.addColumn('school_inspection_audits', 'total_score', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      });
    }

    // Modify assigned_score in audits to be nullable
    if (auditsInfo.assigned_score) {
      await queryInterface.changeColumn('school_inspection_audits', 'assigned_score', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('schools', 'academic_score');
    await queryInterface.removeColumn('schools', 'achievement_score');
    await queryInterface.removeColumn('schools', 'media_score');
    await queryInterface.removeColumn('schools', 'participation_score');
    await queryInterface.removeColumn('schools', 'total_score');
    await queryInterface.removeColumn('schools', 'inspection_status');

    await queryInterface.removeColumn('school_inspection_audits', 'academic_score');
    await queryInterface.removeColumn('school_inspection_audits', 'achievement_score');
    await queryInterface.removeColumn('school_inspection_audits', 'media_score');
    await queryInterface.removeColumn('school_inspection_audits', 'participation_score');
    await queryInterface.removeColumn('school_inspection_audits', 'total_score');
  }
};
