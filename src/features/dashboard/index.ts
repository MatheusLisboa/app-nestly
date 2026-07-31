export { TodayDashboard } from "./components/today-dashboard";
export { getTodayDigest } from "./services/today-digest";

export const dashboardFeature = {
  id: "dashboard",
  offlineEnabled: false,
} as const;
