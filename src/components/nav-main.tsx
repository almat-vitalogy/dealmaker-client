"use client";

import { type Icon } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useNavigationStore } from "@/store/navigation";
import { Loader2 } from "lucide-react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { setLoadingToPath } = useNavigationStore();
  const { loadingToPath } = useNavigationStore();

  console.log(`NavMain: Current path: ${pathname}, Loading to path: ${loadingToPath}`);
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item, i) => {
            return (
              <Link
                href={item.url}
                key={i}
                onClick={(e) => {
                  if (pathname !== item.url) {
                    e.preventDefault(); // stop default nav
                    setLoadingToPath(item.url);
                    router.push(item.url);
                  }
                }}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" tooltip={item.title} isActive={pathname === item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>

                    {loadingToPath === item.url && <Loader2 className="ml-auto size-4 animate-spin text-muted-foreground" />}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </Link>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
