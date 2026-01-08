const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config({ path: '../.env' });

async function checkAppts() {
    const sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: 'mysql',
            port: process.env.DB_PORT,
            logging: false
        }
    );

    try {
        const [results] = await sequelize.query("SELECT id, date, startTime, status, userId FROM appointments;");
        console.log('Appointments in DB:', results);

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        console.log('Today Local String:', todayStr);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkAppts();
