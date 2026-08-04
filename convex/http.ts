import { httpRouter } from "convex/server";
import { auth } from "./auth";

// TASK-004: mounts the auth HTTP endpoints (sign-in, token refresh) on the
// deployment's .site domain.
const http = httpRouter();
auth.addHttpRoutes(http);
export default http;
