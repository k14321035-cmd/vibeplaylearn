import { getToken, getCurrentUser } from "../../core/auth.js";
import { API_BASE_URL } from "../../core/config.js";

const container = document.getElementById("postsContainer");
function closeAllMenus() {
  document
    .querySelectorAll(".menu-dropdown.show")
    .forEach(m => m.classList.remove("show"));
}

document.addEventListener("click", closeAllMenus);

// ================= FETCH POSTS =================
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
    console.error(err);
  }
}

async function adminDeletePost(postId) {
  if (!confirm("Delete this post?")) return;

  await fetch(`${API_BASE_URL}/posts/admin/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  document.getElementById(`post-${postId}`).remove();
}
// ================= RENDER POSTS =================
function renderPosts(posts) {
  container.innerHTML = "";

  posts.forEach(post => {
    const card = createPostCard(post);
    container.appendChild(card);
  });
}


// ================= CREATE POST CARD =================
function createPostCard(post) {
  const card = document.createElement("div");
  card.className = "post-card";

  const currentUser = getCurrentUser();
  const isOwner = post.user?._id === currentUser.id;
  const username = post.user?.username || "Unknown";

  card.innerHTML = `
    <div class="post-header">
      <div class="post-user">
        <div class="post-avatar">
          ${username[0].toUpperCase()}
        </div>
        <div class="post-info">
          <h4>${username}</h4>
          <span>${formatTime(post.createdAt)}</span>
        </div>
      </div>

      <div class="post-menu">
        <button class="menu-btn">⋯</button>
        <div class="menu-dropdown">
          ${
            isOwner
              ? `<button class="delete-post">Delete</button>`
              : `<span class="menu-muted">No actions</span>`
          }
        </div>
      </div>
    </div>

    ${post.image ? `<img src="${post.image}" class="post-image"/>` : ""}

    <div class="post-caption">
      <strong>${username}</strong> ${post.caption || ""}
    </div>
  `;

  // MENU TOGGLE
  const menuBtn = card.querySelector(".menu-btn");
  const menu = card.querySelector(".menu-dropdown");

  menuBtn.onclick = e => {
    e.stopPropagation();
    closeAllMenus();
    menu.classList.toggle("show");
  };

  // DELETE
  if (isOwner) {
    card.querySelector(".delete-post").onclick = () => {
      deletePost(post._id);
      menu.classList.remove("show");
    };
  }

  return card;
}


// ================= LIKE POST =================
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
    console.error(err);
  }
}

async function deletePost(postId) {
  const ok = confirm("Delete this post?");
  if (!ok) return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/post/${postId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );

    if (!res.ok) {
      alert("Failed to delete post");
      return;
    }

    fetchPosts(); // 🔄 refresh feed
  } catch (err) {
    console.error(err);
  }
}
if(currentUser.isAdmin) {
  menu.innerHTML += `<button class="delete-btn" onclick="adminDeletePost('${post._id}')">Admin Delete</button>`;
}
// ================= TIME FORMAT =================
function formatTime(date) {
  return new Date(date).toLocaleString();
}
window.openChatFromFeed = function (userId) {
  window.location.href = `/pages/messages.html?user=${userId}`;
};
