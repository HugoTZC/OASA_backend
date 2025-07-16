const express = require('express');
const router = express.Router();
const db = require('../config/database');
const fs = require('fs');
const path = require('path');

// Admin route to initialize database schema
router.post('/init-schema', async (req, res) => {
  try {
    console.log('Starting database schema initialization...');
    
    // Create tables in order
    const createStatements = [
      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100),
        price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        original_price DECIMAL(10,2),
        cost DECIMAL(10,2),
        sku VARCHAR(100) UNIQUE,
        barcode VARCHAR(100),
        brand VARCHAR(100),
        model VARCHAR(100),
        weight DECIMAL(8,2),
        dimensions JSONB,
        stock_quantity INTEGER DEFAULT 0,
        min_stock_level INTEGER DEFAULT 0,
        max_stock_level INTEGER DEFAULT 1000,
        is_active BOOLEAN DEFAULT TRUE,
        is_featured BOOLEAN DEFAULT FALSE,
        is_new BOOLEAN DEFAULT FALSE,
        is_on_sale BOOLEAN DEFAULT FALSE,
        rating DECIMAL(3,2) DEFAULT 0.00,
        review_count INTEGER DEFAULT 0,
        tags TEXT[],
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )`,
      
      // Product categories table
      `CREATE TABLE IF NOT EXISTS product_categories (
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
      )`,
      
      // Product images table
      `CREATE TABLE IF NOT EXISTS product_images (
        id BIGSERIAL PRIMARY KEY,
        product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        alt_text VARCHAR(255),
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )`,
      
      // Product reviews table
      `CREATE TABLE IF NOT EXISTS product_reviews (
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
      )`
    ];
    
    // Execute CREATE TABLE statements
    for (let i = 0; i < createStatements.length; i++) {
      console.log(`Creating table ${i + 1}/${createStatements.length}...`);
      try {
        await db.query(createStatements[i]);
        console.log(`✅ Table ${i + 1} created successfully`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Table ${i + 1} already exists, skipping`);
        } else {
          throw error;
        }
      }
    }
    
    // Create indexes
    const indexStatements = [
      'CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)',
      'CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active)',
      'CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured)',
      'CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)',
      'CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC)',
      'CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity)',
      'CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug)',
      'CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON product_categories(parent_id)',
      'CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id)',
      'CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(is_primary)',
      'CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id)',
      'CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating)',
      'CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON product_reviews(is_approved)'
    ];
    
    // Execute index statements
    for (let i = 0; i < indexStatements.length; i++) {
      try {
        await db.query(indexStatements[i]);
        console.log(`✅ Index ${i + 1}/${indexStatements.length} created`);
      } catch (error) {
        console.log(`⚠️  Index ${i + 1} error (likely already exists):`, error.message);
      }
    }
    
    // Insert sample data
    await insertSampleData(db);
    
    // Check what was created
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%product%'
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    console.log('Product tables:', tables);
    
    // Get counts
    const counts = {};
    for (const table of tables) {
      try {
        const countResult = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        counts[table] = parseInt(countResult.rows[0].count);
      } catch (error) {
        counts[table] = 'Error';
      }
    }
    
    res.json({
      success: true,
      message: 'Database schema initialized successfully',
      tables,
      counts
    });
    
  } catch (error) {
    console.error('Schema initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize schema',
      message: error.message
    });
  }
});

async function insertSampleData(db) {
  console.log('Inserting sample data...');
  
  // Insert categories
  const categories = [
    { name: 'Gases Industriales', slug: 'gases-industriales', description: 'Oxígeno, acetileno, argón y más gases para uso industrial', sort_order: 1 },
    { name: 'Autopartes', slug: 'autopartes', description: 'Repuestos y accesorios para todo tipo de vehículos', sort_order: 2 },
    { name: 'Herramientas', slug: 'herramientas', description: 'Herramientas profesionales para todos los oficios', sort_order: 3 },
    { name: 'Equipos de Soldadura', slug: 'equipos-soldadura', description: 'Equipos y consumibles para soldadura profesional', sort_order: 4 },
    { name: 'Equipos Neumáticos', slug: 'equipos-neumaticos', description: 'Compresores, pistolas neumáticas y accesorios', sort_order: 5 }
  ];
  
  for (const cat of categories) {
    try {
      await db.query(`
        INSERT INTO product_categories (name, slug, description, sort_order)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (slug) DO UPDATE SET 
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          updated_at = NOW()
      `, [cat.name, cat.slug, cat.description, cat.sort_order]);
    } catch (error) {
      console.log(`Category "${cat.name}" error:`, error.message);
    }
  }
  
  // Insert sample products
  const products = [
    {
      name: 'Tanque de Oxígeno Industrial 50L',
      description: 'Tanque de oxígeno de alta calidad para uso industrial y médico. Fabricado con materiales resistentes y certificado para uso profesional.',
      category: 'Gases Industriales',
      price: 1250.00,
      original_price: 1400.00,
      sku: 'OXI-50L-001',
      brand: 'OASA',
      stock_quantity: 15,
      is_featured: true,
      is_on_sale: true,
      rating: 4.5,
      review_count: 23,
      tags: ['oxígeno', 'industrial', 'medicinal', '50L']
    },
    {
      name: 'Soldadora MIG/MAG 200A',
      description: 'Soldadora profesional MIG/MAG de 200 amperios con control digital y sistema de refrigeración.',
      category: 'Equipos de Soldadura',
      price: 8500.00,
      sku: 'SOLD-MIG-200',
      brand: 'TechWeld',
      stock_quantity: 8,
      is_featured: true,
      is_new: true,
      rating: 4.8,
      review_count: 45,
      tags: ['soldadora', 'MIG', 'MAG', '200A', 'profesional']
    },
    {
      name: 'Kit Herramientas Mecánico 150 Pzs',
      description: 'Kit completo de herramientas mecánicas de 150 piezas en maletín resistente.',
      category: 'Herramientas',
      price: 2100.00,
      original_price: 2400.00,
      sku: 'TOOL-KIT-150',
      brand: 'ProTools',
      stock_quantity: 12,
      is_on_sale: true,
      rating: 4.3,
      review_count: 67,
      tags: ['herramientas', 'mecánico', 'kit', '150 piezas']
    },
    {
      name: 'Filtro de Aceite Universal',
      description: 'Filtro de aceite universal compatible con múltiples marcas y modelos de vehículos.',
      category: 'Autopartes',
      price: 180.00,
      sku: 'FILT-ACEIT-UNI',
      brand: 'AutoParts',
      stock_quantity: 0,
      rating: 4.1,
      review_count: 89,
      tags: ['filtro', 'aceite', 'universal', 'autoparte']
    },
    {
      name: 'Regulador de Presión Argón',
      description: 'Regulador de presión para tanques de argón con manómetros de alta precisión.',
      category: 'Gases Industriales',
      price: 950.00,
      sku: 'REG-ARG-001',
      brand: 'OASA',
      stock_quantity: 6,
      is_new: true,
      rating: 4.6,
      review_count: 34,
      tags: ['regulador', 'argón', 'presión', 'manómetro']
    },
    {
      name: 'Compresor de Aire 100L',
      description: 'Compresor de aire industrial de 100 litros con motor de 3HP y sistema silencioso.',
      category: 'Equipos Neumáticos',
      price: 12500.00,
      original_price: 14000.00,
      sku: 'COMP-AIR-100L',
      brand: 'AirMax',
      stock_quantity: 3,
      is_featured: true,
      is_on_sale: true,
      rating: 4.7,
      review_count: 28,
      tags: ['compresor', 'aire', '100L', '3HP', 'silencioso']
    }
  ];
  
  for (const product of products) {
    try {
      const result = await db.query(`
        INSERT INTO products (
          name, description, category, price, original_price, sku, brand,
          stock_quantity, is_featured, is_new, is_on_sale, rating, review_count, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (sku) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          price = EXCLUDED.price,
          updated_at = NOW()
        RETURNING id
      `, [
        product.name, product.description, product.category, product.price,
        product.original_price, product.sku, product.brand, product.stock_quantity,
        product.is_featured, product.is_new, product.is_on_sale, product.rating,
        product.review_count, product.tags
      ]);
      console.log(`✅ Product "${product.name}" inserted/updated`);
    } catch (error) {
      console.log(`Product "${product.name}" error:`, error.message);
    }
  }
  
  console.log('Sample data insertion completed');
}

// Admin route to get database status
router.get('/db-status', async (req, res) => {
  try {
    // Check existing tables
    const tablesResult = await db.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = {};
    for (const row of tablesResult.rows) {
      try {
        const countResult = await db.query(`SELECT COUNT(*) as count FROM ${row.table_name}`);
        tables[row.table_name] = {
          type: row.table_type,
          count: parseInt(countResult.rows[0].count)
        };
      } catch (error) {
        tables[row.table_name] = {
          type: row.table_type,
          count: 'Error'
        };
      }
    }
    
    res.json({
      success: true,
      tables
    });
    
  } catch (error) {
    console.error('Database status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get database status',
      message: error.message
    });
  }
});

// Admin route to insert sample products
router.post('/insert-sample-products', async (req, res) => {
  try {
    console.log('Inserting sample products...');
    
    // Sample products data
    const sampleProducts = [
      {
        name: 'Tanque de Oxígeno Industrial 50L',
        slug: 'tanque-oxigeno-industrial-50l',
        sku: 'OXI-50L-001',
        description: 'Tanque de oxígeno de alta calidad para uso industrial y médico. Fabricado con materiales resistentes y certificado para uso profesional. Capacidad de 50 litros con presión máxima de 200 bar.',
        short_description: 'Tanque de oxígeno industrial de 50 litros para uso profesional.',
        category_id: 1,
        price: 1250.00,
        original_price: 1400.00,
        stock_quantity: 15,
        is_featured: true,
        rating_average: 4.5,
        rating_count: 23
      },
      {
        name: 'Soldadora MIG/MAG 200A',
        slug: 'soldadora-mig-mag-200a',
        sku: 'SOL-MIG-200',
        description: 'Soldadora MIG/MAG profesional de 200 amperios. Incluye antorcha, cables y accesorios. Ideal para trabajos de soldadura semi-automática en acero y aluminio.',
        short_description: 'Soldadora MIG/MAG profesional de 200A con accesorios completos.',
        category_id: 2,
        price: 8500.00,
        original_price: null,
        stock_quantity: 5,
        is_featured: true,
        rating_average: 4.8,
        rating_count: 45
      },
      {
        name: 'Kit Herramientas Mecánico 150 Pzs',
        slug: 'kit-herramientas-mecanico-150pzs',
        sku: 'KIT-MEC-150',
        description: 'Kit completo de herramientas mecánicas con 150 piezas. Incluye llaves, dados, destornilladores y accesorios en maletín resistente.',
        short_description: 'Kit completo de 150 herramientas mecánicas en maletín.',
        category_id: 3,
        price: 2100.00,
        original_price: 2400.00,
        stock_quantity: 10,
        is_featured: true,
        rating_average: 4.3,
        rating_count: 156
      },
      {
        name: 'Compresor de Aire 100L 3HP',
        slug: 'compresor-aire-100l-3hp',
        sku: 'COM-AIR-100',
        description: 'Compresor de aire de 100 litros con motor de 3HP. Presión máxima 8 bar. Ideal para uso profesional e industrial.',
        short_description: 'Compresor de aire profesional de 100L y 3HP.',
        category_id: 5,
        price: 12500.00,
        original_price: 14000.00,
        stock_quantity: 3,
        is_featured: true,
        rating_average: 4.7,
        rating_count: 28
      },
      {
        name: 'Regulador de Presión Argón',
        slug: 'regulador-presion-argon',
        sku: 'REG-ARG-001',
        description: 'Regulador de presión profesional para argón. Construcción robusta en latón con manómetros de alta precisión. Ideal para soldadura TIG y MIG.',
        short_description: 'Regulador de presión profesional para argón con manómetros de precisión.',
        category_id: 1,
        price: 950.00,
        original_price: null,
        stock_quantity: 8,
        is_featured: false,
        rating_average: 4.6,
        rating_count: 34
      },
      {
        name: 'Electrodo 6013 3.2mm (5kg)',
        slug: 'electrodo-6013-32mm-5kg',
        sku: 'ELE-6013-32',
        description: 'Electrodos de soldadura 6013 de 3.2mm. Paquete de 5kg ideal para soldadura de mantenimiento y reparación general.',
        short_description: 'Electrodos 6013 de 3.2mm, paquete de 5kg para soldadura general.',
        category_id: 2,
        price: 320.00,
        original_price: 380.00,
        stock_quantity: 25,
        is_featured: false,
        rating_average: 4.2,
        rating_count: 67
      }
    ];

    let insertedCount = 0;
    
    for (const product of sampleProducts) {
      try {
        // Check if product already exists
        const existingProduct = await db.query('SELECT id FROM dbo.products WHERE sku = $1', [product.sku]);
        
        if (existingProduct.rows.length === 0) {
          const insertQuery = `
            INSERT INTO dbo.products (
              name, slug, sku, description, short_description, category_id,
              price, original_price, stock_quantity, is_featured, is_active,
              rating_average, rating_count, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
          `;
          
          await db.query(insertQuery, [
            product.name,
            product.slug,
            product.sku,
            product.description,
            product.short_description,
            product.category_id,
            product.price,
            product.original_price,
            product.stock_quantity,
            product.is_featured,
            true, // is_active
            product.rating_average,
            product.rating_count
          ]);
          
          insertedCount++;
        }
      } catch (error) {
        console.error(`Error inserting product ${product.name}:`, error.message);
      }
    }
    
    // Get final count
    const countResult = await db.query('SELECT COUNT(*) as count FROM dbo.products');
    const totalProducts = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      message: `Successfully inserted ${insertedCount} sample products`,
      insertedCount,
      totalProducts
    });
    
  } catch (error) {
    console.error('Error inserting sample products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to insert sample products',
      message: error.message
    });
  }
});

module.exports = router;
