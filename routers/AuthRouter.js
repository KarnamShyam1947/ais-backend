
const verifyToken = require('../middleware/AuthMiddleware');
const {
    login,
    registerUser,
    changePassword,
    verifyUser,
    logout
} = require("./../controllers/AuthController");
const express = require('express');

const router = express.Router();


router.post('/login', login);
router.post('/register', registerUser);

router.post('/change-password', verifyToken, changePassword);
router.post('/logout', verifyToken, logout);
router.get('/current', verifyToken, verifyUser);

module.exports = router;