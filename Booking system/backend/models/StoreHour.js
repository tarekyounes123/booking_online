const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const StoreHour = sequelize.define('StoreHour', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        dayOfWeek: {
            type: DataTypes.INTEGER, // 0-6 (Sunday-Saturday)
            allowNull: false,
            unique: true
        },
        openTime: {
            type: DataTypes.TIME,
            allowNull: true,
            defaultValue: '09:00:00'
        },
        closeTime: {
            type: DataTypes.TIME,
            allowNull: true,
            defaultValue: '18:00:00'
        },
        isOpen: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'store_hours',
        timestamps: true
    });

    return StoreHour;
};
