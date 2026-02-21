import { query,mutation } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { EXCERPT_LENGTH } from "./constants";
function generateExcerpt(content:string){
  const plain=content.replace(/[#*`\[\]()]/g,'').replace(/\n/g,' ');
  return plain.substring(0,EXCERPT_LENGTH) + (plain.length > EXCERPT_LENGTH ? '...' : '');
}
//get all posts from the database
export const getAllPosts=query({
  args:{
    paginationOpts:paginationOptsValidator,
    searchQuery:v.optional(v.string())
  },
  handler:async(ctx,args)=>{
    let posts=await ctx.db.query("posts").withIndex("by_created_at").order("desc").collect();
    if(args.searchQuery){
      const searchLower=args.searchQuery.toLowerCase();
      posts=posts.filter((post)=>post.title.toLowerCase().includes(searchLower) || post.tags.some(tag =>tag.toLowerCase().includes(searchLower)) || post.authorName.toLowerCase().includes(searchLower));
    }
    let start=args.paginationOpts.numItems * (args.paginationOpts.cursor ? parseInt(args.paginationOpts.cursor) :0);
    let end=start + args.paginationOpts.numItems;
    const paginatedPosts=posts.slice(start,end);
    return {
      page:paginatedPosts,
      isDone: start + args.paginationOpts.numItems >= posts.length,
      continueCursor:(start + args.paginationOpts.numItems < posts.length) ? String(args.paginationOpts.cursor ? parseInt(args.paginationOpts.cursor) + 1 : 1) : undefined
    }
  }
})
//get by single post
export const getPostById=query({
  args:{
    postId:v.id("posts")
  },
  handler:async(ctx,args)=>{
    return await ctx.db.get(args.postId);
  }
})
//create a new post
export const createPost=mutation({
  args:{
    title:v.string(),
    content:v.string(),
    tags:v.array(v.string()),
    imageId:v.optional(v.id("_storage"))
  },
  handler:async(ctx,args)=>{
    const identity=await ctx.auth.getUserIdentity();
    if(!identity){
      throw new Error("Not authenticated");
    }
    const user=await ctx.db.query("users").withIndex("by_convex_id",(q)=>q.eq("convexId",identity.subject)).first();
    if(!user){
      throw new Error("User not found");
    }
    const excerpt=generateExcerpt(args.content);
    const imageUrls=args.imageId ? await ctx.storage.getUrl(args.imageId) : undefined;
    await ctx.db.insert("posts",{
      title:args.title,
      content:args.content,
      tags:args.tags.slice(0,5),
      excerpt,
      imageId:args.imageId,
      imageUrls:imageUrls ?? undefined,
      authorId:user._id,
      authorName:user.name,
      authorAvatar:user.avatar,
      createdAt:Date.now(),
      updatedAt:Date.now()
    
    })
  }
});
//update existing post
export const updatePost=mutation({
  args:{
    postId:v.id("posts"),
    title:v.string(),
    content:v.string(),
    tags:v.array(v.string()),
    imageId:v.optional(v.id("_storage"))
  },
  handler:async(ctx,args)=>{
    const identity=await ctx.auth.getUserIdentity();
    if(!identity){
      throw new Error("Not authenticated");
    }
    const user=await ctx.db.query("users").withIndex("by_convex_id",(q)=>q.eq("convexId",identity.subject)).first();
    if(!user){
      throw new Error("User not found");
    }
    const post=await ctx.db.get(args.postId);
    if(!post){
      throw new Error("Post not found");
    }
    if(post.authorId !== user._id){
      throw new Error("You are not authorized to update this post");
    }
    const excerpt = generateExcerpt(args.content);
    const imageUrl = args.imageId 
      ? await ctx.storage.getUrl(args.imageId)
      : undefined;
      await ctx.db.patch(args.postId,{
        title:args.title,
        content:args.content,
        excerpt,
        imageId:args.imageId,
        imageUrls:imageUrl ?? undefined,
        tags:args.tags.slice(0,5),
        updatedAt:Date.now()
      });
      return {success:true};
  }
});
//delete an existing post
export const deletePost=mutation({
  args:{
    postId:v.id("posts")
  },
  handler:async(ctx,args)=>{
    const identity=await ctx.auth.getUserIdentity();
    if(!identity){
      throw new Error("Not authenticated");
    }
    const user=await ctx.db.query("users").withIndex("by_convex_id",(q)=>q.eq("convexId",identity.subject)).first();
    if(!user){
      throw new Error("User not found");
    }
    const post=await ctx.db.get(args.postId);
    if(!post){
      throw new Error("Post not found");
    }
    if(post.authorId !== user._id){
      throw new Error("You are not authorized to delete this post");
    }
    await ctx.db.delete(args.postId);
    return {success:true};
  }
});
export const generateUploadUrl=mutation({
  handler:async(ctx)=>{
    return await ctx.storage.generateUploadUrl();
  }
})
//get admin stats
export const getAdminStats=query({
  handler:async(ctx)=>{
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_convex_id", (q) => q.eq("convexId", identity.subject))
      .first();
    
    if (!user || user.role !== "admin") {
      throw new Error("Unauthorized: Admin only");
    }
    const allPosts=await ctx.db.query("posts").collect();
    const allUsers=await ctx.db.query("users").collect();
    //count active writers
    const authorIds=new Set(allPosts.map(post =>post.authorId.toString()));
    const activeWriters=authorIds.size;
    //return stats
    return {
      totalPosts:allPosts.length,
      totalUsers:allUsers.length,
      activeWriters,
    }
  }
})