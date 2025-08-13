import express from "express";
import { CheckAuth, login, signup, updateProfile } from "../controller/usercontrol.js";
import { protectRoute } from "../middle/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, CheckAuth);

export default userRouter;
