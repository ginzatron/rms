import { useState } from "react";
import { useUsers } from "../../hooks/useUsers";
import { useUser, isResident, isFaculty } from "../../context/UserContext";
import type { User, UserWithRoleData, SelectedUser } from "../../types/api";

export function MobileHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: users, loading } = useUsers();
  const { user: selectedUser, setUser } = useUser();

  // Group users by role for the dropdown
  const residents = users?.filter((u) => u.role === "resident") ?? [];
  const faculty =
    users?.filter(
      (u) => u.role === "faculty" || u.role === "program_director"
    ) ?? [];

  const handleSelectUser = async (user: User) => {
    // Fetch full user data to get role-specific IDs
    try {
      const response = await fetch(`/api/users/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch user details");

      const userData: UserWithRoleData = await response.json();

      const selected: SelectedUser = {
        id: userData.id,
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        role: userData.role,
        photoUrl: userData.photo_url,
        residentId: userData.resident?.id,
        facultyId: userData.faculty?.id,
        pgyLevel: userData.resident?.pgy_level,
      };

      setUser(selected);
    } catch (error) {
      console.error("Failed to select user:", error);
    }

    setIsDropdownOpen(false);
  };

  // Determine display info based on selected user role
  const getRoleLabel = () => {
    if (!selectedUser) return "";
    if (isResident(selectedUser)) return selectedUser.pgyLevel ?? "Resident";
    if (isFaculty(selectedUser)) return "Faculty";
    return selectedUser.role;
  };

  const getAvatarColor = () => {
    if (isResident(selectedUser)) return "bg-green-100 text-green-600";
    return "bg-blue-100 text-blue-600";
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
        {/* Title with context */}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            General Surgery
          </h1>
          <p className="text-xs text-gray-500">
            {isResident(selectedUser)
              ? "Progress Dashboard"
              : "Faculty Dashboard"}
          </p>
        </div>

        {/* User selector dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="
              flex items-center gap-2 px-3 py-2
              bg-gray-100 rounded-lg
              text-sm font-medium text-gray-700
              active:bg-gray-200 transition-colors
            "
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
          >
            {selectedUser ? (
              <>
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${getAvatarColor()}`}
                >
                  <span className="text-xs font-medium">
                    {selectedUser.firstName[0]}
                    {selectedUser.lastName[0]}
                  </span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="max-w-[100px] truncate leading-tight">
                    {isResident(selectedUser)
                      ? `${selectedUser.firstName} ${selectedUser.lastName[0]}.`
                      : `Dr. ${selectedUser.lastName}`}
                  </span>
                  <span className="text-[10px] text-gray-500 leading-tight">
                    {getRoleLabel()}
                  </span>
                </div>
              </>
            ) : (
              <span className="text-gray-500">Select User</span>
            )}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
                aria-hidden="true"
              />

              {/* Menu */}
              <div
                role="listbox"
                className="
                  absolute right-0 top-full mt-1 z-20
                  w-72 max-h-[70vh] overflow-y-auto
                  bg-white rounded-lg shadow-lg border border-gray-200
                "
              >
                {loading ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    Loading...
                  </div>
                ) : (
                  <>
                    {/* Residents Section */}
                    {residents.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Residents
                          </span>
                        </div>
                        {residents.map((user) => (
                          <UserOption
                            key={user.id}
                            user={user}
                            isSelected={selectedUser?.id === user.id}
                            onSelect={handleSelectUser}
                            variant="resident"
                          />
                        ))}
                      </div>
                    )}

                    {/* Faculty Section */}
                    {faculty.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Faculty
                          </span>
                        </div>
                        {faculty.map((user) => (
                          <UserOption
                            key={user.id}
                            user={user}
                            isSelected={selectedUser?.id === user.id}
                            onSelect={handleSelectUser}
                            variant="faculty"
                          />
                        ))}
                      </div>
                    )}

                    {residents.length === 0 && faculty.length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">
                        No users available
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

interface UserOptionProps {
  user: User;
  isSelected: boolean;
  onSelect: (user: User) => void;
  variant: "resident" | "faculty";
}

function UserOption({ user, isSelected, onSelect, variant }: UserOptionProps) {
  const avatarColor =
    variant === "resident"
      ? "bg-green-100 text-green-600"
      : "bg-blue-100 text-blue-600";

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={() => onSelect(user)}
      className={`
        w-full px-4 py-3 text-left
        flex items-center gap-3
        hover:bg-gray-50 active:bg-gray-100
        ${isSelected ? "bg-blue-50" : ""}
      `}
    >
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${avatarColor}`}
      >
        <span className="text-sm font-medium">
          {user.first_name[0]}
          {user.last_name[0]}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">
          {variant === "faculty" ? "Dr. " : ""}
          {user.first_name} {user.last_name}
        </div>
        <div className="text-xs text-gray-500 truncate">{user.email}</div>
      </div>
      {isSelected && (
        <svg
          className="w-5 h-5 text-blue-600 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
