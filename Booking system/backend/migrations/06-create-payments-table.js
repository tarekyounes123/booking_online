'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('payments', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        appointmentId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'appointments',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
        amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        currency: {
          type: Sequelize.STRING,
          defaultValue: 'usd',
          allowNull: false
        },
        paymentMethod: {
          type: Sequelize.ENUM('stripe', 'paypal', 'cash', 'bank_transfer'),
          allowNull: false
        },
        transactionId: {
          type: Sequelize.STRING,
          allowNull: true // Stripe/PayPal transaction ID
        },
        status: {
          type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled'),
          defaultValue: 'pending',
          allowNull: false
        },
        paymentIntentId: {
          type: Sequelize.STRING, // Stripe payment intent ID
          allowNull: true
        },
        receiptUrl: {
          type: Sequelize.STRING, // URL to payment receipt
          allowNull: true
        },
        paidAt: {
          type: Sequelize.DATE,
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
      await queryInterface.dropTable('payments', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};