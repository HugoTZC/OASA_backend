-- SQLite-compatible schema for products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    imagepath TEXT,
    hierarchy INTEGER CHECK(hierarchy IN (1, 2, 3)),
    sku TEXT UNIQUE NOT NULL
);

-- Sample data: 10 realistic industrial products
INSERT INTO products (name, description, category, imagepath, hierarchy, sku) VALUES
    ('Industrial Argon Gas', 'High-purity argon gas for welding and metal fabrication, 99.99% purity', 'Gases', '/images/products/argon-gas.jpg', 1, 'GAS-ARGN-001'),
    ('MIG Welding Wire', '0.035" diameter mild steel MIG welding wire, 33lb spool', 'Welding Equipment', '/images/products/mig-wire.jpg', 2, 'WLD-MIG-035'),
    ('Pneumatic Air Regulator', '1/4" NPT brass air regulator with gauge, 0-150 PSI', 'Pneumatic Equipment', '/images/products/regulator-brass.jpg', 2, 'PNU-REG-014'),
    ('Tungsten Electrode Set', 'Pack of 10 tungsten electrodes for TIG welding, 3/32"', 'Welding Equipment', '/images/products/tungsten-set.jpg', 2, 'WLD-TIG-T10'),
    ('Impact Wrench Set', '1/2" drive pneumatic impact wrench with 15-piece socket set', 'Tools', '/images/products/impact-wrench.jpg', 1, 'TLS-IMP-012'),
    ('Steel Brake Lines', 'Stainless steel braided brake lines, 36" length, -3 AN', 'Auto Parts', '/images/products/brake-lines.jpg', 2, 'AUT-BRK-036'),
    ('Oxygen Industrial Grade', 'Industrial oxygen gas for cutting and welding, 99.5% purity', 'Gases', '/images/products/oxygen-industrial.jpg', 1, 'GAS-OXY-002'),
    ('Air Hose 3/8"', 'Hybrid air hose 3/8" x 50ft, 300 PSI working pressure', 'Pneumatic Equipment', '/images/products/air-hose-50.jpg', 1, 'PNU-HSE-038'),
    ('Pilot Check Valve', '1/4" NPT pneumatic pilot check valve, 250 PSI max', 'Pneumatic Equipment', '/images/products/pilot-check.jpg', 3, 'PNU-CHK-014'),
    ('TIG Foot Pedal', 'Amphenol-style TIG welding foot pedal for amperage control', 'Welding Equipment', '/images/products/tig-pedal.jpg', 2, 'WLD-TIG-FT1');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_hierarchy ON products(hierarchy);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);