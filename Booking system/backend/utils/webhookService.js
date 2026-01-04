const axios = require('axios');
const crypto = require('crypto');
const { Webhook } = require('../models');

class WebhookService {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Get all active webhooks for a specific event
  async getWebhooksByEvent(event) {
    return await Webhook.findAll({
      where: {
        event,
        isActive: true
      }
    });
  }

  // Trigger webhooks for a specific event
  async triggerWebhooks(event, payload) {
    try {
      const webhooks = await this.getWebhooksByEvent(event);
      
      if (!webhooks || webhooks.length === 0) {
        console.log(`No active webhooks found for event: ${event}`);
        return;
      }

      console.log(`Triggering ${webhooks.length} webhooks for event: ${event}`);

      // Trigger each webhook in parallel
      const results = await Promise.allSettled(
        webhooks.map(webhook => this.triggerWebhook(webhook, payload))
      );

      // Log results
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Webhook ${webhooks[index].id} failed:`, result.reason);
        }
      });

      return results;
    } catch (error) {
      console.error('Error triggering webhooks:', error);
      throw error;
    }
  }

  // Trigger a single webhook with retry logic
  async triggerWebhook(webhook, payload) {
    let lastError = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Create signature for security
        const signature = this.createSignature(payload, webhook.secret);

        const response = await axios.post(webhook.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': webhook.event,
            'X-Webhook-Signature': signature,
            'User-Agent': 'BookingSystem-Webhook'
          },
          timeout: 10000 // 10 second timeout
        });

        // Update webhook with success information
        await webhook.update({
          lastTriggeredAt: new Date(),
          lastResponseCode: response.status,
          lastErrorMessage: null
        });

        console.log(`Webhook ${webhook.id} triggered successfully. Response: ${response.status}`);
        return response;
      } catch (error) {
        console.error(`Webhook ${webhook.id} attempt ${attempt} failed:`, error.message);

        // Update webhook with error information
        await webhook.update({
          lastTriggeredAt: new Date(),
          lastResponseCode: error.response?.status || 0,
          lastErrorMessage: error.message.substring(0, 500) // Limit to 500 chars
        });

        lastError = error;

        // If this is not the last attempt, wait before retrying
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    // All attempts failed
    throw lastError;
  }

  // Create signature for webhook security
  createSignature(payload, secret) {
    const payloadString = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', secret || process.env.WEBHOOK_SECRET || 'default-secret')
      .update(payloadString)
      .digest('hex');
  }

  // Delay helper function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Add a new webhook
  async addWebhook(data) {
    return await Webhook.create(data);
  }

  // Update a webhook
  async updateWebhook(id, data) {
    const webhook = await Webhook.findByPk(id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }
    return await webhook.update(data);
  }

  // Delete a webhook
  async deleteWebhook(id) {
    const webhook = await Webhook.findByPk(id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }
    return await webhook.destroy();
  }

  // Test a webhook
  async testWebhook(id) {
    const webhook = await Webhook.findByPk(id);
    if (!webhook) {
      throw new Error('Webhook not found');
    }

    const testPayload = {
      event: 'test.event',
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'This is a test webhook event'
      }
    };

    try {
      await this.triggerWebhook(webhook, testPayload);
      return { success: true, message: 'Webhook test successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new WebhookService();