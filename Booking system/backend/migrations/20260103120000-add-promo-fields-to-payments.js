'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('payments', 'originalAmount', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        after: 'amount'
      }, { transaction });

      await queryInterface.addColumn('payments', 'discountAmount', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        after: 'originalAmount'
      }, { transaction });

      await queryInterface.addColumn('payments', 'promotionId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Promotions', // Note: This should be the table name, which is 'Promotions' by Sequelize convention
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        after: 'discountAmount'
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
      await queryInterface.removeColumn('payments', 'promotionId', { transaction });
      await queryInterface.removeColumn('payments', 'discountAmount', { transaction });
      await queryInterface.removeColumn('payments', 'originalAmount', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
