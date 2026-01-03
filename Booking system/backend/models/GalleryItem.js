module.exports = (sequelize, DataTypes) => {
  const GalleryItem = sequelize.define('GalleryItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Title is required'
        },
        len: {
          args: [2, 100],
          msg: 'Title must be between 2 and 100 characters'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Description is required'
        },
        len: {
          args: [10, 500],
          msg: 'Description must be between 10 and 500 characters'
        }
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Image URL is required'
        }
      }
    },
    imageFilename: {
      type: DataTypes.STRING,
      allowNull: true // Store the original filename
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    }
  }, {
    // Model options
    tableName: 'gallery_items',
    timestamps: true
  });

  GalleryItem.associate = (models) => {
    GalleryItem.belongsTo(models.Category, { foreignKey: 'categoryId' });
  };

  GalleryItem.associateAfterLoad = (db) => {
    GalleryItem.belongsTo(db.Category, { foreignKey: 'categoryId' });
  };

  return GalleryItem;
};