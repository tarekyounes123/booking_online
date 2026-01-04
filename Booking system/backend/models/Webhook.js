module.exports = (sequelize, DataTypes) => {
  const Webhook = sequelize.define('Webhook', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [2, 100],
          msg: 'Webhook name must be between 2 and 100 characters'
        }
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: {
          msg: 'Please provide a valid URL'
        }
      }
    },
    event: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [['appointment.created', 'appointment.updated', 'appointment.deleted', 'payment.completed', 'user.created', 'user.updated']],
          msg: 'Event must be one of the allowed events'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastTriggeredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastResponseCode: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    lastErrorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'webhooks',
    timestamps: true
  });

  return Webhook;
};