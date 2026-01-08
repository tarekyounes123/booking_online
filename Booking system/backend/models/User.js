const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'First name is required'
        },
        len: {
          args: [2, 30],
          msg: 'First name must be between 2 and 30 characters'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Last name is required'
        },
        len: {
          args: [2, 30],
          msg: 'Last name must be between 2 and 30 characters'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email already exists'
      },
      validate: {
        isEmail: {
          msg: 'Please provide a valid email'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 100],
          msg: 'Password must be at least 6 characters long'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('customer', 'admin', 'staff'),
      defaultValue: 'customer',
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
   isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verificationCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verificationCodeExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resetPasswordCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordCodeExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    branchId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'branches', // This references the 'branches' table
        key: 'id'
      }
    }
  }, {
    // Model options
    tableName: 'users',
    timestamps: true,
    hooks: {
      // Hash password before saving
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.password && user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    }
  });

  // Instance method to check password
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // Instance method to generate JWT token
  User.prototype.generateToken = function() {
    return jwt.sign(
      { id: this.id, role: this.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  };

  // Instance method to generate reset password token
  User.prototype.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
  };

  User.associate = (models) => {
    User.hasMany(models.Appointment, { foreignKey: 'userId' });
    User.hasMany(models.Payment, { foreignKey: 'userId' });
    User.hasMany(models.Notification, { foreignKey: 'userId' });
    User.hasOne(models.Staff, { foreignKey: 'userId' });
    User.hasMany(models.Review, { foreignKey: 'userId' });
    User.belongsTo(models.Branch, { foreignKey: 'branchId' });
  };

  return User;
};