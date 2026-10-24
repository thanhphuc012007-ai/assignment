/* =========================================================
   TRANG SẢN PHẨM - lọc, sắp xếp, tìm kiếm
   ========================================================= */
PAGES.products = function () {
  const FLAGS = FILTERS.flags;

  /* Đọc bộ lọc từ URL.
     Bắt buộc phải kiểm tra giá trị hợp lệ trước, vì người dùng có thể
     gõ tay sai (ví dụ ?price=abc) và làm trang bị lỗi. */
  function readStateFromUrl() {
    const catParam = getParam("cat") || "Tất cả";
    const brandParam = getParam("brand") || "Tất cả";
    const priceParam = Number(getParam("price") || 0);
    const flagParam = (getParam("flag") || "").split(",");
    const sortParam = getParam("sort") || "popular";

    return {
      q: getParam("q") || "",
      cat: CATEGORIES.indexOf(catParam) >= 0 ? catParam : "Tất cả",
      brand: BRANDS.indexOf(brandParam) >= 0 ? brandParam : "Tất cả",
      priceIdx: PRICE_RANGES[priceParam] ? priceParam : 0,
      flags: new Set(flagParam.filter(f => FLAGS.some(x => x.key === f))),
      sort: FILTERS.sorts.some(s => s.value === sortParam) ? sortParam : "popular"
    };
  }

  const state = readStateFromUrl();

  const pageSize = 9;
  let shown = pageSize;

  const loadMoreWrap = $("#loadMoreWrap");
  const loadMoreBtn = $("#loadMore");

  /* ---------- Lọc dữ liệu từ PRODUCTS ----------
     skip cho phép bỏ qua một nhóm điều kiện khi cần đếm.
     Ví dụ đếm số máy của từng hãng thì không áp bộ lọc hãng,
     nếu không thì các hãng khác luôn ra 0. */
  function applyFilters(skip) {
    const range = PRICE_RANGES[state.priceIdx] || PRICE_RANGES[0];
    const q = state.q.trim().toLowerCase();

    return PRODUCTS.filter(p => {
      if (skip !== "cat" && state.cat !== "Tất cả" && p.category !== state.cat) return false;
      if (skip !== "brand" && state.brand !== "Tất cả" && p.brand !== state.brand) return false;
      if (skip !== "price" && (p.price < range.min || p.price >= range.max)) return false;
      if (skip !== "flags") {
        if (state.flags.has("new") && !p.isNew) return false;
        if (state.flags.has("hot") && !p.isHot) return false;
        if (state.flags.has("sale") && discountPercent(p) <= 0) return false;
        if (state.flags.has("installment") && p.price < FILTERS.installmentMin) return false;
      }
      if (q) {
        const hay = `${p.name} ${p.brand} ${p.chip} ${p.specs.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function getList() {
    const sorters = {
      popular: (a, b) => b.sold - a.sold,
      new: (a, b) => b.isNew - a.isNew,
      discount: (a, b) => discountPercent(b) - discountPercent(a),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating
    };
    return applyFilters().sort(sorters[state.sort] || sorters.popular);
  }

  /* ---------- Sidebar ---------- */
  function renderSidebar() {
    /* Lưu vị trí cuộn trước khi vẽ lại danh sách, vì thay nội dung
       sẽ đưa scrollTop về 0 */
    const scroller = $("#sideBrands");
    const keepScroll = scroller.scrollTop;

    /* Số đếm chỉ tính trong phạm vi các bộ lọc còn lại, nhờ vậy
       người dùng thấy ngay nếu bấm vào một mục sẽ còn bao nhiêu sản phẩm */

    /* Danh mục: bỏ qua bộ lọc danh mục, nếu không các mục khác luôn ra 0 */
    const catPool = applyFilters("cat");
    $("#sideCats").innerHTML = CATEGORIES.map(c => {
      const count = c === "Tất cả" ? catPool.length : catPool.filter(p => p.category === c).length;
      return `<button class="${state.cat === c ? "active" : ""}" data-cat="${c}" ${count === 0 ? "disabled" : ""}>
        ${c}<span class="count">${count}</span></button>`;
    }).join("");

    const pool = applyFilters("brand");
    $("#sideBrands").innerHTML = BRANDS.map(b => {
      const count = b === "Tất cả" ? pool.length : pool.filter(p => p.brand === b).length;
      return `<button class="${state.brand === b ? "active" : ""}" data-brand="${b}" ${count === 0 ? "disabled" : ""}>
        ${b}<span class="count">${count}</span></button>`;
    }).join("");

    const pricePool = applyFilters("price");
    $("#sidePrices").innerHTML = PRICE_RANGES.map((r, i) => {
      const count = pricePool.filter(p => p.price >= r.min && p.price < r.max).length;
      return `<button class="${state.priceIdx === i ? "active" : ""}" data-price="${i}" ${count === 0 ? "disabled" : ""}>
        ${r.label}<span class="count">${count}</span></button>`;
    }).join("");

    /* Checkbox đặc điểm chỉ dựng một lần, các lần render sau chỉ
      cập nhật trạng thái checked - tránh mất focus khi vừa bấm xong
      thì phần tử bị thay thế, và không làm mất vị trí cuộn */
    if (!$("#sideFlags").dataset.ready) {
      $("#sideFlags").innerHTML = FLAGS.map(f => `
        <label class="check-row">
          <input type="checkbox" data-flag="${f.key}">
          ${f.label}
        </label>`).join("");
      $("#sideFlags").dataset.ready = "1";
    }
    $$("#sideFlags [data-flag]").forEach(input => { input.checked = state.flags.has(input.dataset.flag); });

    /* Giữ nguyên vị trí cuộn của khung thương hiệu sau khi vẽ lại */
    scroller.scrollTop = keepScroll;
  }

  /* ---------- Chips đang lọc ---------- */
  function renderChips() {
    const chips = [];
    if (state.q) chips.push({ label: `Tìm: "${state.q}"`, clear: "q" });
    if (state.cat !== "Tất cả") chips.push({ label: state.cat, clear: "cat" });
    if (state.brand !== "Tất cả") chips.push({ label: state.brand, clear: "brand" });
    if (state.priceIdx !== 0) chips.push({ label: PRICE_RANGES[state.priceIdx].label, clear: "price" });
    state.flags.forEach(f => chips.push({ label: FLAGS.find(x => x.key === f).label, clear: "flag", val: f }));

    $("#activeChips").innerHTML = chips.map(c => `
      <span class="chip">${c.label}
        <button data-clear="${c.clear}" data-val="${c.val || ""}" aria-label="Bỏ lọc">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </span>`).join("");
  }

  /* ---------- Tiêu đề phụ động ----------
     Cập nhật mỗi lần render, nếu không khi đổi bộ lọc
     câu mô tả vẫn giữ nội dung của lần tải trang đầu tiên */
  function renderSubtitle() {
    const parts = [];
    if (state.cat !== "Tất cả") parts.push(state.cat.toLowerCase());
    if (state.brand !== "Tất cả") parts.push(`điện thoại ${state.brand}`);
    if (state.q) parts.push(`từ khóa "${state.q}"`);

    /* <h1> đổi theo danh mục đang chọn */
    $("#pageTitle").textContent = CATEGORY_TITLES[state.cat] || CATEGORY_TITLES["Tất cả"];

    $("#pageSub").textContent = parts.length
      ? `Đang hiển thị ${parts.join(" ")} · ${PRODUCTS.length} mẫu trong kho.`
      : "Chính hãng 100%, bảo hành 12 tháng, trả góp 0% không cần thẻ tín dụng.";
  }

  /* ---------- Danh sách ---------- */
  function render() {
    const list = getList();
    renderSidebar();
    renderChips();
    renderSubtitle();
    $("#sortSelect").value = state.sort;
    $("#resultCount").textContent = list.length;
    $("#emptyState").hidden = list.length > 0;

    renderGrid("#productGrid", list.slice(0, shown));
    $$("#productGrid .card").forEach(el => el.classList.add("reveal", "in"));

    /* Hết sản phẩm thì ẩn nút "Xem thêm" đi */
    const left = list.length - shown;
    loadMoreWrap.hidden = left <= 0;
    if (left > 0) loadMoreBtn.textContent = `Xem thêm ${Math.min(left, pageSize)} sản phẩm`;

    /* Đếm xem người dùng đang bật bao nhiêu điều kiện lọc */
    const badge = $("#filterCount");
    const activeCount = (state.cat !== "Tất cả" ? 1 : 0) + (state.brand !== "Tất cả" ? 1 : 0)
      + (state.priceIdx !== 0 ? 1 : 0) + state.flags.size;
    badge.hidden = activeCount === 0;
    badge.textContent = activeCount;

    /* Số kết quả hiện trên nút "Xem ... sản phẩm" */
    $("#sidebarCount").textContent = list.length;
  }

  function pushQuery() {
    const p = new URLSearchParams();
    if (state.q) p.set("q", state.q);
    if (state.cat !== "Tất cả") p.set("cat", state.cat);
    if (state.brand !== "Tất cả") p.set("brand", state.brand);
    if (state.priceIdx) p.set("price", state.priceIdx);
    if (state.flags.size) p.set("flag", [...state.flags].join(","));
    if (state.sort !== "popular") p.set("sort", state.sort);
    history.replaceState(null, "", "products.html" + (p.toString() ? "?" + p : ""));
  }

  function update(patch, resetShown = true) {
    Object.assign(state, patch);
    if (resetShown) shown = pageSize;
    pushQuery();
    render();
  }

  /* ---------- Sự kiện ---------- */
  document.addEventListener("click", e => {
    const c = e.target.closest("[data-cat]");
    if (c) { update({ cat: c.dataset.cat }); return; }

    const b = e.target.closest("[data-brand]");
    if (b) { update({ brand: b.dataset.brand }); return; }

    const pr = e.target.closest("[data-price]");
    if (pr) { update({ priceIdx: Number(pr.dataset.price) }); return; }

    const cl = e.target.closest("[data-clear]");
    if (cl) {
      const kind = cl.dataset.clear;
      if (kind === "q") update({ q: "" });
      else if (kind === "cat") update({ cat: "Tất cả" });
      else if (kind === "brand") update({ brand: "Tất cả" });
      else if (kind === "price") update({ priceIdx: 0 });
      else if (kind === "flag") { state.flags.delete(cl.dataset.val); update({}); }
      return;
    }

    if (e.target.closest("#resetAll") || e.target.closest("#resetEmpty")) {
      state.flags.clear();
      update({ q: "", cat: "Tất cả", brand: "Tất cả", priceIdx: 0 });
      toast("Đã xóa tất cả bộ lọc");
    }
  });

  /* Nút "Xem thêm": hiện thêm một trang sản phẩm nữa */
  loadMoreBtn.addEventListener("click", () => { shown = shown + pageSize; render(); });

  /* ---------- Bộ lọc trên màn hình nhỏ ----------
     Trên điện thoại khung bộ lọc khá dài, đẩy hết sản phẩm xuống dưới màn hình.
     Nên mặc định ẩn đi, chỉ mở ra khi bấm nút "Bộ lọc". */
  const sidebar = $("#sidebar");
  const filterToggle = $("#filterToggle");

  function closeSidebar() {
    sidebar.classList.remove("open");
    filterToggle.classList.remove("active");
  }

  filterToggle.addEventListener("click", () => {
    /* classList.toggle trả về true nếu vừa thêm class, false nếu vừa gỡ */
    const isOpen = sidebar.classList.toggle("open");
    filterToggle.classList.toggle("active", isOpen);
  });

  $("#closeSidebar").addEventListener("click", closeSidebar);
  $("#applyFilter").addEventListener("click", closeSidebar);

  document.addEventListener("change", e => {
    const flag = e.target.closest("[data-flag]");
    if (flag) {
      if (flag.checked) state.flags.add(flag.dataset.flag);
      else state.flags.delete(flag.dataset.flag);
      update({});
      return;
    }
    if (e.target.id === "sortSelect") update({ sort: e.target.value }, false);
  });

  /* Danh sách cách sắp xếp lấy từ data */
  $("#sortSelect").innerHTML = FILTERS.sorts.map(o => `<option value="${o.value}">${o.label}</option>`).join("");

  render();
};