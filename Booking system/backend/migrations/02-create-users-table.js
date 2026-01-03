'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('users', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        firstName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        role: {
          type: Sequelize.ENUM('customer', 'admin', 'staff'),
          defaultValue: 'customer',
          allowNull: false
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: true
        },
        address: {
          type: Sequelize.STRING,
          allowNull: true
        },
        isVerified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        verificationToken: {
          type: Sequelize.STRING,
          allowNull: true
        },
        resetPasswordToken: {
          type: Sequelize.STRING,
          allowNull: true
        },
        resetPasswordExpire: {
          type: Sequelize.DATE,
          allowNull: true
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        avatar: {
          type: Sequelize.STRING,
          allowNull: true
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

      await queryInterface.addIndex('users', ['email'], {
        unique: true,
        name: 'users_email_unique',
        transaction
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('users', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};