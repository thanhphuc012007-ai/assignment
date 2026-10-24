/* =========================================================
   TÀI KHOẢN + LƯU TRỮ DỮ LIỆU

   Đồ án không có máy chủ, mọi dữ liệu được mô phỏng ngay trong
   trình duyệt bằng localStorage:
   - Store   : hàm đọc / ghi / xoá một khoá JSON, có bắt lỗi
   - Accounts: danh sách tài khoản, đăng ký, đăng nhập, đăng xuất
   Phiên đăng nhập chỉ lưu email, không lưu mật khẩu.
   ========================================================= */

/* Tên các khoá trong localStorage */
const KEY_CART = "phonestore.cart";
const KEY_ORDERS = "phonestore.orders";
const KEY_USERS = "phonestore.users";
const KEY_SESSION = "phonestore.session";

/* =========================================================
   Store - đọc / ghi dữ liệu dạng JSON trong localStorage
   ========================================================= */
const Store = {
  /* Trả về giá trị đã lưu, nếu chưa có hoặc JSON hỏng thì trả fallback */
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (err) {
      /* Safari ở chế độ riêng tư hoặc dữ liệu bị hỏng đều rơi vào đây */
      return fallback;
    }
  },

  /* Ghi xuống localStorage, trả false nếu trình duyệt chặn ghi */
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      /* không làm được thì kệ, không ảnh hưởng luồng chính */
    }
  }
};

/* =========================================================
   Accounts - đăng ký / đăng nhập / đăng xuất
   ========================================================= */
const Accounts = {
  /* Chuẩn hoá email về chữ thường, bỏ khoảng trắng thừa để
     "A@B.com" và "a@b.com" không tạo ra hai tài khoản khác nhau */
  normalize(email) {
    return String(email == null ? "" : email).trim().toLowerCase();
  },

  /* Tài khoản đang đăng nhập, hoặc null */
  current() {
    const email = Store.read(KEY_SESSION, "");
    if (!email) return null;
    return this.all().find(u => u.email === email) || null;
  },

  isLoggedIn() {
    return this.current() !== null;
  },

  /* Danh sách tài khoản trong localStorage.
     Lần đầu mở web sẽ nạp sẵn DEMO_ACCOUNT làm tài khoản thử nghiệm. */
  all() {
    const saved = Store.read(KEY_USERS, null);
    if (Array.isArray(saved)) return saved;

    const seeded = [Object.assign({}, DEMO_ACCOUNT, { email: this.normalize(DEMO_ACCOUNT.email) })];
    Store.write(KEY_USERS, seeded);
    return seeded;
  },

  /* Tìm tài khoản theo email */
  findByEmail(email) {
    const key = this.normalize(email);
    return this.all().find(u => u.email === key) || null;
  },

  /* Email đã có trong danh sách chưa */
  isTaken(email) {
    return this.findByEmail(email) !== null;
  },

  /* Tạo tài khoản mới. Trả { ok, msg, user } */
  register({ name, email, phone, password }) {
    const mail = this.normalize(email);

    if (this.isTaken(mail)) {
      return { ok: false, msg: "Email này đã được đăng ký, vui lòng dùng email khác" };
    }

    const user = {
      name: String(name).trim(),
      email: mail,
      phone: String(phone).trim(),
      password: password,
      createdAt: new Date().toLocaleString("vi-VN")
    };

    const list = this.all();
    list.push(user);
    if (!Store.write(KEY_USERS, list)) {
      return { ok: false, msg: "Không lưu được tài khoản, trình duyệt đang chặn lưu trữ" };
    }
    return { ok: true, user };
  },

  /* Kiểm tra đăng nhập. Trả { ok, msg, user } */
  login(email, password) {
    const user = this.findByEmail(email);

    if (!user) {
      return { ok: false, msg: "Email này chưa được đăng ký" };
    }
    if (user.password !== password) {
      return { ok: false, msg: "Mật khẩu không đúng, vui lòng thử lại" };
    }

    /* Chỉ lưu email trong phiên, không lưu mật khẩu */
    Store.write(KEY_SESSION, user.email);
    return { ok: true, user };
  },

  /* Đăng xuất: xoá phiên, giữ nguyên danh sách tài khoản */
  logout() {
    Store.remove(KEY_SESSION);
    return true;
  }
};

/* Chữ cái đầu của họ tên, dùng cho vòng tròn avatar trên header */
function initialOf(name) {
  const parts = String(name == null ? "" : name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  /* Hai chữ cái đầu nếu có họ và tên, ví dụ "Nguyễn Văn A" -> "NA" */
  if (parts.length >= 2) {
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

/* Độ dài tối thiểu của mật khẩu, dùng cho cả thước đo và thông báo lỗi */
const MIN_PASSWORD = 6;

/* Đường dẫn tương đối của trang đang mở, ví dụ "product.html?id=3" */
function hereUrl() {
  return location.pathname.split("/").pop() + location.search;
}

/* Trang đăng nhập / đăng ký, kèm trang muốn quay lại sau khi xong.
   Đang đứng ở chính trang đăng nhập thì không gửi "next" đi,
   nếu không sau khi đăng nhập xong sẽ quay lại login.html vô hạn */
function loginUrl(mode = "login", from) {
  const here = hereUrl();
  const isAuthPage = here.split("?")[0] === "login.html";
  const back = from || (isAuthPage ? "" : here);

  let url = "login.html?mode=" + mode;
  if (back) url += "&next=" + encodeURIComponent(back);
  return url;
}

/* Trang đăng ký, cùng kiểu trả về với loginUrl */
function registerUrl(from) {
  const here = hereUrl();
  if (here.split("?")[0] === "register.html") return "register.html";
  return "register.html?next=" + encodeURIComponent(here);
}

/* Chỉ nhận đường dẫn nội bộ dạng "ten-trang.html?a=b".
   Chặn javascript:, //ten-con, ..\ để không mở được trang ngoài ý muốn */
function safeNext(value) {
  const v = String(value == null ? "" : value).trim();
  if (!v) return "";
  if (v.includes("..") || v.includes(":") || v.includes("\\") || v.startsWith("/")) return "";
  return /^[\w.-]+\.html(\?[\w=&%.~-]*)?$/.test(v) ? v : "";
}