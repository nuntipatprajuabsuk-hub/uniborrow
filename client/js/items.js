// --- 1. หน้าค้นหา/รายการของ (browse.html & index.html) ---
function renderBrowsePage() {
  const container = document.getElementById('item-list') || document.querySelector('.item-grid');
  if (!container) return;

  const items = getItems();
  const searchInput = document.getElementById('search-input') || document.querySelector('input[type="search"]');
  const categoryFilter = document.getElementById('category-filter') || document.querySelector('select');

  function filterAndRender() {
    const keyword = searchInput ? searchInput.value.toLowerCase() : '';
    const category = categoryFilter ? categoryFilter.value : 'all';

    const filtered = items.filter(item => {
      const matchKey = item.title.toLowerCase().includes(keyword) || item.description.toLowerCase().includes(keyword);
      const matchCat = category === 'all' || item.category === category || category === '';
      return matchKey && matchCat;
    });

    if (filtered.length === 0) {
      container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px;">ไม่พบรายการสิ่งของที่ค้นหา</div>';
      return;
    }

    container.innerHTML = filtered.map(item => `
      <div class="item-card" style="border: 1px solid #ddd; padding: 15px; border-radius: 8px; background: #fff;">
        <img src="${item.image}" alt="${item.title}" style="width: 100%; height: 160px; object-fit: contain; margin-bottom: 10px;">
        <div class="item-card-body">
          <span class="badge" style="background: ${item.status === 'available' ? '#4CAF50' : '#f44336'}; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px;">
            ${item.status === 'available' ? 'ว่างให้ยืม' : 'ถูกยืมแล้ว'}
          </span>
          <h3 style="margin: 10px 0 5px 0;">${item.title}</h3>
          <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">หมวดหมู่: ${item.category}</p>
          <p style="color: #888; font-size: 13px; margin: 0 0 15px 0;">เจ้าของ: ${item.owner}</p>
          <a href="item-detail.html?id=${item.id}" style="display: block; text-align: center; background: #007bff; color: white; text-decoration: none; padding: 8px; border-radius: 4px;">ดูรายละเอียด</a>
        </div>
      </div>
    `).join('');
  }

  if (searchInput) searchInput.addEventListener('input', filterAndRender);
  if (categoryFilter) categoryFilter.addEventListener('change', filterAndRender);
  
  filterAndRender();
}

// --- 2. หน้ารายละเอียดของ (item-detail.html) ---
function renderItemDetailPage() {
  const detailContainer = document.getElementById('item-detail-container') || document.querySelector('.detail-container');
  if (!detailContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const itemId = parseInt(urlParams.get('id'));
  const items = getItems();
  const item = items.find(i => i.id === itemId);

  if (!item) {
    detailContainer.innerHTML = '<h2 style="text-align:center; margin-top:50px;">ไม่พบรายการสิ่งของนี้</h2>';
    return;
  }

  detailContainer.innerHTML = `
    <div style="display: flex; gap: 30px; max-width: 900px; margin: 20px auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
      <div style="flex: 1; text-align: center;">
        <img src="${item.image}" alt="${item.title}" style="width: 100%; max-height: 300px; object-fit: contain;">
      </div>
      <div style="flex: 1.5;">
        <span style="background: ${item.status === 'available' ? '#4CAF50' : '#f44336'}; color: white; padding: 4px 10px; border-radius: 4px; font-size: 13px;">
          ${item.status === 'available' ? 'ว่างให้ยืม' : 'ถูกยืมแล้ว'}
        </span>
        <h1 style="margin: 15px 0 10px 0;">${item.title}</h1>
        <p>หมวดหมู่: <b>${item.category}</b></p>
        <p>เจ้าของสิ่งของ: <b>${item.owner}</b></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
        <p style="line-height: 1.6;">${item.description}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
        
        ${item.status === 'available' ? `
          <div style="background: #f9f9f9; padding: 15px; border-radius: 6px;">
            <h3 style="margin-top:0;">ฟอร์มยืมสิ่งของ</h3>
            <div style="margin-bottom: 10px;">
              <label style="display:block; margin-bottom:5px;">วันที่ต้องการยืม:</label>
              <input type="date" id="borrow-start" style="width:100%; padding:8px; box-sizing:border-box;">
            </div>
            <div style="margin-bottom: 15px;">
              <label style="display:block; margin-bottom:5px;">วันที่ส่งคืน:</label>
              <input type="date" id="borrow-end" style="width:100%; padding:8px; box-sizing:border-box;">
            </div>
            <button onclick="submitBorrow(${item.id})" style="width:100%; background:#28a745; color:white; border:none; padding:10px; border-radius:4px; cursor:pointer; font-weight:bold;">ยืนยันการยืม</button>
          </div>
        ` : `
          <button disabled style="width:100%; background:#ccc; color:#666; border:none; padding:10px; border-radius:4px;">สิ่งของนี้ถูกยืมไปแล้ว</button>
        `}
      </div>
    </div>
  `;
}

// ฟังก์ชันกดส่งคำขอยืม
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
    alert('กรุณากำหนดวันที่ยืมและวันที่ส่งคืนให้ครบถ้วน');
    return;
  }

  const items = getItems();
  const itemIndex = items.findIndex(i => i.id === itemId);
  if (itemIndex !== -1) {
    items[itemIndex].status = 'borrowed';
    saveItems(items);
  }

  const borrowings = getBorrowings();
  borrowings.push({
    id: Date.now(),
    itemId: itemId,
    itemTitle: items[itemIndex].title,
    borrowerId: user.id,
    startDate: startDate,
    endDate: endDate,
    status: 'กำลังยืม'
  });
  saveBorrowings(borrowings);

  alert('ทำรายการยืมสำเร็จ!');
  window.location.href = 'my-borrowings.html';
}

// --- 3. หน้าเพิ่มของยืม (add-item.html) ---
function initAddItemForm() {
  const form = document.getElementById('add-item-form') || document.querySelector('form');
  if (!form || window.location.pathname.indexOf('add-item') === -1) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการลงประกาศ');
      window.location.href = 'login.html';
      return;
    }

    const titleInput = document.getElementById('item-title') || form.querySelector('input[name="title"]');
    const categorySelect = document.getElementById('item-category') || form.querySelector('select');
    const descInput = document.getElementById('item-desc') || form.querySelector('textarea');

    const items = getItems();
    const newItem = {
      id: Date.now(),
      title: titleInput.value,
      category: categorySelect ? categorySelect.value : 'ทั่วไป',
      description: descInput ? descInput.value : '',
      image: '../img/textbook.svg',
      status: 'available',
      owner: user.name,
      ownerId: user.id
    };

    items.push(newItem);
    saveItems(items);

    alert('ลงประกาศสิ่งของเรียบร้อยแล้ว!');
    window.location.href = 'browse.html';
  });
}

// --- 4. หน้าประวัติการยืมของฉัน (my-borrowings.html) ---
function renderMyBorrowings() {
  const container = document.getElementById('my-borrowings-list') || document.querySelector('.borrowings-container');
  if (!container) return;

  const user = getCurrentUser();
  if (!user) {
    container.innerHTML = '<div style="text-align:center; margin-top:40px;"><p>กรุณา <a href="login.html">เข้าสู่ระบบ</a> เพื่อดูรายการยืมของคุณ</p></div>';
    return;
  }

  const borrowings = getBorrowings().filter(b => b.borrowerId === user.id);

  if (borrowings.length === 0) {
    container.innerHTML = '<div style="text-align:center; margin-top:40px;"><p>คุณยังไม่มีรายการสิ่งของที่ยืมในขณะนี้</p></div>';
    return;
  }

  container.innerHTML = `
    <table style="width:100%; border-collapse: collapse; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <thead>
        <tr style="background:#f4f4f4; text-align:left; border-bottom:2px solid #ddd;">
          <th style="padding:12px;">ชื่อสิ่งของ</th>
          <th style="padding:12px;">วันที่เริ่มยืม</th>
          <th style="padding:12px;">กำหนดส่งคืน</th>
          <th style="padding:12px;">สถานะ</th>
          <th style="padding:12px; text-align:center;">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        ${borrowings.map(b => `
          <tr style="border-bottom:1px solid #eee;">
            <td style="padding:12px;"><b>${b.itemTitle}</b></td>
            <td style="padding:12px;">${b.startDate}</td>
            <td style="padding:12px;">${b.endDate}</td>
            <td style="padding:12px;">
              <span style="background:${b.status === 'กำลังยืม' ? '#ffc107' : '#6c757d'}; color:${b.status === 'กำลังยืม' ? '#000' : '#fff'}; padding:3px 8px; border-radius:4px; font-size:12px;">
                ${b.status}
              </span>
            </td>
            <td style="padding:12px; text-align:center;">
              ${b.status === 'กำลังยืม' ? `
                <button onclick="returnItem(${b.id}, ${b.itemId})" style="background:#dc3545; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer;">ส่งคืนสิ่งของ</button>
              ` : '<span style="color:#aaa;">คืนแล้ว</span>'}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ฟังก์ชันคืนของ
function returnItem(borrowingId, itemId) {
  if (!confirm('ยืนยันการคืนสิ่งของชิ้นนี้?')) return;

  const items = getItems();
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.status = 'available';
    saveItems(items);
  }

  const borrowings = getBorrowings();
  const b = borrowings.find(b => b.id === borrowingId);
  if (b) {
    b.status = 'คืนแล้ว';
    saveBorrowings(borrowings);
  }

  alert('คืนสิ่งของเรียบร้อยแล้ว!');
  renderMyBorrowings();
}

// Run functions
document.addEventListener('DOMContentLoaded', () => {
  renderBrowsePage();
  renderItemDetailPage();
  initAddItemForm();
  renderMyBorrowings();
});
