const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.delete('/:id', authenticate, authorize('admin'), userController.deactivateUser);

module.exports = router;