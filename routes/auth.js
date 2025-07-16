const express = require('express');
const router = express.Router();

// Placeholder for auth routes
router.get('/me', (req, res) => {
  res.json({ message: 'Auth routes - coming soon' });
});

module.exports = router;
