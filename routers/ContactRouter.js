const express = require('express');
const router = express.Router();
const contactController = require('../controllers/ContactController');

router.get('/', async (req, res) => {
  const contacts = await contactController.getContacts();
  res.json(contacts);
});

module.exports = router;
