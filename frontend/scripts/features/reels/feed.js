import { getToken } from "../../core/auth.js";
import { API_BASE_URL, BACKEND_URL } from "../../core/config.js";

const container = document.getElementById("reelsContainer");

/* =========================
   FETCH REELS FROM BACKEND
   ========================= */
export async function fetchReels() {
    try {
        const res = await fetch(`${API_BASE_URL}/reels`, {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        });

        if (!res.ok) throw new Error("Failed to fetch reels");

        const reels = await res.json();
        
        // Clear container before loading
        container.innerHTML = "";

        if (reels.length === 0) {
            container.innerHTML = `<div class="empty-state">No reels yet. Be the first to post!</div>`;
            return;
        }

        reels.forEach(reel => {
            const reelHTML = `
                <div class="reel-slide">
                    <video
                        src="${BACKEND_URL}${reel.video}"
                        loop
                        muted
                        playsinline
                        preload="metadata"
                        class="reel-video"
                    ></video>

                    <div class="reel-overlay">
                        <div class="reel-info">
                            <div class="reel-user">
                                <div class="avatar-small">${reel.user.username.charAt(0).toUpperCase()}</div>
                                <strong>@${reel.user.username}</strong>
                            </div>
                            <div class="reel-caption">
                                ${reel.caption || ""}
                            </div>
                        </div>

                        <div class="reel-actions">
                            <button class="action-btn">❤️ <span>${reel.likes || 0}</span></button>
                            <button class="action-btn">💬 <span>${reel.comments?.length || 0}</span></button>
                            <button class="action-btn">✈️</button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', reelHTML);
        });

        // Initialize video logic
        setupReelObserver();
        setupVideoInteractions();

    } catch (err) {
        console.error("Failed to load reels:", err);
        container.innerHTML = `<div class="error">Error loading feed. Check your connection.</div>`;
    }
}

/* =========================
   AUTOPLAY LOGIC (Intersection Observer)
   ========================= */
function setupReelObserver() {
    const videos = document.querySelectorAll(".reel-video");

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                const video = entry.target;

                if (entry.isIntersecting) {
                    // Play video when 75% visible
                    video.play().catch(error => {
                        console.log("Autoplay blocked. User must interact first.");
                    });
                } else {
                    // Pause and reset when scrolled away
                    video.pause();
                    video.currentTime = 0; 
                }
            });
        },
        { 
            threshold: 0.75 // Video must be 75% on screen to play
        }
    );

    videos.forEach(video => observer.observe(video));
}

/* =========================
   CLICK TO MUTE/UNMUTE
   ========================= */
function setupVideoInteractions() {
    container.addEventListener("click", (e) => {
        if (e.target.classList.contains("reel-video")) {
            const video = e.target;
            // Toggle mute
            video.muted = !video.muted;
            
            // Optional: Provide visual feedback for mute/unmute
            console.log(video.muted ? "Muted" : "Unmuted");
        }
    });
}

/* =========================
   INITIALIZE
   ========================= */
fetchReels();