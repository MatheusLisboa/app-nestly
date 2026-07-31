/**
 * Auth provider identifiers supported by MyNinho.
 * Apple is reserved for a future release — keep the contract stable.
 */
export const authProviders = ["google", "password", "apple"] as const;

export type AuthProviderId = (typeof authProviders)[number];

export const authProviderMeta: Record<
  AuthProviderId,
  { enabledInV1: boolean; supabaseProvider?: "google" | "apple" }
> = {
  google: { enabledInV1: true, supabaseProvider: "google" },
  password: { enabledInV1: true },
  apple: { enabledInV1: false, supabaseProvider: "apple" },
};

export function getEnabledAuthProviders(): AuthProviderId[] {
  return authProviders.filter((id) => authProviderMeta[id].enabledInV1);
}
