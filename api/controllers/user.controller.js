import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import User from "../models/user.model.js";

// only authenticated person can change their own data
export const updateUser = async (req, res, next) => {
  // now we will have access to the user object in the request object here
  console.log(req.user);
  if (req.user.id !== req.params.userId) {
    return next(
      errorHandler(403, "you're not allowed to update this user's data")
    );
  }
  // if the user is authenticated, they can only change their own data
  // we can now update the user data
  if (req.body.password) {
    if (req.body.password.length < 6) {
      return next(
        errorHandler(400, "Password must be at least 6 characters long")
      );
    }
    req.body.password = bcryptjs.hashSync(req.body.password, 10);
  }
  if (req.body.username) {
    if (req.body.username.length < 3 || req.body.username.length > 20) {
      return next(
        errorHandler(400, "Username must be between 3 and 20 characters long")
      );
    }
    if (req.body.username.includes(" ")) {
      return next(errorHandler(400, "Username must not contain any spaces"));
    }
    if (req.body.username !== req.body.username.toLowerCase()) {
      return next(errorHandler(400, "Username must be lowercase"));
    }
    if (!req.body.username.match(/^[a-zA-Z0-9]+$/)) {
      return next(
        errorHandler(400, "Username must contain only letters and numbers")
      );
    }
  }

  // we should not update everything at once for security reasons
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
          profilePicture: req.body.profilePicture,
        },
      },
      { new: true }
    );

    // excluding the password from the response
    const { password, ...rest } = updatedUser._doc;
    res.status(200).json(updatedUser);
  } catch (err) {
    console.log(err.message);
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
    // if the user is authenticated and is an admin, then he will be able to delete a user
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, "You're not allowed to delete this account"));
  }

  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json("User account deleted successfully");
  } catch (err) {
    next(err);
  }
};

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie("access_token")
      .status(200)
      .json("User has been signed out!");
  } catch (err) {
    next(err);
  }
};

export const getusers = async (req, res, next) => {
  // if the user is not admin
  if (!req.user.isAdmin) {
    return next(errorHandler(403, "you're not allowed to see all the users"));
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "asc" ? 1 : -1;
    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthUsers = await User.countDocuments({
      createdAt: {
        $gte: oneMonthAgo,
      },
    });

    res
      .status(200)
      .json({ users: usersWithoutPassword, totalUsers, lastMonthUsers });
  } catch (err) {
    next(err);
  }
};
