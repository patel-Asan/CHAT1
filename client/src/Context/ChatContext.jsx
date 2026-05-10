// import { createContext,  useEffect, useState } from "react";
// import { AuthContext } from "./AuthContext";
// import React, { useContext } from "react";


// export const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {

//     const [messages, setMessages] =useState([]);
//     const [users, setUsers] = useState([]);
//     const [selectedUser, setSelectedUser]=useState(null)
//     const [unseenMessages, setUnseenMessages]= useState({})

//     const {socket, axios}= useContext(AuthContext);
     

//     const getUsers = async()=>{
//         try{
//     const { data } = await axios.get("/api/messages/users");
//     if(data.success){
//         setUsers(data.users)
//         setUnseenMessages(data.unseenMessages)
//     } 
// } catch(error) {
//     toast.error(error.messages)
// }
// }


// // selected user

// const getMessages = async (userId)=>{
//     try{
//         const { data }= await axios.get(`/api/messages/${userId}`);
//        if (data.success){
//             setMessages(data.messages)
//         }
//     } catch (error){
//         toast.error(error.message)
//     }
// }
    
// // send message to selected user

// const SendMessage = async (messageData)=>{
//     try {
//         const {data} = await axios.post(`/api/messsages/send/${selectedUser._id}`, messageData);
//         if(data.success){
//             setMessages((prevMessages)=>[...prevMessages, data.newMessage])
//         } else {
//             toast.error(data.message)
//         } 
//     } catch (error) {
//         toast.error(error.message)
        
//     }
// }
//     //subsribe to messages for selected user

//     const subscribeToMessages = async () =>{
//         if(!socket) return;
//         socket.on("newMessage", (newMessage)=>{
//             if(selectedUser && newMessage.sender._id === selectedUser._id){
//                 newMessage.seen = true;
//                 setMessages((prevMessages)=>[...prevMessages, newMessage])
//                 axios.post(`/api/messages/seen/${selectedUser._id}`);
//             }else{
//                 setUnseenMessages((prevUnseenMessages)=>({
//                     ...prevUnseenMessages,
//                     [newMessage.senderId]: 
//                     prevUnseenMessages[newMessage.senderId] ?
//                     prevUnseenMessages[newMessage.senderId] + 1 : 1
//                 }))
//             }
//         })
//     }

//     //unsubscribe from messages for selected user
//     const unsubscribeFromMessages = () => {
//         if(!socket) return;
//         socket.off("newMessage");
//     }

//     useEffect(()=>{
//         subscribeToMessages();
//         return () => unsubscribeFromMessages();
//     }, [socket, selectedUser]);
   
    
//     const value = {
//         messages,
//         users,
//         selectedUser,
//         getUsers,
//         getMessages,
//         SendMessage,
//         setSelectedUser,
//         unseenMessages,
//         setUnseenMessages,

//     }
//     return(
//         <ChatContext.Provider value={value}>
//             { children}
//         </ChatContext.Provider>
//     )
// }


import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const { socket, axios } = useContext(AuthContext);

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getGroups = async () => {
    try {
      const { data } = await axios.get("/api/groups");
      if (data.success) setGroups(data.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const createGroup = async (name, memberIds) => {
    try {
      const { data } = await axios.post("/api/groups/create", { name, members: memberIds });
      return data;
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  };

  const getGroupMessages = async (groupId) => {
    try {
      const { data } = await axios.get(`/api/groups/${groupId}/messages`);
      if (data.success) setMessages(data.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendGroupMessage = async (messageData) => {
    try {
      const { data } = await axios.post(`/api/groups/${selectedGroup._id}/send`, messageData);
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const { data } = await axios.delete(`/api/messages/${messageId}`);
      if (data.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, deleted: true, text: "", image: "", file: {} } : msg
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const subscribeToMessages = () => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      if (selectedUser && String(newMessage.senderId) === String(selectedUser._id)) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/seen/${newMessage.senderId}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, deleted: true, text: "", image: "", file: {} } : msg
        )
      );
    });

    socket.on("typing", ({ senderId }) => {
      if (selectedUser && String(senderId) === String(selectedUser._id)) {
        setIsTyping(true);
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (selectedUser && String(senderId) === String(selectedUser._id)) {
        setIsTyping(false);
      }
    });

    socket.on("newGroupMessage", ({ groupId, message }) => {
      if (selectedGroup && String(groupId) === String(selectedGroup._id)) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("groupCreated", (group) => {
      setGroups((prev) => {
        const exists = prev.find((g) => g._id === group._id);
        return exists ? prev : [...prev, group];
      });
    });
  };

  const unsubscribeFromMessages = () => {
    if (!socket) return;
    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("newGroupMessage");
    socket.off("groupCreated");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        users,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        groups,
        selectedGroup,
        setSelectedGroup,
        getUsers,
        getGroups,
        getMessages,
        getGroupMessages,
        sendMessage,
        sendGroupMessage,
        createGroup,
        deleteMessage,
        isTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
