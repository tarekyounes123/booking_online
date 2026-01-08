module.exports = (sequelize, DataTypes) => {
    const ThemeSetting = sequelize.define('ThemeSetting', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        primaryColor: {
            type: DataTypes.STRING,
            defaultValue: '#1976d2'
        },
        secondaryColor: {
            type: DataTypes.STRING,
            defaultValue: '#dc004e'
        },
        fontFamily: {
            type: DataTypes.STRING,
            defaultValue: 'Roboto, sans-serif'
        },
        borderRadius: {
            type: DataTypes.INTEGER,
            defaultValue: 4
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });

    return ThemeSetting;
};
