const express = require('express');
const router = express.Router();
const { createExpense, getExpenses, getExpense, deleteExpense } = require('../controllers/expense.controller');
const auth = require('../middleware/auth.middleware');

router.use(auth);
router.get('/', getExpenses);
router.post('/', createExpense);
router.get('/:id', getExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
