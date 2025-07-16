const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

class SiteSettingsService {
  constructor() {
    this.settingsFile = path.join(__dirname, '../data/site-settings.json');
    this.defaultSettings = {
      // Banner settings
      banner_slogan: "La tienda de los expertos",
      banner_contact: "656-123-4567",
      banner_enabled: true,
      
      // Theme settings
      primary_color: "#1e40af", // blue-800
      secondary_color: "#3b82f6", // blue-500
      accent_color: "#fbbf24", // yellow-400
      text_color: "#111827", // gray-900
      background_color: "#ffffff",
      
      // Company information
      company_name: "OASA Industrial",
      company_email: "contacto@oasa.com",
      company_phone: "656-123-4567",
      company_address: "Av. Industrial 123, Ciudad Industrial",
      
      // Social media
      facebook_url: "",
      twitter_url: "",
      instagram_url: "",
      linkedin_url: ""
    };
  }

  async ensureSettingsFile() {
    try {
      const dataDir = path.dirname(this.settingsFile);
      await fs.mkdir(dataDir, { recursive: true });
      
      try {
        await fs.access(this.settingsFile);
      } catch (error) {
        await fs.writeFile(this.settingsFile, JSON.stringify(this.defaultSettings, null, 2));
      }
    } catch (error) {
      console.error('Error ensuring site settings file:', error);
      throw error;
    }
  }

  async getSiteSettings() {
    try {
      await this.ensureSettingsFile();
      const data = await fs.readFile(this.settingsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading site settings:', error);
      return this.defaultSettings;
    }
  }

  async updateSiteSettings(newSettings) {
    try {
      await this.ensureSettingsFile();
      
      const currentSettings = await this.getSiteSettings();
      const updatedSettings = {
        ...currentSettings,
        ...newSettings
      };
      
      await fs.writeFile(this.settingsFile, JSON.stringify(updatedSettings, null, 2));
      return updatedSettings;
    } catch (error) {
      console.error('Error updating site settings:', error);
      throw error;
    }
  }

  async updateSetting(key, value) {
    try {
      const currentSettings = await this.getSiteSettings();
      currentSettings[key] = value;
      await fs.writeFile(this.settingsFile, JSON.stringify(currentSettings, null, 2));
      return currentSettings;
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      throw error;
    }
  }
}

const siteSettingsService = new SiteSettingsService();

/**
 * GET /api/settings/site
 * Get all site settings
 */
router.get('/site', async (req, res) => {
  try {
    const settings = await siteSettingsService.getSiteSettings();
    res.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch site settings'
    });
  }
});

/**
 * PUT /api/settings/site
 * Update all site settings
 */
router.put('/site', async (req, res) => {
  try {
    const updatedSettings = await siteSettingsService.updateSiteSettings(req.body);
    res.json({
      success: true,
      message: 'Site settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating site settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update site settings'
    });
  }
});

/**
 * PUT /api/settings/site/:key
 * Update specific setting
 */
router.put('/site/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const updatedSettings = await siteSettingsService.updateSetting(key, value);
    res.json({
      success: true,
      message: `Setting ${key} updated successfully`,
      settings: updatedSettings
    });
  } catch (error) {
    console.error(`Error updating setting ${req.params.key}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to update setting ${req.params.key}`
    });
  }
});

/**
 * GET /api/settings/site/:key
 * Get specific setting
 */
router.get('/site/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const settings = await siteSettingsService.getSiteSettings();
    
    if (key in settings) {
      res.json({
        success: true,
        key,
        value: settings[key]
      });
    } else {
      res.status(404).json({
        success: false,
        error: `Setting ${key} not found`
      });
    }
  } catch (error) {
    console.error(`Error fetching setting ${req.params.key}:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch setting ${req.params.key}`
    });
  }
});

module.exports = router;
