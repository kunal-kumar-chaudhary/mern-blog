import { errorHandler } from "../utils/error.js";
import Comment from "../models/comment.model.js";

export const createComment = async (req, res, next) => {
  try {
    const { content, postId, userId } = req.body;
    if (userId !== req.user.id) {
      return next(
        errorHandler(403, "You're not allowed to comment on this post")
      );
    }
    const newComment = await Comment.create({
      content,
      postId,
      userId,
    });
    res.status(200).json(newComment);
  } catch (err) {
    next(err);
  }
};

export const getPostComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({
      createdAt: -1,
    });

    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};

export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    // inside the like array we will check if there is a like with the same userId
    const likeIndex = comment.likes.indexOf(req.user.id);
    // if the user has not liked the comment yet, we will add the user id to the likes array
    if(likeIndex === -1){
      comment.numberOfLikes += 1;
      comment.likes.push(req.user.id);
    }
    // if the user has already liked the comment, we will remove the user id from the likes array
    else{
      comment.numberOfLikes -= 1;
      comment.likes.splice(likeIndex, 1);
    }
     await comment.save();
     res.status(200).json(comment);
  }
  catch(err){
    next(err);
  }
}
