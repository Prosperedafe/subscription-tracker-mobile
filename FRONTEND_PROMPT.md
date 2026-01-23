# Frontend Application Prompt for Subscription Tracker

Create a modern, responsive React frontend application for a subscription tracking system. The application should integrate with the existing backend API and provide a complete user experience for managing subscriptions.

## Backend API Base URL
- Development: `http://localhost:5500`
- All API endpoints are prefixed with `/api`

## Authentication

### Authentication Method
- JWT Bearer Token authentication
- Token format: `Authorization: Bearer <token>`
- Token is returned on sign-up and sign-in
- Store token in localStorage or httpOnly cookie (prefer localStorage for simplicity)

### Authentication Endpoints

#### 1. Sign Up
- **Endpoint**: `POST /api/auth/sign-up`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "string (3-20 chars)",
    "email": "string (valid email)",
    "password": "string (6-50 chars)"
  }
  ```
- **Success Response** (201):
  ```json
  {
    "success": true,
    "message": "User created successfully",
    "data": {
      "user": {
        "_id": "string",
        "name": "string",
        "email": "string",
        "createdAt": "ISO date",
        "updatedAt": "ISO date"
      },
      "token": "JWT token string"
    }
  }
  ```
- **Error Responses**:
  - 400: Password validation failed
  - 409: User already exists
  - 500: Server error

#### 2. Sign In
- **Endpoint**: `POST /api/auth/sign-in`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "User signed in successfully",
    "data": {
      "user": {
        "_id": "string",
        "name": "string",
        "email": "string",
        "createdAt": "ISO date",
        "updatedAt": "ISO date"
      },
      "token": "JWT token string"
    }
  }
  ```
- **Error Responses**:
  - 404: User not found
  - 401: Invalid password
  - 500: Server error

#### 3. Sign Out
- **Endpoint**: `POST /api/auth/sign-out`
- **Auth Required**: No (client-side only - clear token)

## User Endpoints

#### 4. Get All Users
- **Endpoint**: `GET /api/users`
- **Auth Required**: Yes (Bearer token)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Users fetched successfully",
    "data": [/* array of user objects */]
  }
  ```

#### 5. Get User by ID
- **Endpoint**: `GET /api/users/:id`
- **Auth Required**: Yes (Bearer token)
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "User fetched successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "email": "string",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  }
  ```
- **Error Responses**:
  - 404: User not found
  - 401: Unauthorized

## Subscription Endpoints

#### 6. Create Subscription
- **Endpoint**: `POST /api/subscriptions`
- **Auth Required**: Yes (Bearer token)
- **Request Body**:
  ```json
  {
    "name": "string (2-100 chars)",
    "price": "number (>= 0)",
    "currency": "USD" | "EUR" | "GBP",
    "frequency": "daily" | "weekly" | "monthly" | "yearly",
    "category": "food" | "entertainment" | "health" | "education" | "other",
    "paymentMethod": "string",
    "status": "active" | "inactive" | "expired" (optional, defaults to "active"),
    "startDate": "ISO date string",
    "renewalDate": "ISO date string (must be after startDate)"
  }
  ```
- **Success Response** (201):
  ```json
  {
    "success": true,
    "message": "Subscription created successfully",
    "data": {
      "_id": "string",
      "name": "string",
      "price": "number",
      "currency": "string",
      "frequency": "string",
      "category": "string",
      "paymentMethod": "string",
      "status": "string",
      "startDate": "ISO date",
      "renewalDate": "ISO date",
      "user": "user object id",
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  }
  ```

#### 7. Get User Subscriptions
- **Endpoint**: `GET /api/subscriptions/user/:id`
- **Auth Required**: Yes (Bearer token)
- **Note**: The `:id` must match the authenticated user's ID
- **Success Response** (200):
  ```json
  {
    "success": true,
    "message": "Subscriptions fetched successfully",
    "data": [/* array of subscription objects */]
  }
  ```
- **Error Responses**:
  - 401: User is not the owner of the account

## Error Response Format

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error message (optional)"
}
```

Common HTTP status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (missing/invalid token)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 429: Rate Limit Exceeded
- 500: Internal Server Error

## Data Models

### User Model
```typescript
{
  _id: string;
  name: string; // 3-20 characters
  email: string; // valid email, unique, lowercase
  password: string; // not returned in responses
  createdAt: Date;
  updatedAt: Date;
}
```

### Subscription Model
```typescript
{
  _id: string;
  name: string; // 2-100 characters
  price: number; // >= 0
  currency: "USD" | "EUR" | "GBP"; // default: "USD"
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  category: "food" | "entertainment" | "health" | "education" | "other";
  paymentMethod: string;
  status: "active" | "inactive" | "expired"; // default: "active"
  startDate: Date;
  renewalDate: Date; // must be after startDate
  user: string; // user object id
  createdAt: Date;
  updatedAt: Date;
}
```

## Frontend Requirements

### Tech Stack
- **React** (latest version with hooks)
- **React Query (TanStack Query)** for all data fetching and mutations
- **React Router** for navigation
- **Modern CSS framework** (Tailwind CSS, Material-UI, or similar)
- **Form handling library** (React Hook Form recommended)
- **Date handling** (date-fns or dayjs)
- **HTTP client** (axios or fetch with React Query)

### Required Features

#### 1. Authentication Pages
- **Sign Up Page**:
  - Form with name, email, password fields
  - Password validation (6-50 characters)
  - Email validation
  - Name validation (3-20 characters)
  - Show error messages for validation failures
  - Redirect to dashboard on success
  - Store token in localStorage

- **Sign In Page**:
  - Form with email and password fields
  - Show error messages for invalid credentials
  - Redirect to dashboard on success
  - Store token in localStorage

- **Sign Out**:
  - Clear token from localStorage
  - Redirect to sign-in page

#### 2. Protected Routes
- Implement route protection using React Router
- Redirect unauthenticated users to sign-in page
- Include token in Authorization header for all authenticated requests

#### 3. Dashboard/Home Page
- Display user's subscriptions in a card/list view
- Show subscription details: name, price, currency, frequency, category, status, renewal date
- Filter subscriptions by:
  - Status (active, inactive, expired)
  - Category
  - Frequency
- Sort subscriptions by:
  - Renewal date (upcoming first)
  - Price (high to low, low to high)
  - Name (alphabetical)
- Display total monthly/yearly spending (based on frequency)
- Show upcoming renewals (next 7 days, next 30 days)
- Empty state when no subscriptions exist

#### 4. Create Subscription Page
- Form with all required fields:
  - Name (text input)
  - Price (number input)
  - Currency (dropdown: USD, EUR, GBP)
  - Frequency (dropdown: daily, weekly, monthly, yearly)
  - Category (dropdown: food, entertainment, health, education, other)
  - Payment Method (text input)
  - Status (dropdown: active, inactive, expired) - optional
  - Start Date (date picker)
  - Renewal Date (date picker, must be after start date)
- Form validation matching backend requirements
- Show validation errors
- Success message and redirect to dashboard on success
- Loading state during submission

#### 5. User Profile Page (Optional)
- Display user information (name, email)
- Show account creation date

### UI/UX Requirements

1. **Design**:
   - Modern, clean, and professional design
   - Responsive (mobile, tablet, desktop)
   - Accessible (keyboard navigation, ARIA labels)
   - Consistent color scheme and typography

2. **Loading States**:
   - Show loading indicators during API calls
   - Skeleton loaders for data fetching

3. **Error Handling**:
   - Display user-friendly error messages
   - Handle network errors gracefully
   - Show toast notifications for success/error states
   - Handle 401 errors by redirecting to sign-in

4. **State Management**:
   - Use React Query for server state
   - Use React Context or local state for auth state
   - Persist authentication state (check localStorage on app load)

5. **Date Formatting**:
   - Display dates in user-friendly format (e.g., "Jan 15, 2024")
   - Show relative dates for upcoming renewals (e.g., "Renews in 5 days")
   - Highlight expired subscriptions

6. **Currency Formatting**:
   - Format prices with proper currency symbols
   - Group by currency if multiple currencies exist

### Additional Features (Nice to Have)

1. **Subscription Details/Edit Page**:
   - View full subscription details
   - Edit subscription (if backend supports)
   - Delete subscription (if backend supports)

2. **Analytics/Insights**:
   - Monthly spending chart
   - Category breakdown (pie chart)
   - Spending trends over time

3. **Notifications**:
   - Show upcoming renewal reminders
   - Highlight expired subscriptions

4. **Search**:
   - Search subscriptions by name

5. **Export**:
   - Export subscriptions to CSV/JSON

## Implementation Notes

1. **API Client Setup**:
   - Create an axios instance or fetch wrapper
   - Add Authorization header interceptor
   - Handle token refresh if needed
   - Set base URL from environment variable

2. **React Query Configuration**:
   - Set up QueryClient with appropriate defaults
   - Configure retry logic
   - Set up error handling
   - Use mutations for POST requests
   - Use queries for GET requests

3. **Authentication Context**:
   - Create AuthContext to manage user state
   - Provide login, logout, and user data
   - Check token validity on app initialization

4. **Form Validation**:
   - Use React Hook Form with validation schema (Zod or Yup)
   - Match backend validation rules exactly

5. **Date Handling**:
   - Use date-fns or dayjs for date manipulation
   - Handle timezone considerations
   - Validate date ranges (renewalDate > startDate)

## Example API Integration Pattern

```typescript
// Using React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['subscriptions', userId],
  queryFn: () => fetchSubscriptions(userId),
  enabled: !!userId && !!token
});

const mutation = useMutation({
  mutationFn: createSubscription,
  onSuccess: () => {
    queryClient.invalidateQueries(['subscriptions']);
  }
});
```

## Deliverables

1. Complete React application with all required pages
2. Proper routing and navigation
3. Form validation matching backend rules
4. Error handling and loading states
5. Responsive design
6. Clean, maintainable code structure
7. README with setup instructions

## Getting Started

1. Set up React project (Vite or Create React App)
2. Install dependencies (React Query, React Router, form library, etc.)
3. Configure API base URL
4. Set up authentication context
5. Create API service layer
6. Build pages and components
7. Test all functionality

---

**Note**: Ensure all API calls use React Query for fetching and mutations. Handle authentication tokens properly and implement proper error handling throughout the application.
