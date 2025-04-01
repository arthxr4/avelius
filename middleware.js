// middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware((auth, req) => {
  console.log("🛡️ Middleware intercepting:", req.nextUrl.pathname);
});

export const config = {
  matcher: [
    "/dashboard(.*)",
    "/api/checkout/secure",
    "/api/stripe/(.*)",
  ],
};
