import { errorHandler } from "../utils/error.js";
import Post from "../models/post.model.js";

export const create = async (req, res, next) => {
  // if the uses is not admin, he/she is not allowed to create a post
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "you're not allowed to create a post"));
  }

  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, "All fields are required"));
  }

  // slug will be used as url for directing to the post page
  const slug = req.body.title
    .split(" ")
    .join("-")
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, "");

  try {
    const newPost = await Post.create({
      ...req.body,
      slug,
      userId: req.user.id,
    });
    res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
};

export const getposts = async (req, res, next) => {
  try {
    // if there is not starting index, we will start from the beginning
    const startIndex = parseInt(req.query.startIndex) || 0;
    // if there is no limit, we will limit the number of posts to 9
    const limit = parseInt(req.query.limit) || 9;
    // we will sort the posts by the latest first
    const sortDirection = req.query.order === "asc" ? 1 : -1;
    console.log(req.query);
    // getting posts based on the query parameters passed in the url
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { postId: req.query.category }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: "i" } },
          { content: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    }
    )
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
      console.log(posts);
    // getting total number of posts
    const totalPosts = await Post.countDocuments();

    // getting all the posts done in last one month
    const now = new Date();
    // last month
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    // This effectively retrieves all posts created within the last month.
    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    console.log(posts);
    res.status(200).json({posts, totalPosts, lastMonthPosts});

  } catch (err) {
    next(err);
  }
};
