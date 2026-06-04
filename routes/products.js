const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const { category, search, hierarchy, sortBy = 'name', sortOrder = 'asc' } = req.query;

    let query = `SELECT * FROM products WHERE hierarchy IS NOT NULL AND hierarchy != 3`;
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category ILIKE $${paramIndex}`;
      params.push(`%${category}%`);
      paramIndex++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (hierarchy) {
      query += ` AND hierarchy = $${paramIndex}`;
      params.push(hierarchy);
      paramIndex++;
    }

    const validSortFields = ['name', 'category', 'hierarchy', 'sku'];
    const validSortOrders = ['asc', 'desc'];

    if (validSortFields.includes(sortBy) && validSortOrders.includes(sortOrder.toLowerCase())) {
      query += ` ORDER BY hierarchy ASC, ${sortBy} ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY hierarchy ASC, name ASC`;
    }

    query += ` LIMIT 200`;

    const result = await db.query(query, params);

    const products = result.rows.map(row => {
      const filename = row.imagepath ? row.imagepath.split('/').pop() : null;
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category || 'Sin categoría',
        imagepath: filename ? `/images/${filename}` : null,
        hierarchy: row.hierarchy,
        sku: row.sku,
        isFeatured: row.hierarchy === 1,
        isNew: row.hierarchy === 2,
        isHighlighted: row.hierarchy === 3
      };
    });

    res.json({
      products,
      count: products.length
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `SELECT * FROM products WHERE id = $1`;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const row = result.rows[0];

    const filename = row.imagepath ? row.imagepath.split('/').pop() : null;
    const product = {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category || 'Sin categoría',
      imagepath: filename ? `/images/${filename}` : null,
      hierarchy: row.hierarchy,
      sku: row.sku,
      isFeatured: row.hierarchy === 1,
      isNew: row.hierarchy === 2,
      isHighlighted: row.hierarchy === 3
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

module.exports = router;