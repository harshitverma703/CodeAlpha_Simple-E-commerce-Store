import { clearAuth, isLoggedIn } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupAuthUI();
  updateCartCount();

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      window.location.href = "index.html";
    });
  }
});

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

export function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = count;
  });
}

function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

function setupAuthUI() {
  const loggedIn = isLoggedIn();

  document.querySelectorAll(".logged-in-only").forEach((el) => {
    el.classList.toggle("hidden", !loggedIn);
  });

  document.querySelectorAll(".logged-out-only").forEach((el) => {
    el.classList.toggle("hidden", loggedIn);
  });
}

export function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
