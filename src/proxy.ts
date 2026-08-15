import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

/**
 * TASK-004. Two jobs, and one of them is not optional.
 *
 * 1. Convex Auth proxies its own `/api/auth` calls through here. Without this
 *    file running, every sign-in POSTs to a route that does not exist and 404s,
 *    which is exactly what happened while it was named `middleware.ts`.
 * 2. /admin is unreachable without a session. That part IS only a convenience
 *    layer; the real enforcement is `requireAdmin` in `convex/leads.ts`, since
 *    a direct call to a Convex function never passes through here at all.
 *
 * **The filename is load-bearing.** Next.js 16 renamed Middleware to Proxy, and
 * a file called `middleware.ts` is silently ignored: no error, no warning, it
 * simply never runs. The exported helpers still carry the old name because
 * that is what `@convex-dev/auth` calls them.
 */
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

/**
 * Local development only, and it opens the convenience layer rather than the
 * boundary: with this on and the server switch off, /admin renders and every
 * query on it fails. See `AdminGate.tsx` for why the two are separate.
 */
const devBypass = process.env.NEXT_PUBLIC_DEV_ADMIN_BYPASS === "1";

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isAdminRoute(request) && !devBypass && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/login");
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
