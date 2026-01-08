'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('ThemeSettings', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            primaryColor: {
                type: Sequelize.STRING,
                defaultValue: '#1976d2'
            },
            secondaryColor: {
                type: Sequelize.STRING,
                defaultValue: '#dc004e'
            },
            fontFamily: {
                type: Sequelize.STRING,
                defaultValue: 'Roboto, sans-serif'
            },
            borderRadius: {
                type: Sequelize.INTEGER,
                defaultValue: 4
            },
            isActive: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        // Seed defaults
        await queryInterface.bulkInsert('ThemeSettings', [{
            primaryColor: '#1976d2',
            secondaryColor: '#dc004e',
            fontFamily: 'Roboto, sans-serif',
            borderRadius: 4,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('ThemeSettings');
    }
};
