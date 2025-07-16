const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all products with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 12,
      minPrice,
      maxPrice,
      inStock,
      isNew,
      isSale
    } = req.query;

    let query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'alt_text', pi.alt_text,
              'is_primary', pi.is_primary,
              'display_order', pi.display_order
            ) ORDER BY pi.display_order, pi.is_primary DESC
          ) FILTER (WHERE pi.id IS NOT NULL), 
          '[]'::json
        ) as images
      FROM dbo.products p
      LEFT JOIN dbo.categories c ON p.category_id = c.id
      LEFT JOIN dbo.product_images pi ON p.id = pi.product_id
      WHERE p.is_active = true
    `;

    const params = [];
    let paramIndex = 1;

    // Add filters
    if (category) {
      query += ` AND (c.name ILIKE $${paramIndex} OR c.slug ILIKE $${paramIndex})`;
      params.push(`%${category}%`);
      paramIndex++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex} OR p.short_description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (minPrice) {
      query += ` AND p.price >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      query += ` AND p.price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (inStock === 'true') {
      query += ` AND p.stock_quantity > 0`;
    }

    if (isNew === 'true') {
      query += ` AND p.created_at >= NOW() - INTERVAL '30 days'`;
    }

    if (isSale === 'true') {
      query += ` AND p.original_price IS NOT NULL AND p.original_price > p.price`;
    }

    query += ` GROUP BY p.id, c.name, c.slug`;

    // Add sorting
    const validSortFields = ['name', 'price', 'rating_average', 'created_at'];
    const validSortOrders = ['asc', 'desc'];
    
    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toLowerCase())) {
      const sortField = sortBy === 'rating' ? 'rating_average' : sortBy;
      query += ` ORDER BY p.${sortField} ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY p.name ASC`;
    }

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM dbo.products p
      LEFT JOIN dbo.categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    
    const countParams = [];
    let countParamIndex = 1;

    // Apply same filters for count
    if (category) {
      countQuery += ` AND (c.name ILIKE $${countParamIndex} OR c.slug ILIKE $${countParamIndex})`;
      countParams.push(`%${category}%`);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (p.name ILIKE $${countParamIndex} OR p.description ILIKE $${countParamIndex} OR p.short_description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (minPrice) {
      countQuery += ` AND p.price >= $${countParamIndex}`;
      countParams.push(parseFloat(minPrice));
      countParamIndex++;
    }

    if (maxPrice) {
      countQuery += ` AND p.price <= $${countParamIndex}`;
      countParams.push(parseFloat(maxPrice));
      countParamIndex++;
    }

    if (inStock === 'true') {
      countQuery += ` AND p.stock_quantity > 0`;
    }

    if (isNew === 'true') {
      countQuery += ` AND p.created_at >= NOW() - INTERVAL '30 days'`;
    }

    if (isSale === 'true') {
      countQuery += ` AND p.original_price IS NOT NULL AND p.original_price > p.price`;
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Format products
    const products = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      shortDescription: row.short_description,
      category: row.category_name || 'Sin categoría',
      categorySlug: row.category_slug,
      categoryId: row.category_id,
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : null,
      costPrice: row.cost_price ? parseFloat(row.cost_price) : null,
      sku: row.sku,
      stockQuantity: row.stock_quantity,
      minStockLevel: row.min_stock_level,
      weight: row.weight ? parseFloat(row.weight) : null,
      dimensions: {
        length: row.dimensions_length ? parseFloat(row.dimensions_length) : null,
        width: row.dimensions_width ? parseFloat(row.dimensions_width) : null,
        height: row.dimensions_height ? parseFloat(row.dimensions_height) : null,
      },
      isFeatured: row.is_featured || false,
      isActive: row.is_active || false,
      isDigital: row.is_digital || false,
      requiresShipping: row.requires_shipping !== false,
      isNew: false, // We'll calculate this based on created_at
      isOnSale: row.original_price && parseFloat(row.original_price) > parseFloat(row.price),
      rating: parseFloat(row.rating_average || 0),
      reviewCount: row.rating_count || 0,
      viewCount: row.view_count || 0,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      images: row.images || [],
      inStock: row.stock_quantity > 0,
      image: row.images && row.images.length > 0 
        ? row.images.find(img => img.is_primary)?.image_url || row.images[0].image_url
        : '/placeholder.svg?height=300&width=300',
      reviews: row.rating_count || 0,
      isSale: row.original_price && parseFloat(row.original_price) > parseFloat(row.price),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    // Calculate isNew based on created_at (products created in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    products.forEach(product => {
      product.isNew = new Date(product.createdAt) > thirtyDaysAgo;
    });

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch products',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pi.id,
              'image_url', pi.image_url,
              'alt_text', pi.alt_text,
              'is_primary', pi.is_primary,
              'display_order', pi.display_order
            ) ORDER BY pi.display_order, pi.is_primary DESC
          ) FILTER (WHERE pi.id IS NOT NULL), 
          '[]'::json
        ) as images
      FROM dbo.products p
      LEFT JOIN dbo.categories c ON p.category_id = c.id
      LEFT JOIN dbo.product_images pi ON p.id = pi.product_id
      WHERE p.id = $1 AND p.is_active = true
      GROUP BY p.id, c.name, c.slug
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const row = result.rows[0];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const product = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      shortDescription: row.short_description,
      category: row.category_name || 'Sin categoría',
      categorySlug: row.category_slug,
      categoryId: row.category_id,
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : null,
      costPrice: row.cost_price ? parseFloat(row.cost_price) : null,
      sku: row.sku,
      stockQuantity: row.stock_quantity,
      minStockLevel: row.min_stock_level,
      weight: row.weight ? parseFloat(row.weight) : null,
      dimensions: {
        length: row.dimensions_length ? parseFloat(row.dimensions_length) : null,
        width: row.dimensions_width ? parseFloat(row.dimensions_width) : null,
        height: row.dimensions_height ? parseFloat(row.dimensions_height) : null,
      },
      isFeatured: row.is_featured || false,
      isActive: row.is_active || false,
      isDigital: row.is_digital || false,
      requiresShipping: row.requires_shipping !== false,
      isNew: new Date(row.created_at) > thirtyDaysAgo,
      isOnSale: row.original_price && parseFloat(row.original_price) > parseFloat(row.price),
      rating: parseFloat(row.rating_average || 0),
      reviewCount: row.rating_count || 0,
      viewCount: row.view_count || 0,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      images: row.images || [],
      inStock: row.stock_quantity > 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json(product);

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      error: 'Failed to fetch product',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get product categories
router.get('/categories/all', async (req, res) => {
  try {
    const query = `
      SELECT * FROM dbo.categories 
      WHERE is_active = true 
      ORDER BY display_order, name
    `;

    const result = await db.query(query);
    
    const categories = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      icon: row.icon,
      color: row.color,
      parentId: row.parent_id,
      displayOrder: row.display_order,
      isActive: row.is_active,
      metaTitle: row.meta_title,
      metaDescription: row.meta_description,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(categories);

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;
