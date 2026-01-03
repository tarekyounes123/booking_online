module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add imageFilename column to existing table
    await queryInterface.addColumn('gallery_items', 'imageFilename', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Remove imageFilename column
    await queryInterface.removeColumn('gallery_items', 'imageFilename');
  }
};