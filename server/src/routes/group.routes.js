const express = require('express');
const router = express.Router();
const { createGroup, getGroups, getGroup, addMember, removeMember } = require('../controllers/group.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);
router.get('/', getGroups);
router.post('/', createGroup);
router.get('/:id', getGroup);
router.post('/:id/members', addMember);
router.patch('/:id/members/:memberId', removeMember);

module.exports = router;
