module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add categoryId column to gallery_items table
    await queryInterface.addColumn('gallery_items', 'categoryId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Remove categoryId column from gallery_items table
    await queryInterface.removeColumn('gallery_items', 'categoryId');
  }
};