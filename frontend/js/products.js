import { apiFetch } from "./api.js";
import { escapeHtml, formatPrice, getCart, saveCart } from "./main.js";

let allProducts = [];

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("productsGrid");
  if (grid) {
    await loadProductsPage();
  }
});

export async function loadProducts({ containerId, limit = 8 } = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const data = await apiFetch("/products");
    const products = normalizeProducts(data).slice(0, limit);
    renderProductCards(container, products);
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>Unable to load products</h3><p>${escapeHtml(error.message)}</p></div>`;
  }
}

async function loadProductsPage() {
  const grid = document.getElementById("productsGrid");

  try {
    const data = await apiFetch("/products");
    allProducts = normalizeProducts(data);

    setupCategoryFilter(allProducts);
    renderProductCards(grid, allProducts);

    const search = document.getElementById("searchInput");
    const category = document.getElementById("categorySelect");

    search?.addEventListener("input", filterProducts);
    category?.addEventListener("change", filterProducts);
  } catch (error) {
    grid.innerHTML = `<div class="empty-state"><h3>Unable to load products</h3><p>${escapeHtml(error.message)}</p></div>`;
  }
}

function normalizeProducts(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.products)) return data.products;
  return [];
}

function setupCategoryFilter(products) {
  const select = document.getElementById("categorySelect");
  if (!select) return;

  const categories = [...new Set(
    products.map((product) => product.category).filter(Boolean)
  )].sort();

  select.innerHTML = `<option value="">All categories</option>`;
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
  });
}

function filterProducts() {
  const query = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const category = document.getElementById("categorySelect")?.value || "";

  const filtered = allProducts.filter((product) => {
    const matchesQuery =
      !query ||
      String(product.name || "").toLowerCase().includes(query) ||
      String(product.description || "").toLowerCase().includes(query);

    const matchesCategory =
      !category || product.category === category;

    return matchesQuery && matchesCategory;
  });

  renderProductCards(document.getElementById("productsGrid"), filtered);
}

function renderProductCards(container, products) {
  if (!container) return;

  const emptyState = document.getElementById("emptyState");
  if (!products.length) {
    container.innerHTML = "";
    emptyState?.classList.remove("hidden");
    return;
  }

  emptyState?.classList.add("hidden");

  container.innerHTML = products.map((product) => {
    const imageHtml = product.image
      ? `<img src="images/${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">`
      : `<span>No image</span>`;

    return `
      <article class="product-card">
        <a href="product.html?id=${encodeURIComponent(product.id)}" class="product-image" aria-label="View ${escapeHtml(product.name)}">
          ${imageHtml}
        </a>
        <div class="product-card-body">
          <span class="product-category">${escapeHtml(product.category || "General")}</span>
          <h3 class="product-name">${escapeHtml(product.name)}</h3>
          <p class="product-description">${escapeHtml(product.description || "Product description available soon.")}</p>
          <div class="product-card-footer">
            <span class="price">${formatPrice(product.price)}</span>
            <button class="btn btn-primary add-cart" data-id="${product.id}">Add to Cart</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  container.querySelectorAll(".add-cart").forEach((button) => {
    button.addEventListener("click", () => {
      const product = products.find((item) => String(item.id) === String(button.dataset.id));
      if (!product) return;

      const cart = getCart();
      const existing = cart.find((item) => String(item.id) === String(product.id));

      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.image || "",
          quantity: 1
        });
      }

      saveCart(cart);
      const original = button.textContent;
      button.textContent = "Added ✓";
      setTimeout(() => {
        button.textContent = original;
      }, 900);
    });
  });
}
