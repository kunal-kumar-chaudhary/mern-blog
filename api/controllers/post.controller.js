import { errorHandler } from "../utils/error.js";
import Post from "../models/post.model.js";

export const create = async (req, res, next) => {

    // if the uses is not admin, he/she is not allowed to create a post
    if(!req.user.isAdmin){
        return next(errorHandler(403, "you're not allowed to create a post"));
    }

    if(!req.body.title || !req.body.content)
    {
        return next(errorHandler(400, "All fields are required"));
    }
    
    // slug will be used as url for directing to the post page
    const slug = req.body.title.split(" ").join("-").toLowerCase().replace(/[^a-zA-Z0-9-]/g, "");

    try{
        const newPost = await Post.create({
            ...req.body,
            slug,   
            userId: req.user.id,
        });
        res.status(201).json(newPost);
    }
    catch(err){
        next(err);
    }

};