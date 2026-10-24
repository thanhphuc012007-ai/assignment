const PRODUCTS = [
  {
    id: 1, category: "Điện thoại", brand: "Apple", name: "iPhone 17 Pro Max 512GB",
    price: 45990000, oldPrice: 49990000, stock: 12, sold: 820, rating: 4.9, isNew: true, isHot: true,
    img: "assets/img/iphone-17-pro-max.webp",
    specs: ["6.9\" OLED", "A19 Pro", "512GB"], ram: "12GB", battery: "5000mAh",
    camera: "48MP + 48MP + 12MP", os: "iOS 19", screen: "LTPO Super Retina XDR 120Hz",
    chip: "Apple A19 Pro",
    desc: "Flagship của Apple với chip A19 Pro, màn hình ProMotion 120Hz và hệ thống camera 48MP chuyên nghiệp. Khung titanium nhẹ nhưng cứng cáp, pin cả ngày sử dụng thoải mái.",
    highlight: ["Khung titanium", "Sạc nhanh 45W", "Chống nước IP68"]
  },
  {
    id: 2, category: "Điện thoại", brand: "Apple", name: "iPhone 17 256GB",
    price: 28990000, oldPrice: 31990000, stock: 25, sold: 1450, rating: 4.8, isNew: true, isHot: true,
    img: "assets/img/iphone-17.jpg",
    specs: ["6.3\" OLED", "A19", "256GB"], ram: "8GB", battery: "3900mAh",
    camera: "48MP + 12MP", os: "iOS 19", screen: "Super Retina XDR 120Hz",
    chip: "Apple A19",
    desc: "Trải nghiệm iOS mượt mà trong thân máy gọn nhẹ, camera 48MP thế hệ mới và hiệu năng A19 mạnh mẽ cho mọi tác vụ.",
    highlight: ["Camera 48MP", "Nhẹ 177g", "Chống nước IP68"]
  },
  {
    id: 3, category: "Điện thoại", brand: "Samsung", name: "Galaxy S26 Ultra 512GB",
    price: 41990000, oldPrice: null, stock: 8, sold: 640, rating: 4.8, isNew: true, isHot: true,
    img: "assets/img/galaxy-s26-ultra.jpg",
    specs: ["6.9\" AMOLED", "Snapdragon 8 Elite", "512GB"], ram: "16GB", battery: "5200mAh",
    camera: "200MP + 12MP + 50MP", os: "Android 16", screen: "Dynamic AMOLED 2X 120Hz",
    chip: "Snapdragon 8 Elite Gen 2",
    desc: "Camera 200MP sắc nét nhất thị trường, bút S Pen tích hợp sẵn và màn hình AMOLED cao cấp. Mạnh mẽ từ hiệu năng đến khả năng sáng tạo.",
    highlight: ["Bút S Pen", "Zoom 100x", "Khung titanium"]
  },
  {
    id: 4, category: "Điện thoại", brand: "Samsung", name: "Galaxy S26 128GB",
    price: 21990000, oldPrice: 23990000, stock: 16, sold: 520, rating: 4.7, isNew: true,
    img: "assets/img/galaxy-s26.jpg",
    specs: ["6.2\" AMOLED", "Snapdragon 8 Elite", "128GB"], ram: "12GB", battery: "4200mAh",
    camera: "50MP + 12MP", os: "Android 16", screen: "Dynamic AMOLED 2X 120Hz",
    chip: "Snapdragon 8 Elite Gen 2",
    desc: "Phiên bản nhỏ gọn của dòng S26, cân bằng giữa hiệu năng và giá bán, phù hợp người dùng thích máy compact.",
    highlight: ["Màn hình 6.2\"", "AI Camera", "Sạc 45W"]
  },
  {
    id: 5, category: "Điện thoại", brand: "Xiaomi", name: "Xiaomi 16 Pro 512GB",
    price: 25990000, oldPrice: 28990000, stock: 18, sold: 980, rating: 4.7, isNew: true, isHot: true,
    img: "assets/img/xiaomi-16-pro.webp",
    specs: ["6.73\" AMOLED", "Snapdragon 8 Elite", "512GB"], ram: "16GB", battery: "6100mAh",
    camera: "50MP + 50MP + 50MP", os: "Android 16", screen: "LTPO AMOLED 120Hz",
    chip: "Snapdragon 8 Elite Gen 2",
    desc: "Cấu hình khủng, sạc nhanh 90W và hệ thống 3 camera 50MP ống kính Leica. Pin 6100mAh cho thời gian sử dụng rất dài.",
    highlight: ["Ống kính Leica", "Sạc 90W", "Pin 6100mAh"]
  },
  {
    id: 6, category: "Điện thoại", brand: "Xiaomi", name: "Redmi Note 15 Pro 256GB",
    price: 8490000, oldPrice: 9990000, stock: 45, sold: 3200, rating: 4.6, isNew: false, isHot: true,
    img: "assets/img/redmi-note-15-pro.jpg",
    specs: ["6.67\" AMOLED", "Dimensity 7400", "256GB"], ram: "12GB", battery: "5500mAh",
    camera: "200MP + 8MP", os: "Android 16", screen: "AMOLED 120Hz",
    chip: "Dimensity 7400-Ultra",
    desc: "Vua tầm trung với camera 200MP, pin 5500mAh và sạc nhanh 67W. Đây là lựa chọn đáng tiề nhất trong phân khúc dưới 10 triệu.",
    highlight: ["Camera 200MP", "Sạc 67W", "Loa stereo"]
  },
  {
    id: 7, category: "Điện thoại", brand: "OPPO", name: "OPPO Find X9 Pro 256GB",
    price: 31990000, oldPrice: 34990000, stock: 14, sold: 560, rating: 4.7, isNew: true,
    img: "assets/img/oppo-find-x9-pro.jpg",
    specs: ["6.78\" AMOLED", "Dimensity 9500", "256GB"], ram: "16GB", battery: "5800mAh",
    camera: "50MP + 50MP + 50MP", os: "Android 16", screen: "LTPO AMOLED 120Hz",
    chip: "Dimensity 9500",
    desc: "Thiết kế cao cấp, camera Hasselblad và sạc siêu nhanh 120W. Màn hình LTPO tiết kiệm pin thông minh.",
    highlight: ["Camera Hasselblad", "Sạc 120W", "Chống nước IP69"]
  },
  {
    id: 8, category: "Điện thoại", brand: "vivo", name: "vivo X300 Pro 512GB",
    price: 34990000, oldPrice: null, stock: 9, sold: 430, rating: 4.6, isNew: true,
    img: "assets/img/vivo-x300-pro.jpg",
    specs: ["6.78\" AMOLED", "Dimensity 9500", "512GB"], ram: "16GB", battery: "6000mAh",
    camera: "50MP + 200MP + 50MP", os: "Android 16", screen: "LTPO AMOLED 120Hz",
    chip: "Dimensity 9500",
    desc: "Zoom viễn vọng 200MP và màn hình LTPO cao cấp, trải nghiệm camera di động đỉnh cao nhờ ống kính Zeiss chuẩn xắc thang.",
    highlight: ["Telezoom 200MP", "Ống kính Zeiss", "Sạc 100W"]
  },
  {
    id: 9, category: "Điện thoại", brand: "realme", name: "realme GT 8 256GB",
    price: 11990000, oldPrice: 13990000, stock: 30, sold: 1600, rating: 4.5, isNew: false, isHot: true,
    img: "assets/img/realme-gt-8.webp",
    specs: ["6.78\" AMOLED", "Snapdragon 8 Elite", "256GB"], ram: "12GB", battery: "5500mAh",
    camera: "50MP + 8MP", os: "Android 16", screen: "AMOLED 144Hz",
    chip: "Snapdragon 8 Elite",
    desc: "Hiệu năng cao cấp trong tầm giá tầm trung, màn hình 144Hz cực mượt cho game thủ và hệ thống tản nhiệt tiên tiến.",
    highlight: ["Màn hình 144Hz", "Tản nhiệt vapor", "Sạc 120W"]
  },
  {
    id: 10, category: "Điện thoại", brand: "Apple", name: "iPhone 16e 128GB",
    price: 13990000, oldPrice: 15990000, stock: 22, sold: 720, rating: 4.4, isNew: false,
    img: "assets/img/iphone-16e.jpg",
    specs: ["6.1\" OLED", "A18", "128GB"], ram: "8GB", battery: "4000mAh",
    camera: "48MP", os: "iOS 19", screen: "Super Retina XDR 60Hz",
    chip: "Apple A18",
    desc: "Phiên bản iPhone giá rẻ nhất với chip A18, hỗ trợ 5G và Apple Intelligence. Phù hợp người mới chuyển từ Android sang iOS.",
    highlight: ["Hỗ trợ 5G", "Giá dễ tiếp cận", "Nhẹ 167g"]
  },
  {
    id: 11, category: "Điện thoại", brand: "Samsung", name: "Galaxy Z Fold7 512GB",
    price: 49990000, oldPrice: 54990000, stock: 5, sold: 210, rating: 4.5, isNew: true,
    img: "assets/img/galaxy-z-fold7.jpg",
    specs: ["7.6\" Gập", "Snapdragon 8 Elite", "512GB"], ram: "12GB", battery: "4400mAh",
    camera: "50MP + 12MP + 10MP", os: "Android 16", screen: "Foldable 120Hz",
    chip: "Snapdragon 8 Elite",
    desc: "Điện thoại gập cao cấp với màn hình lớn 7.6 inch, mỏng nhất thị trường và bút S Pen Fold tích hợp.",
    highlight: ["Màn hình gập 7.6\"", "Mỏng 8.9mm", "S Pen Fold"]
  },
  {
    id: 12, category: "Điện thoại", brand: "Xiaomi", name: "POCO X7 Pro 256GB",
    price: 8990000, oldPrice: 9990000, stock: 33, sold: 1900, rating: 4.4, isNew: false,
    img: "assets/img/poco-x7-pro.jpg",
    specs: ["6.67\" AMOLED", "Dimensity 8400", "256GB"], ram: "12GB", battery: "6000mAh",
    camera: "50MP + 8MP", os: "Android 16", screen: "AMOLED 120Hz",
    chip: "Dimensity 8400",
    desc: "Hiệu năng mạnh vượt trội trong phân khúc giá, pin 6000mAh cực lớn và màn hình AMOLED 120Hz.",
    highlight: ["Pin 6000mAh", "Chip Dimensity 8400", "Giá/số hiệu năng tốt"]
  },
  {
    id: 13, category: "Điện thoại", brand: "OPPO", name: "OPPO Reno13 256GB",
    price: 9490000, oldPrice: 10990000, stock: 28, sold: 870, rating: 4.4, isNew: true,
    img: "assets/img/oppo-reno13.jpg",
    specs: ["6.7\" AMOLED", "Dimensity 7300", "256GB"], ram: "8GB", battery: "5000mAh",
    camera: "50MP + 8MP", os: "Android 15", screen: "AMOLED 120Hz",
    chip: "Dimensity 7300",
    desc: "Mẫu điện thoại mỏng nhẹ với thiết kế thời thượng, camera 50MP và sạc nhanh 80W trong thân máy chỉ 7.6mm.",
    highlight: ["Mỏng 7.6mm", "Sạc 80W", "Nhẹ 181g"]
  },
  {
    id: 14, category: "Điện thoại", brand: "vivo", name: "vivo Y39 128GB",
    price: 5490000, oldPrice: 6490000, stock: 40, sold: 1300, rating: 4.2, isNew: false,
    img: "assets/img/vivo-y39.jpg",
    specs: ["6.5\" AMOLED", "Snapdragon 4 Gen", "128GB"], ram: "6GB", battery: "6000mAh",
    camera: "50MP + 2MP", os: "Android 15", screen: "AMOLED 90Hz",
    chip: "Snapdragon 4 Gen 2",
    desc: "Lựa chọn giá rẻ cho nhu cầu cơ bản, pin 6000mAh cực lớn giúp dùng cả ngày không lo hết.",
    highlight: ["Pin 6000mAh", "Giá rẻ", "Màn hình AMOLED"]
  },
  {
    id: 15, category: "Điện thoại", brand: "realme", name: "realme 14 128GB",
    price: 6290000, oldPrice: null, stock: 36, sold: 640, rating: 4.3, isNew: false,
    img: "assets/img/realme-14.jpg",
    specs: ["6.6\" AMOLED", "Helio G100", "128GB"], ram: "8GB", battery: "5000mAh",
    camera: "50MP + 2MP", os: "Android 15", screen: "AMOLED 120Hz",
    chip: "Helio G100",
    desc: "Điện thoại bền bỉ với khả năng chống nước IP69, màn hình 120Hz và pin 5000mAh sử dụng thoải mái.",
    highlight: ["Chống nước IP69", "Màn hình 120Hz", "Pin 5000mAh"]
  },
  {
    id: 16, category: "Điện thoại", brand: "Apple", name: "iPhone 17 Plus 512GB",
    price: 32990000, oldPrice: 35990000, stock: 11, sold: 480, rating: 4.8, isNew: true, isHot: true,
    img: "assets/img/iphone-17-plus.jpg",
    specs: ["6.7\" OLED", "A19 Pro", "512GB"], ram: "12GB", battery: "4600mAh",
    camera: "48MP + 12MP", os: "iOS 19", screen: "Super Retina XDR 120Hz",
    chip: "Apple A19 Pro",
    desc: "Bản Plus với màn hình lớn 6.7 inch và thời lượng pin tốt hơn bản tiêu chuẩn, vẫn giữ chip A19 Pro cao cấp.",
    highlight: ["Màn hình 6.7\"", "Chip A19 Pro", "Bộ nhớ 512GB"]
  },
  {
    id: 17, category: "Điện thoại", brand: "Apple", name: "iPhone Air 256GB",
    price: 23390000, oldPrice: 31990000, stock: 10, sold: 520, rating: 4.8, isNew: true, isHot: true,
    img: "assets/img/iphone-air-256.jpg",
    specs: ["6.5\" OLED", "Apple A19 Pro", "256GB"], ram: "12GB", battery: "4600mAh",
    camera: "48MP + 12MP", os: "iOS 19", screen: "Super Retina XDR 120Hz",
    chip: "Apple A19 Pro",
    desc: "Dòng iPhone Air mỏng nhất từ trước đến nay chỉ 5.6mm, nhẹ hơn 30g so với iPhone thường nhưng vẫn giữ chip A19 Pro và camera 48MP.",
    highlight: ["Siêu mỏng 5.6mm", "Chip A19 Pro", "Nhẹ 162g"]
  },
  {
    id: 18, category: "Điện thoại", brand: "Samsung", name: "Galaxy A57 5G 128GB",
    price: 11390000, oldPrice: 13490000, stock: 38, sold: 1420, rating: 4.6, isNew: false, isHot: true,
    img: "assets/img/galaxy-a57.jpg",
    specs: ["6.7\" AMOLED", "Exynos 1580", "128GB"], ram: "8GB", battery: "5000mAh",
    camera: "50MP + 12MP + 5MP", os: "Android 16", screen: "Super AMOLED 120Hz",
    chip: "Exynos 1580",
    desc: "Dòng Galaxy A mới nhất nổi bật với màn hình AMOLED 120Hz, chống nước IP67 và bảo hành 4 năm cập nhật hệ điều hành.",
    highlight: ["Chống nước IP67", "Màn hình 120Hz", "Cập nhật 4 năm"]
  },
  {
    id: 19, category: "Điện thoại", brand: "Xiaomi", name: "Redmi Note 17 Pro Max 512GB",
    price: 16190000, oldPrice: 17990000, stock: 15, sold: 690, rating: 4.7, isNew: true,
    img: "assets/img/redmi-note-17-pro-max.jpg",
    specs: ["6.83\" AMOLED", "Dimensity 9400+", "512GB"], ram: "12GB", battery: "5500mAh",
    camera: "50MP + 13MP + 50MP", os: "Android 16", screen: "LTPO AMOLED 144Hz",
    chip: "Dimensity 9400+",
    desc: "Hiệu năng hàng đầu với chip Dimensity 9400+, màn hình 144Hz sắc nét và hệ camera Leica chuyên chụp chân dung.",
    highlight: ["Màn hình 144Hz", "Ống kính Leica", "Sạc 90W"]
  },
  {
    id: 20, category: "Điện thoại", brand: "OPPO", name: "OPPO A6 Pro 256GB",
    price: 9990000, oldPrice: null, stock: 42, sold: 1150, rating: 4.5, isNew: false, isHot: true,
    img: "assets/img/oppo-a6-pro.jpg",
    specs: ["6.7\" AMOLED", "Dimensity 6300", "256GB"], ram: "8GB", battery: "5800mAh",
    camera: "50MP + 2MP", os: "Android 15", screen: "AMOLED 120Hz",
    chip: "Dimensity 6300",
    desc: "Máy tầm trung bền bỉ với pin 5800mAh, chống nước IP65 và thiết kế mỏng nhẹ chỉ 7.8mm.",
    highlight: ["Pin 5800mAh", "Chống nước IP65", "Mỏng 7.8mm"]
  },
  {
    id: 21, category: "Điện thoại", brand: "vivo", name: "vivo Y28 256GB",
    price: 6490000, oldPrice: null, stock: 26, sold: 830, rating: 4.4, isNew: false,
    img: "assets/img/vivo-y28.jpg",
    specs: ["6.56\" LCD", "Snapdragon 680", "256GB"], ram: "8GB", battery: "6000mAh",
    camera: "50MP + 2MP", os: "Android 15", screen: "LCD 90Hz",
    chip: "Snapdragon 680",
    desc: "Máy tầm trung pin trâu với dung lượng 6000mAh, thiết kế bo tròn mềm mại và cảm biến vân tay chìa khóa.",
    highlight: ["Pin 6000mAh", "Bộ nhớ 256GB", "Sạc nhanh 44W"]
  },
  {
    id: 22, category: "Điện thoại", brand: "realme", name: "realme 13+ 5G 256GB",
    price: 6590000, oldPrice: 9490000, stock: 34, sold: 960, rating: 4.5, isNew: false, isHot: true,
    img: "assets/img/realme-13-plus.jpg",
    specs: ["6.72\" AMOLED", "Snapdragon 7s Gen 2", "256GB"], ram: "8GB", battery: "5000mAh",
    camera: "50MP + 8MP", os: "Android 14", screen: "AMOLED 120Hz",
    chip: "Snapdragon 7s Gen 2",
    desc: "Lựa chọn giá rẻ có mạng 5G và màn hình AMOLED 120Hz, cấu hình mạnh so với giá bán trong phân khúc dưới 7 triệu.",
    highlight: ["Hỗ trợ 5G", "Màn hình AMOLED 120Hz", "Sạc nhanh 67W"]
  },
  {
    id: 23, category: "Phụ kiện", brand: "Apple", name: "Tai nghe Bluetooth AirPods 4",
    price: 3390000, oldPrice: 3790000, stock: 200, sold: 380, rating: 4.7, isNew: false, isHot: true,
    img: "assets/img/airpods-4.jpg",
    specs: ["Bluetooth 5.3", "Chống nướng", "Hộp sạc"], ram: "", battery: "Nghe 5h", camera: "",
    os: "Tương thích iOS và Android", screen: "", chip: "Apple H2",
    desc: "Tai nghe không dây thế hệ mới với chip Apple H2, chất âm được nâng cấp và hộp sạc nâng cấp cho đến 30 giờ nghe nhạc.",
    highlight: ["Chip Apple H2", "Nghe đến 5 giờ", "Chống nướng IP57"]
  },
  {
    id: 24, category: "Phụ kiện", brand: "Apple", name: "Cáp Type-C - Lightning 1m",
    price: 520000, oldPrice: 590000, stock: 250, sold: 460, rating: 4.6, isNew: false,
    img: "assets/img/cap-type-c-lightning.jpg",
    specs: ["1 mét", "Type-C", "Lightning"], ram: "", battery: "", camera: "",
    os: "Tương thích mọi thiết bị", screen: "", chip: "Chuẩn sạc nhanh 87W",
    desc: "Cáp chính hãng bền bỉ, đầu Type-C kết nối sang cổng Lightning, hỗ trợ sạc nhanh tối đa 87W.",
    highlight: ["Sạc nhanh 87W", "Vừa sạc vừa truyền dữ liệu", "Chiều dài 1 mét"]
  },
  {
    id: 25, category: "Phụ kiện", brand: "Samsung", name: "Sạc nhanh Samsung 45W T4511",
    price: 570000, oldPrice: 890000, stock: 180, sold: 300, rating: 4.5, isNew: false,
    img: "assets/img/samsung-charger-45w.jpg",
    specs: ["45W", "USB-C PD", "1 cổng"], ram: "", battery: "", camera: "",
    os: "Tương thích mọi thiết bị", screen: "", chip: "Power Delivery 3.0",
    desc: "Củ sạc chính hãng Samsung công suất 45W theo chuẩn Power Delivery, dùng kèm củ sạc Type-C trong hộp.",
    highlight: ["Công suất 45W", "Chuẩn PD 3.0", "Sạc nhanh dòng Galaxy"]
  },
  {
    id: 26, category: "Phụ kiện", brand: "Xiaomi", name: "Pin sạc dự phòng Xiaomi 10.000mAh",
    price: 390000, oldPrice: 470000, stock: 120, sold: 240, rating: 4.6, isNew: false,
    img: "assets/img/xiaomi-power-bank.jpg",
    specs: ["10.000 mAh", "Sạc nhanh 22.5W", "Cáp Type-C"], ram: "", battery: "10000mAh", camera: "",
    os: "Tương thích mọi thiết bị", screen: "", chip: "Sạc nhanh 22.5W",
    desc: "Pin dự phòng 10.000mAh tích hợp sẵn cáp Type-C, sạc nhanh 22.5W và có đèn báo dung lượng.",
    highlight: ["10.000 mAh", "Sạc nhanh 22.5W", "Cáp Type-C tích hợp"]
  }
];

/* =========================================================
   DANH MỤC SẢN PHẨM
   "danh mục" là thuộc tính bắt buộc của mỗi sản phẩm, dùng để
   lọc danh sách. Sản phẩm dùng category để đóng gói theo nhóm.
   ========================================================= */
const CATEGORIES = ["Tất cả", "Điện thoại", "Phụ kiện"];

/* Tiêu đề trang tương ứng với từng danh mục, dùng cho thẻ <h1> */
const CATEGORY_TITLES = {
  "Tất cả": "Tất cả sản phẩm",
  "Điện thoại": "Danh sách điện thoại",
  "Phụ kiện": "Danh sách phụ kiện"
};

/* Giỏ hàng mẫu nạp sẵn lần đầu khi người dùng chưa có dữ liệu.
   Mỗi phần tử gồm mã sản phẩm (id) và số lượng (qty). */
const DEFAULT_CART = [
  { id: 6, qty: 1 },
  { id: 9, qty: 2 },
  { id: 14, qty: 1 }
];

/* Tài khoản thử nghiệm nạp sẵn, dùng để đăng nhập khi chưa đăng ký.
   Đây là dữ liệu mô phỏng, chỉ tồn tại trong trình duyệt của người dùng. */
const DEMO_ACCOUNT = {
  name: "Nguyễn Văn A",
  email: "demo@phonestore.vn",
  phone: "0912345678",
  password: "123456"
};

const BRANDS = ["Tất cả", "Apple", "Samsung", "Xiaomi", "OPPO", "vivo", "realme"];

const PRICE_RANGES = [
  { label: "Tất cả mức giá", min: 0, max: Infinity },
  { label: "Dưới 7 triệu", min: 0, max: 7000000 },
  { label: "7 - 15 triệu", min: 7000000, max: 15000000 },
  { label: "15 - 25 triệu", min: 15000000, max: 25000000 },
  { label: "Trên 25 triệu", min: 25000000, max: Infinity }
];

const SHOP = {
  name: "PhoneStore", hotline: "1900 6868", email: "hotro@phonestore.vn",
  address: "123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh", freeShipThreshold: 10000000, shipFee: 30000,
  /* Đơn từ bigOrderThreshold trở lên được giảm bigOrderRate */
  bigOrderThreshold: 30000000,
  bigOrderRate: 0.05
};

/* =========================================================
   DỮ LIỆU HIỂN THỊ - gom toàn bộ nội dung tĩnh sang đây
   để HTML chỉ còn khung, mọi thứ được sinh ra bằng JS
   ========================================================= */

/* Số liệu trang chủ: stat = "total" sẽ tự lấy theo PRODUCTS */
const HERO_STATS = [
  { stat: "total", label: "Sản phẩm đang bán" },
  { stat: "50K+", label: "Khách hàng" },
  { stat: "4.9/5", label: "Đánh giá" },
  { stat: "12 tháng", label: "Bảo hành" }
];

/* Thẻ ưu đãi */
const PROMOS = [
  { cls: "promo-1", tag: "Giảm ngay", value: "500K", desc: "Khi mua iPhone dòng Pro tại cửa hàng", href: "products.html?brand=Apple", cta: "Khám phá ngay" },
  { cls: "promo-2", tag: "Trả góp 0%", value: "12 tháng", desc: "Áp dụng cho tất cả sản phẩm chính hãng", href: "products.html", cta: "Xem sản phẩm" },
  { cls: "promo-3", tag: "Thu cũ đổi mới", value: "+1 triệu", desc: "Thu cũ bất kỳ hãng nào, tặng thêm 1 triệu", href: "index.html#lien-he", cta: "Đăng ký ngay" }
];

/* Tính năng nổi bật */
const FEATURES = [
  { icon: "shield", title: "Bảo hành 12 tháng", desc: "Chính hãng, đổi mới trong 30 ngày" },
  { icon: "truck", title: "Giao hàng nhanh", desc: "2h nội thành, 24h toàn quốc" },
  { icon: "wallet", title: "Trả góp 0%", desc: "Thủ tục nhanh gọn, không cần CCCD" },
  { icon: "refresh", title: "Thu cũ đổi mới", desc: "Thu cũ bất kỳ hãng nào" }
];

/* Biểu mẫu liên hệ */
const CONTACT_SUBJECTS = [
  "Tư vấn mua điện thoại",
  "Hỏi về chính sách bảo hành",
  "Đổi trả sản phẩm",
  "Hợp tác đại lý",
  "Khác"
];

/* Thông tin liên hệ: shop = lấy giá trị tương ứng trong SHOP */
const CONTACT_INFO = [
  { icon: "truck", title: "Hotline", shop: "hotline", suffix: " &middot; 8:00 - 22:00" },
  { icon: "tag", title: "Email", shop: "email" },
  { icon: "shield", title: "Cửa hàng", shop: "address" },
  { icon: "refresh", title: "Đổi trả", text: "Trong vòng 15 ngày, sản phẩm nguyên seal" }
];

/* Bộ lọc trang sản phẩm */
const FILTERS = {
  cats: CATEGORIES,
  brands: BRANDS,
  prices: PRICE_RANGES,
  flags: [
    { key: "new", label: "Mới về" }, { key: "hot", label: "Bán chạy" },
    { key: "sale", label: "Đang giảm giá" }, { key: "installment", label: "Trả góp 0%" }
  ],
  sorts: [
    { value: "popular", label: "Bán chạy nhất" }, { value: "new", label: "Mới về" },
    { value: "discount", label: "Giảm giá nhiều nhất" }, { value: "price-asc", label: "Giá: thấp đến cao" },
    { value: "price-desc", label: "Giá: cao đến thấp" }, { value: "rating", label: "Đánh giá cao nhất" }
  ],
  installmentMin: 9000000
};

/* Thanh toán */
const PAYMENTS = [
  { value: "cod", title: "Thanh toán khi nhận hàng (COD)", desc: "Kiểm tra máy rồi thanh toán cho shipper", logo: "COD" },
  { value: "momo", title: "Ví MoMo", desc: "Quét mã QR bằng ứng dụng MoMo", logo: "MoMo" },
  { value: "zalopay", title: "Ví ZaloPay", desc: "Thanh toán nhanh qua ZaloPay", logo: "ZaloPay" },
  { value: "card", title: "Thẻ tín dụng / ATM", desc: "Visa, Mastercard, Napas", logo: "Visa" },
  { value: "installment", title: "Trả góp 0%", desc: "Khoản vay 0% trong 6 - 12 tháng", logo: "FE Credit" }
];

/* Tỉnh thành giao hàng */
const CITIES = [
  "Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Biên Hòa", "Nha Trang"
];
