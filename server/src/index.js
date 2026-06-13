const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth.routes');
const groupRoutes = require('./routes/group.routes');
const expenseRoutes = require('./routes/expense.routes');
const settlementRoutes = require('./routes/settlement.routes');
const importRoutes = require('./routes/import.routes');
const balanceRoutes = require('./routes/balance.routes');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/import', importRoutes);
app.use('/api/balances', balanceRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
