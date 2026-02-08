import { getToken, getUser } from "../../core/auth.js";
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
import { API_BASE_URL, BACKEND_URL } from "../../core/config.js";

const socket = io(BACKEND_URL, {
  auth: {
    token: getToken()
  }
});

const chatMessages = document.getElementById("chatMessages");
const form = document.getElementById("messageForm");
const input = document.getElementById("chatInput");
const noChatSelected = document.getElementById("noChatSelected");
const activeChat = document.getElementById("activeChat");
const chatUsername = document.getElementById("chatUsername");

const params = new URLSearchParams(window.location.search);
const chatUserId = params.get("user");

let currentChatUser = chatUserId;
const user = getUser();
let activeUserId = null;

/* JOIN SOCKET ROOM */
socket.emit("join", user.id);

export async function loadChat(userId) {
  currentChatUser = userId;
  activeUserId = userId;

  // UI Toggles
  if (noChatSelected) noChatSelected.classList.add("hidden");
  if (activeChat) activeChat.classList.remove("hidden");

  // Fetch Messages & User Info
  const [msgRes, userRes] = await Promise.all([
    fetch(`${API_BASE_URL}/messages/${userId}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    }),
    fetch(`${API_BASE_URL}/auth/users/${userId}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
  ]);

  const messages = await msgRes.json();
  const chatUser = await userRes.json();

  // Update Header
  if (chatUsername) chatUsername.textContent = chatUser.username;
  if (typeof chatAvatar !== "undefined" && chatUser.avatar) {
      // If chatAvatar is an img tag
      if (chatAvatar.tagName === "IMG") chatAvatar.src = chatUser.avatar;
      else chatAvatar.textContent = chatUser.username[0].toUpperCase();
  } else if (chatAvatar) {
      chatAvatar.textContent = chatUser.username ? chatUser.username[0].toUpperCase() : "?";
  }

  chatMessages.innerHTML = "";

  messages.forEach(msg => {
    const div = document.createElement("div");
    // Check if sender is me (compare IDs)
    const isMe = (msg.sender._id || msg.sender) === user.id;
    div.className = isMe ? "msg me" : "msg";
    div.textContent = msg.text;
    chatMessages.appendChild(div);
  });

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
/* LOAD CHAT */

/* SEND MESSAGE */


/* RECEIVE MESSAGE */
socket.on("newMessage", message => {
  if (
    message.sender._id === activeUserId ||
    message.sender._id === user.id
  ) {
    renderMessage(message);
  }
});

/* RENDER MESSAGE */
function renderMessage(msg) {
  const div = document.createElement("div");
  div.className = `msg ${
    msg.sender._id === user.id ? "me" : ""
  }`;
  div.textContent = msg.text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
if(chatUserId){
  loadChat(chatUserId);
}

messageForm.addEventListener("submit", async e => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  await fetch(
    `${API_BASE_URL}/messages/${currentChatUser}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({ text })
    }
  );

  input.value = "";
  loadChat(currentChatUser);
});