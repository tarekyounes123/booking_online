module.exports = (sequelize, DataTypes) => {
    const WaitingList = sequelize.define('WaitingList', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        serviceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'services',
                key: 'id'
            }
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        preferredTime: {
            type: DataTypes.STRING, // e.g. "Morning", "Afternoon", or specific time
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('waiting', 'notified', 'booked', 'expired'),
            defaultValue: 'waiting'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    });

    WaitingList.associate = (models) => {
        WaitingList.belongsTo(models.User, { foreignKey: 'userId' });
        WaitingList.belongsTo(models.Service, { foreignKey: 'serviceId' });
    };

    return WaitingList;
};
