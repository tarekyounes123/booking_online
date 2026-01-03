module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add paymentMethod column to appointments table
    await queryInterface.addColumn('appointments', 'paymentMethod', {
      type: Sequelize.ENUM('cash', 'online'),
      defaultValue: 'cash',
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove paymentMethod column from appointments table
    await queryInterface.removeColumn('appointments', 'paymentMethod');
  }
};