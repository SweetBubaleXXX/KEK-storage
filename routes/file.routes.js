const express = require('express');

const fileControllers = require('../controllers/file.controllers');

const router = express.Router();

router.get('/download/:fileId', fileControllers.download);

router.post('/upload/:fileId', fileControllers.upload);

module.exports = router;
