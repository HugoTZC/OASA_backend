const express = require('express');
const router = express.Router();

/**
 * Images API using Picsum Photos
 * Provides mock image data for products, categories, banners, etc.
 */

// Base URL for Picsum Photos
const PICSUM_BASE_URL = 'https://picsum.photos';

/**
 * GET /api/images/product/:id
 * Get product image(s) by product ID
 */
router.get('/product/:id', (req, res) => {
  const { id } = req.params;
  const { size = '400', count = 1, seed } = req.query;
  
  try {
    const images = [];
    const [width, height] = size.includes('x') ? size.split('x') : [size, size];
    
    for (let i = 0; i < parseInt(count); i++) {
      const imageId = (parseInt(id) * 10) + i; // Generate consistent IDs
      const imageSeed = seed ? `${seed}-${i}` : `product-${id}-${i}`;
      
      images.push({
        id: imageId,
        url: `${PICSUM_BASE_URL}/seed/${imageSeed}/${width}/${height}`,
        thumbnail: `${PICSUM_BASE_URL}/seed/${imageSeed}/150/150`,
        alt: `Product ${id} image ${i + 1}`,
        size: { width: parseInt(width), height: parseInt(height) }
      });
    }
    
    res.json({
      success: true,
      productId: id,
      images: count == 1 ? images[0] : images
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate product images'
    });
  }
});

/**
 * GET /api/images/category/:category
 * Get category banner/header images
 */
router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  const { size = '1200x400' } = req.query;
  
  try {
    const [width, height] = size.split('x');
    const categoryId = hashString(category); // Generate consistent ID from category name
    
    const image = {
      id: categoryId,
      url: `${PICSUM_BASE_URL}/seed/category-${category}/${width}/${height}`,
      thumbnail: `${PICSUM_BASE_URL}/seed/category-${category}/300/200`,
      alt: `${category} category banner`,
      size: { width: parseInt(width), height: parseInt(height) }
    };
    
    res.json({
      success: true,
      category,
      image
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate category image'
    });
  }
});

/**
 * GET /api/images/hero
 * Get hero/carousel images for homepage
 */
router.get('/hero', (req, res) => {
  const { count = 5, size = '1920x600' } = req.query;
  
  try {
    const images = [];
    const [width, height] = size.split('x');
    
    const heroTopics = ['industrial', 'tools', 'automotive', 'machinery', 'warehouse'];
    
    for (let i = 0; i < parseInt(count); i++) {
      const topic = heroTopics[i] || 'industrial';
      images.push({
        id: `hero-${i + 1}`,
        url: `${PICSUM_BASE_URL}/seed/hero-${topic}/${width}/${height}`,
        thumbnail: `${PICSUM_BASE_URL}/seed/hero-${topic}/400/150`,
        alt: `Hero banner ${i + 1}`,
        title: `Slide ${i + 1}`,
        description: `Promotional content for ${topic} products`,
        size: { width: parseInt(width), height: parseInt(height) }
      });
    }
    
    res.json({
      success: true,
      images
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate hero images'
    });
  }
});

/**
 * GET /api/images/placeholder
 * Get generic placeholder images
 */
router.get('/placeholder', (req, res) => {
  const { size = '300', type = 'product', grayscale = false, blur } = req.query;
  
  try {
    const [width, height] = size.includes('x') ? size.split('x') : [size, size];
    let url = `${PICSUM_BASE_URL}/seed/placeholder-${type}/${width}/${height}`;
    
    // Add effects
    const effects = [];
    if (grayscale === 'true') effects.push('grayscale');
    if (blur) effects.push(`blur=${blur}`);
    
    if (effects.length > 0) {
      url += '?' + effects.join('&');
    }
    
    const image = {
      id: `placeholder-${type}`,
      url,
      alt: `${type} placeholder`,
      size: { width: parseInt(width), height: parseInt(height) }
    };
    
    res.json({
      success: true,
      image
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate placeholder image'
    });
  }
});

/**
 * GET /api/images/random
 * Get random images
 */
router.get('/random', (req, res) => {
  const { size = '400', count = 1, category } = req.query;
  
  try {
    const images = [];
    const [width, height] = size.includes('x') ? size.split('x') : [size, size];
    
    for (let i = 0; i < parseInt(count); i++) {
      const randomParam = Date.now() + i; // Ensure unique images
      const url = category 
        ? `${PICSUM_BASE_URL}/seed/${category}-${randomParam}/${width}/${height}`
        : `${PICSUM_BASE_URL}/${width}/${height}?random=${randomParam}`;
      
      images.push({
        id: `random-${randomParam}`,
        url,
        thumbnail: category 
          ? `${PICSUM_BASE_URL}/seed/${category}-${randomParam}/150/150`
          : `${PICSUM_BASE_URL}/150/150?random=${randomParam}`,
        alt: `Random image ${i + 1}`,
        size: { width: parseInt(width), height: parseInt(height) }
      });
    }
    
    res.json({
      success: true,
      images: count == 1 ? images[0] : images
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate random images'
    });
  }
});

/**
 * GET /api/images/gallery/:type
 * Get image galleries for different content types
 */
router.get('/gallery/:type', (req, res) => {
  const { type } = req.params; // products, projects, testimonials, etc.
  const { page = 1, limit = 12, size = '300' } = req.query;
  
  try {
    const images = [];
    const [width, height] = size.includes('x') ? size.split('x') : [size, size];
    const startIndex = (page - 1) * limit;
    
    for (let i = 0; i < parseInt(limit); i++) {
      const imageIndex = startIndex + i;
      images.push({
        id: `${type}-${imageIndex}`,
        url: `${PICSUM_BASE_URL}/seed/${type}-gallery-${imageIndex}/${width}/${height}`,
        thumbnail: `${PICSUM_BASE_URL}/seed/${type}-gallery-${imageIndex}/150/150`,
        alt: `${type} gallery image ${imageIndex + 1}`,
        size: { width: parseInt(width), height: parseInt(height) }
      });
    }
    
    res.json({
      success: true,
      type,
      page: parseInt(page),
      limit: parseInt(limit),
      images
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate gallery images'
    });
  }
});

/**
 * GET /api/images/info/:seed
 * Get image information (simulates the /info endpoint)
 */
router.get('/info/:seed', (req, res) => {
  const { seed } = req.params;
  
  try {
    const imageInfo = {
      id: seed,
      author: "Picsum Photos",
      width: 4000,
      height: 3000,
      url: "https://unsplash.com/photos/example",
      download_url: `${PICSUM_BASE_URL}/seed/${seed}/4000/3000`,
      seed: seed
    };
    
    res.json({
      success: true,
      info: imageInfo
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get image info'
    });
  }
});

// Helper function to generate consistent hash from string
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

module.exports = router;
