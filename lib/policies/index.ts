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

/**
 * Get all policies (for admin/global access only).
 * Note: This should only be used for administrative purposes, not for user-facing features.
 */
export function getAllPolicies(): Policy[] {
  return [...francePolicies, ...belgiumPolicies];
}

// Re-export types
export type { Policy, PolicyTopic, SupportedCountry } from "./types";
export { SUPPORTED_COUNTRIES } from "./types";
