const express = require('express');
const router = express.Router();
const {
    createUser,
    getUsers,
    updateUser,
    deleteUser
} = require('../controllers/adminController');
const { auth, adminAuth } = require('../middleware/auth');

router.use(auth, adminAuth); // All admin routes require admin access

router.post('/users', createUser);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
