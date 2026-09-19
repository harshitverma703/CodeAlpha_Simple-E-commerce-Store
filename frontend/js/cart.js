import { apiFetch } from "./api.js";
import { escapeHtml, formatPrice, getCart, saveCart } from "./main.js";

document.addEventListener("DOMContentLoaded", renderCart);

export function renderCart() {
  const container = document.getElementById("cartContainer");
  if (!container) return;

  const cart = getCart();

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Your cart is empty</h3>
        <p>Add some products to get started.</p>
        <a href="products.html" class="btn btn-primary">Browse Products</a>
      </div>
    `;
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const shipping = subtotal > 999 ? 0 : 80;
  const total = subtotal + shipping;

  container.innerHTML = `
    <div class="cart-items">
      ${cart.map((item) => {
        const image = item.image
          ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">`
          : `<span>No image</span>`;

        return `
          <article class="cart-item">
            <div class="cart-item-image">${image}</div>
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              <p>${formatPrice(item.price)} each</p>
              <div class="cart-controls">
                <button class="btn btn-secondary quantity-minus" data-id="${item.id}">−</button>
                <strong>${item.quantity}</strong>
                <button class="btn btn-secondary quantity-plus" data-id="${item.id}">+</button>
              </div>
            </div>
            <div class="cart-item-actions">
              <strong>${formatPrice(item.price * item.quantity)}</strong>
              <div style="margin-top:10px">
                <button class="btn btn-danger remove-item" data-id="${item.id}">Remove</button>
              </div>
            </div>
          </article>
        `;
      }).join("")}

      <div class="cart-total">
        <span>Subtotal</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
    </div>

    <aside class="summary-card">
      <h2>Summary</h2>
      <div class="summary-row"><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div>
      <div class="summary-row"><span>Shipping</span><strong>${shipping === 0 ? "Free" : formatPrice(shipping)}</strong></div>
      <div class="summary-row total"><span>Total</span><strong>${formatPrice(total)}</strong></div>
      <a href="checkout.html" class="btn btn-primary btn-block" style="margin-top:18px">Proceed to Checkout</a>
      <a href="products.html" class="btn btn-secondary btn-block" style="margin-top:10px">Continue Shopping</a>
    </aside>
  `;

  container.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", () => {
      const updated = getCart().filter((item) => String(item.id) !== String(button.dataset.id));
      saveCart(updated);
      renderCart();
    });
  });

  container.querySelectorAll(".quantity-minus").forEach((button) => {
    button.addEventListener("click", () => {
      updateQuantity(button.dataset.id, -1);
    });
  });

  container.querySelectorAll(".quantity-plus").forEach((button) => {
    button.addEventListener("click", () => {
      updateQuantity(button.dataset.id, 1);
    });
  });
}

async function updateQuantity(id, delta) {
  const cart = getCart();
  const item = cart.find((entry) => String(entry.id) === String(id));
  if (!item) return;

  item.quantity = Math.max(1, Number(item.quantity) + delta);
  saveCart(cart);
  renderCart();
}
