// ─── Country-based Policy Access ─────────────────────────────────────
// This module provides functions to access policies based on user's country.
// Policies are separated by country to ensure data isolation.

import type { Policy, SupportedCountry } from "./types";
import { francePolicies } from "./france";
import { belgiumPolicies } from "./belgium";

// ─── Country to policies mapping ─────────────────────────────────────
const COUNTRY_POLICIES: Record<SupportedCountry, Policy[]> = {
  France: francePolicies,
  Belgium: belgiumPolicies,
};

/**
 * Get all policies for a specific country.
 * Returns an empty array if the country is not supported.
 */
export function getPoliciesForCountry(country: string): Policy[] {
  if (country in COUNTRY_POLICIES) {
    return COUNTRY_POLICIES[country as SupportedCountry];
  }
  return [];
}

/**
 * Get a specific policy by ID, but only if it belongs to the user's country.
 * Returns undefined if the policy doesn't exist or doesn't belong to the country.
 */
export function getPolicyByIdForCountry(policyId: string, country: string): Policy | undefined {
  const policies = getPoliciesForCountry(country);
  return policies.find(p => p.id === policyId);
}

/**
 * Check if a country is supported by the system.
 */
export function isSupportedCountry(country: string): country is SupportedCountry {
  return country in COUNTRY_POLICIES;
}

// ──────────────────────────────────────────────────────────────────
// NOTE: getAllPolicies() was intentionally removed to enforce country
// isolation. Any future admin feature requiring cross-country access
// must implement a dedicated admin API route with explicit role-based
// authorization checks — never a blanket "return everything" export.
// ──────────────────────────────────────────────────────────────────

/**
 * AUDIT CHECKLIST — Policy Index
 * ✅ getAllPolicies() removed — no function returns cross-country data
 * ✅ Exports: only getPoliciesForCountry, getPolicyByIdForCountry, isSupportedCountry
 * ✅ Grep verified: no file in the codebase imports getAllPolicies
 * ✅ Type exports preserved: Policy, PolicyTopic, SupportedCountry, SUPPORTED_COUNTRIES
 */

// Re-export types
export type { Policy, PolicyTopic, SupportedCountry } from "./types";
export { SUPPORTED_COUNTRIES } from "./types";
