/* =========================================================
   TRANG ĐĂNG KÝ
   Biểu mẫu họ tên, email, mật khẩu và xác nhận mật khẩu.
   Dữ liệu được kiểm tra trước khi lưu vào Accounts (localStorage):
   bắt buộc không trống, email đúng định dạng, mật khẩu tối thiểu
   MIN_PASSWORD ký tự, xác nhận khớp và email chưa từng đăng ký.
   ========================================================= */
PAGES.register = function () {
  const root = $("#authRoot");

  /* Trang muốn quay lại sau khi đăng ký */
  const backTo = safeNext(getParam("next")) || "index.html";

  /* Đã có tài khoản thì không cần đăng ký thêm */
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

  /* ---------- Đo độ mạnh mật khẩu ---------- */
  function scorePassword(v) {
    let score = 0;
    if (v.length >= MIN_PASSWORD) score++;
    if (v.length >= 10) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^\w\s]/.test(v)) score++;
    return score;
  }

  function paintMeter(v) {
    const meter = $("#passMeter");
    const tip = $("#passTip");
    if (!meter || !tip) return;

    const score = scorePassword(v);
    meter.classList.toggle("mid", score === 2 || score === 3);
    meter.classList.toggle("strong", score >= 4);
    $("i", meter).style.width = Math.round((score / 5) * 100) + "%";

    if (!v) tip.textContent = `Tối thiểu ${MIN_PASSWORD} ký tự`;
    else if (score <= 1) tip.textContent = "Mật khẩu còn yếu, nên thêm chữ hoa, số và ký tự đặc biệt";
    else if (score <= 3) tip.textContent = "Mật khẩu ổn";
    else tip.textContent = "Mật khẩu mạnh";
  }

  /* ---------- Vẽ form ---------- */
  root.innerHTML = `
    <form class="auth-form" id="authForm" novalidate>
      <h2 class="auth-title">Tạo tài khoản</h2>
      <p class="auth-sub">Điền thông tin bên dưới để bắt đầu mua sắm</p>

      <div class="field">
        <label for="rName">Họ và tên <span class="req">*</span></label>
        <input type="text" id="rName" placeholder="Nguyễn Văn A" autocomplete="name">
        <small class="err"></small>
      </div>

      <div class="field">
        <label for="rEmail">Email <span class="req">*</span></label>
        <input type="email" id="rEmail" placeholder="ban@example.com" autocomplete="email">
        <small class="err"></small>
      </div>

      <div class="field">
        <label for="rPhone">Số điện thoại <span class="req">*</span></label>
        <input type="tel" id="rPhone" placeholder="0912345678" autocomplete="tel">
        <small class="err"></small>
      </div>

      <div class="field">
        <label for="rPass">Mật khẩu <span class="req">*</span></label>
        <div class="pass-wrap">
          <input type="password" id="rPass" placeholder="Tối thiểu ${MIN_PASSWORD} ký tự" autocomplete="new-password">
          <button class="pass-eye" type="button" id="passEye" aria-label="Hiện mật khẩu">${ICONS.eye}</button>
        </div>
        <div class="pass-meter" id="passMeter"><i></i></div>
        <small class="pass-tip" id="passTip">Tối thiểu ${MIN_PASSWORD} ký tự</small>
        <small class="err"></small>
      </div>

      <div class="field">
        <label for="rPass2">Xác nhận mật khẩu <span class="req">*</span></label>
        <div class="pass-wrap">
          <input type="password" id="rPass2" placeholder="Nhập lại mật khẩu" autocomplete="new-password">
          <button class="pass-eye" type="button" id="passEye2" aria-label="Hiện mật khẩu">${ICONS.eye}</button>
        </div>
        <small class="err"></small>
      </div>

      <label class="check-row">
        <input type="checkbox" id="rAgree">
        Tôi đồng ý với điều khoản bảo mật và chính sách đổi trả của PhoneStore
      </label>
      <small class="err" id="agreeErr" style="display:none;color:var(--danger);font-weight:600">
        Bạn cần đồng ý với điều khoản để tạo tài khoản
      </small>

      <button type="submit" class="btn btn-primary btn-lg btn-block"><span data-icon="user"></span> Tạo tài khoản</button>

      <p class="auth-switch">Đã có tài khoản? <a href="${loginUrl("login")}">Đăng nhập</a></p>
    </form>`;

  hydrate(root);
  bindEye($("#passEye"));
  bindEye($("#passEye2"));

  /* ---------- Kiểm tra dữ liệu nhập ----------
     Mỗi rule: { el, test, msg }. Ô nào để trống hoặc sai định dạng
     sẽ được đánh dấu đỏ kèm thông báo. */
  const checkAll = bindValidation([
    { el: "#rName", test: v => v.trim().length > 0, msg: "Vui lòng nhập họ và tên" },
    { el: "#rName", ...COMMON_RULES.name(2) },
    { el: "#rEmail", test: v => v.trim().length > 0, msg: "Vui lòng nhập email" },
    { el: "#rEmail", test: v => RE_EMAIL.test(v.trim()), msg: "Email không hợp lệ" },
    { el: "#rPhone", ...COMMON_RULES.phone(), msg: "Số điện thoại không hợp lệ (VD: 0912345678)" },
    {
      el: "#rPass",
      test: v => v.length >= MIN_PASSWORD,
      msg: `Mật khẩu tối thiểu ${MIN_PASSWORD} ký tự`
    },
    { el: "#rPass2", test: v => v.length > 0, msg: "Vui lòng xác nhận mật khẩu" },
    { el: "#rPass2", test: v => v === $("#rPass").value, msg: "Hai mật khẩu không khớp" }
  ]);

  /* Báo lỗi riêng cho ô email khi email đã được đăng ký.
     Truyền null hoặc rỗng nghĩa là xoá cảnh báo đi. */
  function setEmailError(msg) {
    const field = $("#rEmail").closest(".field");
    const hit = !!msg;
    field.classList.toggle("invalid", hit);
    $(".err", field).textContent = hit ? msg : "";
  }

  /* Đổi mật khẩu thì phải kiểm tra lại ô xác nhận cho khớp,
     và cập nhật lại thước đo độ mạnh */
  $("#rPass").addEventListener("input", e => {
    paintMeter(e.target.value);
    $("#rPass2").dispatchEvent(new Event("input"));
  });

  /* Người dùng đang sửa lại email thì bỏ luôn cảnh báo "đã đăng ký" */
  $("#rEmail").addEventListener("input", () => setEmailError(null));

  /* ---------- Xử lý đăng ký ---------- */
  $("#authForm").addEventListener("submit", e => {
    e.preventDefault();

    const allOk = checkAll();
    const agreed = $("#rAgree").checked;
    $("#agreeErr").style.display = agreed ? "none" : "block";

    const name = $("#rName").value.trim();
    const email = $("#rEmail").value.trim();
    const phone = $("#rPhone").value.trim();
    const pass = $("#rPass").value;

    /* Email đã được đăng ký hay chưa */
    const emailTaken = allOk && Accounts.isTaken(email);

    if (!allOk || emailTaken) {
      if (emailTaken) setEmailError("Email này đã được đăng ký, vui lòng dùng email khác");

      toast(emailTaken
        ? "Email này đã được đăng ký"
        : "Vui lòng kiểm tra lại các trường bị lỗi", "error");
      focusFirstError();
      return;
    }

    if (!agreed) {
      toast("Bạn cần đồng ý với điều khoản để tạo tài khoản", "error");
      $("#rAgree").focus();
      return;
    }

    const res = Accounts.register({ name, email, phone, password: pass });

    if (!res.ok) {
      toast(res.msg, "error");
      focusFirstError();
      return;
    }

    /* Đăng ký xong thì đăng nhập luôn cho khỏi phải nhập lại */
    Accounts.login(email, pass);
    renderAccountControl();

    toast(`Đăng ký thành công, chào mừng ${name}`, "success");
    setTimeout(() => { location.href = backTo; }, 900);
  });
};