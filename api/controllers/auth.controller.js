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

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(errorHandler(400, "All fields are required"));
  }
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(400, "Invalid credentials"));
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, "Invalid credentials"));
    }
    const token = jwt.sign({ id: validUser._id, isAdmin: validUser.isAdmin }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const { password: pass, ...rest } = validUser._doc;

    res
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json(rest);
  } catch (err) {
    // middleware sending error
    next(err);
  }
};

export const google = async (req, res, next) => {
  const { email, name, googlePhotoURL } = req.body;

  try {
    const user = await User.findOne({ email });
    // email exists in the database, then we log in the user and create a token and save it into a cookie
    if (user) {
      const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie("access_token", token, {
          httpOnly: true, 
        })
        .json(rest);
    }
    // email does not exist in the database THEN we create a new user and then sign in the user and create a token and save it into a cookie 
    else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
        const hashedPassword = bcryptjs.hash(generatedPassword, 10);
        // we want to make the user name unique
        // we will generate the password for the user (later they can change)
        const newUser = await User.create({
            username: name.toLowerCase().split(" ").join("") + Math.random().toString(9).slice(-4),
            email,
            password: generatedPassword,
            profilePicture: googlePhotoURL
        })
        const token = jwt.sign({id: newUser._id, isAdmin: newUser.isAdmin}, process.env.JWT_SECRET);
        const {password, ...rest} = newUser._doc;
        res.status(200).cookie("access_token", token, {
            httpOnly: true,
        }).json(rest);
    }
  } catch (error) {
    next(error);
  }
};
