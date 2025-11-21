/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as client from "../client.js";
import type * as lib_folders from "../lib/folders.js";
import type * as lib_links from "../lib/links.js";
import type * as lib_userCustomizations from "../lib/userCustomizations.js";
import type * as lib_usernames from "../lib/usernames.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  client: typeof client;
  "lib/folders": typeof lib_folders;
  "lib/links": typeof lib_links;
  "lib/userCustomizations": typeof lib_userCustomizations;
  "lib/usernames": typeof lib_usernames;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
