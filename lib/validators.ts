import {z} from "zod";
export const signUpSchema=z.object({
  name:z.string().min(2,"Name must be atleast 2 characters")
  .max(50,"Name must be less than 50 characters"),
  email:z.string().email("please enter a valid email address"),
  password:z.string().min(8,"Password must be atleast 8 characters")
  .regex(/[a-z]/, "Password must contain atleast one lowercase letter")
  .regex(/[A-Z]/, "Password must contain atleast one uppercase letter")
  .regex(/[0-9]/, "Password must contain atleast one number"),
  confirmPassword:z.string()

}).refine((data)=>data.password === data.confirmPassword,{
  message:"Passwords do not match",
  path:["confirmPassword"]
});


export const SignInSchema=z.object({
  email:z.string().email("please enter a valid email address"),
  password:z.string().min(8,"Password must be atleast 8 characters")

});
export type signUpFormData=z.infer<typeof signUpSchema>;
export type SignInFormData=z.infer<typeof SignInSchema>;
