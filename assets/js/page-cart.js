/* =========================================================
   TRANG GIỎ HÀNG - đọc từ mảng cart, dữ liệu được lưu trong localStorage
   ========================================================= */
PAGES.cart = function () {
  const root = $("#cartRoot");

  function render() {
    const t = Cart.totals();
    updateCartBadge();

    /* ---------- Giỏ trống ---------- */
    if (!t.items.length) {
      root.innerHTML = emptyState("cart",
        "Giỏ hàng của bạn đang trống",
        "Hãy chọn một chiếc điện thoại ưng ý trong kho sản phẩm của chúng tôi.",
        "Đi mua sắm ngay");
      hydrate(root);
      $("#cartSubtitle").textContent = "Bạn chưa có sản phẩm nào trong giỏ.";
      return;
    }

    root.innerHTML = `
      <div class="cart-layout">
        <section class="panel">
          <div class="panel-head">
            <h2>Sản phẩm trong giỏ (<span id="lineCount">${t.items.length}</span>)</h2>
            <button class="link-danger" id="clearCart">
              <span data-icon="trash"></span> Xóa tất cả
            </button>
          </div>

          <div class="panel-body">
            ${t.items.map(i => `
              <div class="cart-line">
                <a class="thumb" href="product.html?id=${i.id}">${phoneThumb(i)}</a>
                <div>
                  <span class="card-brand">${i.brand}</span>
                  <div class="name"><a href="product.html?id=${i.id}">${i.name}</a></div>
                  <div class="unit">Đơn giá: <strong>${formatPrice(i.price)}</strong>
                    ${i.oldPrice ? ` &middot; <del>${formatPrice(i.oldPrice)}</del>` : ""}</div>
                  <div class="actions">
                    <div class="qty-box">
                      <button data-step="-1" data-id="${i.id}" aria-label="Giảm số lượng">−</button>
                      <span>${i.qty}</span>
                      <button data-step="1" data-id="${i.id}" aria-label="Tăng số lượng">+</button>
                    </div>
                    <span style="font-size:13px;color:var(--muted)">Tối đa ${i.stock} máy</span>
                    <button class="link-danger" data-remove="${i.id}">
                      <span data-icon="trash"></span> Xóa
                    </button>
                  </div>
                </div>
                <div class="line-total">${formatPrice(i.lineTotal)}</div>
              </div>`).join("")}
          </div>

          <div class="panel-foot">
            <a class="btn btn-outline" href="products.html">
              <span data-icon="arrowRight" style="transform:rotate(180deg)"></span>
              Tiếp tục mua sắm
            </a>
          </div>
        </section>

        <aside class="panel summary">
          <div class="panel-head"><h2>Tóm tắt đơn hàng</h2></div>

          <div class="summary-body">
            ${summaryRows(t, { firstLabel: `Tạm tính (${t.items.length} mặt hàng)` })}
          </div>

          ${freeShipProgress(t)}

          <div class="panel-foot">
            <button class="btn btn-primary btn-lg btn-block" id="goCheckout">
              Thanh toán ngay <span data-icon="arrowRight"></span>
            </button>
            <div class="trust-row">
              <span><span data-icon="shield"></span> Bảo hành 12 tháng</span>
              <span><span data-icon="refresh"></span> Đổi trả 15 ngày</span>
            </div>
          </div>
        </aside>
      </div>`;

    hydrate(root);
    $("#cartSubtitle").textContent =
      `Bạn đang có ${Cart.count()} sản phẩm trong giỏ · Tổng ${formatPrice(t.total)}`;
  }

  /* ---------- Sự kiện ---------- */
  root.addEventListener("click", e => {
    const step = e.target.closest("[data-step]");
    if (step) {
      const id = Number(step.dataset.id);
      const next = Cart.qtyOf(id) + Number(step.dataset.step);
      const res = next <= 0 ? Cart.remove(id) : Cart.setQty(id, next);
      if (!res.ok) toast(res.msg, "error");
      render();
      return;
    }

    const rm = e.target.closest("[data-remove]");
    if (rm) {
      const p = productById(rm.dataset.remove);
      const res = Cart.remove(rm.dataset.remove);
      if (!res.ok) toast(res.msg, "error");
      else toast(`Đã xóa "${p ? p.name : "sản phẩm"}" khỏi giỏ`);
      render();
      return;
    }

    if (e.target.closest("#clearCart")) {
      if (!confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) return;
      Cart.clear();
      toast("Đã xóa toàn bộ giỏ hàng");
      render();
      return;
    }

    if (e.target.closest("#goCheckout")) location.href = "checkout.html";
  });

  render();
};