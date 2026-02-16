import {defineSchema,defineTable} from "convex/server";
import {v} from "convex/values";
export default defineSchema({
  users:defineTable({
    convexId:v.string(),
    name:v.string(),
    email:v.string(),
    avatar:v.optional(v.string()),
    bio:v.optional(v.string()),
    role:v.union(v.literal("user"),v.literal("admin")),
    createdAt:v.number()
  })
  .index("by_convex_id",["convexId"]),
  posts:defineTable({
    authorId:v.id("users"),
    title:v.string(),
    content:v.string(),
    imageId:v.optional(v.id("_storage")),
    imageUrls:v.optional(v.string()),
    tags:v.array(v.string()),
    authorName:v.string(),
    authorAvatar:v.optional(v.string()),
    createdAt:v.number(),
    updatedAt:v.number()
  })
  .index("by_author_id",["authorId"])
  .index("by_created_at",["createdAt"])
  .searchIndex("search_title",{
    searchField:"title",
    filterFields:["authorId"]
  })

})