export interface DashboardStats {
  watchlistCount: number;
  ratingsCount: number;
  averageRating: number;
  monthlyWatchCount: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}
