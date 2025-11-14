import Link from 'next/link';
import { QuickAction } from '@/types/dashboard';

const quickActions: QuickAction[] = [
  {
    title: 'Search Movies',
    description: 'Discover new films',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    href: '/search',
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Browse Movies',
    description: 'Explore popular titles',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
    href: '/',
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'My Watchlist',
    description: 'View saved movies',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    href: '/watchlist',
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'My Profile',
    description: 'Manage your account',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    href: '/profile',
    color: 'from-orange-500 to-orange-600'
  }
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {quickActions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className="group relative overflow-hidden bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 p-6 transform hover:-translate-y-1"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

          <div className="relative z-10">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 group-hover:bg-blue-50 transition-colors duration-300 mb-4 text-gray-700 group-hover:text-blue-600">
              {action.icon}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
              {action.title}
            </h3>

            <p className="text-sm text-gray-600">
              {action.description}
            </p>
          </div>

          <div className="absolute bottom-4 right-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  );
}
