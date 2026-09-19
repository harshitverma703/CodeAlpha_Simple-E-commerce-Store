import {
  apiFetch,
  setToken,
  setUser,
  clearAuth,
  isLoggedIn
} from "./api.js";
import {
  escapeHtml,
  formatPrice
} from "./main.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const ordersContainer = document.getElementById("ordersContainer");

  if (loginForm) setupLogin(loginForm);
  if (registerForm) setupRegister(registerForm);
  if (ordersContainer) loadOrders();

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearAuth();
      window.location.href = "index.html";
    });
  }
});

function showMessage(id, type, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = `message ${type}`;
  el.textContent = text;
}

function setupLogin(form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "Logging in...";

    try {
      const result = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });

      const token = result.token || result.accessToken;
      const user = result.user || { name: result.name, email };

      if (!token) {
        throw new Error("Login succeeded but no authentication token was returned.");
      }

      setToken(token);
      setUser(user);

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "index.html";
      window.location.href = redirect;
    } catch (error) {
      showMessage("loginMessage", "error", error.message);
      button.disabled = false;
      button.textContent = "Login";
    }
  });
}

function setupRegister(form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      showMessage("registerMessage", "error", "Passwords do not match.");
      return;
    }

    const button = form.querySelector("button[type='submit']");
    button.disabled = true;
    button.textContent = "Creating account...";

    try {
      const result = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password })
      });

      const token = result.token || result.accessToken;
      const user = result.user || { name, email };

      if (token) {
        setToken(token);
        setUser(user);
        window.location.href = "index.html";
        return;
      }

      showMessage("registerMessage", "success", "Registration successful. Redirecting to login...");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
    } catch (error) {
      showMessage("registerMessage", "error", error.message);
      button.disabled = false;
      button.textContent = "Register";
    }
  });
}

async function loadOrders() {
  const container = document.getElementById("ordersContainer");

  if (!isLoggedIn()) {
    window.location.href = "login.html?redirect=orders.html";
    return;
  }

  try {
    const result = await apiFetch("/orders/my-orders");
    const orders = Array.isArray(result) ? result : (result.orders || []);

    if (!orders.length) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No orders yet</h3>
          <p>Your placed orders will appear here.</p>
          <a class="btn btn-primary" href="products.html">Start Shopping</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map((order) => `
      <article class="order-card">
        <div class="order-header">
          <div>
            <h3>Order #${escapeHtml(order.id)}</h3>
            <p class="order-meta">${formatDate(order.created_at)} • ${formatPrice(order.total_amount)}</p>
          </div>
          <span class="order-status">${escapeHtml(order.status || "pending")}</span>
        </div>

        <div class="order-items">
          ${(order.items || order.order_items || []).map((item) => `
            <div class="order-item-row">
              <span>${escapeHtml(item.name || `Product #${item.product_id}`)} × ${item.quantity}</span>
              <strong>${formatPrice(Number(item.price) * Number(item.quantity))}</strong>
            </div>
          `).join("")}
        </div>
      </article>
    `).join("");
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Unable to load orders</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}

function formatDate(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
