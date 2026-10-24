/* =========================================================
   TRANG CHI TIẾT SẢN PHẨM
   ========================================================= */
PAGES.product = function () {
  const root = $("#detailRoot");
  const id = getParam("id");
  const product = productById(id);

  /* Không tìm thấy sản phẩm thì nói rõ và dừng, không hiện nhầm máy khác */
  if (!product) {
    root.innerHTML = emptyState("search",
      "Không tìm thấy sản phẩm này",
      "Mã sản phẩm không hợp lệ hoặc sản phẩm đã ngừng kinh doanh. Bạn có thể xem các mẫu đang bán hiện tại.",
      "Xem tất cả sản phẩm");
    document.title = "Sản phẩm không tồn tại - PhoneStore";
    return;
  }

  let qty = 1;

  const off = discountPercent(product);
  const inCart = Cart.qtyOf(product.id);
  /* Phải để let vì số máy còn lại giảm dần sau mỗi lần thêm giỏ */
  let left = Math.max(0, product.stock - inCart);

  /* ---------- Header ---------- */
  $("#breadcrumb").innerHTML = `
    <a href="index.html">Trang chủ</a><span>/</span>
    <a href="products.html">Sản phẩm</a><span>/</span>
    <a href="products.html?brand=${encodeURIComponent(product.brand)}">${product.brand}</a><span>/</span>
    <span>${product.name}</span>`;
  $("#detailName").textContent = product.name;
  $("#detailBrandLine").textContent = `${product.brand} · ${product.specs.join(" · ")}`;
  document.title = `${product.name} - PhoneStore`;

  /* Bảng thông số kỹ thuật.
     Phụ kiện không có màn hình / RAM / camera / hệ điều hành riêng nên
     các dòng đó để trống và bị loại khỏi bảng, tránh hiện dòng rỗng. */
  const specRows = [
    ["Màn hình", product.screen ? `${product.screen} (${product.specs[0]})` : ""],
    ["Chip xử lý", product.chip],
    ["RAM", product.ram],
    ["Dung lượng pin", product.battery],
    ["Camera chính", product.camera],
    ["Tương thích", product.os],
    ["Thương hiệu", product.brand],
    ["Danh mục", product.category],
    ["Bảo hành", "12 tháng chính hãng"]
  ].filter(row => row[1]);

  /* ---------- Nội dung ---------- */
  root.innerHTML = `
    <div class="detail-layout">
      <div class="detail-gallery">${phoneArt(product)}</div>

      <div class="detail">
        <div class="detail-tags">
          ${off > 0 ? `<span class="pill pill-off">Giảm ${off}%</span>` : ""}
          ${product.isNew ? `<span class="pill pill-new">Hàng mới về</span>` : ""}
          ${product.isHot ? `<span class="pill pill-hot">Bán chạy #1</span>` : ""}
          ${product.stock <= 12 ? `<span class="pill pill-hot">Chỉ còn ${product.stock} máy</span>` : ""}
        </div>

        <h1>${product.name}</h1>

        <div class="detail-meta">
          <span class="stars">${starString(product.rating)}</span>
          <span><strong style="color:var(--text)">${product.rating}</strong> / 5</span>
          <span class="sold">${formatSold(product.sold)} đã bán</span>
          <span>Mã SP${String(product.id).padStart(4, "0")}</span>
        </div>

        <div class="detail-price-box">
          <strong>${formatPrice(product.price)}</strong>
          ${product.oldPrice ? `<del>${formatPrice(product.oldPrice)}</del>` : ""}
          ${off > 0 ? `<span class="save">Tiết kiệm ${formatPrice(product.oldPrice - product.price)}</span>` : ""}
        </div>

        <p class="detail-desc">${product.desc}</p>

        <ul class="detail-highlights">
          ${product.highlight.map(h => `<li><span data-icon="check"></span>${h}</li>`).join("")}
        </ul>

        <div class="buy-row">
          <div class="qty-box">
            <button id="minus" aria-label="Giảm">−</button>
            <span id="qtyText">1</span>
            <button id="plus" aria-label="Tăng">+</button>
          </div>
          <button class="btn btn-primary btn-lg" id="addBtn" ${left <= 0 ? "disabled" : ""}>
            <span data-icon="cart"></span>
            <span id="addLabel">${left <= 0 ? "Tạm hết hàng" : "Thêm vào giỏ hàng"}</span>
          </button>
          <button class="btn btn-dark btn-lg" id="buyNow" ${left <= 0 ? "disabled" : ""}>Mua ngay</button>
        </div>

        <p class="stock-note">
          Còn <strong id="stockLeft">${left}</strong> máy trong kho ·
          <span data-icon="truck" style="width:15px;height:15px;vertical-align:-3px"></span>
          Giao hàng 2h nội thành, 24h toàn quốc · Bảo hành chính hãng 12 tháng
        </p>

        <div class="side-title" style="margin-bottom:12px">Thông số kỹ thuật</div>
        <table class="spec-table">
          ${specRows.map(([label, value]) => `<tr><th>${label}</th><td>${value}</td></tr>`).join("")}
        </table>
      </div>
    </div>`;

  /* ---------- Số lượng + tồn kho ----------
     paintStock vẽ lại cả nút bấm và dòng "còn X máy", vì hai thứ này
     đều phụ thuộc vào biến left. Chỉ sửa textContent của nút sẽ làm
     mất luôn biểu tượng svg bên trong. */
  function paintStock() {
    const soldOut = left <= 0;
    $("#stockLeft").textContent = left;
    $("#addBtn").disabled = soldOut;
    $("#buyNow").disabled = soldOut;
    $("#addLabel").textContent = soldOut ? "Tạm hết hàng" : "Thêm vào giỏ hàng";
    paintQty();
  }

  function paintQty() {
    $("#qtyText").textContent = qty;
    $("#minus").disabled = qty <= 1;
    $("#plus").disabled = qty >= left;
  }
  paintStock();

  $("#minus").addEventListener("click", () => { qty = Math.max(1, qty - 1); paintQty(); });
  $("#plus").addEventListener("click", () => {
    if (qty >= left) return toast(`Chỉ còn ${left} máy trong kho`, "error");
    qty++;
    paintQty();
  });

  /* ---------- Thêm giỏ / mua ngay ---------- */
  $("#addBtn").addEventListener("click", () => {
    const res = Cart.add(product.id, qty);
    if (!res.ok) return toast(res.msg, "error");

    toast(`Đã thêm ${qty} sản phẩm vào giỏ hàng`, "success");
    updateCartBadge();
    flashCartIcon();

    /* Trừ số vừa thêm khỏi tồn kho rồi vẽ lại toàn bộ phần mua hàng */
    left -= qty;
    qty = 1;
    paintStock();
  });

  $("#buyNow").addEventListener("click", () => {
    const res = Cart.add(product.id, qty);
    if (!res.ok) return toast(res.msg, "error");
    location.href = "checkout.html";
  });

  /* ---------- Sản phẩm liên quan ---------- */
  const related = PRODUCTS
    .filter(p => p.id !== product.id)
    .map(p => ({ p, score: (p.brand === product.brand ? 2 : 0) + Math.abs(p.price - product.price) / 1e7 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map(x => x.p);

  if (related.length) {
    $("#relatedBlock").hidden = false;
    renderGrid("#relatedGrid", related);
  }
};