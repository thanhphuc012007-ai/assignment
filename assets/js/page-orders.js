/* =========================================================
   TRANG LỊCH SỬ ĐƠN HÀNG
   Đọc từ store Orders (đã lưu trong localStorage)
   ========================================================= */
PAGES.orders = function () {
  const root = $("#ordersRoot");

  /* Tên phương thức thanh toán theo mã đã lưu */
  const payTitle = (value) => {
    const hit = PAYMENTS.find(p => p.value === value);
    return hit ? hit.title : "Thanh toán khi nhận hàng (COD)";
  };

  function render() {
    const list = Orders.all;

    /* ---------- Chưa có đơn nào ---------- */
    if (!list.length) {
      root.innerHTML = emptyState("box",
        "Bạn chưa có đơn hàng nào",
        "Sau khi đặt hàng, đơn của bạn sẽ xuất hiện ở đây để tiện theo dõi.",
        "Mua sắm ngay");
      hydrate(root);
      $("#ordersSubtitle").textContent = "Bạn chưa có đơn hàng nào.";
      return;
    }

    root.innerHTML = `
      <div class="list-toolbar">
        <span class="count">Tổng cộng <strong>${list.length}</strong> đơn hàng</span>
        <button class="link-danger" id="clearOrders" type="button">
          <span data-icon="trash"></span> Xóa lịch sử
        </button>
      </div>

      <div class="orders-list">
        ${list.map(o => {
          const qty = o.items.reduce((sum, i) => sum + i.qty, 0);
          const where = [o.customer.address, o.customer.district, o.customer.city].filter(Boolean).join(", ");

          return `
            <article class="order-card">
              <div class="order-head">
                <div>
                  <strong>${escapeHtml(o.id)}</strong>
                  <span> · ${escapeHtml(o.date)}</span>
                </div>
                <span class="status-pill">${escapeHtml(o.status || "Đang xử lý")}</span>
              </div>

              <div class="order-body">
                ${o.items.map(i => {
                  const product = productById(i.id);
                  return `
                    <div class="order-row">
                      <span class="mini-thumb">${product ? phoneThumb(product) : ""}<span class="mini-qty">${i.qty}</span></span>
                      <span class="mini-info">
                        <strong>${escapeHtml(i.name)}</strong>
                        <span>${escapeHtml(i.brand)} · ${formatPrice(i.price)}</span>
                      </span>
                      <b>${formatPrice(i.price * i.qty)}</b>
                    </div>`;
                }).join("")}
              </div>

              <div class="order-foot">
                <div class="order-meta">
                  ${where ? `<span>${ICONS.truck} Giao đến ${escapeHtml(where)}</span>` : ""}
                  <span>${ICONS.wallet} ${escapeHtml(payTitle(o.customer.payment))}</span>
                  <span>${ICONS.box} ${qty} sản phẩm</span>
                </div>
                <strong class="order-total">${formatPrice(o.totals.total)}</strong>
              </div>
            </article>`;
        }).join("")}
      </div>`;

    hydrate(root);
    $("#ordersSubtitle").textContent =
      `Bạn có ${list.length} đơn hàng đã đặt. Liên hệ hotline ${SHOP.hotline} để được hỗ trợ.`;
  }

  root.addEventListener("click", e => {
    if (!e.target.closest("#clearOrders")) return;
    if (!confirm("Bạn có chắc muốn xóa toàn bộ lịch sử đơn hàng?")) return;
    Orders.clear();
    toast("Đã xóa lịch sử đơn hàng");
    render();
  });

  render();
};