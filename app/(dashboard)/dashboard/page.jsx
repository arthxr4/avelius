import { currentUser } from "@clerk/nextjs/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;

  if (!email) return null;

  return <DashboardClient userEmail={email} />;
}