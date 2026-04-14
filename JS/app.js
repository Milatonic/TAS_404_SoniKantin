const produkList = document.getElementById("produk-list");
const mitraCard = document.getElementById("mitra-card");
const produkCount = document.getElementById("produk-count");
const filterButtons = document.querySelectorAll(".filter-button");
const navButtons = document.querySelectorAll(".nav-button");
const tabPanels = document.querySelectorAll(".tab-panel");
const splashScreen = document.getElementById("splash-screen");
const welcomeMessage = document.getElementById("welcome-message");
let allProduk = [];

if (splashScreen) {
  const emojiArray = ['🍕', '🍔', '🍟', '🍰', '☕', '🥤', '🍦', '🍪'];
  let emojiIndex = 0;
  const storeIcons = splashScreen.querySelectorAll('.store-emoji');
  if (storeIcons.length) {
    setInterval(() => {
      emojiIndex = (emojiIndex + 1) % emojiArray.length;
      storeIcons.forEach(icon => {
        icon.textContent = emojiArray[emojiIndex];
      });
    }, 400);
  }

  setTimeout(() => {
    splashScreen.classList.add("splash-hidden");
    showWelcomeMessage();
  }, 4000);

  const logoBubble = splashScreen.querySelector('.logo-bubble');
  if (logoBubble) {
    logoBubble.addEventListener('click', () => {
      triggerConfetti();
      splashScreen.classList.add("splash-hidden");
      showWelcomeMessage();
    });
  }
}

function showWelcomeMessage() {
  const welcomeLetters = document.getElementById('welcome-letters');
  const welcomeEmojis = document.getElementById('welcome-emojis');
  const text = 'Selamat datang di Warung Bu Soni';
  const emojiArray = ['🍕', '🍔', '🍟', '☕', '🥤', '🍦'];

  if (!welcomeLetters || !welcomeEmojis) {
    welcomeMessage.classList.add('show');
    setTimeout(() => welcomeMessage.classList.remove('show'), 2000);
    return;
  }

  welcomeLetters.innerHTML = '';
  welcomeEmojis.innerHTML = '';
  welcomeMessage.classList.add('show');

  text.split('').forEach((char, index) => {
    const letterEl = document.createElement('span');
    letterEl.textContent = char;
    letterEl.className = 'welcome-letter';
    letterEl.style.animationDelay = `${index * 0.09}s`;
    welcomeLetters.appendChild(letterEl);
  });

  emojiArray.forEach((emoji, index) => {
    const emojiEl = document.createElement('span');
    emojiEl.textContent = emoji;
    emojiEl.className = 'welcome-emoji-block';
    emojiEl.style.animationDelay = `${0.4 + index * 0.12}s`;
    welcomeEmojis.appendChild(emojiEl);
  });

  setTimeout(() => {
    welcomeMessage.classList.remove('show');
  }, 2800);
}

function setActiveTab(targetId) {
  tabPanels.forEach(panel => {
    panel.classList.toggle("active", panel.id === targetId);
    panel.classList.toggle("hidden", panel.id !== targetId);
  });
  navButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.target === targetId);
  });
}

function formatPrice(price) {
  return price ? price.trim() : "-";
}

function setTheme(category) {
  document.body.classList.remove("theme-all", "theme-makanan", "theme-minuman");
  if (category === "Makanan") {
    document.body.classList.add("theme-makanan");
  } else if (category === "Minuman") {
    document.body.classList.add("theme-minuman");
  } else {
    document.body.classList.add("theme-all");
  }
}

function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

function renderProduk(produkItems) {
  produkList.innerHTML = produkItems.length
    ? produkItems.map(item => {
        const categoryClass = item.produk_category.toLowerCase() === "minuman"
          ? "category-minuman"
          : item.produk_category.toLowerCase() === "makanan"
          ? "category-makanan"
          : "";

        return `
        <article class="card product-card ${categoryClass}">
          <img src="${(item.produk_image)}" alt="${item.produk_name.trim()}" loading="lazy">
          <div class="card-content">
            <h3>${item.produk_name.trim()}</h3>
            <p class="product-meta">Kategori: ${item.produk_category}</p>
            <p class="product-price">Harga: ${formatPrice(item.produk_price)}</p>
            <p class="product-stock">Stok: ${item.produk_stock}</p>
          </div>
        </article>
      `;
      }).join("")
    : `<div class="empty-state">Produk tidak ditemukan.</div>`;

  produkCount.textContent = `${produkItems.length} item`;
}

function renderMitra(mitra) {
  if (!mitra) {
    mitraCard.innerHTML = `<p class="empty-state">Data mitra tidak tersedia.</p>`;
    return;
  }

  mitraCard.innerHTML = `
    <div class="mitra-content">
      <h3>${mitra.mitra_name}</h3>
      <p><strong>Pemilik:</strong> ${mitra.owner_name}</p>
      <p><strong>Email:</strong> ${mitra.email_owner}</p>
      <p><strong>Alamat:</strong> ${mitra.address_owner}</p>
      <p><strong>Kategori:</strong> ${mitra.category}</p>
      <p><strong>Sekolah:</strong> ${mitra.school}</p>
    </div>
  `;
}

function applyFilter(category) {
  const filtered = category === "all"
    ? allProduk
    : allProduk.filter(item => item.produk_category === category);
  renderProduk(filtered);
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    triggerConfetti();
    filterButtons.forEach(btn => btn.classList.toggle("active", btn === button));
    setTheme(button.dataset.filter);
    applyFilter(button.dataset.filter);
  });
});

setTheme("all");

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    triggerConfetti();
    setActiveTab(button.dataset.target);
  });
});

fetch("data/tabel_produk_rows.json")
  .then(response => {
    if (!response.ok) throw new Error("Gagal memuat data produk.");
    return response.json();
  })
  .then(data => {
    allProduk = Array.isArray(data) ? data : [];
    renderProduk(allProduk);
  })
  .catch(error => {
    produkList.innerHTML = `<div class="empty-state">${error.message}</div>`;
    produkCount.textContent = "0 item";
    console.error(error);
  });

fetch("data/tabel_mitra_rows.json")
  .then(response => {
    if (!response.ok) throw new Error("Gagal memuat data mitra.");
    return response.json();
  })
  .then(data => {
    renderMitra(Array.isArray(data) ? data[0] : null);
  })
  .catch(error => {
    mitraCard.innerHTML = `<div class="empty-state">${error.message}</div>`;
    console.error(error);
  });
