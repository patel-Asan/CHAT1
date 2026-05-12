 import express from "express";
 import { protectRoute } from "../middle/auth.js";
 import { getUsersForSidebar, getMessages, markMessagesAsSeen, sendMessage, deleteMessage, editMessage } from
  "../controller/messagecontroller.js";


 const messageRouter = express.Router();

 messageRouter.get("/users", protectRoute, getUsersForSidebar);
 messageRouter.get("/:id", protectRoute, getMessages);
 messageRouter.put("/seen/:senderId", protectRoute, markMessagesAsSeen);
 messageRouter.post("/send/:id", protectRoute, sendMessage);
 messageRouter.delete("/:id", protectRoute, deleteMessage);
 messageRouter.put("/:id", protectRoute, editMessage);


    export default messageRouter;