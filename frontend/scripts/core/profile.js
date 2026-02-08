const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(theme) {
  if (theme === "light") {
    document.body.classList.add("light");
  } else if (theme === "dark") {
    document.body.classList.remove("light");
  } else {
    // system
    document.body.classList.toggle("light", !prefersDark.matches);
  }
}

// Load saved theme or default to system
const savedTheme = localStorage.getItem("theme") || "system";
applyTheme(savedTheme);

// React to system theme changes
prefersDark.addEventListener("change", () => {
  if ((localStorage.getItem("theme") || "system") === "system") {
    applyTheme("system");
  }
});

const profile = {
  name: localStorage.getItem("name") || "Your Name",
  username: localStorage.getItem("username") || "yourhandle",
  bio: localStorage.getItem("bio") || "Building cool stuff 🚀",
  avatar: localStorage.getItem("avatar") || ""
};

function loadProfile() {
  document.getElementById("displayName").textContent = profile.name;
  document.getElementById("displayUsername").textContent = "@" + profile.username;
  document.getElementById("displayBio").textContent = profile.bio;

  if (profile.avatar) {
    document.getElementById("profileAvatar").style.backgroundImage = `url(${profile.avatar})`;
    document.getElementById("profileAvatar").textContent = "";
    document.getElementById("avatarPreview").src = profile.avatar;
  }
}

function openEditProfile() {
  document.getElementById("editProfileModal").classList.add("active");

  nameInput.value = profile.name;
  usernameInput.value = profile.username;
  bioInput.value = profile.bio;
}

function closeEditProfile() {
  document.getElementById("editProfileModal").classList.remove("active");
}

avatarInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    avatarPreview.src = reader.result;
    avatarPreview.style.display = "block";
    profile.avatar = reader.result;
  };
  reader.readAsDataURL(file);
});

function saveProfile() {
  profile.name = nameInput.value;
  profile.username = usernameInput.value;
  profile.bio = bioInput.value;

  localStorage.setItem("name", profile.name);
  localStorage.setItem("username", profile.username);
  localStorage.setItem("bio", profile.bio);
  localStorage.setItem("avatar", profile.avatar);

  loadProfile();
  closeEditProfile();
}
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light");
}
loadProfile();

