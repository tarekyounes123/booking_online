'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('appointments', {
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
        serviceId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'services',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        staffId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'staff',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        date: {
          type: Sequelize.DATEONLY,
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
        status: {
          type: Sequelize.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no-show'),
          defaultValue: 'pending',
          allowNull: false
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        location: {
          type: Sequelize.STRING,
          allowNull: true
        },
        meetingLink: {
          type: Sequelize.STRING, // For virtual appointments
          allowNull: true
        },
        reminderSent: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        branchId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'branches',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
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
      await queryInterface.dropTable('appointments', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};