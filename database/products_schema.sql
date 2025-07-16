-- =====================================================
-- PRODUCTS DATABASE SCHEMA
-- =====================================================

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    original_price DECIMAL(10,2), -- For sale pricing
    cost DECIMAL(10,2), -- Internal cost
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    weight DECIMAL(8,2), -- in kg
    dimensions JSONB, -- {width, height, depth} in cm
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_on_sale BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    tags TEXT[], -- Array of tags for search
    metadata JSONB, -- Flexible additional data
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create product categories table
CREATE TABLE IF NOT EXISTS product_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES product_categories(id),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create product images table
CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create product reviews table (for ratings and reviews)
CREATE TABLE IF NOT EXISTS product_reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Insert product categories
INSERT INTO product_categories (name, slug, description, image_url, sort_order) VALUES
('Gases Industriales', 'gases-industriales', 'Oxígeno, acetileno, argón y más gases para uso industrial', '/images/categories/gases.jpg', 1),
('Autopartes', 'autopartes', 'Repuestos y accesorios para todo tipo de vehículos', '/images/categories/autopartes.jpg', 2),
('Herramientas', 'herramientas', 'Herramientas profesionales para todos los oficios', '/images/categories/herramientas.jpg', 3),
('Equipos de Soldadura', 'equipos-soldadura', 'Equipos y consumibles para soldadura profesional', '/images/categories/soldadura.jpg', 4),
('Equipos Neumáticos', 'equipos-neumaticos', 'Compresores, pistolas neumáticas y accesorios', '/images/categories/neumaticos.jpg', 5)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Insert products based on the hardcoded data
INSERT INTO products (
    name, description, category, price, original_price, sku, brand, 
    stock_quantity, is_active, is_featured, is_new, is_on_sale, 
    rating, review_count, tags
) VALUES
(
    'Tanque de Oxígeno Industrial 50L',
    'Tanque de oxígeno de alta calidad para uso industrial y médico. Fabricado con materiales resistentes y certificado para uso profesional. Capacidad de 50 litros con presión máxima de 200 bar.',
    'Gases Industriales',
    1250.00,
    1400.00,
    'OXI-50L-001',
    'OASA Industrial',
    15,
    true,
    true,
    false,
    true,
    4.5,
    23,
    ARRAY['oxígeno', 'industrial', 'médico', 'tanque', '50L']
),
(
    'Soldadora MIG/MAG 200A',
    'Soldadora profesional MIG/MAG de 200 amperios. Ideal para trabajos de soldadura en talleres y construcción. Incluye antorcha y cables de alta calidad.',
    'Equipos de Soldadura',
    8500.00,
    NULL,
    'SOLD-MIG-200',
    'WeldMaster',
    8,
    true,
    true,
    true,
    false,
    4.8,
    45,
    ARRAY['soldadora', 'MIG', 'MAG', '200A', 'profesional']
),
(
    'Kit Herramientas Mecánico 150 Pzs',
    'Kit completo de herramientas mecánicas con 150 piezas. Incluye llaves, dados, destornilladores y accesorios. Presentado en maletín resistente.',
    'Herramientas',
    2100.00,
    2400.00,
    'KIT-MEC-150',
    'ToolPro',
    12,
    true,
    false,
    false,
    true,
    4.3,
    67,
    ARRAY['kit', 'herramientas', 'mecánico', '150 piezas', 'maletín']
),
(
    'Filtro de Aceite Universal',
    'Filtro de aceite universal compatible con múltiples marcas de vehículos. Alta eficiencia de filtrado y larga duración.',
    'Autopartes',
    180.00,
    NULL,
    'FILT-ACE-UNI',
    'AutoFilter',
    0,
    true,
    false,
    false,
    false,
    4.1,
    89,
    ARRAY['filtro', 'aceite', 'universal', 'motor', 'automotriz']
),
(
    'Regulador de Presión Argón',
    'Regulador de presión especializado para gas argón. Control preciso de presión para trabajos de soldadura TIG. Construcción robusta y duradera.',
    'Gases Industriales',
    950.00,
    NULL,
    'REG-ARG-001',
    'GasControl',
    6,
    true,
    false,
    true,
    false,
    4.6,
    34,
    ARRAY['regulador', 'presión', 'argón', 'soldadura', 'TIG']
),
(
    'Compresor de Aire 100L',
    'Compresor de aire industrial de 100 litros. Motor potente y tanque de gran capacidad. Ideal para talleres y aplicaciones industriales.',
    'Equipos Neumáticos',
    12500.00,
    14000.00,
    'COMP-100L-001',
    'AirPower',
    4,
    true,
    true,
    false,
    true,
    4.7,
    28,
    ARRAY['compresor', 'aire', '100L', 'industrial', 'taller']
),
(
    'Electrodos de Soldadura 3.2mm E6013',
    'Electrodos para soldadura de acero al carbono. Diámetro 3.2mm, tipo E6013. Excelente para principiantes y soldadura general.',
    'Equipos de Soldadura',
    85.00,
    NULL,
    'ELEC-E6013-32',
    'WeldPro',
    50,
    true,
    false,
    false,
    false,
    4.4,
    156,
    ARRAY['electrodos', 'soldadura', 'E6013', '3.2mm', 'acero']
),
(
    'Llave Inglesa Ajustable 12"',
    'Llave inglesa ajustable de 12 pulgadas. Acero al cromo vanadio para mayor resistencia. Mandíbulas antideslizantes.',
    'Herramientas',
    245.00,
    NULL,
    'LLAVE-ING-12',
    'ToolMaster',
    25,
    true,
    false,
    false,
    false,
    4.2,
    78,
    ARRAY['llave', 'inglesa', 'ajustable', '12 pulgadas', 'cromo vanadio']
),
(
    'Batería para Auto 12V 75Ah',
    'Batería libre de mantenimiento para automóviles. 12 voltios, 75 amperios-hora. Ideal para vehículos medianos y grandes.',
    'Autopartes',
    1850.00,
    2100.00,
    'BAT-12V-75AH',
    'PowerCell',
    18,
    true,
    false,
    false,
    true,
    4.3,
    92,
    ARRAY['batería', 'auto', '12V', '75Ah', 'libre mantenimiento']
),
(
    'Careta de Soldadura Automática',
    'Careta de soldadura con cristal fotosensible automático. Protección UV/IR. Ajuste de sensibilidad y tiempo de retardo.',
    'Equipos de Soldadura',
    1250.00,
    NULL,
    'CAR-AUTO-001',
    'SafeWeld',
    10,
    true,
    true,
    true,
    false,
    4.9,
    67,
    ARRAY['careta', 'soldadura', 'automática', 'fotosensible', 'protección']
)
ON CONFLICT (sku) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    stock_quantity = EXCLUDED.stock_quantity,
    updated_at = NOW();

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_active ON product_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON product_categories(parent_id);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(is_primary);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON product_reviews(is_approved);

-- =====================================================
-- CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for products with full details
CREATE OR REPLACE VIEW products_full AS
SELECT 
    p.*,
    CASE 
        WHEN p.stock_quantity > 0 THEN true 
        ELSE false 
    END as in_stock,
    CASE 
        WHEN p.original_price IS NOT NULL AND p.original_price > p.price 
        THEN true 
        ELSE false 
    END as has_discount,
    CASE 
        WHEN p.original_price IS NOT NULL AND p.original_price > p.price 
        THEN ROUND(((p.original_price - p.price) / p.original_price * 100), 2)
        ELSE 0 
    END as discount_percentage
FROM products p
WHERE p.is_active = true;

-- View for featured products
CREATE OR REPLACE VIEW featured_products AS
SELECT * FROM products_full
WHERE is_featured = true
ORDER BY created_at DESC;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to relevant tables
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_categories_updated_at ON product_categories;
CREATE TRIGGER update_product_categories_updated_at
    BEFORE UPDATE ON product_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
