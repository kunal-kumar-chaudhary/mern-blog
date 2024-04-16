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

export const editComment = async (req, res, next)=>{
  try{
      const comment = await Comment.findById(req.params.commentId);
      // if comment exists
      if(!comment){
          return next(errorHandler(404, "Comment not found"));
      }
      // if the person is not owner of this comment and not an admin
      if(comment.userId !== req.user.id && !req.user.isAdmin){
          return next(errorHandler(403, "You're not allowed to edit this comment"));
      }
      const editedComment = await Comment.findByIdAndUpdate(req.params.commentId, {
        content: req.body.content,
      },
    {new:true}); 
    res.status(200).json(editedComment);
  }
  catch(err){
    next(err);
  }
}

export const deleteComment = async (req, res, next)=>{
  try{
    const comment = await Comment.findById(req.params.commentId);
    if(!comment){
      return next(errorHandler(404, "Comment not found"));
    };
    if(comment.userId !== req.user.id && !req.user.isAdmin){
      return next(errorHandler(403, "You're not allowed to delete this comment"));
    };
    await Comment.findByIdAndDelete(req.params.commentId);
    res.status(200).json({message: "Comment deleted successfully"});
  }
  catch(err){
    next(err);
  }
} 

export const getcomments = async (req, res, next) => {
  // if the person is not admin
  if(!req.user.isAdmin){
    return next(errorHandler(403, "You're not allowed to see this page"));
  };

  // if the person is admin
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "desc" ?  -1 : 1;
    const comments = await Comment.find()
      .sort({ createdAt: sortDirection  })
      .skip(startIndex)
      .limit(limit);
    const totalComments = await Comment.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() -1, now.getDate());
    const lastMonthComments = await Comment.countDocuments({createdAt: {$gte: oneMonthAgo}});
    res.status(200).json({comments, totalComments, lastMonthComments});
  } catch (err) {
    next(err);
  }
}