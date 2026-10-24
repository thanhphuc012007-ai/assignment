/* =========================================================
   TRANG CHỦ
   ========================================================= */

/* Số liệu trong hero: mục nào là số thật thì chạy từ 0 lên,
   còn mục dạng chuỗi (ví dụ "50K+") thì giữ nguyên, không đếm */
function countUpHero() {
  for (const el of $$("#heroStats strong")) {
    const target = Number(el.dataset.countTo);

    /* Không phải số thì thôi, giữ nguyên chữ đã hiển thị */
    if (isNaN(target)) continue;

    el.textContent = "0";

    /* Mỗi lần chạy cộng thêm 1/30 giá trị, tối đa 30 lần là tới đích */
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(target, current + Math.ceil(target / 30));
      el.textContent = current.toLocaleString("vi-VN");
      if (current >= target) clearInterval(timer);
    }, 30);
  }
}

PAGES.home = function () {
  const sorters = {
    hot: (a, b) => b.sold - a.sold,
    new: (a, b) => b.isNew - a.isNew,
    sale: (a, b) => discountPercent(b) - discountPercent(a),
    cheap: (a, b) => a.price - b.price
  };

  const take = (key, n = 8) => [...PRODUCTS].sort(sorters[key]).slice(0, n);

  renderGrid("#hotGrid", take("hot"));
  renderGrid("#newGrid", take("new"));

  const saleItems = PRODUCTS
    .filter(p => p.oldPrice && discountPercent(p) > 0)
    .sort(sorters.sale)
    .slice(0, 8);
  renderGrid("#saleGrid", saleItems.length ? saleItems : take("sale"));

  /* Danh sách điện thoại: phần lớn các mục trên trang chủ chỉ nói về máy */
  const phones = PRODUCTS.filter(p => p.category === "Điện thoại");

  /* Thương hiệu. Chỉ tính trong nhóm "Điện thoại", vì phụ kiện có mức giá
     rất khác nên nếu tính chung thì dòng "từ ...₫" sẽ gây nhầm lẫn */
  $("#brandBar").innerHTML = BRANDS.filter(b => b !== "Tất cả").map(b => {
    const items = phones.filter(p => p.brand === b);
    const count = items.length;
    const cheapest = Math.min(...items.map(p => p.price));
    return `
      <a class="brand-pill" href="products.html?cat=%C4%91i%E1%BB%87n+tho%E1%BA%ADi&brand=${encodeURIComponent(b)}">
        <span class="dot"></span>
        ${b}
        <span>${count} mẫu &middot; từ ${formatPrice(cheapest)}</span>
      </a>`;
  }).join("");

  /* Số lượng máy đang bán nằm ngay trong câu giới thiệu của hero */
  $("#heroPhoneCount").textContent = phones.length;

  /* Điện thoại trong hero: máy đang giảm giá sâu nhất, cũng là cây bán chạy nhất */
  $("#heroPhone").innerHTML = phoneArt([...phones].sort(sorters.sale)[0]);

  /* Số liệu hero: "total" thì lấy độ dài PRODUCTS, còn lại giữ nguyên chuỗi */
  $("#heroStats").innerHTML = HERO_STATS.map(s => {
    const value = s.stat === "total" ? PRODUCTS.length : s.stat;
    return `<div><strong data-count-to="${value}">${value}</strong><span>${s.label}</span></div>`;
  }).join("");
  countUpHero();

  /* Ưu đãi */
  $("#promoGrid").innerHTML = PROMOS.map(p => `
    <div class="promo ${p.cls}">
      <span>${p.tag}</span>
      <strong>${p.value}</strong>
      <p>${p.desc}</p>
      <a href="${p.href}">${p.cta} <span data-icon="arrowRight"></span></a>
    </div>`).join("");

  /* Chủ đề liên hệ */
  $("#cSubject").innerHTML = CONTACT_SUBJECTS.map(o => `<option>${o}</option>`).join("");

  /* Thông tin liên hệ */
  $("#contactInfo").innerHTML = CONTACT_INFO.map(i => `
    <div class="info-item">
      <span class="info-ico" data-icon="${i.icon}"></span>
      <div>
        <strong>${i.title}</strong>
        <span>${i.shop ? SHOP[i.shop] + (i.suffix || "") : i.text}</span>
      </div>
    </div>`).join("");

  /* Tính năng */
  $("#featureRow").innerHTML = FEATURES.map(f => `
    <div class="feature reveal">
      <span class="feature-ico" data-icon="${f.icon}"></span>
      <div><strong>${f.title}</strong><span>${f.desc}</span></div>
    </div>`).join("");

  /* Reveal theo nhóm */
  ["#hotGrid .card", "#newGrid .card", "#saleGrid .card", "#brandBar .brand-pill", "#featureRow .feature"].forEach(sel => {
    $$(sel).forEach((el, i) => {
      el.classList.add("reveal");
      el.dataset.delay = String(Math.min(i, 7) * 60);
    });
  });

  /* Newsletter */
  $("#newsForm").addEventListener("submit", e => {
    e.preventDefault();
    const input = $("#newsEmail");
    const v = input.value.trim();
    if (!RE_EMAIL.test(v)) {
      toast("Email không hợp lệ, vui lòng kiểm tra lại", "error");
      input.focus();
      return;
    }
    toast("Đăng ký thành công! Cảm ơn bạn đã theo dõi PhoneStore", "success");
    input.value = "";
  });

  /* Form liên hệ - dùng chung bộ luật kiểm tra với trang thanh toán */
  const form = $("#contactForm");
  const checkAll = bindValidation([
    { el: "#cName", ...COMMON_RULES.name(2) },
    { el: "#cPhone", ...COMMON_RULES.phone() },
    { el: "#cMsg", test: v => v.trim().length >= 5, msg: "Vui lòng nhập nội dung cần tư vấn" }
  ]);

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!checkAll()) {
      toast("Vui lòng điền đầy đủ thông tin hợp lệ", "error");
      focusFirstError();
      return;
    }
    toast(`Cảm ơn ${$("#cName").value.trim().split(/\s+/).pop()}! Chúng tôi sẽ gọi cho bạn trong 30 phút`, "success");
    form.reset();

    /* Xóa luôn viền đỏ báo lỗi còn sót lại sau khi reset */
    $$(".field", form).forEach(field => field.classList.remove("invalid"));
  });
};