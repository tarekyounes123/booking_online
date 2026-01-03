'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('services', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        duration: {
          type: Sequelize.INTEGER, // Duration in minutes
          allowNull: false
        },
        price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        category: {
          type: Sequelize.STRING,
          allowNull: true
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        image: {
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

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('services', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};