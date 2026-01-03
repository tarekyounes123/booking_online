'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('notifications', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        type: {
          type: Sequelize.ENUM('email', 'sms', 'push', 'in_app'),
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('pending', 'sent', 'failed'),
          defaultValue: 'pending',
          allowNull: false
        },
        sentAt: {
          type: Sequelize.DATE,
          allowNull: true
        },
        isRead: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        metadata: {
          type: Sequelize.JSON // Additional data for the notification
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }, { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('notifications', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};