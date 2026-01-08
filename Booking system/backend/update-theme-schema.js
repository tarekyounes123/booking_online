const { connectDB } = require('./config/db');
const db = require('./models');

async function updateSchema() {
  console.log('Starting schema update...');

  try {
    await connectDB();
    console.log('Connected to database');

    // Check if the ThemeSetting table exists and has the required columns
    const queryInterface = db.sequelize.getQueryInterface();
    console.log('Getting table description...');

    const tableDescription = await queryInterface.describeTable('ThemeSettings');
    console.log('Current ThemeSettings table structure:');
    Object.keys(tableDescription).forEach(column => {
      console.log(`${column}: ${tableDescription[column].type}`);
    });

    // Check if brandName and brandNameHighlight columns exist
    const hasBrandName = !!tableDescription.brandName;
    const hasBrandNameHighlight = !!tableDescription.brandNameHighlight;

    console.log(`Has brandName column: ${hasBrandName}`);
    console.log(`Has brandNameHighlight column: ${hasBrandNameHighlight}`);

    if (!hasBrandName) {
      console.log('Adding brandName column...');
      await queryInterface.addColumn('ThemeSettings', 'brandName', {
        type: db.sequelize.constructor.DataTypes.STRING,
        defaultValue: 'SARA',
        allowNull: true
      });
      console.log('brandName column added');
    }

    if (!hasBrandNameHighlight) {
      console.log('Adding brandNameHighlight column...');
      await queryInterface.addColumn('ThemeSettings', 'brandNameHighlight', {
        type: db.sequelize.constructor.DataTypes.STRING,
        defaultValue: 'Salon',
        allowNull: true
      });
      console.log('brandNameHighlight column added');
    }

    if (!hasBrandName || !hasBrandNameHighlight) {
      console.log('Columns added successfully!');
    } else {
      console.log('Columns already exist.');
    }

    // Check if any records exist, if not create a default one
    const existingRecord = await db.ThemeSetting.findOne();
    if (!existingRecord) {
      console.log('Creating default theme settings record...');
      await db.ThemeSetting.create({
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        fontFamily: 'Roboto, sans-serif',
        borderRadius: 4,
        brandName: 'SARA',
        brandNameHighlight: 'Salon',
        isActive: true
      });
      console.log('Default theme settings created.');
    } else {
      console.log('Theme settings record already exists');
    }

    console.log('Schema update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateSchema();