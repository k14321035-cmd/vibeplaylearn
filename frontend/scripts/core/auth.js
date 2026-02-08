import { API_BASE_URL } from "./config.js";
const TOKEN_KEY = "token";
const API = API_BASE_URL;

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}


export function isLoggedIn() {
  return !!getToken();
}


async function loadUserWidget() {
  try {
    const response = await fetch(`${API}/auth/me`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    if (!response.ok) throw new Error("Not logged in");

    const user = await response.json();

    // Update the UI with real data
    const avatar = document.getElementById("userWidgetAvatar");
    const fullname = document.getElementById("userWidgetFullname");
    const username = document.getElementById("userWidgetUsername");

    // Display the first letter of the username as avatar
    avatar.textContent = user.username.charAt(0).toUpperCase();
    
    // If you have a profile picture field:
    // if (user.profilePic) avatar.innerHTML = `<img src="${user.profilePic}">`;

    fullname.textContent = user.fullname || user.username;
    username.textContent = `@${user.username}`;

  } catch (err) {
    console.error("Widget Error:", err);
    // Optional: Redirect to login if user isn't found
    // window.location.href = "login.html";
  }
}




export async function signup(data) {
  const res = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

export async function login(data) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Login failed");

  // ✅ Save BOTH the token and the user object
  localStorage.setItem("token", result.token);
  localStorage.setItem("user", JSON.stringify(result.user)); 
  
  return result.user;
}

export async function getMe() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const res = await fetch(`${API}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) return null;
  return res.json();
}
export function getToken() {
  return localStorage.getItem("token");
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}



export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = "/frontend/pages/login.html";
}
// Initialize when the page loads
loadUserWidget();