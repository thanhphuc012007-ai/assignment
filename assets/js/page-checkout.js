/* =========================================================
   TRANG THANH TOÁN - thông tin lấy từ giỏ hàng
   ========================================================= */
PAGES.checkout = function () {
  const root = $("#checkoutRoot");

  let payMethod = "cod";

  function render() {
    const t = Cart.totals();
    updateCartBadge();

    /* Giữ trống thì không cho thanh toán */
    if (!t.items.length) {
      root.innerHTML = emptyState("wallet",
        "Chưa có đơn hàng để thanh toán",
        "Vui lòng chọn sản phẩm và thêm vào giỏ hàng trước khi thanh toán.",
        "Đi tới danh sách sản phẩm");
      hydrate(root);
      return;
    }

    /* Phương thức đã chọn phải còn hợp lệ, nếu không thì lùi về mặc định.
     Nhờ vậy lúc vẽ lại form, radio đúng với biến payMethod thay vì
     luôn bắt đầu ở phương thức đầu tiên. */
    if (!PAYMENTS.some(p => p.value === payMethod)) {
      payMethod = PAYMENTS[0].value;
    }

    root.innerHTML = `
      <div class="checkout-layout">
        <form class="panel form-panel" id="orderForm" novalidate>

          <div class="form-block">
            <h3>Thông tin người nhận</h3>
            <p>Bạn nhận đơn hàng tận nhà trên toàn quốc</p>
            <div class="form-grid">
              <div class="field">
                <label for="oName">Họ và tên <span class="req">*</span></label>
                <input type="text" id="oName" placeholder="Nguyễn Văn A" autocomplete="name">
                <small class="err"></small>
              </div>
              <div class="field">
                <label for="oPhone">Số điện thoại <span class="req">*</span></label>
                <input type="tel" id="oPhone" placeholder="0912345678" autocomplete="tel">
                <small class="err"></small>
              </div>
              <div class="field full">
                <label for="oEmail">Email (không bắt buộc)</label>
                <input type="email" id="oEmail" placeholder="ban@example.com" autocomplete="email">
                <small class="err"></small>
              </div>
            </div>
          </div>

          <div class="form-block">
            <h3>Địa chỉ giao hàng</h3>
            <p>Giao hàng nhanh 2h nội thành, 24h toàn quốc</p>
            <div class="form-grid">
              <div class="field">
                <label for="oCity">Tỉnh / Thành phố <span class="req">*</span></label>
                <select id="oCity">
                  <option value="">Chọn tỉnh thành</option>
                  ${CITIES.map(c => `<option>${c}</option>`).join("")}
                </select>
                <small class="err"></small>
              </div>
              <div class="field">
                <label for="oDistrict">Quận / Huyện <span class="req">*</span></label>
                <input type="text" id="oDistrict" placeholder="Quận 1">
                <small class="err"></small>
              </div>
              <div class="field full">
                <label for="oAddress">Số nhà, đường <span class="req">*</span></label>
                <input type="text" id="oAddress" placeholder="Số 123, đường Nguyễn Huệ">
                <small class="err"></small>
              </div>
              <div class="field full">
                <label for="oNote">Ghi chú cho đơn hàng</label>
                <textarea id="oNote" rows="3" placeholder="VD: Gọi trước khi giao, giao sau 18h..."></textarea>
              </div>
            </div>
          </div>

          <div class="form-block">
            <h3>Phương thức thanh toán</h3>
            <p>Chọn cách thanh toán thuận tiện với bạn</p>
            <div class="pay-list">
              ${PAYMENTS.map(p => `
                <label class="pay-option">
                  <input type="radio" name="payment" value="${p.value}" ${p.value === payMethod ? "checked" : ""}>
                  <span class="dot"></span>
                  <span class="txt"><strong>${p.title}</strong><span>${p.desc}</span></span>
                  <span class="pay-logo">${p.logo}</span>
                </label>`).join("")}
            </div>
          </div>

          <div class="form-block">
            <h3>Hoàn tất đơn hàng</h3>
            <p>Bạn sẽ nhận được xác nhận đơn hàng qua điện thoại</p>
            <label class="check-row" style="margin-bottom:16px">
              <input type="checkbox" id="oAgree">
              Tôi đã đọc và đồng ý với điều khoản bảo hành, đổi trả của PhoneStore
            </label>
            <small class="err" id="agreeErr" style="display:none;color:var(--danger);font-weight:600">Bạn cần đồng ý với điều khoản để tiếp tục</small>
            <button type="submit" class="btn btn-primary btn-lg btn-block">
              <span data-icon="wallet"></span> Xác nhận đặt hàng · <span id="btnTotal">${formatPrice(t.total)}</span>
            </button>
          </div>
        </form>

        <aside class="panel summary">
          <div class="panel-head"><h2>Đơn hàng của bạn</h2></div>
          <div class="summary-body">
            ${t.items.map(i => `
              <div class="mini-line">
                <span class="mini-thumb">${phoneThumb(i)}<span class="mini-qty">${i.qty}</span></span>
                <span class="mini-info">
                  <strong>${i.name}</strong>
                  <span>${i.brand} · ${formatPrice(i.price)}</span>
                </span>
                <b>${formatPrice(i.lineTotal)}</b>
              </div>`).join("")}

            <div class="sum-row" style="margin-top:14px"><span>Tạm tính</span><strong>${formatPrice(t.subtotal)}</strong></div>
            ${summaryRows(t, { totalLabel: "Thanh toán", savedLabel: "Tiết kiệm" })}
          </div>
          <div class="panel-foot">
            <a class="btn btn-outline btn-block" href="cart.html">
              <span data-icon="arrowRight" style="transform:rotate(180deg)"></span> Quay lại giỏ hàng
            </a>
          </div>
        </aside>
      </div>`;

    hydrate(root);
    bindForm();
  }

  /* ---------- Validate + đặt hàng ---------- */
  function bindForm() {
    /* Dùng chung luật kiểm tra với form liên hệ ở trang chủ */
    const rules = [
      { el: "#oName", ...COMMON_RULES.name(2) },
      { el: "#oPhone", ...COMMON_RULES.phone() },
      { el: "#oEmail", ...COMMON_RULES.email() },
      { el: "#oCity", test: v => v !== "", msg: "Vui lòng chọn tỉnh / thành phố" },
      { el: "#oDistrict", ...COMMON_RULES.name(2), msg: "Vui lòng nhập quận / huyện" },
      { el: "#oAddress", test: v => v.trim().length >= 5, msg: "Vui lòng nhập địa chỉ đầy đủ" }
    ];

    const checkAll = bindValidation(rules);

    $("#orderForm").addEventListener("change", e => {
      if (e.target.name !== "payment") return;
      payMethod = e.target.value;
      toast(`Đã chọn: ${(PAYMENTS.find(p => p.value === payMethod) || {}).title || ""}`);
    });

    $("#orderForm").addEventListener("submit", e => {
      e.preventDefault();

      const allOk = checkAll();
      const agreed = $("#oAgree").checked;
      $("#agreeErr").style.display = agreed ? "none" : "block";

      if (!allOk) {
        toast("Vui lòng kiểm tra lại các trường bị lỗi", "error");
        focusFirstError();
        return;
      }
      if (!agreed) {
        toast("Bạn cần đồng ý với điều khoản để tiếp tục", "error");
        $("#oAgree").focus();
        return;
      }

      const name = $("#oName").value.trim();
      const value = sel => $(sel).value.trim();

      const order = Cart.placeOrder({
        name: name,
        phone: value("#oPhone"),
        email: value("#oEmail"),
        city: value("#oCity"),
        district: value("#oDistrict"),
        address: value("#oAddress"),
        note: value("#oNote"),
        payment: payMethod
      });

      /* escapeHtml dùng chung từ app.js để tên người dùng có ký tự
         đặc biệt không phá vỡ markup */
      root.innerHTML = `
        <div class="panel order-done">
          <div class="ico" data-icon="check"></div>
          <h1>Đặt hàng thành công!</h1>
          <p>Cảm ơn <strong>${escapeHtml(name)}</strong>, đơn hàng của bạn đã được ghi nhận.</p>
          <p>Chúng tôi sẽ gọi điện xác nhận trong vắt 30 phút tới.</p>

          <div class="order-code">Mã đơn hàng: ${escapeHtml(order.id)}</div>

          <div class="done-list">
            <div class="done-row"><span>Thời gian đặt hàng</span><b>${escapeHtml(order.date)}</b></div>
            <div class="done-row"><span>Số lượng sản phẩm</span><b>${order.items.length} mặt hàng</b></div>
            <div class="done-row"><span>Phương thức thanh toán</span><b>${escapeHtml((PAYMENTS.find(p => p.value === payMethod) || {}).title || "COD")}</b></div>
            <div class="done-row"><span>Phí vận chuyển</span><b>${order.totals.shipping === 0 ? "Miễn phí" : formatPrice(order.totals.shipping)}</b></div>
            <div class="done-row"><span>Tổng thanh toán</span><b style="color:var(--danger);font-size:17px">${formatPrice(order.totals.total)}</b></div>
          </div>

          <div class="done-actions">
            <a class="btn btn-primary btn-lg" href="products.html">Tiếp tục mua sắm</a>
            <a class="btn btn-outline btn-lg" href="orders.html">Xem đơn hàng</a>
            <a class="btn btn-outline btn-lg" href="index.html">Về trang chủ</a>
          </div>
        </div>`;

      hydrate(root);
      updateCartBadge();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  render();
};