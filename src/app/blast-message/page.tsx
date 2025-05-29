import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import WebControllerClient from "./blast-message-client";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return <div>Not authenticated</div>;
  }

  const user = session.user;

  return <WebControllerClient user={user} />;
}
