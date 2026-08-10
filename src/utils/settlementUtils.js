// Settlement calculation: greedy debt minimization algorithm
export const calculateSettlements = (participants, expenses) => {
  const balance = {};
  participants.forEach(p => { balance[p] = 0; });
  expenses.forEach(exp => {
    const share = exp.amount / exp.among.length;
    exp.among.forEach(p => { if (balance[p] !== undefined) balance[p] -= share; });
    if (balance[exp.paidBy] !== undefined) balance[exp.paidBy] += exp.amount;
  });
  const creditors = [];
  const debtors = [];
  Object.entries(balance).forEach(([name, bal]) => {
    if (bal > 0.01) creditors.push({ name, bal });
    else if (bal < -0.01) debtors.push({ name, bal: -bal });
  });
  creditors.sort((a, b) => b.bal - a.bal);
  debtors.sort((a, b) => b.bal - a.bal);
  const settlements = [];
  let ci = 0, di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const amount = Math.min(creditors[ci].bal, debtors[di].bal);
    settlements.push({ from: debtors[di].name, to: creditors[ci].name, amount: Math.round(amount * 100) / 100 });
    creditors[ci].bal -= amount;
    debtors[di].bal -= amount;
    if (creditors[ci].bal < 0.01) ci++;
    if (debtors[di].bal < 0.01) di++;
  }
  return settlements;
};
