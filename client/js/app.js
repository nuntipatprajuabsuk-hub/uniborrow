// --- INITIAL MOCK DATA (ข้อมูลเริ่มต้นระบบ) ---
const INITIAL_ITEMS = [
  {
    id: 1,
    title: 'หนังสือเรียน Calculus I',
    category: 'หนังสือ',
    description: 'หนังสือสภาพดี มีรอยไฮไลต์เล็กน้อย สรุปเข้มพร้อมแนวข้อสอบ',
    image: '../img/textbook.svg',
    status: 'available',
    owner: 'สมชาย ใจดี',
    ownerId: 1
  },
  {
    id: 2,
    title: 'ขาตั้งกล้อง Tripod',
    category: 'อุปกรณ์ถ่ายภาพ',
    description: 'ขาตั้งกล้องความสูง 1.5 เมตร น้ำหนักเบา พกพาสะดวก',
    image: '../img/tripod.svg',
    status: 'available',
    owner: 'สมหญิง รักดี',
    ownerId: 2
  },
  {
    id: 3,
    title: 'ปลั๊กไฟพ่วง 5 เมตร',
    category: 'เครื่องใช้ไฟฟ้า',
    description: 'ปลั๊กพ่วง 4 ช่องเสียบ มีสวิตช์เปิด-ปิดแยก ปลอดภัย',
    image: '../img/powerstrip.svg',
    status: 'available',
    owner: 'สมชาย ใจดี',
    ownerId: 1
  },
  {
    id: 4,
    title: 'สว่านไร้สาย',
    category: 'เครื่องมือช่าง',
    description: 'สว่านแบตเตอรี่ พร้อมหัวเจาะหลายขนาด สำหรับงานหอพัก',
    image: '../img/drill.svg',
    status: 'available',
    owner: 'อนันต์ สายลุย',
    ownerId: 3
  },
  {
    id: 5,
    title: 'เครื่องคิดเลขวิทยาศาสตร์',
    category: 'การเรียน',
    description: 'CASIO FX-991EX สำหรับคำนวณสถิติและวิศวกรรม',
    image: '../img/calculator.svg',
    status: 'available',
    owner: 'วิภาดา เรียนดี',
    ownerId: 4
  },
  {
    id: 6,
    title: 'สายแปลง HDMI to VGA',
    category: 'อุปกรณ์ไอที',
    description: 'สำหรับต่อโน้ตบุ๊กเข้ากับโปรเจกเตอร์ในห้องเรียน',
    image: '../img/hdmi.svg',
    status: 'available',
    owner: 'สมหญิง รักดี',
    ownerId: 2
  }
];

// 初始化 Data ใน LocalStorage
function initDatabase() {
  if (!localStorage.getItem('ub_items')) {
    localStorage.setItem('ub_items', JSON.stringify(INITIAL_ITEMS));
  }
  if (!localStorage.getItem('ub_users')) {
    localStorage.setItem('ub_users', JSON.stringify([
      { id: 1, name: 'สมชาย ใจดี', email: 'somchai@student.ac.th', password: '123' }
    ]));
  }
  if (!localStorage.getItem('ub_borrowings')) {
    localStorage.setItem('ub_borrowings', JSON.stringify([]));
  }
}

initDatabase();

// --- HELPER FUNCTIONS ---
function getUsers() { return JSON.parse(localStorage.getItem('ub_users')); }
function getItems() { return JSON.parse(localStorage.getItem('ub_items')); }
function getBorrowings() { return JSON.parse(localStorage.getItem('ub_borrowings')); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('ub_current_user')); }

function saveItems(items) { localStorage.setItem('ub_items', JSON.stringify(items)); }
function saveBorrowings(borrowings) { localStorage.setItem('ub_borrowings', JSON.stringify(borrowings)); }

// --- AUTHENTICATION ---
function register(name, email, password) {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' };
  }
  const newUser = { id: Date.now(), name, email, password };
  users.push(newUser);
  localStorage.setItem('ub_users', JSON.stringify(users));
  localStorage.setItem('ub_current_user', JSON.stringify(newUser));
  return { success: true };
}

function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem('ub_current_user', JSON.stringify(user));
    return { success: true };
  }
  return { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
}

function logout() {
  localStorage.removeItem('ub_current_user');
  window.location.href = 'login.html';
}

function checkAuth() {
  const user = getCurrentUser();
  const authContainer = document.getElementById('nav-auth');
  if (authContainer) {
    if (user) {
      authContainer.innerHTML = `
        <span>สวัสดี, <b>${user.name}</b></span>
        <a href="my-borrowings.html">รายการยืม</a>
        <a href="add-item.html" class="btn-small">+ ลงประกาศ</a>
        <button onclick="logout()" class="btn-logout">ออกจากระบบ</button>
      `;
    } else {
      authContainer.innerHTML = `
        <a href="login.html">เข้าสู่ระบบ</a>
        <a href="register.html" class="btn-small">สมัครสมาชิก</a>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', checkAuth);
