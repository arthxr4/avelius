// middleware.js
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/dashboard(.*)",
    "/api/checkout/secure", // ✅ protège la route sécurisée
  ],
};