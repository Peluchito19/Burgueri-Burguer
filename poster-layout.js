const cartPanel = document.querySelector("#pedido");
const cartToggle = document.querySelector("#cart-toggle");
const cartClose = document.querySelector("#cart-close");
const hotspotLayer = document.querySelector("#menu-hotspots");

if (cartPanel && cartToggle) {
  function setCartExpanded(expanded) {
    cartPanel.classList.toggle("is-collapsed", !expanded);
    cartToggle.setAttribute("aria-expanded", String(expanded));
  }

  function toggleCart() {
    const shouldExpand = cartPanel.classList.contains("is-collapsed");
    setCartExpanded(shouldExpand);
  }

  cartToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleCart();
  });

  cartClose?.addEventListener("click", () => {
    setCartExpanded(false);
  });

  cartPanel.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", (event) => {
    if (cartPanel.classList.contains("is-collapsed")) {
      return;
    }

    if (cartPanel.contains(event.target) || cartToggle.contains(event.target)) {
      return;
    }

    setCartExpanded(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setCartExpanded(false);
    }
  });

  hotspotLayer?.addEventListener("click", (event) => {
    if (event.target.closest("[data-add-item]")) {
      setCartExpanded(true);
    }
  });

  setCartExpanded(false);
}