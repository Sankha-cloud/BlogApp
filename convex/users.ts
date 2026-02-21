import {mutation,query} from "./_generated/server";
import {v} from "convex/values";
import {ADMIN_EMAIL} from "./constants";
import { paginationOptsValidator } from "convex/server";
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
    const usersPost=await ctx.db.query("posts").withIndex("by_author_id",(q)=>q.eq("authorId",user._id)).collect();
    for(const post of usersPost){
      await ctx.db.patch(post._id,{
        authorName:args.name,
        authorAvatar:args.avatar,
      })
  }
  return {success:true};
}});
export const getUserProfile=query({
  args:{
    userId:v.id("users"),
    paginationOpts:paginationOptsValidator,
    searchQuery:v.optional(v.string())
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
   let posts=await ctx.db.query("posts").withIndex("by_author_id",(q)=>q.eq("authorId",user._id)).order("desc").collect();
   if(args.searchQuery){
    const searchLower=args.searchQuery.toLowerCase();
    posts=posts.filter((post)=>post.title.toLowerCase().includes(searchLower) || post.tags.some(tag =>tag.toLowerCase().includes(searchLower)) || post.authorName.toLowerCase().includes(searchLower));
   }
   const start=args.paginationOpts.numItems * (args.paginationOpts.cursor ? parseInt(args.paginationOpts.cursor) : 0);
   const paginatedPosts=posts.slice(start,start + args.paginationOpts.numItems);
   return {
    user,
    page:paginatedPosts,
    isDone:start + args.paginationOpts.numItems >= posts.length,
    continueCursor:(start + args.paginationOpts.numItems < posts.length) ? String(args.paginationOpts.cursor ? parseInt(args.paginationOpts.cursor) + 1 : 1) : undefined
   }
  }
})