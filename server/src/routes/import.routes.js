const express = require('express');
const router = express.Router();
const multer = require('multer');
const { importCSV, getImportLogs, resolveLog } = require('../controllers/import.controller');
const auth = require('../middleware/auth.middleware');

const upload = multer({ dest: 'uploads/' });

router.use(auth);
router.post('/csv', upload.single('file'), importCSV);
router.get('/logs/:groupId', getImportLogs);
router.patch('/logs/:id', resolveLog);

module.exports = router;
