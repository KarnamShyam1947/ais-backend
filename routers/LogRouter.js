
const { getAllLogs } = require('../controllers/LogController');
const express = require('express');

const router = express.Router();


router.get('/', getAllLogs);

module.exports = router;