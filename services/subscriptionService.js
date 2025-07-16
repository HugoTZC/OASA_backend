const db = require('../config/database');

class SubscriptionService {
  
  /**
   * Get all available subscription plans
   */
  async getSubscriptionPlans() {
    const result = await db.query('SELECT * FROM subscription_plans ORDER BY monthly_price ASC');
    return result.rows;
  }

  /**
   * Get client's current subscription
   */
  async getClientSubscription(clientId = 1) {
    const result = await db.query(`
      SELECT 
        cs.*,
        sp.plan_name,
        sp.description as plan_description,
        sp.monthly_price,
        sp.max_products,
        sp.max_users
      FROM client_subscriptions cs
      JOIN subscription_plans sp ON cs.plan_id = sp.id
      WHERE cs.client_id = $1 AND cs.is_active = true
    `, [clientId]);
    
    return result.rows[0] || null;
  }

  /**
   * Check if a specific feature is enabled for the client
   */
  async isFeatureEnabled(featureKey, clientId = 1) {
    const result = await db.query(`
      SELECT pf.is_enabled
      FROM client_subscriptions cs
      JOIN plan_features pf ON cs.plan_id = pf.plan_id
      JOIN features f ON pf.feature_id = f.id
      WHERE cs.client_id = $1 
        AND cs.is_active = true 
        AND f.feature_key = $2
    `, [clientId, featureKey]);
    
    return result.rows[0]?.is_enabled || false;
  }

  /**
   * Get all enabled features for a client
   */
  async getEnabledFeatures(clientId = 1) {
    const result = await db.query(`
      SELECT 
        f.feature_key,
        f.feature_name,
        f.description,
        pf.is_enabled
      FROM client_subscriptions cs
      JOIN plan_features pf ON cs.plan_id = pf.plan_id
      JOIN features f ON pf.feature_id = f.id
      WHERE cs.client_id = $1 
        AND cs.is_active = true
        AND pf.is_enabled = true
      ORDER BY f.feature_name
    `, [clientId]);
    
    return result.rows;
  }

  /**
   * Update feature for a specific client (admin only)
   */
  async updateClientFeature(clientId, featureKey, isEnabled) {
    const client = new db.pool.Client();
    await client.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get the current subscription and feature
      const subResult = await client.query(`
        SELECT cs.plan_id 
        FROM client_subscriptions cs 
        WHERE cs.client_id = $1 AND cs.is_active = true
      `, [clientId]);
      
      if (!subResult.rows[0]) {
        throw new Error('No active subscription found for client');
      }
      
      const planId = subResult.rows[0].plan_id;
      
      const featureResult = await client.query(`
        SELECT id FROM features WHERE feature_key = $1
      `, [featureKey]);
      
      if (!featureResult.rows[0]) {
        throw new Error('Feature not found');
      }
      
      const featureId = featureResult.rows[0].id;
      
      // Update or insert the plan feature
      await client.query(`
        INSERT INTO plan_features (plan_id, feature_id, is_enabled)
        VALUES ($1, $2, $3)
        ON CONFLICT (plan_id, feature_id) 
        DO UPDATE SET is_enabled = $3, updated_at = NOW()
      `, [planId, featureId, isEnabled]);
      
      await client.query('COMMIT');
      return true;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get shopping-specific features
   */
  async getShoppingFeatures(clientId = 1) {
    const shoppingFeatures = [
      'enable_shopping',
      'enable_pricing', 
      'enable_add_to_cart',
      'enable_checkout'
    ];
    
    const features = {};
    
    for (const feature of shoppingFeatures) {
      features[feature] = await this.isFeatureEnabled(feature, clientId);
    }
    
    // Determine shopping mode based on features
    if (features.enable_shopping && features.enable_add_to_cart && features.enable_checkout) {
      features.shopping_mode = 'full';
    } else if (features.enable_pricing) {
      features.shopping_mode = 'catalog';
    } else {
      features.shopping_mode = 'disabled';
    }
    
    return features;
  }

  /**
   * Update multiple shopping features at once
   */
  async updateShoppingFeatures(clientId, features) {
    const client = new db.pool.Client();
    await client.connect();
    
    try {
      await client.query('BEGIN');
      
      const featuresToUpdate = [
        'enable_shopping',
        'enable_pricing', 
        'enable_add_to_cart',
        'enable_checkout'
      ];
      
      for (const featureKey of featuresToUpdate) {
        if (featureKey in features) {
          await this.updateClientFeature(clientId, featureKey, features[featureKey]);
        }
      }
      
      await client.query('COMMIT');
      return true;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new SubscriptionService();
