// frontend/scripts/features/story/story.js
import { API_BASE_URL, BACKEND_URL, getMediaPath } from "../../core/config.js";
async function handleDirectStoryUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first");

    // Show a small loading hint (optional)
    const plusIcon = document.querySelector(".story-avatar");
    const originalText = plusIcon.textContent;
    plusIcon.textContent = "⏳";

    const formData = new FormData();
    formData.append("image", file); // Must match what your upload.js middleware expects

    try {
        const res = await fetch(`${API_BASE_URL}/stories`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
            alert("Story uploaded!");
            location.reload(); // Refresh to see the new story in the bar
        } else {
            const err = await res.json();
            alert("Upload failed: " + err.message);
        }
    } catch (error) {
        console.error("Story upload error:", error);
        alert("Server error during upload");
    } finally {
        plusIcon.textContent = originalText;
    }
}
async function fetchStories() {
    const container = document.getElementById("dynamicStories");
    if (!container) return;
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_BASE_URL}/stories/feed`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const stories = await res.json();

        let html = "";
        // Add the dynamic stories
        stories.forEach(story => {
            const username = story.owner?.username || "user";
            const profilePic = story.owner?.profilePic
                ? getMediaPath(story.owner.profilePic)
                : '../../../../assets/default-avatar.svg';

            html += `
                <div class="story-item" onclick="viewStory('${getMediaPath(story.mediaUrl)}', '${username}')">
                    <div class="story-ring">
                        <img src="${profilePic}" class="story-avatar" onerror="this.src='../../../../assets/default-avatar.svg'" />
                    </div>
                    <div class="story-username">${username}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (err) {
        console.error("Error fetching stories:", err);
    }
}
let storyTimer;

function viewStory(mediaUrl, username) {
    const modal = document.getElementById("storyViewer");
    const img = document.getElementById("storyViewMedia");
    const userLabel = document.getElementById("storyViewUser");
    const progress = document.getElementById("storyProgress");

    // Reset progress bar
    progress.style.transition = 'none';
    progress.style.width = '0%';

    // Set Content
    img.src = mediaUrl;
    userLabel.textContent = `@${username}`;
    modal.classList.add("active");

    // Start Progress Bar (Wait a tiny bit for the DOM to catch up)
    setTimeout(() => {
        progress.style.transition = 'width 5s linear';
        progress.style.width = '100%';
    }, 50);

    // Auto-close after 5 seconds
    clearTimeout(storyTimer);
    storyTimer = setTimeout(() => {
        closeStoryViewer();
    }, 5000);
}

function closeStoryViewer() {
    const modal = document.getElementById("storyViewer");
    modal.classList.remove("active");
    clearTimeout(storyTimer);
}

// Initialize on load
document.addEventListener("DOMContentLoaded", fetchStories);

function openStoryUpload() {
    document.getElementById('storyFileInput').click();
}

window.handleDirectStoryUpload = handleDirectStoryUpload;
window.viewStory = viewStory;
window.closeStoryViewer = closeStoryViewer;
window.openStoryUpload = openStoryUpload;
window.fetchStories = fetchStories;