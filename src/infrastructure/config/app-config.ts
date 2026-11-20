const isProduction = process.env.NODE_ENV === "production";

export const APP_ROUTES = {
  home: "/",
  search: "/search",
  liked: "/liked",
  library: "/library",
  profile: "/profile",
  recap: "/recap",
  login: "/login",
  register: "/register",
  authCallback: "/auth/callback",
  privacy: "/privacy",
  terms: "/terms",
} as const;

/** Pages shown without the player chrome (sidebar, tab bar, player). */
export const AUTH_ROUTE_PATHS: readonly string[] = [
  APP_ROUTES.login,
  APP_ROUTES.register,
  APP_ROUTES.authCallback,
  APP_ROUTES.privacy,
  APP_ROUTES.terms,
];

export const appConfig = {
  /** "true" serves the bundled offline sample catalog instead of the FastAPI backend */
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true",
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Synseafy",
  productionDomain: "https://music.wynnsea.my.id",
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL ||
    (isProduction ? "https://music.wynnsea.my.id" : "http://localhost:3000"),
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (isProduction
      ? "https://api.music.wynnsea.my.id"
      : "http://localhost:8000"),
  googleCallbackUrl:
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI ||
    `${
      process.env.NEXT_PUBLIC_APP_URL ||
      (isProduction ? "https://music.wynnsea.my.id" : "http://localhost:3000")
    }${APP_ROUTES.authCallback}`,
} as const;
