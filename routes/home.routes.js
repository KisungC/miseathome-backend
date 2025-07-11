// routes/home.routes.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('👋 Hello World! Welcome to my landing page.');
});

module.exports = router;
