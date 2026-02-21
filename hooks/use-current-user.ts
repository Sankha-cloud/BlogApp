import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
export function useCurrentUser(){
  const user=useQuery(api.users.getCurrentUser);
  return {
    user,
    isAdmin:user?.role === "admin",
    isLoading:user === undefined ,
    isAuthenticated:user !== null && user !== undefined
  }
}