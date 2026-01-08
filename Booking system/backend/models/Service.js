module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Service name is required'
        },
        len: {
          args: [2, 100],
          msg: 'Service name must be between 2 and 100 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER, // Duration in minutes
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Duration must be at least 1 minute'
        },
        max: {
          args: [1440], // 24 hours in minutes
          msg: 'Duration cannot exceed 24 hours'
        }
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Price cannot be negative'
        }
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    averageRating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: 0.0,
        max: 5.0
      }
    },
    numOfReviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'branches', // This references the 'branches' table
        key: 'id'
      }
    },
    position: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    type: {
      type: DataTypes.ENUM('single', 'bundle'),
      defaultValue: 'single',
      allowNull: false
    },
    includedServices: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    // Model options
    tableName: 'services',
    timestamps: true
  });

  Service.associate = (models) => {
    Service.hasMany(models.Appointment, { foreignKey: 'serviceId' });
    Service.hasMany(models.Review, { foreignKey: 'serviceId' });
    Service.belongsTo(models.Branch, { foreignKey: 'branchId' });
  };

  return Service;
};