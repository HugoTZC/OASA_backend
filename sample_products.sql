-- Insert sample products based on existing categories
-- Let's create some products using the existing categories

-- Sample products for "Gases Industriales" (category_id = 1)
INSERT INTO dbo.products (
    name, slug, sku, description, short_description, category_id, 
    price, original_price, stock_quantity, is_featured, is_active, 
    rating_average, rating_count, created_at, updated_at
) VALUES
(
    'Tanque de Oxígeno Industrial 50L',
    'tanque-oxigeno-industrial-50l',
    'OXI-50L-001',
    'Tanque de oxígeno de alta calidad para uso industrial y médico. Fabricado con materiales resistentes y certificado para uso profesional. Capacidad de 50 litros con presión máxima de 200 bar.',
    'Tanque de oxígeno industrial de 50 litros para uso profesional.',
    1,
    1250.00,
    1400.00,
    15,
    true,
    true,
    4.5,
    23,
    NOW(),
    NOW()
),
(
    'Regulador de Presión Argón',
    'regulador-presion-argon',
    'REG-ARG-001',
    'Regulador de presión profesional para argón. Construcción robusta en latón con manómetros de alta precisión. Ideal para soldadura TIG y MIG.',
    'Regulador de presión profesional para argón con manómetros de precisión.',
    1,
    950.00,
    NULL,
    8,
    false,
    true,
    4.6,
    34,
    NOW(),
    NOW()
),
(
    'Acetileno Industrial 10 Kg',
    'acetileno-industrial-10kg',
    'ACE-10K-001',
    'Cilindro de acetileno de 10 kg para soldadura oxiacetilénica. Gas de alta pureza con válvula de seguridad incorporada.',
    'Cilindro de acetileno industrial de 10 kg para soldadura.',
    1,
    850.00,
    NULL,
    12,
    false,
    true,
    4.3,
    18,
    NOW() - INTERVAL '45 days',
    NOW()
);

-- Sample products for "Equipos de Soldadura" (category_id = 2)  
INSERT INTO dbo.products (
    name, slug, sku, description, short_description, category_id,
    price, original_price, stock_quantity, is_featured, is_active,
    rating_average, rating_count, created_at, updated_at
) VALUES
(
    'Soldadora MIG/MAG 200A',
    'soldadora-mig-mag-200a',
    'SOL-MIG-200',
    'Soldadora MIG/MAG profesional de 200 amperios. Incluye antorcha, cables y accesorios. Ideal para trabajos de soldadura semi-automática en acero y aluminio.',
    'Soldadora MIG/MAG profesional de 200A con accesorios completos.',
    2,
    8500.00,
    NULL,
    5,
    true,
    true,
    4.8,
    45,
    NOW() - INTERVAL '10 days',
    NOW()
),
(
    'Electrodo 6013 3.2mm (5kg)',
    'electrodo-6013-32mm-5kg',
    'ELE-6013-32',
    'Electrodos de soldadura 6013 de 3.2mm. Paquete de 5kg ideal para soldadura de mantenimiento y reparación general.',
    'Electrodos 6013 de 3.2mm, paquete de 5kg para soldadura general.',
    2,
    320.00,
    380.00,
    25,
    false,
    true,
    4.2,
    67,
    NOW() - INTERVAL '60 days',
    NOW()
),
(
    'Careta de Soldadura Automática',
    'careta-soldadura-automatica',
    'CAR-AUTO-001',
    'Careta de soldadura con oscurecimiento automático. Ajuste de sensibilidad y tiempo de reacción. Protección UV/IR.',
    'Careta de soldadura con oscurecimiento automático y protección UV/IR.',
    2,
    1200.00,
    1400.00,
    18,
    false,
    true,
    4.7,
    92,
    NOW() - INTERVAL '20 days',
    NOW()
);

-- Sample products for "Herramientas" (category_id = 3)
INSERT INTO dbo.products (
    name, slug, sku, description, short_description, category_id,
    price, original_price, stock_quantity, is_featured, is_active,
    rating_average, rating_count, created_at, updated_at
) VALUES
(
    'Kit Herramientas Mecánico 150 Pzs',
    'kit-herramientas-mecanico-150pzs',
    'KIT-MEC-150',
    'Kit completo de herramientas mecánicas con 150 piezas. Incluye llaves, dados, destornilladores y accesorios en maletín resistente.',
    'Kit completo de 150 herramientas mecánicas en maletín.',
    3,
    2100.00,
    2400.00,
    10,
    true,
    true,
    4.3,
    156,
    NOW() - INTERVAL '5 days',
    NOW()
),
(
    'Taladro Percutor 13mm 800W',
    'taladro-percutor-13mm-800w',
    'TAL-PER-800',
    'Taladro percutor eléctrico de 13mm con motor de 800W. Función de percusión para concreto y mampostería.',
    'Taladro percutor de 13mm y 800W con función de percusión.',
    3,
    1650.00,
    NULL,
    7,
    false,
    true,
    4.1,
    43,
    NOW() - INTERVAL '35 days',
    NOW()
),
(
    'Amoladora Angular 4.5" 900W',
    'amoladora-angular-45-900w',
    'AMO-ANG-900',
    'Amoladora angular de 4.5 pulgadas con motor de 900W. Ideal para corte y desbaste de metales.',
    'Amoladora angular de 4.5" y 900W para corte y desbaste.',
    3,
    890.00,
    NULL,
    15,
    false,
    true,
    4.4,
    78,
    NOW() - INTERVAL '80 days',
    NOW()
);

-- Sample products for "Equipos Neumáticos" (category_id = 5)
INSERT INTO dbo.products (
    name, slug, sku, description, short_description, category_id,
    price, original_price, stock_quantity, is_featured, is_active,
    rating_average, rating_count, created_at, updated_at
) VALUES
(
    'Compresor de Aire 100L 3HP',
    'compresor-aire-100l-3hp',
    'COM-AIR-100',
    'Compresor de aire de 100 litros con motor de 3HP. Presión máxima 8 bar. Ideal para uso profesional e industrial.',
    'Compresor de aire profesional de 100L y 3HP.',
    5,
    12500.00,
    14000.00,
    3,
    true,
    true,
    4.7,
    28,
    NOW() - INTERVAL '15 days',
    NOW()
),
(
    'Pistola Neumática de Impacto 1/2"',
    'pistola-neumatica-impacto-12',
    'PIS-NEU-12',
    'Pistola neumática de impacto de 1/2 pulgada. Torque máximo 600 Nm. Ideal para montaje y desmontaje de neumáticos.',
    'Pistola neumática de impacto 1/2" con torque máximo 600 Nm.',
    5,
    2800.00,
    NULL,
    12,
    false,
    true,
    4.5,
    51,
    NOW() - INTERVAL '25 days',
    NOW()
);

-- Sample products for "Seguridad Industrial" (category_id = 6)
INSERT INTO dbo.products (
    name, slug, sku, description, short_description, category_id,
    price, original_price, stock_quantity, is_featured, is_active,
    rating_average, rating_count, created_at, updated_at
) VALUES
(
    'Casco de Seguridad Industrial',
    'casco-seguridad-industrial',
    'CAS-SEG-001',
    'Casco de seguridad industrial con suspensión de 4 puntos. Cumple normas ANSI Z89.1. Material ABS de alta resistencia.',
    'Casco de seguridad industrial con suspensión de 4 puntos.',
    6,
    185.00,
    NULL,
    50,
    false,
    true,
    4.2,
    134,
    NOW() - INTERVAL '40 days',
    NOW()
),
(
    'Guantes de Seguridad Nitrilo',
    'guantes-seguridad-nitrilo',
    'GUA-NIT-001',
    'Guantes de seguridad recubiertos con nitrilo. Excelente agarre en seco y húmedo. Resistentes a aceites y químicos.',
    'Guantes de seguridad con recubrimiento de nitrilo.',
    6,
    95.00,
    120.00,
    100,
    false,
    true,
    4.0,
    89,
    NOW() - INTERVAL '70 days',
    NOW()
);
