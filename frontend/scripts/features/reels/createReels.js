import { getToken } from "../../core/auth.js";
import { fetchReels } from "./feed.js";
import { API_BASE_URL } from "../../core/config.js";

const form = document.getElementById("reelForm");
const uploadModal = document.getElementById("uploadModal");
const submitBtn = form?.querySelector('button[type="submit"]');

form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const videoFile = document.getElementById("reelVideo").files[0];
    const caption = document.getElementById("reelCaption").value.trim();

    if (!videoFile) {
        alert("Please select a video");
        return;
    }

    // Disable button to prevent double-posting
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Uploading...";
    }

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("caption", caption);

    try {
        const res = await fetch(`${API_BASE_URL}/reels`, {
            method: "POST",
            headers: {
                // Note: Do NOT set Content-Type here, FormData handles it
                Authorization: `Bearer ${getToken()}`
            },
            body: formData
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || "Upload failed");
        }

        // --- SUCCESS LOGIC ---
        
        // 1. Reset the form
        form.reset();
        
        // 2. Hide the modal (using the function in your HTML)
        if (typeof closeUploadModal === "function") {
            closeUploadModal();
        } else {
            uploadModal?.classList.remove("active");
        }

        // 3. Refresh the feed to show the new reel at the top
        await fetchReels();
        
        alert("Reel posted successfully! 🚀");

    } catch (err) {
        console.error("Reel Upload Error:", err);
        alert(err.message);
    } finally {
        // Re-enable button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Post Reel";
        }
    }
});