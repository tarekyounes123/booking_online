const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' });

async function fixTable() {
    const sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: 'mysql',
            port: process.env.DB_PORT,
            logging: console.log
        }
    );

    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        console.log('Adding missing column...');
        await sequelize.query("ALTER TABLE payments ADD COLUMN pointsAwarded TINYINT(1) NOT NULL DEFAULT 0;");
        console.log('Column added successfully.');

    } catch (error) {
        if (error.original && error.original.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists.');
        } else {
            console.error('Error adding column:', error);
        }
    } finally {
        await sequelize.close();
    }
}

fixTable();
