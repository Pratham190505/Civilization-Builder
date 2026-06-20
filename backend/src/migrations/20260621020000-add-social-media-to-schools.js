'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('schools');
    
    if (!tableInfo.facebook_url) {
      await queryInterface.addColumn('schools', 'facebook_url', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    if (!tableInfo.instagram_url) {
      await queryInterface.addColumn('schools', 'instagram_url', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    if (!tableInfo.youtube_url) {
      await queryInterface.addColumn('schools', 'youtube_url', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
    if (!tableInfo.website_url) {
      await queryInterface.addColumn('schools', 'website_url', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('schools', 'facebook_url');
    await queryInterface.removeColumn('schools', 'instagram_url');
    await queryInterface.removeColumn('schools', 'youtube_url');
    await queryInterface.removeColumn('schools', 'website_url');
  }
};
