const WHATSAPP_PHONE = "56954519788";
const STORAGE_KEY = "buruberi-burger-cart";

const menuItems = [
  {
    id: "xl",
    name: "XL",
    price: 6990,
    description: "Lechuga, tomate, cebolla caramelo, papas fritas, tocino, queso cheddar, salsa BBQ y huevo frito.",
    position: { x: "86%", y: "31%" }
  },
  {
    id: "bbq-burger",
    name: "BBQ Burger",
    price: 6490,
    description: "Lechuga, tomate, cebolla morada, pepinillo, tocino, salsa BBQ y queso cheddar con doble smash.",
    position: { x: "86.5%", y: "45.2%" }
  },
  {
    id: "cheese-burger",
    name: "Cheese Burger",
    price: 6290,
    description: "Lechuga, tomate, queso gouda, pepinillo y hamburguesa doble smash.",
    position: { x: "88.2%", y: "60%" }
  },
  {
    id: "papas-clasicas",
    name: "Papas Fritas Clasicas",
    price: 2000,
    description: "La porcion de papas fritas del menu para acompanar cualquier burger.",
    position: { x: "48%", y: "74.5%" }
  },
  {
    id: "papas-supremas",
    name: "Papas Fritas Supremas",
    price: 3000,
    description: "Version reforzada de papas fritas para compartir o acompanar una bandeja.",
    position: { x: "88%", y: "74.5%" }
  },
  {
    id: "bandeja-xtream",
    name: "Bandeja Xtream",
    price: 16990,
    description: "Incluye 2 BBQ Burger y papa suprema en una sola compra.",
    position: { x: "48.3%", y: "84.1%" }
  }
];

const elements = {
  menuHotspots: document.querySelector("#menu-hotspots"),
  cartItems: document.querySelector("#cart-items"),
  cartStatus: document.querySelector("#cart-status"),
  cartCount: document.querySelector("#cart-count"),
  cartTotal: document.querySelector("#cart-total"),
  whatsappLink: document.querySelector("#whatsapp-link"),
  clearCart: document.querySelector("#clear-cart"),
  floatingCount: document.querySelector("#floating-count")
};

const state = {
  cart: loadCart()
};

renderHotspots();
renderCart();

elements.menuHotspots.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-item]");

  if (!addButton) {
    return;
  }

  const { itemId } = addButton.dataset;

  changeQuantity(itemId, 1);
  pulseHotspot(itemId);
});

elements.cartItems.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-qty-action]");

  if (!quantityButton) {
    return;
  }

  const { itemId, qtyAction } = quantityButton.dataset;
  const delta = qtyAction === "increase" ? 1 : -1;

  changeQuantity(itemId, delta);
});

elements.clearCart.addEventListener("click", () => {
  state.cart = {};
  persistCart();
  renderCart();
});

elements.whatsappLink.addEventListener("click", (event) => {
  if (!getCartEntries().length) {
    event.preventDefault();
  }
});

function renderHotspots() {
  elements.menuHotspots.innerHTML = menuItems.map((item) => {
    const quantity = state.cart[item.id] || 0;

    return `
      <button
        class="hotspot${quantity ? " is-active" : ""}"
        type="button"
        data-add-item
        data-item-id="${item.id}"
        style="--x: ${item.position.x}; --y: ${item.position.y};"
        aria-label="Agregar ${item.name} al carrito"
      >
        <span class="hotspot__tooltip">${item.name} · ${formatCurrency(item.price)}</span>
        <span class="hotspot__button" aria-hidden="true">+</span>
        ${quantity ? `<span class="hotspot__count" aria-hidden="true">${quantity}</span>` : ""}
      </button>
    `;
  }).join("");
}

function renderCart() {
  const entries = getCartEntries();
  const totalItems = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalPrice = entries.reduce((sum, entry) => sum + (entry.price * entry.quantity), 0);

  elements.cartCount.textContent = String(totalItems);
  elements.cartTotal.textContent = formatCurrency(totalPrice);
  elements.floatingCount.textContent = String(totalItems);
  renderHotspots();

  if (!entries.length) {
    elements.cartStatus.textContent = "Aun no agregas productos.";
    elements.cartItems.innerHTML = "<div class=\"cart-empty\">Usa el icono + de cada producto para empezar el pedido.</div>";
  } else {
    elements.cartStatus.textContent = `${totalItems} item${totalItems === 1 ? "" : "s"} listos para enviar.`;
    elements.cartItems.innerHTML = entries.map((entry) => {
      return `
        <article class="cart-item">
          <div class="cart-item__head">
            <div>
              <p class="cart-item__name">${entry.name}</p>
              <span class="cart-item__meta">${formatCurrency(entry.price)} por unidad</span>
            </div>

            <div class="cart-item__controls" aria-label="Controles de cantidad para ${entry.name}">
              <button class="qty-button" type="button" data-qty-action="decrease" data-item-id="${entry.id}" aria-label="Quitar una unidad de ${entry.name}">-</button>
              <strong>${entry.quantity}</strong>
              <button class="qty-button" type="button" data-qty-action="increase" data-item-id="${entry.id}" aria-label="Agregar una unidad de ${entry.name}">+</button>
            </div>
          </div>

          <div class="cart-item__foot">
            <span class="cart-item__subtotal">Subtotal</span>
            <strong>${formatCurrency(entry.price * entry.quantity)}</strong>
          </div>
        </article>
      `;
    }).join("");
  }

  updateWhatsAppLink(entries, totalPrice);
}

function changeQuantity(itemId, delta) {
  const currentQuantity = state.cart[itemId] || 0;
  const nextQuantity = currentQuantity + delta;

  if (nextQuantity <= 0) {
    delete state.cart[itemId];
  } else {
    state.cart[itemId] = nextQuantity;
  }

  persistCart();
  renderCart();
}

function getCartEntries() {
  return Object.entries(state.cart).flatMap(([itemId, quantity]) => {
    const item = menuItems.find((candidate) => candidate.id === itemId);

    if (!item || quantity <= 0) {
      return [];
    }

    return [{
      ...item,
      quantity
    }];
  });
}

function updateWhatsAppLink(entries, totalPrice) {
  if (!entries.length) {
    elements.whatsappLink.href = "#";
    elements.whatsappLink.classList.add("is-disabled");
    elements.whatsappLink.setAttribute("aria-disabled", "true");
    return;
  }

  const orderLines = entries.map((entry) => {
    return `- ${entry.quantity} x ${entry.name}: ${formatCurrency(entry.quantity * entry.price)}`;
  });

  const message = [
    "Hola Buruberi Burger, quiero hacer este pedido:",
    "",
    ...orderLines,
    "",
    `Total: ${formatCurrency(totalPrice)}`,
    "",
    "Nombre:",
    "Tipo de entrega: retiro o despacho",
    "Observaciones:"
  ].join("\n");

  elements.whatsappLink.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  elements.whatsappLink.classList.remove("is-disabled");
  elements.whatsappLink.setAttribute("aria-disabled", "false");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(value);
}

function loadCart() {
  try {
    const storedCart = window.localStorage.getItem(STORAGE_KEY);

    if (!storedCart) {
      return {};
    }

    const parsedCart = JSON.parse(storedCart);

    if (!parsedCart || typeof parsedCart !== "object" || Array.isArray(parsedCart)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsedCart).filter(([, quantity]) => Number.isInteger(quantity) && quantity > 0)
    );
  } catch {
    return {};
  }
}

function persistCart() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
  } catch {
    return;
  }
}

function pulseHotspot(itemId) {
  const button = elements.menuHotspots.querySelector(`[data-item-id="${itemId}"] .hotspot__button`);

  if (!button || !button.animate) {
    return;
  }

  button.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.08)" },
      { transform: "scale(1)" }
    ],
    {
      duration: 220,
      easing: "ease-out"
    }
  );
}