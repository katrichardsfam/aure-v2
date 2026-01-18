/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as gemini from "../gemini.js";
import type * as perfumes from "../perfumes.js";
import type * as recommendation from "../recommendation.js";
import type * as seed from "../seed.js";
import type * as sessions from "../sessions.js";
import type * as storage from "../storage.js";
import type * as userPerfumes from "../userPerfumes.js";
import type * as userPreferences from "../userPreferences.js";
import type * as vibes from "../vibes.js";
import type * as wearLog from "../wearLog.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  gemini: typeof gemini;
  perfumes: typeof perfumes;
  recommendation: typeof recommendation;
  seed: typeof seed;
  sessions: typeof sessions;
  storage: typeof storage;
  userPerfumes: typeof userPerfumes;
  userPreferences: typeof userPreferences;
  vibes: typeof vibes;
  wearLog: typeof wearLog;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
