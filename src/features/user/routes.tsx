// filepath: src/features/user/routes.tsx
import { type RouteObject } from "react-router";
// Import the page component for the user list
import { UserListPage } from "./pages/UserListPage";

/**
 * Defines the routes specific to the user management feature.
 * These routes will typically be nested within the main application layout.
 */
export const userRoutes: RouteObject[] = [
  {
    path: "/users", // The primary path for accessing the user management module
    element: <UserListPage />, // The component rendered when navigating to /users
  },
  // Additional user-related routes could be defined here if needed, such as:
  // { path: "/users/:userId", element: <UserProfilePage /> },
  // { path: "/users/settings", element: <UserSettingsPage /> },
];