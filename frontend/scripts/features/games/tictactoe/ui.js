export function renderBoard(board, onClick) {
  const el = document.getElementById("board");
  el.innerHTML = "";

  board.forEach((cell, i) => {
    const btn = document.createElement("button");
    
    // Add the X or O text
    btn.textContent = cell || "";

    // Apply the specific CSS classes for neon colors
    if (cell === "X") {
      btn.classList.add("x-symbol");
      btn.disabled = true; // Prevent clicking already filled cells
    } else if (cell === "O") {
      btn.classList.add("o-symbol");
      btn.disabled = true; // Prevent clicking already filled cells
    }

    // Only allow clicking if the cell is empty
    btn.onclick = () => {
      if (!cell) {
        onClick(i);
      }
    };

    el.appendChild(btn);
  });
}

export function updateStatus(text) {
  const statusEl = document.getElementById("status");
  statusEl.textContent = text;

  // Optional: Add a red glow if the opponent leaves
  if (text.includes("left")) {
    statusEl.classList.add("status-error");
  } else {
    statusEl.classList.remove("status-error");
  }
}