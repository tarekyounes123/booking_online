const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' });
const dbConfig = require('./config/db');

async function checkColumn() {
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
        await sequelize.authenticate();
        console.log('Connected to DB.');
        const [results] = await sequelize.query("DESCRIBE payments;");
        console.log('Table Structure:', results);

        const hasColumn = results.some(row => row.Field === 'pointsAwarded');
        console.log('Has pointsAwarded:', hasColumn);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkColumn();
