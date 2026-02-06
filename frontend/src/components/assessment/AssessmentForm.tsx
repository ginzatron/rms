import { useState, useCallback } from "react";
import { useUser } from "../../context/UserContext";
import { useClinicalSites } from "../../hooks/useClinicalSites";
import { postApi } from "../../hooks/useApi";
import { ResidentSelector } from "./ResidentSelector";
import { EpaSelector } from "./EpaSelector";
import { EntrustmentPicker } from "./EntrustmentPicker";
import { Toast, VoiceInput, FormField, Select, Button } from "../ui";
import type {
  Resident,
  EpaDefinition,
  AssessmentPayload,
  EntrustmentLevel,
  CaseUrgency,
  CaseComplexity,
  LocationType,
  EntryMethod,
} from "../../types/api";
import { CASE_COMPLEXITY_DESCRIPTIONS } from "../../types/api";

// Get today's date in YYYY-MM-DD format for date input
function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// Detect entry method based on user agent
function detectEntryMethod(): EntryMethod {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "mobile_ios";
  }
  if (/android/.test(userAgent)) {
    return "mobile_android";
  }
  return "web";
}

interface ToastState {
  isVisible: boolean;
  message: string;
  type: "success" | "error";
}

const CASE_URGENCY_OPTIONS = [
  { value: "elective", label: "Elective" },
  { value: "urgent", label: "Urgent" },
  { value: "emergent", label: "Emergent" },
];

const LOCATION_TYPE_OPTIONS = [
  { value: "or", label: "Operating Room" },
  { value: "clinic", label: "Clinic" },
  { value: "icu", label: "ICU" },
  { value: "ed", label: "Emergency Dept" },
  { value: "ward", label: "Ward" },
  { value: "other", label: "Other" },
];

export function AssessmentForm() {
  // Core form state
  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null
  );
  const [selectedEpa, setSelectedEpa] = useState<EpaDefinition | null>(null);
  const [entrustmentLevel, setEntrustmentLevel] = useState<number | null>(null);
  const [narrativeFeedback, setNarrativeFeedback] = useState("");

  // Optional expanded section
  const [optionalExpanded, setOptionalExpanded] = useState(false);
  const [clinicalSiteId, setClinicalSiteId] = useState<string>("");
  const [caseComplexity, setCaseComplexity] = useState<CaseComplexity | "">("");
  const [caseUrgency, setCaseUrgency] = useState<CaseUrgency | "">("");
  const [locationType, setLocationType] = useState<LocationType | "">("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: "",
    type: "success",
  });

  // Context and data hooks
  const { user } = useUser();
  const { data: clinicalSites } = useClinicalSites();

  // Form validation
  const isFormValid =
    selectedResident && selectedEpa && entrustmentLevel && user?.facultyId;

  const resetForm = useCallback(() => {
    setSelectedResident(null);
    setSelectedEpa(null);
    setEntrustmentLevel(null);
    setNarrativeFeedback("");
    setOptionalExpanded(false);
    setClinicalSiteId("");
    setCaseComplexity("");
    setCaseUrgency("");
    setLocationType("");
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ isVisible: true, message, type });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const handleSubmit = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);

    try {
      const payload: AssessmentPayload = {
        resident_id: selectedResident.id,
        faculty_id: user!.facultyId!,
        epa_id: selectedEpa.id,
        entrustment_level: String(entrustmentLevel) as EntrustmentLevel,
        observation_date: getTodayString(),
        entry_method: detectEntryMethod(),
      };

      // Add optional fields if provided
      if (narrativeFeedback.trim()) {
        payload.narrative_feedback = narrativeFeedback.trim();
      }
      if (clinicalSiteId) {
        payload.clinical_site_id = clinicalSiteId;
      }
      if (caseComplexity) {
        payload.case_complexity = caseComplexity;
      }
      if (caseUrgency) {
        payload.case_urgency = caseUrgency;
      }
      if (locationType) {
        payload.location_type = locationType;
      }

      await postApi<AssessmentPayload, unknown>("/api/assessments", payload);

      showToast("Assessment submitted successfully", "success");
      resetForm();
    } catch (error) {
      console.error("Failed to submit assessment:", error);
      const message =
        error instanceof Error ? error.message : "Failed to submit assessment";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show a prompt if no faculty is selected
  if (!user?.facultyId) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Select a Faculty Member
          </h2>
          <p className="text-sm text-gray-500">
            Use the dropdown in the header to select yourself before logging an
            assessment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex flex-col min-h-full"
      >
        {/* Scrollable form content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-6 max-w-lg mx-auto w-full">
          {/* Date indicator */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>New Assessment</span>
            <span className="font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          {/* Resident selector */}
          <FormField label="Resident" required>
            <ResidentSelector
              value={selectedResident}
              onChange={setSelectedResident}
            />
          </FormField>

          {/* EPA selector */}
          <FormField label="EPA" required>
            <EpaSelector value={selectedEpa} onChange={setSelectedEpa} />
          </FormField>

          {/* Case complexity - prominent per SIMPL research */}
          <FormField
            label="Case Complexity"
            hint="recommended"
            helpText="Relative to similar cases in your practice"
          >
            <div className="grid grid-cols-3 gap-2">
              {CASE_COMPLEXITY_DESCRIPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() =>
                    setCaseComplexity(
                      caseComplexity === opt.value ? "" : opt.value
                    )
                  }
                  className={`
                    py-3 px-2 rounded-lg border text-sm font-medium
                    transition-all duration-150
                    ${
                      caseComplexity === opt.value
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700 active:bg-gray-50"
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </FormField>

          {/* Entrustment level */}
          <FormField label="Entrustment Level" required>
            <EntrustmentPicker
              value={entrustmentLevel}
              onChange={setEntrustmentLevel}
            />
          </FormField>

          {/* Narrative feedback with voice input */}
          <FormField
            label="Feedback"
            hint="optional"
            htmlFor="feedback"
            helpText="Tap the microphone to dictate feedback"
          >
            <div className="relative">
              <textarea
                id="feedback"
                value={narrativeFeedback}
                onChange={(e) => setNarrativeFeedback(e.target.value)}
                placeholder="What did they do well? What could improve?"
                rows={3}
                className="
                  w-full px-4 py-3 pr-12
                  bg-white border border-gray-300 rounded-lg
                  text-gray-900 placeholder-gray-500
                  resize-none
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                "
                style={{ minHeight: "80px" }}
              />
              {/* Voice input button */}
              <div className="absolute right-2 bottom-2">
                <VoiceInput
                  onTranscript={(text) => {
                    setNarrativeFeedback((prev) =>
                      prev ? `${prev} ${text}` : text
                    );
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </FormField>

          {/* Optional case details - expandable section */}
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setOptionalExpanded(!optionalExpanded)}
              className="
                w-full flex items-center justify-between
                py-2 text-sm font-medium text-blue-600
                active:text-blue-700
              "
            >
              <span className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 transition-transform ${
                    optionalExpanded ? "rotate-90" : ""
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                Add case details
              </span>
              <span className="text-gray-400 text-xs">Optional</span>
            </button>

            {optionalExpanded && (
              <div className="mt-4 space-y-4">
                {/* Clinical site */}
                <FormField label="Clinical Site" htmlFor="clinical-site">
                  <Select
                    id="clinical-site"
                    value={clinicalSiteId}
                    onChange={(e) => setClinicalSiteId(e.target.value)}
                    placeholder="Select a site"
                    options={(clinicalSites ?? []).map((site) => ({
                      value: site.id,
                      label: site.name,
                    }))}
                  />
                </FormField>

                {/* Case urgency */}
                <FormField label="Case Urgency" htmlFor="case-urgency">
                  <Select
                    id="case-urgency"
                    value={caseUrgency}
                    onChange={(e) =>
                      setCaseUrgency(e.target.value as CaseUrgency | "")
                    }
                    placeholder="Select urgency"
                    options={CASE_URGENCY_OPTIONS}
                  />
                </FormField>

                {/* Location type */}
                <FormField label="Location Type" htmlFor="location-type">
                  <Select
                    id="location-type"
                    value={locationType}
                    onChange={(e) =>
                      setLocationType(e.target.value as LocationType | "")
                    }
                    placeholder="Select location"
                    options={LOCATION_TYPE_OPTIONS}
                  />
                </FormField>
              </div>
            )}
          </div>
        </div>

        {/* Fixed submit button at bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
          <div className="max-w-lg mx-auto p-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              disabled={!isFormValid}
            >
              {isSubmitting ? "Submitting..." : "Submit Assessment"}
            </Button>
          </div>
        </div>
      </form>

      {/* Toast notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
}
