'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Services', 'averageRating', {
      type: Sequelize.DECIMAL(2, 1),
      allowNull: false,
      defaultValue: 0.0
    });
    await queryInterface.addColumn('Services', 'numOfReviews', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Services', 'averageRating');
    await queryInterface.removeColumn('Services', 'numOfReviews');
  }
};
