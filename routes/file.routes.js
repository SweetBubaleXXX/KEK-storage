const express = require('express');

const fileControllers = require('../controllers/file.controllers');
const { checkIfFileExists, getFilePath } = require('../middleware/file.middleware');

const router = express.Router();

router.use('/:fileId', getFilePath);

router.use('/:fileId', checkIfFileExists);

router.get('/:fileId', fileControllers.download);

router.post('/:fileId', fileControllers.upload);

router.delete('/:fileId', fileControllers.delete);

module.exports = router;
