// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_URL!, // Your Clerk issuer URL
      applicationID: "convex",
    },
  ],
};
