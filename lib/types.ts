export interface User{
  _id:string;
  convexId:string;
  name:string;
  email:string;
  avatar?:string;
  bio?:string;
  role:string;
  createdAt:number;
}