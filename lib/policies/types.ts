export type PolicyTopic =
  | "leave"
  | "mobility"
  | "tax"
  | "health"
  | "premiums"
  | "worksite"
  | "onboarding"
  | "compensation"
  | "other";

export interface Policy {
  id: string;
  title: string;
  description: string;
  country: string;  // Single country - policies are now separated by country
  topic: PolicyTopic;
  icon: string;
  updatedAt: string;
  legalRefs: string[];
  content: string;
  ring?: string;
}

// Supported countries
export type SupportedCountry = "France" | "Belgium";

export const SUPPORTED_COUNTRIES: SupportedCountry[] = ["France", "Belgium"];
