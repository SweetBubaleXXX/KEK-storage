const express = require('express');

const infoControllers = require('../controllers/info.controllers');

const router = express.Router();

router.get('/space', infoControllers.storageSpace);

module.exports = router;
