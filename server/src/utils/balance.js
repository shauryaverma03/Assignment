// Computes who owes whom using min-cash-flow algorithm
function simplifyDebts(balances) {
  // balances: { memberId: netAmount } positive = owed money, negative = owes money
  const creditors = [];
  const debtors = [];

  for (const [id, amt] of Object.entries(balances)) {
    const n = parseFloat(amt);
    if (n > 0.01) creditors.push({ id, amt: n });
    else if (n < -0.01) debtors.push({ id, amt: Math.abs(n) });
  }

  const transactions = [];
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const settle = Math.min(creditors[i].amt, debtors[j].amt);
    transactions.push({
      from: debtors[j].id,
      to: creditors[i].id,
      amount: Math.round(settle * 100) / 100,
    });
    creditors[i].amt -= settle;
    debtors[j].amt -= settle;
    if (creditors[i].amt < 0.01) i++;
    if (debtors[j].amt < 0.01) j++;
  }
  return transactions;
}

module.exports = { simplifyDebts };
