import { useState } from "react";
import { AssessmentForm } from "../assessment/AssessmentForm";
import { FacultyHistoryList } from "./FacultyHistoryList";

type FacultyTab = "new" | "history";

interface FacultyDashboardProps {
  facultyId: string;
}

/**
 * Faculty dashboard with two tabs:
 * - "New" — The existing AssessmentForm for logging EPA assessments
 * - "History" — Chronological list of submitted assessments with stats
 *
 * Replaces the direct AssessmentForm rendering in App.tsx,
 * giving faculty access to both capture and review in one view.
 */
export function FacultyDashboard({ facultyId }: FacultyDashboardProps) {
  const [activeTab, setActiveTab] = useState<FacultyTab>("new");

  return (
    <div className="flex flex-col flex-1">
      {/* Tab bar */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="flex px-4 max-w-lg mx-auto" aria-label="Faculty tabs">
          <button
            type="button"
            onClick={() => setActiveTab("new")}
            className={`
              relative px-4 py-3 text-sm font-medium
              border-b-2 transition-colors
              ${
                activeTab === "new"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }
            `}
            aria-current={activeTab === "new" ? "page" : undefined}
          >
            New Assessment
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`
              relative px-4 py-3 text-sm font-medium
              border-b-2 transition-colors
              ${
                activeTab === "history"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }
            `}
            aria-current={activeTab === "history" ? "page" : undefined}
          >
            My History
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "new" ? (
          <AssessmentForm />
        ) : (
          <FacultyHistoryList facultyId={facultyId} />
        )}
      </div>
    </div>
  );
}
