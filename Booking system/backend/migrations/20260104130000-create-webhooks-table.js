'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('webhooks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          len: [2, 100]
        }
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isUrl: true
        }
      },
      event: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          isIn: [['appointment.created', 'appointment.updated', 'appointment.deleted', 'payment.completed', 'user.created', 'user.updated']]
        }
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      secret: {
        type: Sequelize.STRING,
        allowNull: true
      },
      lastTriggeredAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastResponseCode: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      lastErrorMessage: {
        type: Sequelize.TEXT,
        allowNull: true
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('webhooks');
  }
};