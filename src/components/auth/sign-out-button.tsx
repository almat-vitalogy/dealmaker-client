"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Icons } from "../icons";
import { useBlastStore } from "@/store/blast";
import { clear } from "console";
import {useConfirmDialog} from "@/hooks/use-confirm-dialog";

export default function SignOutButton() {
  const { clearStorage } = useBlastStore();
  const router = useRouter();
  const confirm = useConfirmDialog();

  const handleClick = async () => {

    const result = await confirm({
      title: "Logout?",
      description: "Are you sure you want to logout?",
    });

    if (!result) {
      return;
    }

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
