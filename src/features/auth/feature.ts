export const authFeature = {
  id: "auth" as const,
  providersV1: ["google", "password"] as const,
  providersFuture: ["apple"] as const,
};
