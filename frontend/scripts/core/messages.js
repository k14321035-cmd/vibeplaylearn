import { getToken, getUser } from "../../core/auth.js";
import { API_BASE_URL } from "./config.js";

const chatMessages = document.getElementById("chatMessages");
const form = document.getElementById("messageForm");
const input = document.getElementById("messageInput");

let activeUserId = null;

/* LOAD CHAT */
export async function loadChat(userId) {
  activeUserId = userId;

  const res = await fetch(`${API_BASE_URL}/messages/${userId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const messages = await res.json();
  chatMessages.innerHTML = "";

  messages.forEach(msg => {
    chatMessages.innerHTML += `
      <div class="msg ${msg.sender._id === getUser().id ? "me" : ""}">
        ${msg.text}
      </div>
    `;
  });
}

/* SEND MESSAGE */
form.addEventListener("submit", async e => {
  e.preventDefault();

  if (!input.value || !activeUserId) return;

  await fetch(`${API_BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      receiverId: activeUserId,
      text: input.value
    })
  });

  input.value = "";
  loadChat(activeUserId);
});