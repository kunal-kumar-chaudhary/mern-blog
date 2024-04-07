import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    next(errorHandler(400, "All fields are required"));
  }

  try {
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.json("Signup success");
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next)=>{
    const {email, password} = req.body;

    if(!email || !password){
        next(errorHandler(400, "All fields are required"));
    }
    try {
        const validUser = await User.findOne({email});
        if(!validUser){
            return next(errorHandler(400, "Invalid credentials"));
        }  
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if(!validPassword){
            return next(errorHandler(400, "Invalid credentials"));
        }
        const token = jwt.sign({id: validUser._id}, process.env.JWT_SECRET, {expiresIn: "1h"});

        const {password: pass, ...rest} = validUser._doc;

        res.status(200).cookie("access_token", token, {httpOnly: true}).json(rest);
    }
    catch(err){
        // middleware sending error
        next(err);
    }
}