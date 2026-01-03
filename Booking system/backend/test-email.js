require('dotenv').config({ path: '../.env' });

const sendEmail = require('./utils/sendEmail');

// Test email configuration
const testEmail = async () => {
  try {
    console.log('Testing email configuration...');
    
    await sendEmail({
      email: process.env.SMTP_EMAIL, // Send test email to yourself
      subject: 'Test Email Configuration',
      message: 'This is a test email to verify your email configuration is working properly.'
    });
    
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Test email failed:', error.message);
  }
};

testEmail();