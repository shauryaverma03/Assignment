const express = require('express');
const router = express.Router();
const { createSettlement, getSettlements } = require('../controllers/settlement.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);
router.get('/', getSettlements);
router.post('/', createSettlement);

module.exports = router;
