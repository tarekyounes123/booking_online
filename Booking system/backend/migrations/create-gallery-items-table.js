module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('gallery_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
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
        type: Sequelize.TEXT,
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
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Image filename is required'
          }
        }
      },
      imageFilename: {
        type: Sequelize.STRING,
        allowNull: true
      },
      category: {
        type: Sequelize.STRING,
        defaultValue: 'other',
        allowNull: false,
        validate: {
          isIn: {
            args: [['nails', 'hair', 'beauty', 'skincare', 'other']],
            msg: 'Category must be one of: nails, hair, beauty, skincare, other'
          }
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('gallery_items');
  }
};