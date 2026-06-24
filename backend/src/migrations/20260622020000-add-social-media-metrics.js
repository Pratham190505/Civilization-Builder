'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('school_metric_snapshots');
    
    // Add social media metrics columns for future analytics integration
    if (!tableInfo.facebook_reach) {
      await queryInterface.addColumn('school_metric_snapshots', 'facebook_reach', {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Facebook page reach/reach count for analytics'
      });
    }
    if (!tableInfo.instagram_reach) {
      await queryInterface.addColumn('school_metric_snapshots', 'instagram_reach', {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Instagram follower/reach count for analytics'
      });
    }
    if (!tableInfo.youtube_views) {
      await queryInterface.addColumn('school_metric_snapshots', 'youtube_views', {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'YouTube channel views/subscribers for analytics'
      });
    }
    if (!tableInfo.website_visits) {
      await queryInterface.addColumn('school_metric_snapshots', 'website_visits', {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Website visit count for analytics'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('school_metric_snapshots', 'facebook_reach');
    await queryInterface.removeColumn('school_metric_snapshots', 'instagram_reach');
    await queryInterface.removeColumn('school_metric_snapshots', 'youtube_views');
    await queryInterface.removeColumn('school_metric_snapshots', 'website_visits');
  }
};
