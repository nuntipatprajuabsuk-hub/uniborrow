// --- 1. หน้าค้นหา/รายการของ (browse.html) ---
function renderBrowsePage() {
  const container = document.getElementById('item-list');
  if (!container) return;

  const items = getItems();
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');

  function filterAndRender() {
    const keyword = searchInput ? searchInput.value.toLowerCase() : '';
    const category = categoryFilter ? categoryFilter.value : 'all';

    const filtered = items.filter(item => {
      const matchKey = item.title.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword);
      const matchCat = category === 'all' || item.category === category;
      return matchKey && matchCat;
    });

    container.innerHTML = filtered.map(item => `
      <div class="item-card">
        <img src="${item.image}" alt="${item.title}">
        <div class="item-card-body">
          <span class="badge ${item.status}">${item.status === 'available' ? 'ว่างให้ยืม' : 'ถูกยืมแล้ว'}</span>
          <h3>${item.title}</h3>
          <p class="category">${item.category}</p>
          <p class="owner">เจ้าของ: ${item.owner}</p>
          <a href="item-detail.html?id=${item.id}" class="btn-view">ดูรายละเอียด</a>
        </div>
      </div>
    `).join('') || '<p>ไม่พบรายการที่ค้นหา</p>';
  }

  if (searchInput) searchInput.addEventListener('input', filterAndRender);
  if (categoryFilter) categoryFilter.addEventListener('change', filterAndRender);
  
  filterAndRender();
}

// --- 2. หน้ารายละเอียดของ (item-detail.html) ---
function renderItemDetailPage() {
  const detailContainer = document.getElementById('item-detail-container');
  if (!detailContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = parseInt(urlParams.get('id'));
  const items = getItems();
  const item = items.find(i => i.id === itemId);

  if (!item) {
    detailContainer.innerHTML = '<h2>ไม่พบรายการสิ่งของนี้</h2>';
    return;
  }

  const user = getCurrentUser();

  detailContainer.innerHTML = `
    <div class="detail-wrapper">
      <div class="detail-img">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="detail-info">
        <span class="badge ${item.status}">${item.status === 'available' ? 'ว่างให้ยืม' : 'ถูกยืมแล้ว'}</span>
        <h1>${item.title}</h1>
        <p class="cat">หมวดหมู่: <b>${item.category}</b></p>
        <p class="owner">ผู้ให้ยืม: <b>${item.owner}</b></p>
        <div class="desc-box">
          <h4>รายละเอียดสิ่งของ:</h4>
          <p>${item.description}</p>
        </div>
        
        ${item.status === 'available' ? `
          <div class="borrow-form">
            <h3>ฟอร์มขอยืมสิ่งของ</h3>
            <label>วันที่ต้องการยืม:</label>
            <input type="date" id="borrow-start" required>
            <label>วันที่คืน:</label>
            <input type="date" id="borrow-end" required>
            <button onclick="submitBorrow(${item.id})" class="btn-borrow">ส่งคำขอยืม</button>
          </div>
        ` : `
          <button class="btn-disabled" disabled>ถูกยืมไปแล้ว</button>
        `}
      </div>
    </div>
  `;
}

// ฟังก์ชันกดยืมของ
function submitBorrow(itemId) {
  const user = getCurrentUser();
  if (!user) {
    alert('กรุณาเข้าสู่ระบบก่อนทำการยืมของ');
    window.location.href = 'login.html';
    return;
  }

  const startDate = document.getElementById('borrow-start').value;
  const endDate = document.getElementById('borrow-end').value;

  if (!startDate || !endDate) {
    alert('กรุณาเลือกวันที่ยืมและคืนให้ครบถ้วน');
    return;
  }

  // อัปเดตสถานะของ
  const items = getItems();
  const itemIndex = items.findIndex(i => i.id === itemId);
  if (itemIndex !== -1) {
    items[itemIndex].status = 'borrowed';
    saveItems(items);
  }

  // เพิ่มประวัติการยืม
  const borrowings = getBorrowings();
  borrowings.push({
    id: Date.now(),
    itemId: itemId,
    itemTitle: items[itemIndex].title,
    borrowerId: user.id,
    startDate,
    endDate,
    status: 'กำลังยืม'
  });
  saveBorrowings(borrowings);

  alert('ส่งคำขอยืมเรียบร้อยแล้ว!');
  window.location.href = 'my-borrowings.html';
}

// --- 3. หน้าเพิ่มของยืม (add-item.html) ---
function initAddItemForm() {
  const form = document.getElementById('add-item-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนลงประกาศ');
      window.location.href = 'login.html';
      return;
    }

    const title = document.getElementById('item-title').value;
    const category = document.getElementById('item-category').value;
    const description = document.getElementById('item-desc').value;

    const items = getItems();
    const newItem = {
      id: Date.now(),
      title,
      category,
      description,
      image: '../img/textbook.svg', // รูปไอคอน default
      status: 'available',
      owner: user.name,
      ownerId: user.id
    };

    items.push(newItem);
    saveItems(items);

    alert('เพิ่มรายการของยืมสำเร็จ!');
    window.location.href = 'browse.html';
  });
}

// --- 4. หน้าประวัติการยืมของฉัน (my-borrowings.html) ---
function renderMyBorrowings() {
  const container = document.getElementById('my-borrowings-list');
  if (!container) return;

  const user = getCurrentUser();
  if (!user) {
    container.innerHTML = '<p>กรุณา <a href="login.html">เข้าสู่ระบบ</a> เพื่อดูรายการยืมของคุณ</p>';
    return;
  }

  const borrowings = getBorrowings().filter(b => b.borrowerId === user.id);

  if (borrowings.length === 0) {
    container.innerHTML = '<p>คุณยังไม่มีรายการยืมของในขณะนี้</p>';
    return;
  }

  container.innerHTML = `
    <table class="borrow-table">
      <thead>
        <tr>
          <th>ชื่อสิ่งของ</th>
          <th>วันที่เริ่มยืม</th>
          <th>กำหนดส่งคืน</th>
          <th>สถานะ</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        ${borrowings.map(b => `
          <tr>
            <td><b>${b.itemTitle}</b></td>
            <td>${b.startDate}</td>
            <td>${b.endDate}</td>
            <td><span class="status-badge">${b.status}</span></td>
            <td>
              ${b.status === 'กำลังยืม' ? `<button onclick="returnItem(${b.id}, ${b.itemId})" class="btn-return">คืนของ</button>` : 'คืนแล้ว'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ฟังก์ชันกดคืนของ
function returnItem(borrowingId, itemId) {
  if (!confirm('คุณต้องการส่งคืนสิ่งของนี้ใช่หรือไม่?')) return;

  // เปลี่ยนสถานะของกลับเป็น available
  const items = getItems();
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.status = 'available';
    saveItems(items);
  }

  // เปลี่ยนสถานะการยืมเป็น "คืนแล้ว"
  const borrowings = getBorrowings();
  const b = borrowings.find(b => b.id === borrowingId);
  if (b) {
    b.status = 'คืนแล้ว';
    saveBorrowings(borrowings);
  }

  alert('คืนสิ่งของสำเร็จ!');
  renderMyBorrowings();
}

// เรียกทำงานตามแต่ละหน้า
document.addEventListener('DOMContentLoaded', () => {
  renderBrowsePage();
  renderItemDetailPage();
  initAddItemForm();
  renderMyBorrowings();
});
