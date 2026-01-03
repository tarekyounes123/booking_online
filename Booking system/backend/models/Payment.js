module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    appointmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'appointments',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Amount cannot be negative'
        }
      }
    },
    originalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    promotionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Promotions',
        key: 'id'
      }
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'usd',
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'online', 'card', 'stripe'),
      allowNull: false
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true // Transaction ID if applicable
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
    },
    paymentIntentId: {
      type: DataTypes.STRING, // For compatibility if needed
      allowNull: true
    },
    receiptUrl: {
      type: DataTypes.STRING, // URL to payment receipt
      allowNull: true
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    // Model options
    tableName: 'payments',
    timestamps: true
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, { foreignKey: 'userId' });
    Payment.belongsTo(models.Appointment, { foreignKey: 'appointmentId' });
    Payment.belongsTo(models.Promotion, { foreignKey: 'promotionId', as: 'promotion' });
  };

  return Payment;
};