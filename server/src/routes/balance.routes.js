const express = require('express');
const router = express.Router();
const { getGroupBalances, getMemberBreakdown } = require('../controllers/balance.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);
router.get('/:groupId', getGroupBalances);
router.get('/:groupId/:memberId', getMemberBreakdown);

module.exports = router;
