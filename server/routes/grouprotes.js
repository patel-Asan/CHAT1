import express from "express";
import { protectRoute } from "../middle/auth.js";
import {
  createGroup, getUserGroups, getGroupMessages,
  sendGroupMessage, addMember, removeMember
} from "../controller/groupcontroller.js";

const groupRouter = express.Router();

groupRouter.post("/create", protectRoute, createGroup);
groupRouter.get("/", protectRoute, getUserGroups);
groupRouter.get("/:groupId/messages", protectRoute, getGroupMessages);
groupRouter.post("/:groupId/send", protectRoute, sendGroupMessage);
groupRouter.put("/:groupId/add/:userId", protectRoute, addMember);
groupRouter.delete("/:groupId/remove/:userId", protectRoute, removeMember);

export default groupRouter;
