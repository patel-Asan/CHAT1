import Message from "../model/message.js";
import User from "../model/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

export const getUsersForSidebar = async (req, res) => {
    try{
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        const unseenMessages = {}
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({senderId:  user._id, receiverId: userId, seen: false})
            if(messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }   
        })
        await Promise.all(promises);
        res.json({
            success: true,
            message: "Users fetched successfully",
            users: filteredUsers,
            unseenMessages
        }); 
    } catch (error) {
        res.json({
            success: false,
            message: "Error fetching users",
            error: error.message,
        }); 
    }}

    // get all message for selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },
            ]
        })
        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId},
            {seen: true});

        res.json({
            success: true,
            message: "Messages fetched successfully",
            messages    
        });
            
            
        }
        catch (error) {
        res.json({
            success: false,     
            message: "Error fetching messages",
            error: error.message,
        });
    }       
}


// api to mark messages as seen

export const markMessagesAsSeen = async (req, res) => {
    try {
        const { senderId } = req.params;
        const myId = req.user._id;
        await Message.updateMany(
            { senderId, receiverId: myId, seen: false },
            { seen: true }
        );
        res.json({
            success: true,
            message: "Messages marked as seen successfully"
        });
    }
    catch (error) {
        res.json({
            success: false,
            message: "Error marking messages as seen",
            error: error.message,
        });
    }
}

//send message selected user
export const sendMessage = async (req, res) => {
    try {
        const {text, image, file} = req.body;
        const senderId = req.user._id;
        const receiverId = req.params.id;

        let imageUrl;
        let fileData = {};

        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }

        if (file) {
            const uploadResponse = await cloudinary.uploader.upload(file.data, {
                resource_type: "auto",
            });
            fileData = {
                url: uploadResponse.secure_url,
                name: file.name,
                type: file.type,
            };
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            file: fileData
    })

const receiverSocketId = userSocketMap[receiverId];
if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });
}
catch (error) {
        res.json({
            success: false,
            message: "Error sending message",
            error: error.message,
        });
    }
}

// delete message
export const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(id);
        if (!message) {
            return res.json({ success: false, message: "Message not found" });
        }

        if (String(message.senderId) !== String(userId)) {
            return res.json({ success: false, message: "Not authorized" });
        }

        message.deleted = true;
        message.text = "";
        message.image = "";
        message.file = {};
        await message.save();

        const receiverSocketId = userSocketMap[message.receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("messageDeleted", { messageId: id });
        }

        res.json({
            success: true,
            message: "Message deleted successfully",
            data: message
        });
    } catch (error) {
        res.json({
            success: false,
            message: "Error deleting message",
            error: error.message,
        });
    }
}