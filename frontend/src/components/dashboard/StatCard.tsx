import { StatCardProps } from '@/types/dashboard';

export default function StatCard({
  title,
  value,
  icon,
  loading = false,
  trend,
  subtitle
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            {subtitle && <div className="h-3 bg-gray-200 rounded w-20"></div>}
          </div>
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 p-6 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>

          {trend && (
            <div className="flex items-center text-sm">
              <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          )}

          {subtitle && !trend && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
