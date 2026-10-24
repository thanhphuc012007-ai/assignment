/* =========================================================
   TRANG ĐĂNG NHẬP
   Kiểm tra thông tin nhập với danh sách tài khoản đã lưu trong
   Accounts (localStorage). Đăng nhập thành công thì chuyển tới
   trang "next" hoặc trang chủ, đồng thời vẽ lại nút tài khoản
   trên header để thành viên đã đăng nhập.
   ========================================================= */
PAGES.login = function () {
  const root = $("#authRoot");

  /* Trang muốn quay lại sau khi đăng nhập */
  let backTo = safeNext(getParam("next")) || "index.html";

  /* Chặn vòng lặp: quay về chính trang đăng nhập sẽ bị chuyển đi mãi */
  if (backTo.split("?")[0] === "login.html") backTo = "index.html";

  /* Đã đăng nhập rồi thì không cần đăng nhập lần nữa */
  const signed = Accounts.current();
  if (signed) {
    toast(`Bạn đang đăng nhập với ${signed.email}`, "info");
    location.replace(backTo);
    return;
  }

  /* ---------- Nút bật/tắt xem mật khẩu ---------- */
  function bindEye(button) {
    if (!button) return;
    button.addEventListener("click", () => {
      const input = $("input", button.parentElement);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.innerHTML = show ? ICONS.eyeOff : ICONS.eye;
      button.setAttribute("aria-label", show ? "Ẩn mật khẩu" : "Hiện mật khẩu");
      input.focus();
    });
  }

  /* ---------- Vẽ form ---------- */
  root.innerHTML = `
    <form class="auth-form" id="authForm" novalidate>
      <h2 class="auth-title">Đăng nhập</h2>
      <p class="auth-sub">Chào mừng trở lại với PhoneStore</p>

      <div class="field">
        <label for="aEmail">Email <span class="req">*</span></label>
        <input type="email" id="aEmail" placeholder="ban@example.com" autocomplete="email">
        <small class="err"></small>
      </div>

      <div class="field">
        <label for="aPass">Mật khẩu <span class="req">*</span></label>
        <div class="pass-wrap">
          <input type="password" id="aPass" placeholder="Nhập mật khẩu" autocomplete="current-password">
          <button class="pass-eye" type="button" id="passEye" aria-label="Hiện mật khẩu">${ICONS.eye}</button>
        </div>
        <small class="err"></small>
      </div>

      <button type="submit" class="btn btn-primary btn-lg btn-block"><span data-icon="key"></span> Đăng nhập</button>

      <p class="auth-switch">Chưa có tài khoản? <a href="${registerUrl()}">Đăng ký ngay</a></p>
    </form>`;

  hydrate(root);
  bindEye($("#passEye"));

  /* ---------- Kiểm tra dữ liệu nhập ---------- */
  const checkAll = bindValidation([
    { el: "#aEmail", test: v => v.trim().length > 0, msg: "Vui lòng nhập email" },
    { el: "#aEmail", test: v => RE_EMAIL.test(v.trim()), msg: "Email không hợp lệ" },
    { el: "#aPass", test: v => v.length > 0, msg: "Vui lòng nhập mật khẩu" }
  ]);

  /* ---------- Xử lý đăng nhập ---------- */
  $("#authForm").addEventListener("submit", e => {
    e.preventDefault();

    if (!checkAll()) {
      toast("Vui lòng nhập đầy đủ email và mật khẩu", "error");
      focusFirstError();
      return;
    }

    const email = $("#aEmail").value.trim();
    const pass = $("#aPass").value;

    /* So khớp với dữ liệu tài khoản đã đăng ký */
    const res = Accounts.login(email, pass);

    if (!res.ok) {
      toast(res.msg, "error");

      /* Báo riêng cho ô mật khẩu để thấy rõ nguyên nhân */
      const field = $("#aPass").closest(".field");
      if (/mật khẩu/i.test(res.msg)) {
        field.classList.add("invalid");
        $(".err", field).textContent = res.msg;
      }
      $("#aPass").value = "";
      $("#aPass").focus();
      return;
    }

    toast(`Đăng nhập thành công, chào mừng ${res.user.name}`, "success");
    /* Vẽ lại nút tài khoản cho đúng trạng thái trước khi rời trang */
    renderAccountControl();

    setTimeout(() => { location.href = backTo; }, 800);
  });
};