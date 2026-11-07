/**
 * RGCITC Data Store & Interactive Logic (Notices & Registrations)
 * Supports XSS sanitation, responsive dialog handling, and localStorage fallback.
 */

const STORAGE_KEYS = {
  NOTICES: 'rgcitc_notices',
  REGISTRATIONS: 'rgcitc_registrations',
  IS_ADMIN: 'rgcitc_admin_logged_in'
};

// HTML Escaper for XSS Prevention
function sanitizeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Initial Seed Notices
const DEFAULT_NOTICES = [
  {
    id: 'notice-1',
    title: 'স্প্রিং ২০২৬ মেম্বারশিপ রিক্রুটমেন্ট ও ওরিয়েন্টেশন প্রোগ্রাম',
    category: 'Recruitment',
    badgeClass: 'badge-urgent',
    date: '২০২৬-১১-০৫',
    author: 'Executive Committee',
    pinned: true,
    content: 'রংপুর সরকারি কলেজ আইসিটি ক্লাবের ২০২৬ সেশনের সদস্য নিয়োগ কার্যক্রম শুরু হয়েছে। কলেজ প্রাঙ্গণে আধুনিক সফটওয়্যার ইঞ্জিনিয়ারিং, কম্পিটিটিভ প্রোগ্রামিং, অ্যাপ ডেভেলপমেন্ট ও রোবোটিক্স উইংয়ে যুক্ত হতে আগ্রহী শিক্ষার্থীরা অনলাইনের মাধ্যমে ফর্ম পূরণ করতে পারবে। সফলভাবে নিবন্ধিত শিক্ষার্থীদের ইমেইল ও এসএমএস এর মাধ্যমে ওরিয়েন্টেশন সেশনের তারিখ জানানো হবে।'
  },
  {
    id: 'notice-2',
    title: 'ইন্টার-কলেজ প্রোগ্রামিং ক্যাম্প ও বুটক্যাম্প ২০২৬',
    category: 'Workshop',
    badgeClass: 'badge-workshop',
    date: '২০২৬-১১-০১',
    author: 'CP Wing Lead',
    pinned: false,
    content: 'সকল উইংয়ের শিক্ষার্থীদের জন্য ৩ দিনব্যাপী অ্যালগরিদম ও সি/সি++ প্রবলেম সলভিং বুটক্যাম্প অনুষ্ঠিত হতে যাচ্ছে আইসিটি ল্যাবে। ল্যাবের আসন সংখ্যা সীমিত হওয়ায় পূর্বে রেজিস্ট্রেশন সম্পন্ন করা আবশ্যক।'
  },
  {
    id: 'notice-3',
    title: 'রোবোটিক্স অ্যান্ড আইওটি ল্যাব হ্যান্ডস-অন সেশন শিডিউল',
    category: 'Notice',
    badgeClass: 'badge-general',
    date: '২০২৬-১০-২৮',
    author: 'Robotics Wing',
    pinned: false,
    content: 'Arduino Uno এবং ESP32 মাইক্রোকন্ট্রোলার নিয়ে আগামী শনিবার ক্লাবের রোবোটিক্স ল্যাবে প্র্যাকটিক্যাল সেশন অনুষ্ঠিত হবে। লাইন ফলোয়ার ও আইওটি হোম অটোমেশনের প্রাথমিক ধারণা প্রদান করা হবে।'
  }
];

function getNotices() {
  const data = localStorage.getItem(STORAGE_KEYS.NOTICES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(DEFAULT_NOTICES));
    return DEFAULT_NOTICES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_NOTICES;
  }
}

function saveNotices(notices) {
  localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
}

function getRegistrations() {
  const data = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
  if (!data) {
    const seed = [
      {
        id: 'reg-1',
        fullName: 'তানভীর আহমেদ',
        roll: '240112',
        session: '2023-2024',
        dept: 'Science (HSC)',
        phone: '01700112233',
        email: 'tanvir@example.com',
        wings: ['Web Development', 'Competitive Programming'],
        statement: 'আমি পাইথন ও ওয়েব ডেভেলপমেন্টে আগ্রহী।',
        status: 'approved',
        createdAt: '2026-11-06'
      },
      {
        id: 'reg-2',
        fullName: 'নাফিসা তাবাসসুম',
        roll: '231045',
        session: '2022-2023',
        dept: 'CSE (Honours)',
        phone: '01811223344',
        email: 'nafisa@example.com',
        wings: ['Robotics & IoT'],
        statement: 'হার্ডওয়্যার ও আইওটি অটোমেশন প্রজেক্ট করতে চাই।',
        status: 'pending',
        createdAt: '2026-11-07'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveRegistrations(regs) {
  localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(regs));
}

// Toast Notification
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${sanitizeText(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Render Notices on Homepage
function renderNoticesOnHome() {
  const container = document.getElementById('notices-container');
  if (!container) return;

  const notices = getNotices();
  if (notices.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">আপাতত কোনো নোটিশ নেই।</div>`;
    return;
  }

  container.innerHTML = notices.map(n => `
    <article class="notice-card ${n.pinned ? 'pinned' : ''}">
      <div>
        <div class="notice-header">
          <span class="badge-tag ${n.badgeClass || 'badge-general'}">${sanitizeText(n.category)}</span>
          <span class="notice-date">${sanitizeText(n.date)}</span>
        </div>
        <h3 class="notice-title">${sanitizeText(n.title)}</h3>
        <p class="notice-snippet">${sanitizeText(n.content.length > 130 ? n.content.substring(0, 130) + '...' : n.content)}</p>
      </div>
      <div class="notice-footer">
        <span class="notice-author">📌 ${sanitizeText(n.author || 'RGCITC')}</span>
        <button class="btn-read-more" onclick="openNoticeModal('${n.id}')">
          বিস্তারিত দেখুন &rarr;
        </button>
      </div>
    </article>
  `).join('');
}

// Open Notice Detail Modal
window.openNoticeModal = function(noticeId) {
  const notices = getNotices();
  const notice = notices.find(n => n.id === noticeId);
  if (!notice) return;

  const modal = document.getElementById('notice-detail-modal');
  if (!modal) return;

  document.getElementById('notice-modal-badge').innerText = notice.category;
  document.getElementById('notice-modal-badge').className = `badge-tag ${notice.badgeClass || 'badge-general'}`;
  document.getElementById('notice-modal-date').innerText = notice.date;
  document.getElementById('notice-modal-title').innerText = notice.title;
  document.getElementById('notice-modal-content').innerText = notice.content;
  document.getElementById('notice-modal-author').innerText = notice.author || 'Executive Committee';

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

// Modal helpers
function closeModal(modalEl) {
  if (modalEl) {
    modalEl.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Modal handlers
document.addEventListener('DOMContentLoaded', () => {
  renderNoticesOnHome();

  // Close modals on clicking backdrop or close button
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.closest('.modal-overlay'));
    });
  });

  // Open Registration Modal
  const openRegBtns = document.querySelectorAll('.open-register-modal');
  const regModal = document.getElementById('registration-modal');
  openRegBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (regModal) {
        regModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Close with Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(closeModal);
    }
  });

  // Handle Registration Form Submit
  const regForm = document.getElementById('student-registration-form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(regForm);
      const wings = [];
      regForm.querySelectorAll('input[name="wings"]:checked').forEach(cb => wings.push(cb.value));

      if (wings.length === 0) {
        showToast('অনুগ্রহ করে অন্তত ১টি উইং নির্বাচন করুন!', 'error');
        return;
      }

      const email = formData.get('email').trim();
      const phone = formData.get('phone').trim();

      // Basic phone & email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন!', 'error');
        return;
      }

      const newRegistration = {
        id: 'reg-' + Date.now(),
        fullName: formData.get('fullName').trim(),
        roll: formData.get('roll').trim(),
        session: formData.get('session').trim(),
        dept: formData.get('dept').trim(),
        phone: phone,
        email: email,
        wings: wings,
        statement: formData.get('statement') ? formData.get('statement').trim() : '',
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0]
      };

      const registrations = getRegistrations();
      registrations.unshift(newRegistration);
      saveRegistrations(registrations);

      regForm.reset();
      closeModal(regModal);
      showToast('রেজিস্ট্রেশন সফলভাবে জমা হয়েছে! ক্লাবের অ্যাডমিন রিভিউ করবেন।', 'success');
    });
  }
});
