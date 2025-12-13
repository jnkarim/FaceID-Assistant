"use client";

import { Home, Users, MessageSquare, Settings } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();

  const navigation: NavItem[] = [
    { name: "Home", href: "/", icon: <Home className="w-6 h-6" /> },
    { name: "People", href: "/people", icon: <Users className="w-6, h-6" /> },
    {
      name: "Conversation",
      href: "/conversation",
      icon: <MessageSquare className="w-6 h-6" />,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: <Settings className="w-6 h-6" />,
    },
  ];

  return (
    <aside className="fixed top-0 left-0 h-full w-64 flex flex-col border-r border-gray-800 bg-gray-900">
      {/*Logo*/}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-lime-400">FaceID</div>
        </div>
        <p className="text-gray-400 text-sm mt-1">SMART RECOGNISITION SYSTEM</p>
      </div>

      {/*Navigation*/}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                    isActive
                      ? "bg-lime-400 text-gray-900"
                      : "text-gray-300 hover:bg-gray-400 hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/*User Section*/}
      <div className="p-4 border-t border-gray-800 flex flex-col items-center gap-4">
        <Link href="/login">Login</Link>
        <Link href="/signup">Signup</Link>
      </div>
    </aside>
  );
}
