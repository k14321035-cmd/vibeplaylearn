import { getToken, getCurrentUser } from "../../core/auth.js";
import { API_BASE_URL, BACKEND_URL } from "../../core/config.js";

const container = document.getElementById("postsContainer");

/* ================= FETCH POSTS ================= */
export async function fetchPosts() {
  try {
    const res = await fetch(`${API_BASE_URL}/post`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    if (!res.ok) throw new Error("Failed to load posts");

    const posts = await res.json();
    renderPosts(posts);

  } catch (err) {
    console.error("Fetch posts error:", err);
  }
}

/* ================= RENDER POSTS ================= */
function renderPosts(posts) {
  container.innerHTML = "";

  posts.forEach(post => {
    const card = createPostCard(post);
    container.appendChild(card);
  });
}

/* ================= CREATE POST CARD ================= */
function createPostCard(post) {
  const card = document.createElement("div");
  card.className = "post-card";

  const currentUser = getCurrentUser();
  const isLiked =
    post.likes && currentUser && post.likes.includes(currentUser.id);

  const username = post.user?.username || "Unknown";
  const avatar = post.user?.avatar || "/assets/avatar.png";

  card.innerHTML = `
    <div class="post-header">
      <img src="${avatar}" class="avatar" />
      <div class="post-info">
        <h4 class="username">${username}</h4>
        <span>${formatTime(post.createdAt)}</span>
      </div>
    </div>

    ${post.image ? `<img src="${BACKEND_URL}${post.image}" class="post-image"/>` : ""}

    <div class="post-actions">
      <button class="action-btn ${isLiked ? "liked" : ""}">
        ❤️ ${post.likes ? post.likes.length : 0}
      </button>
    </div>

    <div class="post-caption">
      <strong>${username}</strong> ${post.caption || ""}
    </div>
  `;

  /* ==== CLICK TO CHAT ==== */
  const avatarEl = card.querySelector(".avatar");
  const usernameEl = card.querySelector(".username");

  avatarEl.addEventListener("click", () => openChat(post.user._id));
  usernameEl.addEventListener("click", () => openChat(post.user._id));

  /* ==== LIKE ==== */
  card.querySelector(".action-btn").onclick = () =>
    toggleLike(post._id);

  return card;
}

/* ================= LIKE POST ================= */
async function toggleLike(postId) {
  try {
    await fetch(`${API_BASE_URL}/post/${postId}/like`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    fetchPosts();
  } catch (err) {
    console.error("Like error:", err);
  }
}

/* ================= CHAT NAV ================= */
function openChat(userId) {
  window.location.href = `messages.html?user=${userId}`;
}

/* ================= TIME FORMAT ================= */
function formatTime(date) {
  return new Date(date).toLocaleString();
}