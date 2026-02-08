const reels = [
  {
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    caption: "Building VIBE 🔥"
  },
  {
    video: "https://www.w3schools.com/html/movie.mp4",
    caption: "Late night coding 🌙"
  }
];

const container = document.getElementById("reelsContainer");

reels.forEach((reel, index) => {
  const div = document.createElement("div");
  div.className = "reel";
 div.innerHTML = `
  <video src="${reel.video}" loop unmuted  playsinline></video>

  <div class="mute-indicator"></div>

  <div class="reel-actions">
    <button class="like-btn" onclick="likeReel(${index}, this)">❤️</button>
    <button onclick="openComments(${index})">💬</button>
    <button onclick="shareReel(${index})">📤</button>

  </div>

  <div class="reel-caption">${reel.caption}</div>
`;
  container.appendChild(div);
});
function shareReel(index) {
  const url = location.href + "#reel-" + index;

  if (navigator.share) {
    navigator.share({
      title: "Check this reel",
      url
    });
  } else {
    navigator.clipboard.writeText(url);
    alert("Link copied!");
  }
}


/* Auto play only visible video */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    const video = entry.target.querySelector("video");
    if (entry.isIntersecting) {
      video.play();
    } else {
      video.pause();
    }
  });
}, { threshold: 0.75 });
document.querySelectorAll(".reel").forEach(reel => {
  const video = reel.querySelector("video");
  const indicator = reel.querySelector(".mute-indicator");

  reel.addEventListener("click", () => {
    video.muted = !video.muted;
    indicator.textContent = video.muted ? "🔇" : "🔊";
  });
});
document.querySelectorAll(".reel").forEach(reel => {
  let lastTap = 0;
  const heart = document.createElement("div");
  heart.className = "heart-burst";
  const likeBtn = document.createElement("button");
  likeBtn.className = "like-btn";
  likeBtn.innerHTML = "❤️";
  likeBtn.onclick = () => likeReel(index, likeBtn);

  reel.appendChild(likeBtn);
  reel.appendChild(heart);

  reel.addEventListener("click", e => {
    const now = Date.now();
    if (now - lastTap < 300) {
      heart.classList.add("show");
      setTimeout(() => heart.classList.remove("show"), 700);

      const likeBtn = reel.querySelector(".like-btn");
      likeBtn.classList.add("liked");
    }
    lastTap = now;
  });
});


document.querySelectorAll(".reel").forEach(reel => observer.observe(reel));

function likeReel(index, el) {
  el.classList.toggle("liked");
}
let currentReelIndex = 0;
let reelComments = JSON.parse(localStorage.getItem("reelComments")) || {};

function openComments(index) {
  currentReelIndex = index;
  document.getElementById("commentsPanel").classList.add("active");

  const body = document.getElementById("commentsBody");
  body.innerHTML = "";

  (reelComments[index] || []).forEach(c => {
    const div = document.createElement("div");
    div.textContent = c;
    body.appendChild(div);
  });
}

function closeComments() {
  document.getElementById("commentsPanel").classList.remove("active");
}

function addComment(e) {
  if (e.key !== "Enter") return;
  const input = document.getElementById("commentInput");
  if (!input.value.trim()) return;

  reelComments[currentReelIndex] = reelComments[currentReelIndex] || [];
  reelComments[currentReelIndex].push(input.value);

  localStorage.setItem("reelComments", JSON.stringify(reelComments));
  input.value = "";
  openComments(currentReelIndex);
}
