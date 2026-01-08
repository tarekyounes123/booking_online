module.exports = (sequelize, DataTypes) => {
    const Settings = sequelize.define('Settings', {
        key: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Setting key is required'
                }
            }
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: ''
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: 'settings',
        timestamps: true
    });

    Settings.associate = (models) => {
        Settings.belongsTo(models.User, { foreignKey: 'updatedBy', as: 'UpdatedByUser' });
    };

    return Settings;
};
