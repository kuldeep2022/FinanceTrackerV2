export const categoryKeywords: Record<string, string[]> = {
  'Housing & Rent': ['rent', 'mortgage', 'housing', 'apartment', 'realty'],
  'Food & Dining': ['restaurant', 'cafe', 'mcdonald', 'starbucks', 'ubereats', 'doordash', 'grocery', 'supermarket', 'walmart', 'whole foods', 'safeway', 'kroger', 'dining', 'food', 'bakery'],
  'Transport': ['uber', 'lyft', 'gas', 'shell', 'chevron', 'parking', 'metro', 'train', 'bus', 'airline', 'delta', 'united', 'flight', 'travel', 'car rental', 'automotive'],
  'Shopping': ['amazon', 'target', 'ebay', 'best buy', 'apple', 'clothing', 'fashion', 'boots', 'nike', 'adidas', 'mall', 'shopping'],
  'Utilities': ['electric', 'water', 'gas bill', 'internet', 'comcast', 'verizon', 'at&t', 'utilities', 'trash'],
  'Health': ['pharmacy', 'cvs', 'walgreens', 'doctor', 'hospital', 'medical', 'dental', 'gym', 'fitness', 'insurance'],
  'Entertainment': ['netflix', 'spotify', 'hulu', 'disney+', 'cinema', 'theater', 'gaming', 'steam', 'playstation', 'xbox', 'concert', 'ticket'],
  'Subscriptions': ['adobe', 'figma', 'github', 'zoom', 'subscription', 'membership'],
  'Work & Business': ['software', 'hardware', 'office', 'staples', 'freelance', 'business'],
  'Income': ['salary', 'paycheck', 'bonus', 'dividend', 'transfer', 'interest', 'refund'],
  'Debt & Loans': ['loan', 'credit card payment', 'interest', 'capital one', 'chase', 'amex', 'bank of america']
};

export function autoCategorize(title: string): string {
  const normalizedTitle = title.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => normalizedTitle.includes(keyword.toLowerCase()))) {
      return category;
    }
  }
  
  return 'General';
}
