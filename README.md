# Subscription Tracker Mobile App

A modern React Native mobile application for tracking and managing subscriptions, built with Expo and React Query.

## Features

- **Authentication**: Sign up, sign in, and sign out functionality
- **Subscription Management**: Create and view subscriptions with detailed information
- **Dashboard**: View all subscriptions with filtering and sorting options
- **Statistics**: Monthly spending calculations and upcoming renewal reminders
- **Search**: Search subscriptions by name
- **Filtering**: Filter by status (active, inactive, expired)
- **Sorting**: Sort by renewal date, price, or name
- **Profile**: View user profile and account information

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **React Query (TanStack Query)** for data fetching and mutations
- **React Hook Form** with Zod for form validation
- **date-fns** for date manipulation
- **Axios** for API calls
- **Expo Router** for navigation

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Backend API running on `http://localhost:5500` (or update `lib/api.ts` with your API URL)

## Setup Instructions

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure API URL** (if needed)

   For React Native on physical devices, you'll need to update the API base URL in `lib/api.ts` to use your computer's IP address instead of `localhost`:
   
   ```typescript
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5500';
   ```

3. **Start the backend server**

   Make sure your backend API is running on `http://localhost:5500`

4. **Start the Expo development server**

   ```bash
   npx expo start
   ```

5. **Run on your preferred platform**

   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app on your device

## Project Structure

```
├── app/                    # App screens and routing
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Dashboard/Home screen
│   │   └── profile.tsx    # User profile screen
│   ├── sign-in.tsx        # Sign in screen
│   ├── sign-up.tsx        # Sign up screen
│   └── create-subscription.tsx  # Create subscription form
├── components/            # Reusable components
│   └── ProtectedRoute.tsx # Route protection wrapper
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                   # Utility functions and API
│   ├── api.ts            # API client and endpoints
│   ├── queryClient.ts   # React Query configuration
│   └── storage.ts       # Storage utilities
└── constants/            # App constants
    └── theme.ts         # Theme colors
```

## API Integration

The app integrates with a REST API with the following endpoints:

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `GET /api/subscriptions/user/:id` - Get user subscriptions
- `POST /api/subscriptions` - Create subscription

All authenticated requests include a Bearer token in the Authorization header.

## Usage

1. **Sign Up/Sign In**: Create an account or sign in with existing credentials
2. **Dashboard**: View all your subscriptions on the home tab
3. **Create Subscription**: Tap the + button to add a new subscription
4. **Filter & Sort**: Use the filter and sort options to organize subscriptions
5. **Profile**: View your profile and sign out from the profile tab

## Development

The app uses:
- File-based routing with Expo Router
- React Query for server state management
- React Hook Form with Zod validation
- AsyncStorage for token persistence
- TypeScript for type safety

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
