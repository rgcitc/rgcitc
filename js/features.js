/**
 * RGCITC Pure Supabase Backend Data Layer
 * Direct database syncing with PostgreSQL & Row Level Security (RLS)
 */

function sanitizeText(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

// Global cached notices list for modal lookups
let activeNotices = [];

// Fetch Notices from Supabase PostgreSQL
async function fetchNoticesFromDB() {
  const supabase = getSupabase();
  if (!supabase) {
    console.error('Supabase client is not initialized.');
    return [];
  }

  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notices:', error);
    showToast('নোটিশ লোড করতে সমস্যা হয়েছে: ' + error.message, 'error');
    return [];
  }
  activeNotices = data || [];
  return activeNotices;
}

// Render Notices on Homepage
async function renderNoticesOnHome() {
  const container = document.getElementById('notices-container');
  if (!container) return;

  container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">🔄 নোটিশ ডাটাবেস থেকে লোড হচ্ছে...</div>`;

  const notices = await fetchNoticesFromDB();

  if (notices.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">আপাতত কোনো সক্রিয় নোটিশ নেই।</div>`;
    return;
  }

  container.innerHTML = notices.map(n => {
    const formattedDate = new Date(n.created_at).toISOString().split('T')[0];
    return `
      <article class="notice-card ${n.is_pinned ? 'pinned' : ''}">
        <div>
          <div class="notice-header">
            <span class="badge-tag ${n.badge_class || 'badge-general'}">${sanitizeText(n.category)}</span>
            <span class="notice-date">${formattedDate}</span>
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
    `;
  }).join('');
}

// Open Notice Detail Modal
window.openNoticeModal = function(noticeId) {
  const notice = activeNotices.find(n => n.id === noticeId);
  if (!notice) return;

  const modal = document.getElementById('notice-detail-modal');
  if (!modal) return;

  const formattedDate = new Date(notice.created_at).toISOString().split('T')[0];

  document.getElementById('notice-modal-badge').innerText = notice.category;
  document.getElementById('notice-modal-badge').className = `badge-tag ${notice.badge_class || 'badge-general'}`;
  document.getElementById('notice-modal-date').innerText = formattedDate;
  document.getElementById('notice-modal-title').innerText = notice.title;
  document.getElementById('notice-modal-content').innerText = notice.content;
  document.getElementById('notice-modal-author').innerText = notice.author || 'Executive Committee';

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

function closeModal(modalEl) {
  if (modalEl) {
    modalEl.classList.remove('active');
    document.body.style.overflow = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderNoticesOnHome();

  // Close modals
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

  // Close with Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(closeModal);
    }
  });

  // Handle Student Registration Submit -> DIRECT TO SUPABASE
  const regForm = document.getElementById('student-registration-form');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = regForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerText;

      const formData = new FormData(regForm);
      const wings = [];
      regForm.querySelectorAll('input[name="wings"]:checked').forEach(cb => wings.push(cb.value));

      if (wings.length === 0) {
        showToast('অনুগ্রহ করে অন্তত ১টি উইং নির্বাচন করুন!', 'error');
        return;
      }

      const email = formData.get('email').trim();
      const phone = formData.get('phone').trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast('অনুগ্রহ করে সঠিক ইমেইল দিন!', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerText = 'জমা হচ্ছে...';

      const supabase = getSupabase();
      if (!supabase) {
        showToast('ডাটাবেস কানেকশন পাওয়া যায়নি!', 'error');
        submitBtn.disabled = false;
        submitBtn.innerText = originalText;
        return;
      }

      const newRegistration = {
        full_name: formData.get('fullName').trim(),
        roll: formData.get('roll').trim(),
        session: 'HSC ' + (formData.get('batch') || '2028'),
        department: formData.get('dept').trim(),
        phone: phone,
        email: email,
        wings: wings,
        statement: formData.get('statement') ? formData.get('statement').trim() : '',
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('registrations')
        .insert([newRegistration]);

      submitBtn.disabled = false;
      submitBtn.innerText = originalText;

      if (error) {
        console.error('Registration insertion error:', error);
        showToast('রেজিস্ট্রেশন জমা দিতে ব্যর্থ: ' + error.message, 'error');
      } else {
        regForm.reset();
        closeModal(regModal);
        showToast('রেজিস্ট্রেশন সফলভাবে ডাটাবেসে জমা হয়েছে! ক্লাব এক্সিকিউটিভ রিভিউ করবেন।', 'success');
      }
    });
  }
});
