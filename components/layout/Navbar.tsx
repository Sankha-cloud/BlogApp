"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Search,Mail} from "lucide-react";
import {UserButton} from "./user-button";
import {ThemeToggle} from "../layout/theme-toggle";
import {SearchBar} from "../layout/SearchBar";
import {useCurrentUser} from "../../hooks/use-current-user";
export default function Navbar(){
 const {user,isLoading} = useCurrentUser();
 const pathname=usePathname();
 const showSearchBar= pathname == "/" || pathname.startsWith("/profile/");
  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
        <Link href="/" className="flex items-center space-x-2 group">
            <Mail className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              BlogApp
            </span>
          </Link>
          {
            showSearchBar && (
              <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <SearchBar/>
              </div>
            )
          }
          <div className="flex items-center space-x-4">
            <ThemeToggle/>
            {!isLoading && user && <UserButton user={user}/>}

          </div>

        </div>

      </div>
    </nav>
  )
}