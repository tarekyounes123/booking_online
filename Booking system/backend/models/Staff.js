module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define('Staff', {
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
      },
      unique: true
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    experience: {
      type: DataTypes.INTEGER, // Years of experience
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    calendarId: {
      type: DataTypes.STRING, // Google Calendar ID
      allowNull: true
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'id'
      }
    }
  }, {
    // Model options
    tableName: 'staff',
    timestamps: true
  });

  Staff.associate = (models) => {
    Staff.belongsTo(models.User, { foreignKey: 'userId' });
    Staff.hasMany(models.Appointment, { foreignKey: 'staffId' });
    Staff.belongsTo(models.Branch, { foreignKey: 'branchId' });
  };

  return Staff;
};