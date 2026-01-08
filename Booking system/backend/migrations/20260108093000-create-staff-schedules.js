'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('StaffSchedules', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            staffId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'staff',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            dayOfWeek: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            startTime: {
                type: Sequelize.TIME,
                allowNull: false
            },
            endTime: {
                type: Sequelize.TIME,
                allowNull: false
            },
            isDayOff: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
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

        // Add unique constraint to prevent duplicate schedules for same staff/day
        await queryInterface.addConstraint('StaffSchedules', {
            fields: ['staffId', 'dayOfWeek'],
            type: 'unique',
            name: 'unique_staff_day_schedule'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('StaffSchedules');
    }
};
