import { apiFetch, isLoggedIn, getUser } from "./api.js";
import { formatPrice, getCart, saveCart, escapeHtml } from "./main.js";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("checkoutForm");
  const summary = document.getElementById("checkoutSummary");

  if (!isLoggedIn()) {
    window.location.href = "login.html?redirect=checkout.html";
    return;
  }

  const cart = getCart();
  if (!cart.length) {
    window.location.href = "cart.html";
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const shipping = subtotal > 999 ? 0 : 80;
  const total = subtotal + shipping;

  summary.innerHTML = `
    <h2>Order Summary</h2>
    ${cart.map((item) => `
      <div class="summary-row">
        <span>${escapeHtml(item.name)} × ${item.quantity}</span>
        <strong>${formatPrice(item.price * item.quantity)}</strong>
      </div>
    `).join("")}
    <div class="summary-row"><span>Shipping</span><strong>${shipping === 0 ? "Free" : formatPrice(shipping)}</strong></div>
    <div class="summary-row total"><span>Total</span><strong>${formatPrice(total)}</strong></div>
  `;

  const user = getUser();
  if (user) {
    document.getElementById("shippingName").value = user.name || "";
    document.getElementById("shippingEmail").value = user.email || "";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = document.getElementById("checkoutMessage");
    message.className = "message hidden";
    message.textContent = "";

    const payload = {
      items: cart.map((item) => ({
        product_id: item.id,
        quantity: Number(item.quantity)
      })),
      shipping_name: document.getElementById("shippingName").value.trim(),
      shipping_email: document.getElementById("shippingEmail").value.trim(),
      shipping_address: document.getElementById("shippingAddress").value.trim(),
      shipping_city: document.getElementById("shippingCity").value.trim(),
      shipping_state: document.getElementById("shippingState").value.trim(),
      shipping_postal_code: document.getElementById("shippingPostalCode").value.trim()
    };

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Processing...";

    try {
      const result = await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      saveCart([]);
      const orderId = result.order?.id || result.orderId || result.id || "";
      message.className = "message success";
      message.textContent = `Order placed successfully${orderId ? ` — Order #${orderId}` : ""}. Redirecting...`;

      setTimeout(() => {
        window.location.href = "orders.html";
      }, 900);
    } catch (error) {
      message.className = "message error";
      message.textContent = error.message;
      submitButton.disabled = false;
      submitButton.textContent = "Place Order";
    }
  });
});
