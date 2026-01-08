'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'resetPasswordCode', {
            type: Sequelize.STRING,
            allowNull: true
        });

        await queryInterface.addColumn('users', 'resetPasswordCodeExpires', {
            type: Sequelize.DATE,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'resetPasswordCode');
        await queryInterface.removeColumn('users', 'resetPasswordCodeExpires');
    }
};
