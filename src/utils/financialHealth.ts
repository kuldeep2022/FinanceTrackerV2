export type HealthStatus = 'Excellent' | 'Good' | 'Stable' | 'Needs Attention' | 'Critical';

export interface FinancialHealth {
  status: HealthStatus;
  color: string;
  score: number; // 0 to 100
  insight: string;
}

export function calculateFinancialHealth(
  income: number, 
  expenses: number, 
  totalDebt: number, 
  balance: number
): FinancialHealth {
  // 1. Savings Rate Calculation (Primary Factor)
  // Savings Rate = (Income - Expenses) / Income
  const surplus = income - expenses;
  const savingsRate = income > 0 ? (surplus / income) * 100 : 0;

  // 2. Debt to Income Ratio (DTI)
  // Monthly DTI = Total Debt / Monthly Income (simplified here)
  const dti = income > 0 ? (totalDebt / income) : 0;

  // 3. Scoring Logic
  let score = 50; // Start at baseline

  // Adjust by savings rate
  if (savingsRate > 25) score += 30;
  else if (savingsRate > 15) score += 20;
  else if (savingsRate > 5) score += 10;
  else if (savingsRate < 0) score -= 30;
  else if (savingsRate < -20) score -= 50;

  // Adjust by debt
  if (dti === 0) score += 10;
  else if (dti > 2) score -= 20;
  else if (dti > 5) score -= 40;

  // Adjust by balance
  if (balance > expenses * 3) score += 10; // 3 months emergency fund

  // Final Score Normalization
  score = Math.max(0, Math.min(100, score));

  // Determine Status
  if (score >= 85) return { 
    status: 'Excellent', 
    color: 'var(--success)', 
    score, 
    insight: "You're building wealth rapidly! Great savings rate." 
  };
  if (score >= 65) return { 
    status: 'Good', 
    color: '#84cc16', 
    score, 
    insight: "You're on the right track. Consider investing your surplus." 
  };
  if (score >= 45) return { 
    status: 'Stable', 
    color: 'var(--accent-primary)', 
    score, 
    insight: "Your finances are balanced, but there's room for more savings." 
  };
  if (score >= 25) return { 
    status: 'Needs Attention', 
    color: '#f59e0b', 
    score, 
    insight: "Your spending is high relative to income. Try to cut back." 
  };
  
  return { 
    status: 'Critical', 
    color: 'var(--danger)', 
    score, 
    insight: "You're spending significantly more than you earn. Action needed!" 
  };
}
