module.exports = (sequelize, DataTypes) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'services',
        key: 'id'
      }
    },
    staffId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Not all appointments might have assigned staff
      references: {
        model: 'staff',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no-show'),
      defaultValue: 'pending',
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    meetingLink: {
      type: DataTypes.STRING, // For virtual appointments
      allowNull: true
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'online'),
      defaultValue: 'cash',
      allowNull: false
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true // Initially null, will be set when appointment is created
    },
    discountedPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true // Will be set when promotion is applied
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true // Will be set when promotion is applied
    },
    promotionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Promotions',
        key: 'id'
      }
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'id'
      }
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    // Model options
    tableName: 'appointments',
    timestamps: true
  });

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.User, { foreignKey: 'userId' });
    Appointment.belongsTo(models.Service, { foreignKey: 'serviceId' });
    Appointment.belongsTo(models.Staff, { foreignKey: 'staffId' });
    Appointment.hasOne(models.Payment, { foreignKey: 'appointmentId' });
    Appointment.belongsTo(models.Branch, { foreignKey: 'branchId' });
    Appointment.belongsTo(models.Promotion, { foreignKey: 'promotionId' });
  };

  return Appointment;
};