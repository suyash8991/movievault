# Store Directory

Global state management (if needed beyond React Context).

## Potential Files

- `authStore.ts` - Authentication state (if using Zustand/Redux)
- `movieStore.ts` - Movie browsing state
- `uiStore.ts` - UI state (modals, notifications, etc.)

## Guidelines

- Start with React Context API (useAuth hook)
- Only add Zustand/Redux if state becomes complex
- Keep stores small and focused
- Use TypeScript for type safety

## Current Status

Currently using React Context API for auth. This directory is reserved for future state management needs.
