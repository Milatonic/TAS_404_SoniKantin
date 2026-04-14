document.addEventListener('DOMContentLoaded', () => {
  const cartToggle = document.getElementById('cart-toggle');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartClose = document.getElementById('cart-close');
  const cartItemsElement = document.getElementById('cart-items');
  const cartCountElement = document.getElementById('cart-count');
  const checkoutButton = document.getElementById('checkout-button');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartNoteInput = document.getElementById('cart-note');
  const produkList = document.getElementById('produk-list');
  const cart = [];
  let cartNote = '';

  function parsePrice(priceText) {
    if (!priceText) return 0;
    const cleaned = priceText.replace(/[^0-9]/g, '');
    return cleaned ? parseInt(cleaned, 10) : 0;
  }

  function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID').format(value);
  }

  function updateCartCount() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountElement.textContent = totalQty;
    cartToggle.classList.toggle('has-items', totalQty > 0);
  }

  function renderCart() {
    if (!cartItemsElement) return;

    cartItemsElement.innerHTML = '';
    if (!cart.length) {
      cartItemsElement.innerHTML = '<div class="cart-empty">Keranjangmu masih kosong.</div>';
      document.getElementById('cart-total').textContent = 'Total: Rp 0';
      return;
    }

    cart.forEach(item => {
      const card = document.createElement('div');
      card.className = 'cart-item';
      card.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">Harga: Rp ${formatRupiah(item.price)} • ${item.category}</div>
        </div>
        <div class="cart-item-qty">
          <button type="button" class="cart-item-remove" data-action="remove" data-name="${item.name}">Hapus</button>
          <span>x${item.qty}</span>
        </div>
      `;
      cartItemsElement.appendChild(card);
    });

    const totalValue = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    document.getElementById('cart-total').textContent = `Total: Rp ${formatRupiah(totalValue)}`;
    if (cartNoteInput) {
      cartNoteInput.value = cartNote;
    }
  }

  function addCartItem(product) {
    const itemIndex = cart.findIndex(i => i.name === product.name);
    if (itemIndex >= 0) {
      cart[itemIndex].qty += 1;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    updateCartCount();
    renderCart();
  }

  function decrementStock(card) {
    const stockEl = card.querySelector('.product-stock');
    if (!stockEl) return false;
    const currentStock = parseInt(stockEl.textContent.replace(/[^0-9]/g, ''), 10);
    if (isNaN(currentStock) || currentStock <= 0) {
      return false;
    }
    const nextStock = currentStock - 1;
    stockEl.textContent = nextStock > 0 ? `Stok: ${nextStock}` : 'Stok: Habis';
    if (nextStock <= 0) {
      const button = card.querySelector('.add-cart-button');
      if (button) {
        button.disabled = true;
        button.textContent = '❌ Habis';
        button.classList.add('disabled');
      }
    }
    return true;
  }

  function removeCartItem(productName) {
    const itemIndex = cart.findIndex(i => i.name === productName);
    if (itemIndex >= 0) {
      cart.splice(itemIndex, 1);
      updateCartCount();
      renderCart();
    }
  }

  function toggleCart(open) {
    const shouldOpen = typeof open === 'boolean' ? open : cartDrawer.classList.contains('hidden');
    cartDrawer.classList.toggle('hidden', !shouldOpen);
    cartBackdrop.classList.toggle('hidden', !shouldOpen);
  }

  function animateCheckout() {
    cartToggle.classList.add('checkout-active');
    setTimeout(() => cartToggle.classList.remove('checkout-active'), 800);
  }

  function addButtonsToCards() {
    if (!produkList) return;
    const cards = produkList.querySelectorAll('.product-card');
    cards.forEach(card => {
      if (card.querySelector('.add-cart-button')) return;
      const name = card.querySelector('h3')?.textContent?.trim() || 'Produk';
      const priceText = card.querySelector('.product-price')?.textContent?.replace('Harga:', '').trim() || '0';
      const category = card.querySelector('.product-meta')?.textContent?.replace('Kategori:', '').trim() || '';
      const priceValue = parsePrice(priceText);
      card.dataset.productName = name;
      card.dataset.productPrice = priceValue;
      card.dataset.productCategory = category;

      const stockText = card.querySelector('.product-stock')?.textContent || 'Stok: 0';
      const currentStock = parseInt(stockText.replace(/[^0-9]/g, ''), 10);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'add-cart-button';
      button.textContent = currentStock > 0 ? '🛒 Tambah' : '❌ Habis';
      if (currentStock <= 0) {
        button.disabled = true;
        button.classList.add('disabled');
      }
      card.dataset.productStock = currentStock;
      card.querySelector('.card-content')?.appendChild(button);
    });
  }

  if (produkList) {
    const observer = new MutationObserver(() => addButtonsToCards());
    observer.observe(produkList, { childList: true, subtree: true });
    addButtonsToCards();
  }

  if (produkList) {
    produkList.addEventListener('click', event => {
      const button = event.target.closest('.add-cart-button');
      if (!button) return;
      const card = button.closest('.product-card');
      if (!card) return;
      if (button.disabled) return;
      const stockUpdated = decrementStock(card);
      if (!stockUpdated) {
        button.disabled = true;
        button.textContent = '❌ Habis';
        button.classList.add('disabled');
        return;
      }
      const product = {
        name: card.dataset.productName || 'Produk',
        price: parseInt(card.dataset.productPrice || '0', 10),
        category: card.dataset.productCategory || 'Lainnya'
      };
      addCartItem(product);
      if (typeof triggerConfetti === 'function') {
        triggerConfetti();
      }
    });
  }

  cartToggle?.addEventListener('click', () => {
    toggleCart(true);
  });

  cartClose?.addEventListener('click', () => toggleCart(false));
  cartBackdrop?.addEventListener('click', () => toggleCart(false));

  if (cartNoteInput) {
    cartNoteInput.addEventListener('input', event => {
      cartNote = event.target.value;
    });
  }

  cartItemsElement?.addEventListener('click', event => {
    const removeButton = event.target.closest('.cart-item-remove');
    if (!removeButton) return;
    removeCartItem(removeButton.dataset.name);
  });

  checkoutButton?.addEventListener('click', () => {
    if (!cart.length) return;
    animateCheckout();
    if (typeof triggerConfetti === 'function') {
      triggerConfetti();
    }
    cartDrawer.classList.add('checkout-done');
    setTimeout(() => {
      cart.length = 0;
      cartNote = '';
      if (cartNoteInput) cartNoteInput.value = '';
      updateCartCount();
      renderCart();
      cartDrawer.classList.remove('checkout-done');
    }, 850);
  });

  updateCartCount();
  renderCart();

  // Listen for custom event from product modal
  document.addEventListener('addProductToCart', (e) => {
    const productData = e.detail;
    const product = {
      name: productData.name,
      price: productData.price,
      category: productData.category
    };
    addCartItem(product);
    if (typeof triggerConfetti === 'function') {
      triggerConfetti();
    }
  });
});