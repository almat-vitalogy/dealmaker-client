import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DashboardClient from "./dashboard-client";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return <div>Not authenticated</div>;
  }

  const user = session.user;

  return <DashboardClient user={user} />;
}
