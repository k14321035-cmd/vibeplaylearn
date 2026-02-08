import Message from "../models/message.model.js";
import mongoose from "mongoose";

export const getChatList = async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.user._id);

  const chats = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { receiver: userId }]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$sender", userId] },
            "$receiver",
            "$sender"
          ]
        },
        lastMessage: { $first: "$text" },
        lastAt: { $first: "$createdAt" },
        unread: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$receiver", userId] },
                  { $eq: ["$read", false] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user"
      }
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 0,
        userId: "$user._id",
        username: "$user.username",
        avatar: "$user.avatar",
        lastMessage: 1,
        unread: 1,
        lastAt: 1
      }
    },
    { $sort: { lastAt: -1 } }
  ]);

  res.json(chats);
};

export const sendMessage = async (req, res) => {
  const message = await Message.create({
    sender: req.user._id,
    receiver: req.params.userId,
    text: req.body.text
  });

  res.json(message);
};


export const getMessagesWithUser = async (req, res) => {
  const userId = req.user._id;
  const otherId = req.params.userId;

  const messages = await Message.find({
    $or: [
      { sender: userId, receiver: otherId },
      { sender: otherId, receiver: userId }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
};