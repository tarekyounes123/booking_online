module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the new columns to the appointments table
    await queryInterface.addColumn('appointments', 'originalPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('appointments', 'discountedPrice', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('appointments', 'discountAmount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('appointments', 'promotionId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Promotions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the columns in reverse order
    await queryInterface.removeColumn('appointments', 'promotionId');
    await queryInterface.removeColumn('appointments', 'discountAmount');
    await queryInterface.removeColumn('appointments', 'discountedPrice');
    await queryInterface.removeColumn('appointments', 'originalPrice');
  }
};