import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getPasswordStrength(password:string){
 let strength=0;
 if(password.length >= 8)strength++;
 if(password.length >= 12)strength++;
 if(/[a-z]/.test(password) && /[A-Z]/.test(password)){
  strength++;
 }
 if (/\d/.test(password)) strength++;
 if (/[^a-zA-Z0-9]/.test(password)) strength++;
 if(strength <= 2)return "weak";
 if(strength <= 3)return "medium";
 return "strong";


}
export function getInitials(name:string){
  return name.split(" ").map((n)=>n[0]).join(" ").toUpperCase();
}

