/* =========================================================
   PhoneStore - Core
   Dùng chung cho tất cả các trang
   ========================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* Registry: mỗi trang đăng ký hàm render của mình, ví dụ PAGES.home = fn */
const PAGES = {};

const formatPrice = (n) => new Intl.NumberFormat("vi-VN").format(Math.round(n)) + "₫";
/* Rút gọn số lượt đã bán: 820 -> "820", 1450 -> "1.5k", 2000 -> "2k" */
function formatSold(n) {
  if (n < 1000) return String(n);
  return Math.round(n / 100) / 10 + "k";
}

const ESCAPE_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escapeHtml = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ESCAPE_MAP[c]);

const getParam = (key) => new URLSearchParams(location.search).get(key);

const starString = rating => {
  const full = Math.min(5, Math.max(0, Math.round(rating)));
  return "★".repeat(full) + "☆".repeat(5 - full);
};

const discountPercent = p => p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
const productById = id => PRODUCTS.find(p => p.id === Number(id));

/* =========================================================
   ẢNH SẢN PHẨM
   Ảnh thật nằm ở assets/img. onImgFallback() gỡ <img> lỗi để
   không để lại ô trống trên trang.
   ========================================================= */
const phoneArt = p =>
  `<span class="phone-art">
     <img class="phone-photo" src="${p.img}" alt="${p.name}" loading="lazy" decoding="async" data-fallback>
   </span>`;

/* Ảnh nhỏ trong giỏ hàng / thanh toán / lịch sử đơn */
const phoneThumb = p =>
  `<span class="phone-art phone-art-sm">
     <img class="phone-photo" src="${p.img}" alt="${p.name}" loading="lazy" decoding="async" data-fallback>
   </span>`;

/* Sự kiện "error" không bubble nên phải bắt ở pha capture */
function onImgFallback(e) {
  const img = e.target;
  if (!img.dataset || img.dataset.fallback === undefined) return;
  img.closest(".phone-art")?.remove();
  img.remove();
}
/* =========================================================
   STORE: ORDERS - lịch sử đơn hàng
   Ghi xuống localStorage để đơn hàng còn nguyên sau khi tải lại trang
   ========================================================= */
const Orders = {
  LIST: [],
  LIMIT: 20,

  START: 100000,

  /* Đọc đơn hàng đã lưu, bỏ qua dữ liệu hỏng */
  load() {
    const saved = Store.read(KEY_ORDERS, []);
    this.LIST = Array.isArray(saved) ? saved : [];
    return this.LIST;
  },

  save() {
    Store.write(KEY_ORDERS, this.LIST);
    return this;
  },

  read() { return this.LIST; },

  get all() { return this.LIST; },

  nextId() {
    const max = this.read().reduce((m, o) => Math.max(m, Number(o.id.slice(2)) || 0), this.START);
    return "PS" + String(max + 1);
  },

  /* Đơn mới nhất lên đầu, chỉ giữ tối đa LIMIT đơn gần nhất */
  add(order) {
    this.LIST.unshift(order);
    if (this.LIST.length > this.LIMIT) this.LIST.length = this.LIMIT;
    this.save();
    return true;
  },

  clear() {
    this.LIST.length = 0;
    this.save();
    return true;
  }
};

/* =========================================================
   CART STORE - giỏ hàng có lưu bằng localStorage
   Lần đầu mở web sẽ nạp sẵn DEFAULT_CART, từ đó mọi thay đổi đều
   được ghi lại nên tải lại trang hay đóng mở trình duyệt vẫn còn giỏ.
   ========================================================= */
const Cart = {
  LIST: [],

  /* Đọc giỏ đã lưu. Nếu chưa có khoá nghĩa là lần đầu dùng
     trang web thì nạp sẵn giỏ hàng mẫu khai báo trong data.js. */
  load() {
    const saved = Store.read(KEY_CART, null);

    if (!Array.isArray(saved)) {
      this.LIST = DEFAULT_CART.map(line => ({ id: Number(line.id), qty: Number(line.qty) }));
      this.save();
      return this.LIST;
    }

    /* Lọc bỏ dòng hỏng ngay khi nạp để không phải xử lý lại ở mọi nơi */
    this.LIST = saved
      .filter(line => line && productById(line.id))
      .map(line => ({ id: Number(line.id), qty: Math.max(1, Number(line.qty) || 1) }));

    return this.LIST;
  },

  /* Ghi giỏ xuống localStorage, nhận biến trả về để viết gọn */
  save() {
    Store.write(KEY_CART, this.LIST);
    return this;
  },

  /* Gộp dòng trùng id để số lượng không bị cộng dồn sai */
  read() {
    const merged = new Map();
    for (const i of this.LIST) {
      const id = Number(i.id);
      if (!productById(id)) continue;
      merged.set(id, (merged.get(id) || 0) + Math.max(1, Number(i.qty) || 1));
    }
    return [...merged].map(([id, qty]) => ({ id, qty }));
  },

  count() {
    let total = 0;
    for (const i of this.read()) total += i.qty;
    return total;
  },

  qtyOf(id) {
    const line = this.read().find(i => i.id === Number(id));
    return line ? line.qty : 0;
  },

  add(id, qty = 1) {
    const p = productById(id);
    if (!p) return { ok: false, msg: "Không tìm thấy sản phẩm" };
    if (!Number.isFinite(qty) || qty <= 0) return { ok: false, msg: "Số lượng không hợp lệ" };

    const items = this.read();
    const line = items.find(i => i.id === p.id);
    const current = line ? line.qty : 0;
    const want = current + qty;
    if (want > p.stock) {
      return { ok: false, msg: `Chỉ còn ${p.stock} máy trong kho` };
    }
    if (line) line.qty = want;
    else items.push({ id: p.id, qty });
    this.LIST = items;
    this.save();
    return { ok: true, product: p, qty: want };
  },

  setQty(id, qty) {
    const p = productById(id);
    if (!p) return { ok: false, msg: "Không tìm thấy sản phẩm" };
    if (qty <= 0) return this.remove(id);
    if (qty > p.stock) return { ok: false, msg: `Chỉ còn ${p.stock} máy trong kho` };
    const items = this.read();
    const line = items.find(i => i.id === Number(id));
    if (!line) return { ok: false, msg: "Sản phẩm không có trong giỏ" };
    line.qty = qty;
    this.LIST = items;
    this.save();
    return { ok: true, product: p, qty };
  },

  remove(id) {
    this.LIST = this.read().filter(i => i.id !== Number(id));
    this.save();
    return { ok: true, product: productById(id) };
  },

  clear() {
    this.LIST = [];
    this.save();
    return true;
  },

  /* Chi tiết đầy đủ kèm product */
  detailed() {
    return this.read()
      .map(i => {
        const product = productById(i.id);
        return product ? { ...product, qty: i.qty, lineTotal: product.price * i.qty } : null;
      })
      .filter(Boolean);
  },

  totals() {
    /* Chỉ đọc giỏ một lần, dùng chung cho cả các con số lẫn danh sách mặt hàng */
    const items = this.detailed();

    /* Cộng dồn tiền hàng và số tiền tiết kiệm */
    let subtotal = 0, saved = 0;
    for (const i of items) {
      subtotal += i.lineTotal;
      if (i.oldPrice) saved += (i.oldPrice - i.price) * i.qty;
    }

    /* Đơn dưới ngưỡng thì mất phí ship, ngược lại được miễn phí */
    const shipping = (subtotal > 0 && subtotal < SHOP.freeShipThreshold) ? SHOP.shipFee : 0;

    /* Đơn đủ ngưỡng thì giảm thêm SHOP.bigOrderRate */
    const discount = subtotal >= SHOP.bigOrderThreshold ? Math.round(subtotal * SHOP.bigOrderRate) : 0;

    return {
      items, subtotal, shipping, discount, saved,
      total: Math.max(0, subtotal + shipping - discount),
      missing: Math.max(0, SHOP.freeShipThreshold - subtotal)
    };
  },

  placeOrder(details = {}) {
    const t = this.totals();
    const order = {
      id: Orders.nextId(),
      date: new Date().toLocaleString("vi-VN"),
      status: "Đang xử lý",
      customer: {
        name: details.name || "", phone: details.phone || "", email: details.email || "",
        city: details.city || "", district: details.district || "", address: details.address || "",
        note: details.note || "", payment: details.payment || "cod"
      },
      /* Chỉ lưu field cần hiển thị, không lưu cả object sản phẩm */
      items: this.detailed().map(({ id, name, brand, price, qty, img }) =>
        ({ id, name, brand, price, qty, img })),
      totals: { subtotal: t.subtotal, shipping: t.shipping, discount: t.discount, saved: t.saved, total: t.total }
    };

    Orders.add(order);
    this.clear();
    return order;
  }
};

/* =========================================================
   TOAST
   ========================================================= */
function toast(message, type = "info") {
  const wrap = $("#toastWrap");
  if (!wrap) return;

  /* Chọn ký hiệu tương ứng với loại thông báo */
  const symbol = type === "success" ? "✓" : type === "error" ? "!" : "i";

  const el = document.createElement("div");
  el.className = "toast toast-" + type;

  /* Ghép bằng textNode chứ không phải innerHTML: message có thể chứa
     tên người dùng, nếu nối thẳng vào HTML sẽ mở đường cho <img onerror> */
  const icon = document.createElement("span");
  icon.textContent = symbol;
  el.append(icon, document.createTextNode(" " + message));
  wrap.appendChild(el);

  /* Chờ một nhịp ngắn rồi thêm class "show" để CSS chạy hiệu ứng mờ dần */
  setTimeout(() => el.classList.add("show"), 10);

  /* Hiện 2,8 giây rồi ẩn đi */
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 320);
  }, 2800);
}

/* =========================================================
   HEADER / FOOTER dùng chung
   ========================================================= */
const NAV_ITEMS = [
  { href: "index.html", label: "Trang chủ" },
  { href: "products.html", label: "Sản phẩm" },
  { href: "orders.html", label: "Đơn hàng" },
  { href: "index.html#lien-he", label: "Liên hệ" }
];

/* Menu được sáng khi trang hiện tại trùng với menu đó.
   Link có neo (#lien-he) thì phải khớp cả phần hash, còn link thường
   thì chỉ cần khớp tên file. */
function isNavActive(href) {
  const path = location.pathname.split("/").pop();
  const hash = location.hash;
  const [file, anchor] = href.split("#");
  return path === file && (anchor ? hash === "#" + anchor : hash === "");
}

const ICONS = {
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="21" y2="21"></line></svg>',
  cart: '<svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>',
  menu: '<svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',
  close: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  truck: '<svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><path d="M16 8h4l3 3v5h-7z"></path><circle cx="5.5" cy="18.5" r="2"></circle><circle cx="18.5" cy="18.5" r="2"></circle></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>',
  tag: '<svg viewBox="0 0 24 24"><path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"></path><circle cx="7.5" cy="7.5" r="1.5"></circle></svg>',
  refresh: '<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.5 15a9 9 0 1 1-2.1-9.4L23 10"></path></svg>',
  wallet: '<svg viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 0 1 0-4h14v4z"></path><path d="M4 7v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12h2v4h-2a2 2 0 0 1 0-4z"></path></svg>',
  check: '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  trash: '<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path><path d="M10 11v6M14 11v6"></path><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>',
  filter: '<svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>',
  arrowRight: '<svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
  box: '<svg viewBox="0 0 24 24"><path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"></path><rect x="2" y="3" width="20" height="5" rx="1"></rect><path d="M10 12h4"></path></svg>',
  user: '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
  key: '<svg viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="4.5"></circle><path d="M10.8 12.2 20 3"></path><path d="M17 6l2.5 2.5"></path><path d="M14.5 8.5 17 11"></path></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
  eyeOff: '<svg viewBox="0 0 24 24"><path d="M17.9 17.9A10.1 10.1 0 0 1 12 20c-7 0-11-8-11-8a18.4 18.4 0 0 1 5-5.9"></path><path d="M9.9 4.2A9 9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>',
  logout: '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
  chevronDown: '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>'
};

function renderHeader() {
  const host = $("#appHeader");
  if (!host) return;

  host.innerHTML = `
    <div class="topbar">
      <div class="container topbar-inner">
        <span>Miễn phí vận chuyển cho đơn từ ${formatPrice(SHOP.freeShipThreshold)}</span>
        <div class="topbar-right">
          <span>Hotline: <strong>${SHOP.hotline}</strong></span>
          <span class="dot"></span>
          <span>${SHOP.address}</span>
        </div>
      </div>
    </div>
    <header class="header">
      <div class="container header-inner">
        <a href="index.html" class="logo">
          <span class="logo-mark">PS</span>
          <span class="logo-text">Phone<b>Store</b></span>
        </a>

        <nav class="nav" id="mainNav">
          ${NAV_ITEMS.map(n => `<a href="${n.href}" class="nav-link ${isNavActive(n.href) ? "active" : ""}">${n.label}</a>`).join("")}
        </nav>

        <div class="header-actions">
          <form class="head-search" id="headSearch" role="search">
            ${ICONS.search}
            <input type="search" id="headerSearch" placeholder="Tìm điện thoại..." aria-label="Tìm kiếm"
                   autocomplete="off" role="combobox" aria-expanded="false" aria-controls="searchDrop">
            <div class="search-drop" id="searchDrop" role="listbox" hidden></div>
          </form>

          <span id="accountSlot" class="acc-slot"></span>

          <a href="cart.html" class="icon-btn cart-btn" aria-label="Giỏ hàng">
            ${ICONS.cart}<span class="badge" id="cartCount" aria-live="polite">0</span>
          </a>
          <button class="icon-btn menu-btn" id="menuToggle" type="button" aria-label="Menu">${ICONS.menu}</button>
        </div>
      </div>
      <i class="scroll-progress"></i>
    </header>

    <button class="to-top" aria-label="Lên đầu trang">${ICONS.arrowRight}</button>`;

  const search = $("#headerSearch");
  search.value = getParam("q") || "";

  /* Enter hoặc nút tìm thì sang trang danh sách kèm từ khóa */
  function goSearch() {
    const q = search.value.trim();
    location.href = "products.html" + (q ? "?q=" + encodeURIComponent(q) : "");
  }
  $("#headSearch").addEventListener("submit", e => {
    e.preventDefault();
    goSearch();
  });

  initSearchSuggest(search);

  $("#menuToggle").addEventListener("click", () => $("#mainNav").classList.toggle("open"));
  $$("#mainNav .nav-link").forEach(a => a.addEventListener("click", () => $("#mainNav").classList.remove("open")));

  renderAccountControl();
}

/* =========================================================
   NÚT TÀI KHOẢN trên header
   Chưa đăng nhập: nút biểu tượng dẫn thẳng sang trang đăng nhập.
   Đã đăng nhập: hiện tên + menu thả xuống có nút đăng xuất.
   ========================================================= */
function renderAccountControl() {
  const host = $("#accountSlot");
  if (!host) return;

  const user = Accounts.current();

  if (!user) {
    host.innerHTML = `
      <a class="icon-btn" href="${loginUrl("login")}" aria-label="Đăng nhập" title="Đăng nhập">${ICONS.user}</a>`;
    return;
  }

  host.innerHTML = `
    <div class="acc">
      <button class="acc-btn" type="button" id="accToggle" aria-haspopup="menu" aria-expanded="false">
        <span class="acc-avatar">${escapeHtml(initialOf(user.name))}</span>
        <span class="acc-name">${escapeHtml(user.name)}</span>
        ${ICONS.chevronDown}
      </button>

      <div class="acc-drop" id="accDrop" role="menu" hidden>
        <div class="acc-head">
          <strong>${escapeHtml(user.name)}</strong>
          <span>${escapeHtml(user.email)}</span>
        </div>
        <a role="menuitem" href="orders.html">${ICONS.box} Đơn hàng của tôi</a>
        <a role="menuitem" href="cart.html">${ICONS.cart} Giỏ hàng</a>
        <a role="menuitem" href="products.html">${ICONS.tag} Mua sắm tiếp</a>
        <button role="menuitem" type="button" id="logoutBtn" class="danger">${ICONS.logout} Đăng xuất</button>
      </div>
    </div>`;

  const drop = $("#accDrop");
  const toggle = $("#accToggle");

  function close() {
    drop.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", e => {
    e.stopPropagation();
    const open = drop.hidden;
    drop.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  });

  /* Bấm ra ngoài hoặc bấm phím Esc đều đóng menu */
  document.addEventListener("click", e => {
    if (!host.contains(e.target)) close();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") close();
  });

  $("#logoutBtn").addEventListener("click", () => {
    Accounts.logout();
    close();
    toast(`Đã đăng xuất tài khoản ${user.email}`, "info");
    /* Vẽ lại nút tài khoản để về trạng thái chưa đăng nhập ngay trên trang này */
    renderAccountControl();
  });
}

/* =========================================================
   GỢI Ý TÌM KIẾM
   Lọc theo tên / hãng / chip, hiện tối đa 6 gợi ý ngay dưới ô tìm kiếm
   ========================================================= */
const SUGGEST_LIMIT = 6;

function searchProducts(q) {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];

  /* Nhấn mạnh phần khớp: ưu tiên tên sản phẩm, sau đó tới hãng */
  return PRODUCTS
    .map(p => {
      const name = p.name.toLowerCase();
      const hay = `${p.name} ${p.brand} ${p.chip} ${p.specs.join(" ")}`.toLowerCase();
      if (!hay.includes(needle)) return null;

      let score = 1;
      if (name.startsWith(needle)) score = 3;
      else if (name.includes(needle) || p.brand.toLowerCase() === needle) score = 2;
      return { p, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || b.p.sold - a.p.sold)
    .slice(0, SUGGEST_LIMIT)
    .map(x => x.p);
}

function initSearchSuggest(input) {
  const drop = $("#searchDrop");
  if (!drop) return;

  let items = [], active = -1, timer;

  function close() {
    drop.hidden = true;
    drop.innerHTML = "";
    input.setAttribute("aria-expanded", "false");
    items = [];
    active = -1;
  }

  function paint(list) {
    items = list;

    if (!input.value.trim()) return close();

    if (!list.length) {
      drop.innerHTML = `<div class="search-empty">Không tìm thấy "${escapeHtml(input.value.trim())}"</div>`;
    } else {
      drop.innerHTML = list.map(p => `
        <a class="sug" role="option" aria-selected="false" href="product.html?id=${p.id}">
          <span class="sug-ico">${ICONS.search}</span>
          <span class="sug-info">
            <strong>${p.name}</strong>
            <span>${p.brand} · ${p.specs.join(" · ")}</span>
          </span>
          <span class="sug-price">${formatPrice(p.price)}</span>
        </a>`).join("");
    }

    drop.hidden = false;
    input.setAttribute("aria-expanded", "true");
    active = -1;
  }

  /* Chỉ dùng phím mũi tên khi có gợi ý đang hiện */
  function move(step) {
    if (drop.hidden || !items.length) return;
    if (active > -1) drop.children[active]?.classList.remove("on");
    active = (active + step + items.length) % items.length;
    const el = drop.children[active];
    if (el) {
      el.classList.add("on");
      el.setAttribute("aria-selected", "true");
      el.scrollIntoView({ block: "nearest" });
    }
  }

  input.addEventListener("input", () => {
    clearTimeout(timer);
    /* Chờ ngừng gõ 160ms rồi mới lọc, tránh dựng lại DOM liên tục */
    timer = setTimeout(() => paint(searchProducts(input.value)), 160);
  });

  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); move(-1); return; }
    if (e.key === "Escape") { close(); return; }
    if (e.key === "Enter" && active > -1) {
      e.preventDefault();
      location.href = "product.html?id=" + items[active].id;
    }
  });

  input.addEventListener("focus", () => { if (input.value.trim()) paint(searchProducts(input.value)); });

  /* Bấm ra ngoài thì đóng; bấm vào gợi ý thì để link tự điều hướng */
  document.addEventListener("click", e => {
    if (!$("#headSearch").contains(e.target)) close();
  });
}

function renderFooter() {
  const host = $("#appFooter");
  if (!host) return;
  const year = new Date().getFullYear();

  host.innerHTML = `
    <footer class="footer">
      <div class="container footer-top">
        <div class="footer-brand">
          <a href="index.html" class="logo">
            <span class="logo-mark">PS</span>
            <span class="logo-text">Phone<b>Store</b></span>
          </a>
          <p>Cửa hàng điện thoại chính hãng từ 2015. Giá tốt, bảo hành uy tín, giao hàng nhanh toàn quốc.</p>
          <div class="footer-badges">
            <span>${ICONS.shield} Bảo hành 12 tháng</span>
            <span>${ICONS.truck} Giao 2h nội thành</span>
          </div>
        </div>

        <div class="footer-cols">
          <div>
            <h4>Mua hàng</h4>
            <a href="products.html">Tất cả sản phẩm</a>
            <a href="products.html?brand=Apple">Điện thoại Apple</a>
            <a href="products.html?brand=Samsung">Điện thoại Samsung</a>
            <a href="products.html?sort=new">Sản phẩm mới về</a>
          </div>
          <div>
            <h4>Hỗ trợ</h4>
            <a href="index.html#lien-he">Liên hệ</a>
            <a href="index.html#uu-dai">Chương trình ưu đãi</a>
            <a href="orders.html">Lịch sử đơn hàng</a>
          </div>
          <div>
            <h4>Tài khoản</h4>
            <a href="login.html">Đăng nhập</a>
            <a href="register.html">Đăng ký tài khoản</a>
            <a href="orders.html">Lịch sử đơn hàng</a>
            <a href="cart.html">Giỏ hàng của tôi</a>
          </div>
          <div>
            <h4>Liên hệ</h4>
            <span>Hotline: <strong>${SHOP.hotline}</strong></span>
            <span>${SHOP.email}</span>
            <span>${SHOP.address}</span>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container">
          <span>© ${year} PhoneStore. Đồ án HTML &amp; JavaScript.</span>
          <span>Thanh toán: Visa · Mastercard · MoMo · ZaloPay · COD</span>
        </div>
      </div>
    </footer>`;
}

function updateCartBadge() {
  const n = Cart.count();
  $$("#cartCount").forEach(el => {
    el.textContent = n;
    el.classList.toggle("pop", n > 0);
  });
}

/* =========================================================
   Hydrate: data-icon="truck" -> SVG, data-shop="hotline" -> giá trị SHOP
   Giúp HTML viết tĩnh, không phải ghép chuỗi bằng JS
   ========================================================= */
function hydrate(root = document) {
  $$("[data-icon]", root).forEach(el => { if (ICONS[el.dataset.icon]) el.innerHTML = ICONS[el.dataset.icon]; });
  $$("[data-shop]", root).forEach(el => { if (SHOP[el.dataset.shop] !== undefined) el.textContent = SHOP[el.dataset.shop]; });
}

/* =========================================================
   COMPONENT: empty-state
   Khối "chưa có dữ liệu" dùng chung cho giỏ, đơn hàng,
   thanh toán và trang sản phẩm. Nhớ gọi hydrate() sau khi chèn.
   ========================================================= */
function emptyState(icon, title, desc, cta, href = "products.html") {
  return `
    <div class="empty-state">
      <div class="ico" data-icon="${icon}"></div>
      <h3>${title}</h3>
      <p>${desc}</p>
      <a class="btn btn-primary btn-lg" href="${href}">${cta}</a>
    </div>`;
}

/* =========================================================
   COMPONENT: card sản phẩm
   ========================================================= */
function productCard(p) {
  const off = discountPercent(p);
  const left = Math.max(0, p.stock - Cart.qtyOf(p.id));

  /* Chọn nhãn góc ảnh: giảm giá lớn > mới > bán chạy > không có */
  let badge = "";
  if (off >= 15) badge = `<span class="card-tag tag-off">-${off}%</span>`;
  else if (p.isNew) badge = `<span class="card-tag tag-new">Mới</span>`;
  else if (p.isHot) badge = `<span class="card-tag tag-hot">Bán chạy</span>`;

  /* Sắp hết hàng thì hiện thêm nhãn cảnh báo */
  const stock = p.stock <= 12 ? `<span class="card-stock">Chỉ còn ${p.stock}</span>` : "";

  /* Nút thêm giỏ: hết hàng thì khóa lại */
  const addBtn = left <= 0
    ? `<button class="btn-add is-out" disabled>Hết hàng</button>`
    : `<button class="btn-add" data-add="${p.id}" aria-label="Thêm ${p.name} vào giỏ">
         ${ICONS.cart}<span>Thêm</span>
       </button>`;

  return `
    <article class="card">
      <a class="card-img" href="product.html?id=${p.id}" aria-label="${p.name}">
        ${badge}${stock}${phoneArt(p)}
        <span class="card-view">Xem chi tiết</span>
      </a>

      <div class="card-body">
        <span class="card-brand">${p.brand}</span>
        <h3 class="card-title"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="card-specs">${p.specs.map(s => `<span class="spec">${s}</span>`).join("")}</div>
        <div class="card-rating">
          <span class="stars">${starString(p.rating)}</span>
          <span>${p.rating} · ${formatSold(p.sold)} đã bán</span>
        </div>
        <div class="card-foot">
          <div class="price">
            <strong>${formatPrice(p.price)}</strong>
            ${p.oldPrice ? `<del>${formatPrice(p.oldPrice)}</del>` : ""}
          </div>
          ${addBtn}
        </div>
      </div>
    </article>`;
}

function renderGrid(container, list) {
  const grid = typeof container === "string" ? $(container) : container;
  if (!grid) return;
  grid.innerHTML = list.map(productCard).join("");
}

/* =========================================================
   Delegation chung cho nút "thêm giỏ"
   ========================================================= */
function bindAddToCart(root = document) {
  root.addEventListener("click", e => {
    const btn = e.target.closest("[data-add]");
    if (!btn || btn.disabled) return;
    const res = Cart.add(btn.dataset.add);
    if (!res.ok) return toast(res.msg, "error");

    toast(`Đã thêm "${res.product.name}" vào giỏ`, "success");
    updateCartBadge();
    flashCartIcon();
  });
}

function flashCartIcon() {
  const btn = $(".cart-btn");
  if (!btn) return;
  btn.classList.add("bump");
  setTimeout(() => btn.classList.remove("bump"), 500);
}

/* =========================================================
   COMPONENT: khối tóm tắt đơn hàng
   Dùng chung cho trang giỏ và trang thanh toán
   ========================================================= */
function summaryRows(t, opts = {}) {
  const label = opts.totalLabel || "Tổng cộng";
  const first = opts.firstLabel ? `<div class="sum-row"><span>${opts.firstLabel}</span><strong>${formatPrice(t.subtotal)}</strong></div>` : "";

  return `
    ${first}
    <div class="sum-row ${t.shipping === 0 ? "free" : ""}">
      <span>Phí vận chuyển</span>
      <strong>${t.shipping === 0 ? "Miễn phí" : formatPrice(t.shipping)}</strong>
    </div>
    ${t.discount > 0 ? `
      <div class="sum-row minus">
        <span>Ưu đãi đơn lớn (−${Math.round(SHOP.bigOrderRate * 100)}%)</span>
        <strong>−${formatPrice(t.discount)}</strong>
      </div>` : ""}
    ${t.saved > 0 ? `
      <div class="sum-row free">
        <span>${opts.savedLabel || "Bạn tiết kiệm"}</span>
        <strong>${formatPrice(t.saved)}</strong>
      </div>` : ""}
    <div class="sum-total"><span>${label}</span><strong>${formatPrice(t.total)}</strong></div>`;
}

/* Thanh tiến trình "mua thêm X để miễn phí vận chuyển" */
function freeShipProgress(t) {
  const percent = Math.min(100, Math.round((t.subtotal / SHOP.freeShipThreshold) * 100));

  const note = t.missing > 0
    ? `<p class="ship-note">Mua thêm <strong>${formatPrice(t.missing)}</strong> để được <strong>miễn phí vận chuyển</strong></p>`
    : `<p class="ship-note done">✓ Bạn đã được miễn phí vận chuyển</p>`;

  return `
    <div class="ship-progress">
      ${note}
      <div class="progress"><i style="width:${percent}%"></i></div>
    </div>`;
}

/* =========================================================
   VALIDATE FORM
   Gộp luật kiểm tra dùng chung: trang chủ và trang thanh toán
   ========================================================= */
const RE_PHONE = /^(0|\+84)\d{8,10}$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/* strip ký tự phân tách trước khi so khớp số điện thoại */
const cleanPhone = (v) => v.replace(/[\s.-]/g, "");

/* Thông dụng: họ tên, sđt, email, nội dung */
const COMMON_RULES = {
  name: (min = 2) => ({ test: v => v.trim().length >= min, msg: "Vui lòng nhập họ và tên" }),
  phone: () => ({ test: v => RE_PHONE.test(cleanPhone(v)), msg: "Số điện thoại không hợp lệ (VD: 0912345678)" }),
  /* Email không bắt buộc nên để trống vẫn hợp lệ */
  email: () => ({ test: v => !v.trim() || RE_EMAIL.test(v.trim()), msg: "Email không hợp lệ" })
};

/* Gắn validate cho một nhóm rule và trả về hàm kiểm tra lại toàn bộ.
   Mỗi rule: { el, test, msg } với el là selector của ô nhập.

   Nhiều rule có thể cùng trỏ tới một ô. Khi ô đó không hợp lệ thì chỉ hiện
   thông báo của rule ĐẦU TIÊN không thỏa, nhờ vậy người dùng luôn thấy đúng
   nguyên nhân: để trống thì báo "vui lòng nhập", chứ không báo "không hợp lệ". */
function bindValidation(rules) {
  /* Gom các rule theo ô nhập, giữ đúng thứ tự khai báo */
  const groups = new Map();
  for (const r of rules) {
    if (!groups.has(r.el)) groups.set(r.el, []);
    groups.get(r.el).push(r);
  }

  /* Kiểm tra một ô, trả về true nếu hợp lệ */
  function checkField(el) {
    const input = $(el);
    if (!input) return true;

    const failed = groups.get(el).find(r => !r.test(input.value));

    const field = input.closest(".field");
    field.classList.toggle("invalid", !!failed);
    const msg = $(".err", field);
    if (msg) msg.textContent = failed ? failed.msg : "";

    return !failed;
  }

  groups.forEach((group, el) => {
    const input = $(el);
    if (!input) return;

    input.addEventListener("blur", () => checkField(el));
    input.addEventListener("input", () => {
      /* Chỉ báo lỗi lại khi ô đang ở trạng thái lỗi, tránh làm đỏ
         từng ký tự khi người dùng đang gõ */
      if (input.closest(".field").classList.contains("invalid")) checkField(el);
    });
    if (input.tagName === "SELECT") input.addEventListener("change", () => checkField(el));
  });

  /* Kiểm tra toàn bộ các ô, không dừng sớm ở ô sai đầu tiên,
     để mọi ô đều được đánh dấu lỗi trong cùng một lần bấm nút.
     (Array.every sẽ dừng ngay khi gặp false, không dùng ở đây) */
  return () => {
    let ok = true;
    for (const el of groups.keys()) {
      /* checkField luôn chạy, kết quả mới gộp vào ok sau cùng */
      if (!checkField(el)) ok = false;
    }
    return ok;
  };
}

/* Đưa con trỏ về ô đầu tiên đang bị lỗi */
function focusFirstError() {
  const first = $(".field.invalid input, .field.invalid select, .field.invalid textarea");
  if (first) first.focus();
}

/* Header đổi bóng + thanh tiến trình cuộn + nút lên đầu trang */
function initScrollUI() {
  const header = $(".header");
  const bar = $(".scroll-progress");
  const top = $(".to-top");
  if (!header || !bar || !top) return;

  window.addEventListener("scroll", () => {
    const y = window.scrollY;

    /* Header có đổ bóng khi cuộn xuống một chút */
    header.classList.toggle("scrolled", y > 8);

    /* Nút "lên đầu trang" chỉ hiện khi cuộn khá xuống */
    top.classList.toggle("show", y > 600);

    /* Thanh tiến trình = phần trăm đã cuộn */
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? Math.round((y / max) * 100) : 0) + "%";
  });

  top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/* Hiệu ứng fade-in khi cuộn tới
   IntersectionObserver tự báo cho biết phần tử đã lọt vào màn hình hay chưa,
   nên không cần tính tay toạ độ như bình thường */
function initReveal() {
  const items = $$(".reveal");
  if (!items.length) return;

  /* Trình duyệt cũ không hỗ trợ thì hiện luôn cho đỡ mất nội dung */
  if (!("IntersectionObserver" in window)) {
    for (const el of items) el.classList.add("in");
    return;
  }

  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      setTimeout(() => e.target.classList.add("in"), Number(e.target.dataset.delay || 0));
      io.unobserve(e.target);
    }
  }, { threshold: .12, rootMargin: "0px 0px -60px 0px" });

  items.forEach(el => io.observe(el));
}

/* =========================================================
   BOOT
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  /* Nạp giỏ hàng và lịch sử đơn từ localStorage trước khi vẽ giao diện,
     nếu không số lượng trên thanh đầu sẽ tính ra 0 ở lần mở trang đầu tiên */
  Cart.load();
  Orders.load();

  renderHeader();
  renderFooter();

  updateCartBadge();
  bindAddToCart();
  document.addEventListener("error", onImgFallback, true);

  /* Vẽ nội dung riêng của trang trước, rồi hydrate() một lần
     để thay data-icon trong cả header lẫn nội dung vừa sinh ra */
  const page = document.body.dataset.page;
  if (PAGES[page]) PAGES[page]();

  hydrate();

  initScrollUI();
  initReveal();
});
