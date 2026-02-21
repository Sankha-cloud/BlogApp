"use client";
import { useRouter } from "next/router";
import { LogOut, Settings, Shield, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger} from "../ui/dropdown-menu";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import {User} from "../../lib/types";
  import {getInitials} from "../../lib/utils";
  import { useAuthActions } from "@convex-dev/auth/react";
  import toast from "react-hot-toast";
  interface UserButtonProps{
    user:User;
  }
  export function UserButton({user} : UserButtonProps){
    const router=useRouter();
    const {signOut}=useAuthActions();
    async function handleLogout(){
      try{
        await signOut();
        toast.success("Logged out successfully");
        router.push("/signin");
      }
      catch(errr){
        toast.error("Failed to logout");
      }
      

    }
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative flex items-center space-x-2  focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full">
            <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ): null}
              <AvatarFallback className="bg-blue-600 text-white font-semibold">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-blue-600 text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator/>
          <DropdownMenuItem onClick={()=>router.push(`/profile/${user._id}`)}>
            <UserIcon className="mr-2 h-4 w-4"/>
            <span>My Profile</span>
            </DropdownMenuItem>
            {
              user.role === "admin" && (
                <DropdownMenuItem onClick={()=>router.push(`/admin`)}>
                <UserIcon className="mr-2 h-4 w-4"/>
                <span>Admin Dashboard</span>
                </DropdownMenuItem>
              )
            }
            <DropdownMenuSeparator/>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4"/>
              <span>Logout</span>
            </DropdownMenuItem>

        </DropdownMenuContent>

      </DropdownMenu>
    )
  }