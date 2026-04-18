// Centralized ranking & points logic

export const RANKS = {
  BRONZE: { name: 'Bronze', minPoints: 0, label: 'Đồng', color: '#CD7F32' },
  SILVER: { name: 'Silver', minPoints: 100, label: 'Bạc', color: '#C0C0C0' },
  GOLD: { name: 'Gold', minPoints: 500, label: 'Vàng', color: '#FFD700' },
  DIAMOND: { name: 'Diamond', minPoints: 1000, label: 'Kim Cương', color: '#B9F2FF' },
};

export function getRankFromPoints(points: number): string {
  if (points >= RANKS.DIAMOND.minPoints) return 'Diamond';
  if (points >= RANKS.GOLD.minPoints) return 'Gold';
  if (points >= RANKS.SILVER.minPoints) return 'Silver';
  return 'Bronze';
}

export function getRankLabel(rank: string): string {
  switch (rank) {
    case 'Diamond': return 'Kim Cương';
    case 'Gold': return 'Vàng';
    case 'Silver': return 'Bạc';
    default: return 'Đồng';
  }
}

export function getRankColor(rank: string): string {
  switch (rank) {
    case 'Diamond': return '#B9F2FF';
    case 'Gold': return '#FFD700';
    case 'Silver': return '#C0C0C0';
    default: return '#CD7F32';
  }
}

export function getPointsFromAmount(amount: number): number {
  return Math.floor(amount / 10000); // 1 point per 10,000 VND
}
