const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const query = `SELECT category, COUNT(*) as product_count
FROM products
WHERE category IS NOT NULL AND category != ''
GROUP BY category
ORDER BY product_count DESC`;
    const result = await db.query(query);

    const categories = result.rows.map(row => ({
      name: row.category,
      productCount: row.product_count
    }));

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;