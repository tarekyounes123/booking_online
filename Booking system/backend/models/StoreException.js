const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const StoreException = sequelize.define('StoreException', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            unique: true
        },
        openTime: {
            type: DataTypes.TIME,
            allowNull: true
        },
        closeTime: {
            type: DataTypes.TIME,
            allowNull: true
        },
        isOpen: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'store_exceptions',
        timestamps: true
    });

    return StoreException;
};
