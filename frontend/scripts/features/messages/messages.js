import { getToken, getCurrentUser } from "../../core/auth.js";
import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";
import { API_BASE_URL, BACKEND_URL } from "../../core/config.js";

const socket = io(BACKEND_URL, {
  auth: {
    token: getToken()
  }
});

const chatMessages = document.getElementById("chatMessages");
const messageForm = document.getElementById("messageForm");
const chatInput = document.getElementById("chatInput");
const noChatSelected = document.getElementById("noChatSelected");
const activeChat = document.getElementById("activeChat");
const chatUsername = document.getElementById("chatUsername");
const myAvatar = document.getElementById("myAvatar");
const userSearch = document.getElementById("userSearch");

let allChats = []; // Store chats for searching

const params = new URLSearchParams(window.location.search);
const chatUserId = params.get("user");

let currentChatUser = chatUserId;
const user = getCurrentUser();
let activeUserId = null;

if (!user) {
  window.location.href = "../login.html";
}

/* JOIN SOCKET ROOM */
socket.emit("join", user._id || user.id);

async function loadChatList(searchTerm = "") {
  const res = await fetch(`${API_BASE_URL}/messages/chatlist`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  allChats = await res.json();
  renderChatList(searchTerm);
}

function renderChatList(searchTerm = "") {
  const chatList = document.getElementById("chatList");
  if (!chatList) return;

  const filtered = allChats.filter(c =>
    c.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  chatList.innerHTML = filtered.map(chat => `
    <div class="chat-item ${chat.userId === currentChatUser ? 'active' : ''}" onclick="loadChat('${chat.userId}')">
      <div class="chat-item-avatar">${chat.username[0].toUpperCase()}</div>
      <div class="chat-item-info">
        <div class="chat-item-header">
          <strong>${chat.username}</strong>
          <span class="chat-item-time">${new Date(chat.lastAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="chat-item-last-msg">${chat.lastMessage}</div>
      </div>
      ${chat.unread > 0 ? `<div class="unread-badge">${chat.unread}</div>` : ''}
    </div>
  `).join("");
}

// Populate my profile
if (myAvatar && user) {
  myAvatar.textContent = user.username[0].toUpperCase();
  if (user.avatar) {
    myAvatar.style.backgroundImage = `url(${user.avatar})`;
    myAvatar.textContent = "";
  }
}

userSearch.addEventListener("input", (e) => {
  renderChatList(e.target.value);
});

export async function loadChat(userId) {
  currentChatUser = userId;
  activeUserId = userId;

  // UI Toggles
  if (noChatSelected) noChatSelected.classList.add("hidden");
  if (activeChat) activeChat.classList.remove("hidden");

  // Highlight active contact
  document.querySelectorAll(".chat-item").forEach(item => {
    item.classList.remove("active");
  });
  const activeItem = document.querySelector(`.chat-item[onclick*='${userId}']`);
  if (activeItem) activeItem.classList.add("active");

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

  // Auto-focus input for "click and type" experience
  const chatInput = document.getElementById("chatInput");
  if (chatInput) chatInput.focus();
}
/* LOAD CHAT */

/* SEND MESSAGE */


/* RECEIVE MESSAGE */
socket.on("newMessage", message => {
  if (
    message.sender._id === activeUserId ||
    message.sender._id === user._id || message.sender._id === user.id
  ) {
    renderMessage(message);
    loadChatList(); // Refresh list to show last message
  }
});

/* RENDER MESSAGE */
function renderMessage(msg) {
  const div = document.createElement("div");
  const isMe = (msg.sender._id || msg.sender) === (user._id || user.id);
  div.className = `msg ${isMe ? "me" : "received"}`;
  div.textContent = msg.text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
if (chatUserId) {
  loadChat(chatUserId);
}
loadChatList();

messageForm.addEventListener("submit", async e => {
  e.preventDefault();

  const text = chatInput.value.trim();
  if (!text) return;

  // Real-time delivery via Socket
  socket.emit("sendMessage", {
    senderId: user._id || user.id,
    receiverId: currentChatUser,
    text: text
  });

  chatInput.value = "";
});

// Expose to window for global access
window.loadChat = loadChat;