# Features Directory

Feature-based modules following Clean Architecture principles.

## Structure

- `auth/` - Authentication feature (login, register, logout logic)
- `movies/` - Movie browsing, search, details features
- `users/` - User profile, watchlist, dashboard features

## Guidelines

- Each feature contains its own business logic, API calls, and state
- Features should be loosely coupled
- Share common utilities via `/lib` directory
