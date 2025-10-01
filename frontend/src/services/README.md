# Services Directory

API service layer for backend communication.

## Files

- `auth.service.ts` - Authentication API calls (login, register, refresh, logout)
- `movie.service.ts` - Movie API calls (search, details, browse)
- `user.service.ts` - User API calls (profile, watchlist, recommendations)

## Guidelines

- All backend communication goes through services
- Services use the centralized API client from `/lib`
- Return typed responses using interfaces from `/types`
- Handle errors appropriately
