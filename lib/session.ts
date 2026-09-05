export type DemoRole = "patient" | "clinician" | "coordinator" | "evaluator";

export interface UserSession {
  displayName: string;
  role: DemoRole;
  isDemo: true;
  createdAt: string;
}

export const ROLE_LABELS: Record<DemoRole, string> = {
  clinician: "Clinician",
  patient: "Patient",
  coordinator: "Care coordinator",
  evaluator: "Evaluator",
};

const SESSION_STORAGE_KEY = "medlens_demo_session";

/**
 * Reusable session storage utility.
 * Stores and retrieves non-sensitive demo session object from sessionStorage / localStorage.
 */
export const getStoredSession = (): UserSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.displayName === "string" &&
      parsed.displayName.trim().length >= 2 &&
      ["patient", "clinician", "coordinator", "evaluator"].includes(parsed.role) &&
      parsed.isDemo === true
    ) {
      return parsed as UserSession;
    }
    return null;
  } catch {
    return null;
  }
};

export const saveSession = (session: UserSession): void => {
  if (typeof window === "undefined") return;
  try {
    const payload = JSON.stringify(session);
    sessionStorage.setItem(SESSION_STORAGE_KEY, payload);
    localStorage.setItem(SESSION_STORAGE_KEY, payload);
  } catch {
    // Storage access might be disabled or restricted
  }
};

export const clearStoredSession = (): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Storage access fallback
  }
};

export const createDemoSession = (
  displayName: string,
  role: DemoRole
): UserSession => {
  return {
    displayName: displayName.trim(),
    role,
    isDemo: true,
    createdAt: new Date().toISOString(),
  };
};
