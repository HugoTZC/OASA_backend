const express = require('express');
const router = express.Router();
const settingsService = require('../services/settingsService');

/**
 * GET /api/settings/shopping
 * Get shopping settings
 */
router.get('/shopping', async (req, res) => {
  try {
    const settings = await settingsService.getShoppingSettings();
    
    // Convert to the format expected by the frontend
    const response = {
      enable_shopping: settings.enable_shopping ? 'true' : 'false',
      enable_pricing: settings.enable_pricing ? 'true' : 'false',
      enable_add_to_cart: settings.enable_add_to_cart ? 'true' : 'false',
      enable_checkout: settings.enable_checkout ? 'true' : 'false',
      shopping_mode: settings.shopping_mode
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching shopping settings:', error);
    res.status(500).json({
      error: 'Failed to fetch shopping settings'
    });
  }
});

/**
 * PUT /api/settings/shopping
 * Update shopping settings
 */
router.put('/shopping', async (req, res) => {
  try {
    // Convert string values to boolean
    const newSettings = {
      enable_shopping: req.body.enable_shopping === true || req.body.enable_shopping === 'true',
      enable_pricing: req.body.enable_pricing === true || req.body.enable_pricing === 'true',
      enable_add_to_cart: req.body.enable_add_to_cart === true || req.body.enable_add_to_cart === 'true',
      enable_checkout: req.body.enable_checkout === true || req.body.enable_checkout === 'true',
      shopping_mode: req.body.shopping_mode || 'full'
    };
    
    const updatedSettings = await settingsService.updateShoppingSettings(newSettings);
    
    res.json({
      success: true,
      message: 'Shopping settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating shopping settings:', error);
    res.status(500).json({
      error: 'Failed to update shopping settings'
    });
  }
});

module.exports = router;
