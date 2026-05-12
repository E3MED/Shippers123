const express = require('express');
const router = express.Router();
const { updatePrice, exportPDF } = require('../controllers/pricingController');
const { auth } = require('../middleware/auth');

router.put('/:id/price', auth, updatePrice);
router.get('/:id/pdf', auth, exportPDF);

module.exports = router;
