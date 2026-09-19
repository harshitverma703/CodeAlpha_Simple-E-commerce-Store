import { apiFetch } from "./api.js";
import { escapeHtml, formatPrice, getCart, saveCart } from "./main.js";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("productDetails");
  if (!container) return;

  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) {
    container.innerHTML = `<div class="empty-state"><h3>Product not found</h3><a class="btn btn-secondary" href="products.html">Back to Products</a></div>`;
    return;
  }

  try {
    const data = await apiFetch(`/products/${encodeURIComponent(id)}`);
    const product = data.product || data;

  const imageHtml = product.image
  ? `<img src="images/products/${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">`
  : `<span>No image available</span>`;
  
    container.innerHTML = `
      <div class="product-details-grid">
        <div class="product-image">${imageHtml}</div>

        <div>
          <span class="eyebrow">${escapeHtml(product.category || "General")}</span>
          <h1>${escapeHtml(product.name)}</h1>
          <div class="price">${formatPrice(product.price)}</div>
          <p class="details-description">${escapeHtml(product.description || "No description available.")}</p>
          <p class="stock">${Number(product.stock) > 0 ? `${product.stock} in stock` : "Out of stock"}</p>

          <div>
            <div class="quantity-control">
              <button type="button" id="minusBtn" aria-label="Decrease quantity">−</button>
              <input id="quantityInput" type="number" min="1" max="${Math.max(Number(product.stock) || 1, 1)}" value="1">
              <button type="button" id="plusBtn" aria-label="Increase quantity">+</button>
            </div>
            <button class="btn btn-primary" id="addToCartBtn" ${Number(product.stock) <= 0 ? "disabled" : ""}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;

    const quantityInput = document.getElementById("quantityInput");
    const maxStock = Math.max(Number(product.stock) || 1, 1);

    document.getElementById("minusBtn").addEventListener("click", () => {
      quantityInput.value = Math.max(1, Number(quantityInput.value) - 1);
    });

    document.getElementById("plusBtn").addEventListener("click", () => {
      quantityInput.value = Math.min(maxStock, Number(quantityInput.value) + 1);
    });

    document.getElementById("addToCartBtn").addEventListener("click", () => {
      const quantity = Math.max(1, Math.min(maxStock, Number(quantityInput.value) || 1));
      const cart = getCart();
      const existing = cart.find((item) => String(item.id) === String(product.id));

      if (existing) {
        existing.quantity = Math.min(maxStock, existing.quantity + quantity);
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image || "",
          quantity
        });
      }

      saveCart(cart);
      window.location.href = "cart.html";
    });
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>Unable to load product</h3><p>${escapeHtml(error.message)}</p></div>`;
  }
});
