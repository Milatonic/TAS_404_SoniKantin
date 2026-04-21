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

  const sparkleEmojis = ['✨', '💫', '⭐', '🌟', '💥'];

  function parsePrice(priceText) {
    if (!priceText) return 0;
    // Format: "10.000,00" → remove dots (thousands separator) and keep only integer part
    const cleaned = priceText.replace(/\./g, '').split(',')[0];
    const numValue = parseInt(cleaned, 10);
    return isNaN(numValue) ? 0 : numValue;
  }

  function formatRupiah(value) {
    return new Intl.NumberFormat('id-ID').format(value);
  }

  function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    const emoji = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
    sparkle.textContent = emoji;

    const edge = Math.random() > 0.5 ? 'right' : 'left';
    const x = edge === 'right' ? window.innerWidth - 50 : 50;
    const y = Math.random() * window.innerHeight;

    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';

    const tx = (Math.random() - 0.5) * 200;
    const ty = (Math.random() - 0.5) * 200;

    sparkle.style.setProperty('--tx', tx + 'px');
    sparkle.style.setProperty('--ty', ty + 'px');

    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 800);
  }

  function triggerSparkles() {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => createSparkle(), i * 80);
    }
  }

  function showToastNotification(productName) {
    // Remove existing toast to prevent stacking
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
      existingToast.classList.add('hide');
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <span class="toast-icon">✅</span>
      <span>${productName} ditambahkan ke keranjang!</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 500);
    }, 2500);
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
      const subtotal = item.price * item.qty;
      card.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-meta">Rp ${formatRupiah(item.price)} × ${item.qty} = Rp ${formatRupiah(subtotal)}</div>
          <div class="cart-item-category">${item.category}</div>
        </div>
        <div class="cart-item-qty">
          <button type="button" class="cart-item-remove" data-action="remove" data-name="${item.name}">Hapus</button>
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
    triggerSparkles();
    showToastNotification(product.name);
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
    const shouldOpen = typeof open === 'boolean' ? open : !cartDrawer.classList.contains('hidden');
    if (shouldOpen) {
      cartDrawer.classList.remove('hidden');
      cartBackdrop.classList.remove('hidden');
    } else {
      cartDrawer.classList.add('hidden');
      cartBackdrop.classList.add('hidden');
    }
  }

  function createCheckoutSparkles() {
    const sparkleEmojis = ['✨', '💖', '⭐', '🌟'];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'checkout-sparkle';
        const emoji = sparkleEmojis[i % sparkleEmojis.length];
        sparkle.textContent = emoji;
        
        const angle = (i / 8) * Math.PI * 2;
        const distance = 150 + Math.random() * 40;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        sparkle.style.setProperty('--tx', x + 'px');
        sparkle.style.setProperty('--ty', y + 'px');
        sparkle.style.left = centerX + 'px';
        sparkle.style.top = centerY + 'px';
        
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1800);
      }, i * 50);
    }
  }

  function createCheckoutOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'checkout-overlay';
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('fade-out');
    }, 1600);
    
    setTimeout(() => {
      overlay.remove();
    }, 2100);
  }

  function createScatteredEmojis() {
    const foodEmojis = ['🍕', '🍔', '🍟', '�', '🍱'];
    const drinkEmojis = ['☕', '🥤', '🧋', '🥛'];
    const allEmojis = [...foodEmojis, ...drinkEmojis];
    
    for (let i = 0; i < 12; i++) {
      setTimeout(() => {
        const emoji = document.createElement('div');
        emoji.className = 'checkout-scattered-emoji';
        emoji.textContent = allEmojis[Math.floor(Math.random() * allEmojis.length)];
        
        const angle = (i / 12) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const distance = 120 + Math.random() * 100;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance - 50;
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        emoji.style.left = (centerX + x) + 'px';
        emoji.style.top = (centerY + y) + 'px';
        emoji.style.setProperty('--delay', Math.random() * 0.1 + 's');
        
        document.body.appendChild(emoji);
        setTimeout(() => emoji.remove(), 1800);
      }, i * 25);
    }
  }

  function createCheckoutText() {
    const textContainer = document.createElement('div');
    textContainer.className = 'checkout-text-container';
    textContainer.setAttribute('role', 'status');
    textContainer.setAttribute('aria-live', 'polite');
    
    // Create thank you text
    const messageDiv = document.createElement('div');
    messageDiv.className = 'checkout-message';
    
    const text = 'Terima Kasih!';
    let charIndex = 0;
    
    text.split('').forEach((char) => {
      const letter = document.createElement('span');
      letter.className = 'checkout-letter';
      letter.textContent = char;
      letter.style.setProperty('--char-index', charIndex);
      messageDiv.appendChild(letter);
      charIndex++;
    });
    
    textContainer.appendChild(messageDiv);
    document.body.appendChild(textContainer);
    
    // Trigger fade out after animation completes
    setTimeout(() => {
      textContainer.classList.add('fade-out');
    }, 1700);
    
    setTimeout(() => {
      textContainer.remove();
    }, 2200);
  }

  function createCheckoutModal() {
    const modal = document.createElement('div');
    modal.className = 'checkout-modal';
    
    const content = document.createElement('div');
    content.className = 'checkout-modal-content';
    
    // Header dengan success badge
    const header = document.createElement('div');
    header.className = 'checkout-modal-header';
    header.innerHTML = `
      <div class="checkout-success-icon">✅</div>
      <h2>Pesanan Dikonfirmasi!</h2>
    `;
    
    // Order summary
    const summary = document.createElement('div');
    summary.className = 'checkout-modal-summary';
    
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    summary.innerHTML = `
      <div class="summary-item">
        <span>Jumlah Item:</span>
        <strong>${totalItems} item</strong>
      </div>
      <div class="summary-item">
        <span>Total Harga:</span>
        <strong>Rp ${formatRupiah(totalPrice)}</strong>
      </div>
      ${cartNote ? `<div class="summary-item"><span>Catatan:</span><strong>${cartNote}</strong></div>` : ''}
    `;
    
    // Messages
    const messages = document.createElement('div');
    messages.className = 'checkout-modal-messages';
    const messageTexts = [
      '🎉 Pesanan kamu sudah diterima!',
      '⏱️ Pesanan sedang dipersiapkan...',
      '🚀 Segera siap untuk diambil!'
    ];
    
    messageTexts.forEach((msg, idx) => {
      const msgEl = document.createElement('div');
      msgEl.className = 'checkout-modal-message';
      msgEl.textContent = msg;
      msgEl.style.animationDelay = (0.3 + idx * 0.3) + 's';
      messages.appendChild(msgEl);
    });
    
    content.appendChild(header);
    content.appendChild(summary);
    content.appendChild(messages);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Trigger animation in
    setTimeout(() => modal.classList.add('show'), 50);
    
    // Fade out
    setTimeout(() => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 400);
    }, 2500);
  }

  function animateCheckout() {
    // Coordinated smooth animation sequence with better timing
    createCheckoutSparkles();
    setTimeout(() => createCheckoutOverlay(), 100);
    setTimeout(() => {
      createCheckoutText();
      createScatteredEmojis();
      createCheckoutModal();
    }, 400);
    
    // Trigger confetti if available
    setTimeout(() => {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B6B', '#FFB347', '#FF8E72', '#FFA07A', '#FF9472']
        });
      }
    }, 500);
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
    cartDrawer.classList.add('checkout-done');
    // Close cart drawer and reset after animation
    setTimeout(() => {
      cart.length = 0;
      cartNote = '';
      if (cartNoteInput) cartNoteInput.value = '';
      updateCartCount();
      renderCart();
      cartDrawer.classList.remove('checkout-done');
      toggleCart(false);
    }, 1200);
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