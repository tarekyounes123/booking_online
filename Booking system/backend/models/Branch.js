module.exports = (sequelize, DataTypes) => {
  const Branch = sequelize.define('Branch', {
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
          msg: 'Branch name is required'
        }
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Please provide a valid email'
        }
      }
    },
    openingHours: {
      type: DataTypes.JSON, // Store opening hours as JSON
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    // Model options
    tableName: 'branches',
    timestamps: true
  });

  Branch.associate = (models) => {
    Branch.hasMany(models.User, { foreignKey: 'branchId' });
    Branch.hasMany(models.Service, { foreignKey: 'branchId' });
    Branch.hasMany(models.Staff, { foreignKey: 'branchId' });
    Branch.hasMany(models.Appointment, { foreignKey: 'branchId' });
  };

  return Branch;
};