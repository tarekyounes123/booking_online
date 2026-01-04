const express = require('express');
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const db = require('../models');
const { NewsletterSubscriber } = db;

const router = express.Router();

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

// @desc      Subscribe to newsletter
// @route     POST /api/newsletter/subscribe
// @access    Public
router.post('/subscribe', asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Validate email
  if (!email) {
    return next(new ErrorResponse('Please provide an email address', 400));
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new ErrorResponse('Please provide a valid email address', 400));
  }

  try {
    // Check if the email is already subscribed
    let subscriber = await NewsletterSubscriber.findOne({ where: { email } });

    if (subscriber) {
      // If already subscribed but unsubscribed, reactivate
      if (!subscriber.isActive) {
        await NewsletterSubscriber.update(
          { isActive: true, unsubscribedAt: null },
          { where: { email } }
        );
      }
    } else {
      // Create new subscriber
      subscriber = await NewsletterSubscriber.create({ email });
    }

    // Send confirmation email
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Newsletter Subscription Confirmation',
      html: `
        <h2>Thank you for subscribing to our newsletter!</h2>
        <p>You have successfully subscribed to our booking system newsletter.</p>
        <p>You will receive updates about our services, special offers, and important announcements.</p>
        <p>Thank you for your interest!</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return next(new ErrorResponse('Error subscribing to newsletter', 500));
  }
}));

// @desc      Unsubscribe from newsletter
// @route     POST /api/newsletter/unsubscribe
// @access    Public
router.post('/unsubscribe', asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse('Please provide an email address', 400));
  }

  // In a real application, you would remove the email from a database
  // For now, we'll just send a confirmation email
  
  try {
    // Find the subscriber and update their status
    const subscriber = await NewsletterSubscriber.findOne({ where: { email } });

    if (subscriber) {
      // Update to mark as unsubscribed
      await NewsletterSubscriber.update(
        { isActive: false, unsubscribedAt: new Date() },
        { where: { email } }
      );
    }

    // Send confirmation email
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Newsletter Unsubscription Confirmation',
      html: `
        <h2>You have been unsubscribed from our newsletter</h2>
        <p>You have successfully unsubscribed from our booking system newsletter.</p>
        <p>If this was a mistake, you can resubscribe at any time.</p>
        <p>Thank you for your interest!</p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return next(new ErrorResponse('Error unsubscribing from newsletter', 500));
  }
}));

module.exports = router;