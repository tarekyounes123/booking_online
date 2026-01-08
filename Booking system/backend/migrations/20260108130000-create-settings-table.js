'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('settings', {
            key: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false
            },
            value: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: ''
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            updatedBy: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });

        // Insert default settings
        await queryInterface.bulkInsert('settings', [
            {
                key: 'loyaltyPointsEnabled',
                value: 'true',
                description: 'Enable or disable the loyalty points system globally',
                updatedBy: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('settings');
    }
};
