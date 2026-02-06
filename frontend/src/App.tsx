import {
  UserProvider,
  useUser,
  isResident,
  isFaculty,
} from "./context/UserContext";
import { MobileHeader } from "./components/layout/MobileHeader";
import { FacultyDashboard } from "./components/faculty/FacultyDashboard";
import { ResidentDashboard } from "./components/dashboard";

function AppContent() {
  const { user, isLoading } = useUser();

  // Show loading state while restoring user from localStorage
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // No user selected - show prompt
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome to RMS
          </h2>
          <p className="text-sm text-gray-500">
            Select your name from the dropdown above to get started. Residents
            will see their progress dashboard, faculty will see the assessment
            form.
          </p>
        </div>
      </div>
    );
  }

  // Route based on user role
  if (isResident(user)) {
    return <ResidentDashboard residentId={user.residentId!} />;
  }

  if (isFaculty(user)) {
    return <FacultyDashboard facultyId={user.facultyId!} />;
  }

  // Fallback for other roles (coordinator, admin, etc.)
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-50 mb-4">
          <svg
            className="w-8 h-8 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Role Not Supported
        </h2>
        <p className="text-sm text-gray-500">
          The {user.role} role is not yet supported in the mobile app. Please
          use the web dashboard.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col safe-area-top">
        {/* Header with user selector */}
        <MobileHeader />

        {/* Main content - routes based on user role */}
        <main className="flex-1 flex flex-col">
          <AppContent />
        </main>
      </div>
    </UserProvider>
  );
}

export default App;
