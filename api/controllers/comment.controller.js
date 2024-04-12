import { errorHandler } from "../utils/error.js";
import Comment from "../models/comment.model.js";

export const createComment = async (req, res, next)=>{
    try{
        const {content, postId, userId} = req.body;
        if(userId !== req.user.id){
            return next(errorHandler(403, "You're not allowed to comment on this post"));
        }
        const newComment = await Comment.create({
            content,
            postId,
            userId,
        });
        res.status(200).json(newComment);
    }catch(err){
        next(err);
    }
};