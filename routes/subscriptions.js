const express = require('express');
const router = express.Router();
const subscriptionService = require('../services/subscriptionService');

/**
 * GET /api/subscriptions/plans
 * Get all available subscription plans
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = await subscriptionService.getSubscriptionPlans();
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription plans'
    });
  }
});

/**
 * GET /api/subscriptions/current
 * Get current client subscription
 */
router.get('/current', async (req, res) => {
  try {
    const clientId = req.query.client_id || 1; // Default to client 1
    const subscription = await subscriptionService.getClientSubscription(clientId);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found'
      });
    }
    
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch current subscription'
    });
  }
});

/**
 * GET /api/subscriptions/features
 * Get all enabled features for the client
 */
router.get('/features', async (req, res) => {
  try {
    const clientId = req.query.client_id || 1;
    const features = await subscriptionService.getEnabledFeatures(clientId);
    
    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Error fetching enabled features:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch enabled features'
    });
  }
});

/**
 * GET /api/subscriptions/features/shopping
 * Get shopping-specific features
 */
router.get('/features/shopping', async (req, res) => {
  try {
    const clientId = req.query.client_id || 1;
    const shoppingFeatures = await subscriptionService.getShoppingFeatures(clientId);
    
    res.json({
      success: true,
      data: shoppingFeatures
    });
  } catch (error) {
    console.error('Error fetching shopping features:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shopping features'
    });
  }
});

/**
 * PUT /api/subscriptions/features/shopping
 * Update shopping features (admin only)
 */
router.put('/features/shopping', async (req, res) => {
  try {
    const clientId = req.body.client_id || 1;
    const features = req.body;
    
    // Remove client_id from features object
    delete features.client_id;
    
    await subscriptionService.updateShoppingFeatures(clientId, features);
    
    // Return updated features
    const updatedFeatures = await subscriptionService.getShoppingFeatures(clientId);
    
    res.json({
      success: true,
      message: 'Shopping features updated successfully',
      data: updatedFeatures
    });
  } catch (error) {
    console.error('Error updating shopping features:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update shopping features'
    });
  }
});

/**
 * PUT /api/subscriptions/features/:featureKey
 * Update a specific feature (admin only)
 */
router.put('/features/:featureKey', async (req, res) => {
  try {
    const { featureKey } = req.params;
    const { client_id = 1, is_enabled } = req.body;
    
    if (typeof is_enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'is_enabled must be a boolean value'
      });
    }
    
    await subscriptionService.updateClientFeature(client_id, featureKey, is_enabled);
    
    res.json({
      success: true,
      message: `Feature ${featureKey} updated successfully`
    });
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update feature'
    });
  }
});

/**
 * GET /api/subscriptions/features/:featureKey
 * Check if a specific feature is enabled
 */
router.get('/features/:featureKey', async (req, res) => {
  try {
    const { featureKey } = req.params;
    const clientId = req.query.client_id || 1;
    
    const isEnabled = await subscriptionService.isFeatureEnabled(featureKey, clientId);
    
    res.json({
      success: true,
      data: {
        feature_key: featureKey,
        is_enabled: isEnabled
      }
    });
  } catch (error) {
    console.error('Error checking feature:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check feature'
    });
  }
});

module.exports = router;
