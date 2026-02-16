import {mutation,query} from "./_generated/server";
import {v} from "convex/values";
import {ADMIN_EMAIL,POST_PER_PAGE_HOME,POST_PER_PAGE_ADMIN,MAX_IMAGE_SIZE,ALLOWED_IMAGE_TYPES,MAX_TITLE_LENGTH,MIN_TITLE_LENGTH,MAX_CONTENT_LENGTH,MIN_CONTENT_LENGTH,MAX_BIO_LENGTH,MAX_NAME_LENGTH,MIN_NAME_LENGTH,MAX_TAGS,MAX_TAG_LENGTH,MIN_TAG_LENGTH,EXCERPT_LENGTH} from "./constants";
//Get current authenticated user
export const getCurrentUser=query({
 
  handler:async(ctx)=>{
    const identity=await ctx.auth.getUserIdentity();
    if(!identity){
      return null;
    }
    const user=await ctx.db.query("users").withIndex("by_convex_id",(q)=>q.eq("convexId",identity.subject)).first();
    return user;
  }
});
//Get user by id
export const getUserById=query({
  args:{
    userId:v.id("users")
  },
  handler:async(ctx,args)=>{
     const identity=await ctx.auth.getUserIdentity();
     if(!identity){
      return null;
     }
     const user=await ctx.db.get(args.userId);
     if(!user){
      return null;
     }
     return user;
  }
})
//create a new user after authentication
export const createUser=mutation({
 handler:async(ctx)=>{
  const identity=await ctx.auth.getUserIdentity();
  if(!identity){
    throw new Error("Not authenticated");
  }
  const existingUser=await ctx.db.query("users").withIndex("by_convex_id",(q)=>q.eq("convexId",identity.subject)).first();
  if(existingUser){
    return existingUser;
  }
  const role=identity.email === ADMIN_EMAIL ? "admin" :"user";
  const newUser=await ctx.db.insert("users",{
    convexId:identity.subject,
    name:identity.name || "Anonymous",
    email:identity.email!,
    role:role,
    avatar:identity.pictureUrl,
    bio:"",
    createdAt:Date.now()


  });
  return newUser;
 }
});
//update user profile
export const updateProfile=mutation({
  args:{
    name:v.string(),
    avatar:v.optional(v.string()),
    bio:v.optional(v.string())
  },
  handler:async(ctx,args)=>{
    const identity=await ctx.auth.getUserIdentity();
    if(!identity){
      throw new Error("Not authenticated");
    }
    const user=await ctx.db.query("users").withIndex("by_convex_id",(q)=>q.eq("convexId",identity.subject)).first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id,{
      name:args.name,
      avatar:args.avatar,
      bio:args.bio
    });
  }
})