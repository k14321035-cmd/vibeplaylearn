import { getToken } from "../../core/auth.js";
import { API_BASE_URL } from "../../core/config.js";
import { fetchPosts } from "./feed.js";

// Global variable to track if we are uploading a Post or a Story
let uploadMode = 'post'; 

const form = document.getElementById("postForm");
const captionInput = document.getElementById("captionInput");
const postImage = document.getElementById("postImage");

/**
 * Prepares the modal for either a Story or a Post.
 * This is called from the 'Add Story' button or 'POST' button in vibe.html.
 */
window.prepareUpload = function(mode) {
    uploadMode = mode;
    
    // UI Tweaks based on mode
    if (mode === 'story') {
        captionInput.style.display = 'none'; // Stories usually don't have captions
        captionInput.required = false;
    } else {
        captionInput.style.display = 'block';
        captionInput.required = true;
    }
    
    // Open the modal (using the function defined in your vibe.html script tag)
    if (typeof openPostModal === 'function') {
        openPostModal();
    }
};

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const image = postImage.files[0];
        if (!image) {
            return alert("Media is required");
        }

        const token = getToken();
        if (!token) {
            alert("Please login again");
            window.location.href = "login.html";
            return;
        }

        // Determine the correct API endpoint
        const endpoint = uploadMode === 'story' 
            ? `${API_BASE_URL}/stories` 
            : `${API_BASE_URL}/post`;

        const formData = new FormData();
        formData.append("image", image); // Your backend upload middleware likely expects "image"
        
        // Only append caption if it's a post
        if (uploadMode === 'post') {
            const caption = captionInput.value.trim();
            formData.append("caption", caption);
        }

        try {
            // Show a loading state if you have one
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = "Uploading...";
            submitBtn.disabled = true;

            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Upload failed");
            }

            // Success Cleanup
            alert(`${uploadMode.toUpperCase()} shared successfully!`);
            
            if (typeof closePostModal === 'function') {
                closePostModal();
            }
            
            form.reset();
            
            // Refresh content
            if (uploadMode === 'post') {
                fetchPosts(); // Refresh Feed
            } else {
                location.reload(); // Refresh to show the new Story in the carousel
            }

        } catch (err) {
            console.error(err);
            alert(err.message || "Failed to upload");
        } finally {
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = "Post";
            submitBtn.disabled = false;
        }
    });
}