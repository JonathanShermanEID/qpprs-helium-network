/**
 * Breadcrumb Navigation Component
 * Author: Jonathan Sherman - Monaco Edition
 */

import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "wouter";

interface BreadcrumbItem {
  label: string;
  path: string;
}

export function Breadcrumbs() {
  const [location] = useLocation();

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [{ label: "Home", path: "/" }];

    let currentPath = "";
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      const label = segment
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      breadcrumbs.push({ label, path: currentPath });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location === "/") {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-6">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
          {index === breadcrumbs.length - 1 ? (
            // Current page (not clickable)
            <span className="text-white font-medium">{crumb.label}</span>
          ) : (
            // Previous pages (clickable)
            <Link href={crumb.path}>
              <a className="hover:text-blue-400 transition-colors flex items-center gap-1">
                {index === 0 && <Home className="w-4 h-4" />}
                {crumb.label}
              </a>
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
