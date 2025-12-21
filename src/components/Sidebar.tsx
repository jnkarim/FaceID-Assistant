"use client";
import axios from "axios";
import { Home, Users, LogOut, LogIn, Radar } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("api/users/me");
        setIsAuthenticated(true);
      } catch (error: any) {//eslint-disable-line @typescript-eslint/no-explicit-any
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const navigation: NavItem[] = [
    { name: "Home", href: "/", icon: <Home className="w-6 h-6" /> },
    { name: "People", href: "/people", icon: <Users className="w-6 h-6" /> },
  ];

  const logout = async () => {
    try {
      await axios.get("/api/users/logout");
      router.push("/login");
    } catch (error: any) {//eslint-disable-line @typescript-eslint/no-explicit-any
      console.log(error.message);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 flex-col border-r border-gray-800 bg-stone-950 z-40">
        {/* Logo */}
        <div className="p-4">
          <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
          <Radar className="w-5 h-5 sm:w-6 sm:h-6 text-lime-400" />
          <div className="text-white text-base sm:text-lg lg:text-xl font-bold">
            FaceID
          </div>
        </div>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            SMART RECOGNITION SYSTEM
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "bg-lime-400 text-gray-900"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
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

        {/* User Section */}
        <div className="p-6 border-t border-gray-800 flex flex-col items-center gap-4">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="text-gray-400 hover:text-red-400 text-lg font-semibold disabled:opacity-50 transition-colors"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="text-gray-400 hover:text-lime-400 text-lg font-semibold disabled:opacity-50 transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-stone-950 border-t border-gray-800 z-50">
        <div className="flex items-center justify-around px-4 py-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-lime-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
          
          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-gray-400 hover:text-red-400 transition-colors duration-200"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-gray-400 hover:text-lime-400 transition-colors duration-200"
            >
              <LogIn className="w-6 h-6" />
              <span className="text-xs font-medium">Login</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}