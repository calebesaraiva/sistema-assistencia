// src/utils/toast.ts
export const toast = {
  success(message: string) {
    showToast(message, "success");
  },
  error(message: string) {
    showToast(message, "error");
  },
  info(message: string) {
    showToast(message, "info");
  },
};

function showToast(message: string, type: "success" | "error" | "info") {
  const div = document.createElement("div");

  const colors = {
    success: "bg-emerald-600 text-white",
    error: "bg-rose-600 text-white",
    info: "bg-blue-600 text-white",
  }[type];

  div.className = `
    fixed top-4 right-4 z-[9999]
    px-4 py-2 rounded-lg shadow-lg 
    text-sm font-medium
    animate-fade-in
    ${colors}
  `;

  div.textContent = message;
  document.body.appendChild(div);

  setTimeout(() => {
    div.classList.add("opacity-0", "transition");
    setTimeout(() => div.remove(), 300);
  }, 2500);
}
