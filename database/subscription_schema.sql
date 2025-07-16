-- =====================================================
-- SUBSCRIPTION & FEATURE MANAGEMENT SYSTEM
-- =====================================================

-- Features table - defines all available features
CREATE TABLE IF NOT EXISTS features (
    id BIGSERIAL PRIMARY KEY,
    feature_key VARCHAR(100) UNIQUE NOT NULL,
    feature_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- 'shopping', 'analytics', 'cms', etc.
    is_core_feature BOOLEAN DEFAULT FALSE, -- true for essential features
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id BIGSERIAL PRIMARY KEY,
    plan_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    yearly_price DECIMAL(10,2), -- Optional yearly pricing
    max_products INTEGER DEFAULT -1, -- -1 = unlimited
    max_users INTEGER DEFAULT -1, -- -1 = unlimited
    max_storage_gb INTEGER DEFAULT -1, -- -1 = unlimited
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Plan features - defines which features are included in each plan
CREATE TABLE IF NOT EXISTS plan_features (
    id BIGSERIAL PRIMARY KEY,
    plan_id BIGINT NOT NULL,
    feature_id BIGINT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE,
    UNIQUE(plan_id, feature_id)
);

-- Clients table - your customers
CREATE TABLE IF NOT EXISTS clients (
    id BIGSERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Client subscriptions - tracks which plan each client has
CREATE TABLE IF NOT EXISTS client_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- NULL = no expiration
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert core features
INSERT INTO features (feature_key, feature_name, description, category, is_core_feature) VALUES 
    ('enable_shopping', 'Shopping Cart', 'Enable shopping cart and e-commerce functionality', 'shopping', false),
    ('enable_pricing', 'Product Pricing', 'Show product prices to customers', 'shopping', false),
    ('enable_add_to_cart', 'Add to Cart', 'Allow customers to add products to cart', 'shopping', false),
    ('enable_checkout', 'Checkout Process', 'Enable full checkout and payment processing', 'shopping', false),
    ('product_catalog', 'Product Catalog', 'Display product information and images', 'catalog', true),
    ('user_management', 'User Management', 'Manage customer accounts and authentication', 'users', true),
    ('cms_basic', 'Basic CMS', 'Content management for pages and blog posts', 'cms', true),
    ('analytics_basic', 'Basic Analytics', 'View basic site statistics', 'analytics', false),
    ('analytics_advanced', 'Advanced Analytics', 'Detailed analytics and reporting', 'analytics', false),
    ('custom_branding', 'Custom Branding', 'Custom logos, colors, and branding', 'branding', false)
ON CONFLICT (feature_key) DO NOTHING;

-- Insert subscription plans
INSERT INTO subscription_plans (plan_name, description, monthly_price, yearly_price, max_products, max_users) VALUES 
    ('Free', 'Basic catalog functionality only', 0.00, 0.00, 50, 2),
    ('Basic', 'Small business e-commerce solution', 29.99, 299.99, 500, 5),
    ('Professional', 'Full-featured e-commerce platform', 79.99, 799.99, 2000, 20),
    ('Enterprise', 'Large scale e-commerce with advanced features', 199.99, 1999.99, -1, -1)
ON CONFLICT (plan_name) DO NOTHING;

-- Assign features to plans
INSERT INTO plan_features (plan_id, feature_id, is_enabled) 
SELECT p.id, f.id, 
    CASE 
        -- Free plan: only core features
        WHEN p.plan_name = 'Free' AND f.is_core_feature = true THEN true
        WHEN p.plan_name = 'Free' AND f.feature_key = 'enable_pricing' THEN true
        WHEN p.plan_name = 'Free' THEN false
        
        -- Basic plan: shopping features enabled
        WHEN p.plan_name = 'Basic' AND f.feature_key IN ('enable_shopping', 'enable_pricing', 'enable_add_to_cart', 'enable_checkout') THEN true
        WHEN p.plan_name = 'Basic' AND f.is_core_feature = true THEN true
        WHEN p.plan_name = 'Basic' AND f.feature_key = 'analytics_basic' THEN true
        WHEN p.plan_name = 'Basic' THEN false
        
        -- Professional plan: most features
        WHEN p.plan_name = 'Professional' AND f.feature_key NOT IN ('analytics_advanced') THEN true
        WHEN p.plan_name = 'Professional' THEN false
        
        -- Enterprise plan: all features
        WHEN p.plan_name = 'Enterprise' THEN true
        
        ELSE false
    END
FROM subscription_plans p
CROSS JOIN features f
ON CONFLICT (plan_id, feature_id) DO NOTHING;

-- Insert a default client (OASA)
INSERT INTO clients (client_name, company_name, email) VALUES 
    ('OASA Admin', 'OASA Industrial', 'admin@oasa.com')
ON CONFLICT (email) DO NOTHING;

-- Assign OASA to Professional plan by default
INSERT INTO client_subscriptions (client_id, plan_id, is_active) 
SELECT c.id, p.id, true
FROM clients c, subscription_plans p 
WHERE c.email = 'admin@oasa.com' AND p.plan_name = 'Professional'
ON CONFLICT DO NOTHING;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_features_feature_id ON plan_features(feature_id);
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_client_id ON client_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_subscriptions_active ON client_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_features_category ON features(category);
CREATE INDEX IF NOT EXISTS idx_features_key ON features(feature_key);
