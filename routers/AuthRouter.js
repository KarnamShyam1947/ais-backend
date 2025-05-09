const verifyToken = require('../middleware/AuthMiddleware');
const {
    login,
    registerUser,
    changePassword
} = require("./../controllers/AuthController");
const express = require('express');

const router = express.Router();


router.post('/login', login);
router.post('/register', registerUser);

router.post('/change-password', verifyToken, changePassword);

module.exports = router;