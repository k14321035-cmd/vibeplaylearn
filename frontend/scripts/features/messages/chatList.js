import { getToken } from "../../core/auth.js";
import { API_BASE_URL } from "../../core/config.js";
import { loadChat } from "./messages.js";

const chatList = document.getElementById("chatList");

export async function loadChatList() {
  const res = await fetch(`${API_BASE_URL}/messages/chats`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const chats = await res.json();
  chatList.innerHTML = "";

  chats.forEach(chat => {
    const div = document.createElement("div");
    div.className = "chat-item";
    div.innerHTML = `
      <div class="avatar">${chat.username[0].toUpperCase()}</div>
      <div class="chat-info">
        <div class="chat-name">${chat.username}</div>
        <div class="chat-last">${chat.lastMessage}</div>
      </div>
      ${
        chat.unread
          ? `<span class="badge">${chat.unread}</span>`
          : ""
      }
    `;

    div.onclick = () => loadChat(chat.userId);
    chatList.appendChild(div);
  });
}