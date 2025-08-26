"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calculator, BarChart3, Home, Target } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Estimation Form", icon: Calculator },
    { href: "/dashboard", label: "Delivery Dashboard", icon: Home },
  ];

  const isActivePath = (itemHref: string, currentPath: string) => {
    if(currentPath === itemHref) return true;
    if(itemHref === "/" && currentPath === "/") return true;
    if(itemHref === "/dashboard" && currentPath.startsWith("/dashboard")) return true;
    return false;
  }

  return (
    <nav className="bg-white border-b border-blue-100 px-6 py-4 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 flex-col">
            {/* <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div> */}
            <h1 className="text-2xl font-bold text-blue-900">AI EstiPlan Assistant</h1>
            <p className="text-sm text-gray">AI powered estimation delivery planner </p>
          </div>
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActivePath(item.href, pathname);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={pathname === item.href ? "default" : "ghost"}
                    className={`flex items-center space-x-2 transition-all duration-300 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                        : "text-blue-700 hover:text-blue-900 hover:bg-blue-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
