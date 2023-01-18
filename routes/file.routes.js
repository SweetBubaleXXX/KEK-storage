const express = require('express');

const fileControllers = require('../controllers/file.controllers');

const router = express.Router();

router.get('/:fileId', fileControllers.download);

router.post('/:fileId', fileControllers.upload);

module.exports = router;
