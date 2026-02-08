

let currentUserStories = [];
let currentStoryIndex = 0;




        // Load posts
        function loadPosts() {
            const container = document.getElementById('postsContainer');
            container.innerHTML = '';
            
           
        }

        function createPostCard(post, index) {
            return `
                <div class="post-card">
                    <div class="post-header">
                        <div class="post-user">
                            <div class="post-avatar">${post.avatar}</div>
                            <div class="post-info">
                                <h4>${post.username}</h4>
                                <span>${post.time}</span>
                            </div>
                        </div>
                        <button class="icon-btn">⋯</button>
                    </div>
                    <img src="${post.image}" alt="Post" class="post-image"/>
                    <div class="post-actions">
                        <button class="action-btn" onclick="toggleLike(this, ${index})">
                            <span id="like-icon-${index}">🤍</span>
                            <span id="like-count-${index}">${post.likes}</span>
                        </button>
                        <button class="action-btn">
                            <span>💬</span>
                            <span>${post.comments.length}</span>
                        </button>
                        <button class="action-btn">
                            <span>📤</span>
                        </button>
                        <button class="action-btn" style="margin-left: auto;">
                            <span>🔖</span>
                        </button>
                    </div>
                    <div class="post-caption">
                        <strong>${post.username}</strong>${post.caption}
                    </div>
                    <div class="post-comments">
                        <div class="view-comments">View all comments</div>
                        <div class="comment-input">
                            <input type="text" placeholder="Add a comment...">
                            <button>Post</button>
                        </div>
                    </div>
                </div>
            `;
        }

        function toggleLike(btn, index) {
          
            const icon = document.getElementById(`like-icon-${index}`);
            const count = document.getElementById(`like-count-${index}`);
            
            if (btn.classList.contains('liked')) {
                btn.classList.remove('liked');
                icon.textContent = '🤍';
                post.likes--;
            } else {
                btn.classList.add('liked');
                icon.textContent = '❤️';
                post.likes++;
            }
            
            count.textContent = post.likes;
        }

        function toggleFollow(btn) {
            if (btn.classList.contains('following')) {
                btn.classList.remove('following');
                btn.textContent = 'Follow';
            } else {
                btn.classList.add('following');
                btn.textContent = 'Following';
            }
        }

        function openPostModal() {
            document.getElementById('postModal').classList.add('active');
        }

        function closePostModal() {
            document.getElementById('postModal').classList.remove('active');
            document.getElementById('uploadArea').classList.remove('has-image');
            document.getElementById('captionInput').value = '';
            document.getElementById('previewImage').src = '';
        }

        function handleFileSelect(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('previewImage').src = e.target.result;
                    document.getElementById('uploadArea').classList.add('has-image');
                };
                reader.readAsDataURL(file);
            }
        }

        function createPost() {
            const caption = document.getElementById('captionInput').value;
            const previewSrc = document.getElementById('previewImage').src;
            
            if (previewSrc && caption) {
                const newPost = {
                    username: 'yourhandle',
                    avatar: 'Y',
                    time: 'Just now',
                    image: previewSrc,
                    caption: caption,
                    likes: 0,
                    comments: []
                };
                
                loadPosts();
                closePostModal();
            } else {
                alert('Please add an image and caption!');
            }
        }

        // Initialize
        loadPosts();

        // Close modal on outside click
        document.getElementById('postModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closePostModal();
            }
        });

const page = location.pathname.split("/").pop();

document.querySelectorAll(".mobile-nav button").forEach(btn => {
  if (btn.getAttribute("onclick")?.includes(page)) {
    btn.style.color = "var(--accent-1)";
  }
});


