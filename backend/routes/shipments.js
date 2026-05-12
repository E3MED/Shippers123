const express = require('express');
const router = express.Router();
const {
    createShipment,
    getShipments,
    getShipmentById,
    updateShipment,
    deleteShipment,
    getDashboardStats
} = require('../controllers/shipmentController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createShipment);
router.get('/', auth, getShipments);
router.get('/stats', auth, getDashboardStats);
router.get('/:id', auth, getShipmentById);
router.put('/:id', auth, updateShipment);
router.delete('/:id', auth, deleteShipment);

module.exports = router;
