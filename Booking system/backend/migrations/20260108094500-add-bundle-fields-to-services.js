'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('services', 'type', {
            type: Sequelize.ENUM('single', 'bundle'),
            defaultValue: 'single',
            allowNull: false
        });

        await queryInterface.addColumn('services', 'includedServices', {
            type: Sequelize.JSON,
            allowNull: true,
            comment: 'Array of included service names/descriptions for bundles'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('services', 'type');
        await queryInterface.removeColumn('services', 'includedServices');
    }
};
