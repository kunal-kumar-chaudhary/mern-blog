import express from "express";
import {updateUser, deleteUser, signout, getUser, getusers} from "../controllers/user.controller.js";
import {verifyToken} from "../utils/verifyUser.js";

const router = express.Router();

router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.post("/signout", signout);
router.get("/getusers", verifyToken, getusers);
router.get("/:userId", getUser);


export default router; 