// ============ HOME SEARCH ============
const searchForm = document.getElementById("searchForm");
if (searchForm) {
    const searchInput = document.getElementById("searchInput");
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const keyword = searchInput.value.trim();
        if (!keyword) {
            searchInput.focus();
            return;
        }
        window.location.href = `browse.html?search=${encodeURIComponent(keyword)}`;
    });
}

// ============ BROWSE FILTER ============
const browseSearch = document.getElementById("browseSearch");
if (browseSearch && typeof ITEMS !== "undefined") {
    const categoryFilter = document.getElementById("categoryFilter");
    const statusFilter = document.getElementById("statusFilter");
    const grid = document.querySelector(".items-grid");
    const cards = grid ? Array.from(grid.children) : [];

    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search");
    if (initialSearch) browseSearch.value = initialSearch;
    const initialCategory = params.get("category");
    if (initialCategory) {
        const opt = Array.from(categoryFilter.options).find(
            (o) => o.value.toLowerCase() === initialCategory.toLowerCase()
        );
        if (opt) categoryFilter.value = opt.value;
    }

    function applyFilters() {
        const q = browseSearch.value.trim().toLowerCase();
        const cat = categoryFilter.value;
        const status = statusFilter.value;

        cards.forEach((card, i) => {
            const item = ITEMS[i];
            if (!item) return;
            const matchesQ = !q || item.name.toLowerCase().includes(q);
            const matchesCat = !cat || item.cat === cat;
            const matchesStatus =
                !status || item.status === status.toLowerCase();
            card.style.display =
                matchesQ && matchesCat && matchesStatus ? "" : "none";
        });
    }

    browseSearch.addEventListener("input", applyFilters);
    categoryFilter.addEventListener("change", applyFilters);
    statusFilter.addEventListener("change", applyFilters);
    applyFilters();
}

// ============ ITEM DETAIL ============
const detailName = document.getElementById("detailName");
if (detailName && typeof ITEMS !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || ITEMS[0].id;
    const item = ITEMS.find((i) => i.id === id) || ITEMS[0];

    document.getElementById("detailImg").src = `../img/${item.img}`;
    document.getElementById("detailImg").alt = item.name;
    detailName.textContent = item.name;
    document.getElementById("detailDesc").textContent = item.desc;
    document.getElementById("detailAvail").textContent = item.avail;

    const statusEl = document.getElementById("detailStatus");
    if (item.status === "available") {
        statusEl.textContent = "Available";
        statusEl.className = "status-pill available";
    } else {
        statusEl.textContent = "Borrowed";
        statusEl.className = "status-pill borrowed";
    }

    const requestBtn = document.getElementById("requestBtn");
    if (requestBtn) {
        requestBtn.addEventListener("click", () => {
            requestBtn.textContent = "Request Sent ✓";
            requestBtn.disabled = true;
            requestBtn.style.opacity = "0.7";
        });
    }
}

// ============ FORMS (login / register / add-item) ============
["loginForm", "registerForm", "addItemForm"].forEach((formId) => {
    const form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const button = form.querySelector("button[type=submit]");
        const original = button.textContent;
        button.textContent = "✓ Done";
        setTimeout(() => {
            window.location.href = "index.html";
        }, 600);
    });
});
