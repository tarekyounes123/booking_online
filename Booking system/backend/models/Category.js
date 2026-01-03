module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Category name is required'
        },
        len: {
          args: [2, 50],
          msg: 'Category name must be between 2 and 50 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 200],
          msg: 'Description must be less than 200 characters'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    // Model options
    tableName: 'categories',
    timestamps: true
  });

  Category.associate = (models) => {
    Category.hasMany(models.GalleryItem, { foreignKey: 'categoryId' });
  };

  Category.associateAfterLoad = (db) => {
    Category.hasMany(db.GalleryItem, { foreignKey: 'categoryId' });
  };

  return Category;
};