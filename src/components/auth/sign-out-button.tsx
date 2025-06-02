"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Icons } from "../icons";
import { useBlastStore } from "@/store/blast";
import { clear } from "console";

export default function SignOutButton() {
  const { clearStorage } = useBlastStore();
  const router = useRouter();
  const handleClick = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          clearStorage(); // Clear the store
          router.push("/login"); // redirect to login page
        },
      },
    });
  };

  return (
    <div onClick={handleClick} className="flex items-center justify-between w-18 cursor-pointer">
      <Icons.logOut />
      Log out
    </div>
  );
}
