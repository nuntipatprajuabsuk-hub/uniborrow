// --- INITIAL MOCK DATA ---
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

// Initialize Database
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

// Helpers
function getUsers() { return JSON.parse(localStorage.getItem('ub_users')) || []; }
function getItems() { return JSON.parse(localStorage.getItem('ub_items')) || []; }
function getBorrowings() { return JSON.parse(localStorage.getItem('ub_borrowings')) || []; }
function getCurrentUser() { return JSON.parse(localStorage.getItem('ub_current_user')); }

function saveItems(items) { localStorage.setItem('ub_items', JSON.stringify(items)); }
function saveBorrowings(borrowings) { localStorage.setItem('ub_borrowings', JSON.stringify(borrowings)); }

// Auth Functions
function logout() {
  localStorage.removeItem('ub_current_user');
  alert('ออกจากระบบเรียบร้อยแล้ว');
  window.location.href = 'login.html';
}

function checkAuthUI() {
  const user = getCurrentUser();
  const authNav = document.querySelector('.nav-links') || document.querySelector('nav');
  
  // ปรับ UI แถบเมนูบนตามสถานะการล็อกอิน
  const userStatusBox = document.getElementById('user-status');
  if (userStatusBox) {
    if (user) {
      userStatusBox.innerHTML = `
        <span>สวัสดี, <b>${user.name}</b></span>
        <a href="my-borrowings.html">รายการยืมของฉัน</a>
        <a href="add-item.html" class="btn">+ ลงประกาศ</a>
        <button onclick="logout()" class="btn-logout" style="cursor:pointer; padding: 5px 10px;">ออกจากระบบ</button>
      `;
    } else {
      userStatusBox.innerHTML = `
        <a href="login.html">เข้าสู่ระบบ</a>
        <a href="register.html" class="btn">สมัครสมาชิก</a>
      `;
    }
  }
}

// Bind Events for Login & Register Forms
document.addEventListener('DOMContentLoaded', () => {
  checkAuthUI();

  // ฟอร์มเข้าสู่ระบบ (Login)
  const loginForm = document.getElementById('login-form') || document.querySelector('form[action*="login"]');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = loginForm.querySelector('input[type="email"]') || document.getElementById('email');
      const passInput = loginForm.querySelector('input[type="password"]') || document.getElementById('password');

      const users = getUsers();
      const user = users.find(u => u.email === emailInput.value && u.password === passInput.value);

      if (user) {
        localStorage.setItem('ub_current_user', JSON.stringify(user));
        alert('เข้าสู่ระบบสำเร็จ!');
        window.location.href = 'browse.html';
      } else {
        alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    });
  }

  // ฟอร์มสมัครสมาชิก (Register)
  const registerForm = document.getElementById('register-form') || document.querySelector('form[action*="register"]');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('name') || registerForm.querySelector('input[type="text"]');
      const emailInput = document.getElementById('email') || registerForm.querySelector('input[type="email"]');
      const passInput = document.getElementById('password') || registerForm.querySelector('input[type="password"]');

      const users = getUsers();
      if (users.find(u => u.email === emailInput.value)) {
        alert('อีเมลนี้ถูกใช้งานในระบบแล้ว');
        return;
      }

      const newUser = {
        id: Date.now(),
        name: nameInput.value,
        email: emailInput.value,
        password: passInput.value
      };

      users.push(newUser);
      localStorage.setItem('ub_users', JSON.stringify(users));
      localStorage.setItem('ub_current_user', JSON.stringify(newUser));

      alert('สมัครสมาชิกสำเร็จ!');
      window.location.href = 'browse.html';
    });
  }
});
