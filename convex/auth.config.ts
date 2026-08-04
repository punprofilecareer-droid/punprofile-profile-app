// TASK-004: tells Convex to accept JWTs issued by this deployment's own auth.
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
