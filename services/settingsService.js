const fs = require('fs').promises;
const path = require('path');

class SettingsService {
  constructor() {
    this.settingsFile = path.join(__dirname, '../data/shopping-settings.json');
    this.defaultSettings = {
      enable_shopping: true,
      enable_pricing: true,
      enable_add_to_cart: true,
      enable_checkout: true,
      shopping_mode: 'full'
    };
  }

  /**
   * Ensure data directory and settings file exist
   */
  async ensureSettingsFile() {
    try {
      const dataDir = path.dirname(this.settingsFile);
      await fs.mkdir(dataDir, { recursive: true });
      
      // Check if settings file exists
      try {
        await fs.access(this.settingsFile);
      } catch (error) {
        // File doesn't exist, create it with default settings
        await fs.writeFile(this.settingsFile, JSON.stringify(this.defaultSettings, null, 2));
      }
    } catch (error) {
      console.error('Error ensuring settings file:', error);
      throw error;
    }
  }

  /**
   * Get shopping settings
   */
  async getShoppingSettings() {
    try {
      await this.ensureSettingsFile();
      const data = await fs.readFile(this.settingsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading shopping settings:', error);
      return this.defaultSettings;
    }
  }

  /**
   * Update shopping settings
   */
  async updateShoppingSettings(newSettings) {
    try {
      await this.ensureSettingsFile();
      
      // Get current settings
      const currentSettings = await this.getShoppingSettings();
      
      // Merge with new settings
      const updatedSettings = {
        ...currentSettings,
        ...newSettings
      };
      
      // Validate settings
      this.validateSettings(updatedSettings);
      
      // Write to file
      await fs.writeFile(this.settingsFile, JSON.stringify(updatedSettings, null, 2));
      
      return updatedSettings;
    } catch (error) {
      console.error('Error updating shopping settings:', error);
      throw error;
    }
  }

  /**
   * Validate settings structure
   */
  validateSettings(settings) {
    const requiredFields = ['enable_shopping', 'enable_pricing', 'enable_add_to_cart', 'enable_checkout', 'shopping_mode'];
    const validModes = ['full', 'catalog', 'disabled'];
    
    for (const field of requiredFields) {
      if (!(field in settings)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    if (!validModes.includes(settings.shopping_mode)) {
      throw new Error(`Invalid shopping_mode: ${settings.shopping_mode}`);
    }
    
    // Convert boolean values
    settings.enable_shopping = Boolean(settings.enable_shopping);
    settings.enable_pricing = Boolean(settings.enable_pricing);
    settings.enable_add_to_cart = Boolean(settings.enable_add_to_cart);
    settings.enable_checkout = Boolean(settings.enable_checkout);
    
    return settings;
  }

  /**
   * Reset to default settings
   */
  async resetToDefaults() {
    try {
      await this.ensureSettingsFile();
      await fs.writeFile(this.settingsFile, JSON.stringify(this.defaultSettings, null, 2));
      return this.defaultSettings;
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw error;
    }
  }
}

module.exports = new SettingsService();
