'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add brandName column if it doesn't exist
        await queryInterface.addColumn('ThemeSettings', 'brandName', {
            type: Sequelize.STRING,
            defaultValue: 'SARA',
            allowNull: true
        });

        // Add brandNameHighlight column if it doesn't exist
        await queryInterface.addColumn('ThemeSettings', 'brandNameHighlight', {
            type: Sequelize.STRING,
            defaultValue: 'Salon',
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove brandName column
        await queryInterface.removeColumn('ThemeSettings', 'brandName');

        // Remove brandNameHighlight column
        await queryInterface.removeColumn('ThemeSettings', 'brandNameHighlight');
    }
};