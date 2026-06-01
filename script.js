"use strict";
const header = document.querySelector('#header');
const goTop = document.querySelector('#goTop');
const animates = document.querySelectorAll('.animate');
const burger = document.querySelector('#burger');
const mobileMenu = document.querySelector('#mobileMenu');
const overlay = document.querySelector('#overlay');

const onScroll = () => {
  const scrolled = window.scrollY;

  header.classList.toggle('header--scroll', scrolled > 60);
  goTop.classList.toggle('active', scrolled > 350);

  animates.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 80) {
      el.classList.add('show');
    }
  });
};

window.addEventListener('scroll', onScroll);
onScroll();

burger.addEventListener('click', () => {
  mobileMenu.classList.contains('active') ? closeMobileMenu() : openMobileMenu();
});

overlay.addEventListener('click', () => {
  closeMobileMenu();
  closeModal('authModal');
  closeModal('paymentModal');
});

const openMobileMenu = () => {
  mobileMenu.classList.add('active');
  overlay.classList.add('active');
  burger.classList.add('active');
};

const closeMobileMenu = () => {
  mobileMenu.classList.remove('active');
  overlay.classList.remove('active');
  burger.classList.remove('active');
};

const openModal = id => {
  document.querySelector(`#${id}`).classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
};

const closeModal = id => {
  document.querySelector(`#${id}`).classList.remove('active');
  const authOpen = document.querySelector('#authModal').classList.contains('active');
  const payOpen = document.querySelector('#paymentModal').classList.contains('active');
  if (!authOpen && !payOpen) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
};

const openAuthModal = (tab = 'login') => {
  openModal('authModal');
  switchTab(tab);
  clearAuthErrors();
};

const switchTab = tab => {
  const loginForm = document.querySelector('#loginForm');
  const registerForm = document.querySelector('#registerForm');
  const tabLogin = document.querySelector('#tabLogin');
  const tabRegister = document.querySelector('#tabRegister');
  const title = document.querySelector('#authTitle');
  const subtitle = document.querySelector('#authSubtitle');

  const isLogin = tab === 'login';

  loginForm.classList.toggle('active', isLogin);
  registerForm.classList.toggle('active', !isLogin);
  tabLogin.classList.toggle('active', isLogin);
  tabRegister.classList.toggle('active', !isLogin);

  title.textContent = isLogin ? 'Вітаємо назад!' : 'Створити акаунт';
  subtitle.textContent = isLogin ? 'Введи дані для входу' : 'Це займе менше хвилини';
};

const clearAuthErrors = () => {
  document.querySelectorAll('.form__error').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.form__input').forEach(i => i.classList.remove('error'));
};

const isValidEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

const handleRegister = () => {
  const name = document.querySelector('#regName').value.trim();
  const email = document.querySelector('#regEmail').value.trim();
  const pass = document.querySelector('#regPassword').value;
  const confirm = document.querySelector('#regConfirm').value;
  let valid = true;

  clearAuthErrors();

  if (name.length < 2) { showError('regNameErr', 'regName'); valid = false; }
  if (!isValidEmail(email)) { showError('regEmailErr', 'regEmail'); valid = false; }
  if (pass.length < 6) { showError('regPassErr', 'regPassword'); valid = false; }
  if (pass !== confirm) { showError('regConfirmErr', 'regConfirm'); valid = false; }

  if (!valid) return;

  const users = JSON.parse(localStorage.getItem('taskmanager_users') || '[]');
  const exists = users.find(u => u.email === email);

  if (exists) {
    showError('regEmailErr', 'regEmail');
    document.querySelector('#regEmailErr').textContent = 'Акаунт з таким email вже існує';
    return;
  }

  users.push({ name, email, password: pass });
  localStorage.setItem('taskmanager_users', JSON.stringify(users));

  const user = { name, email };
  localStorage.setItem('taskmanager_current', JSON.stringify(user));

  closeModal('authModal');
  setUserUI(user);
  showToast('✅', `Акаунт створено! Ласкаво просимо, ${name}!`);
};

const handleLogin = () => {
  const email = document.querySelector('#loginEmail').value.trim();
  const pass = document.querySelector('#loginPassword').value;
  let valid = true;

  clearAuthErrors();

  if (!isValidEmail(email)) { showError('loginEmailErr', 'loginEmail'); valid = false; }
  if (!pass.length) { showError('loginPassErr', 'loginPassword'); valid = false; }

  if (!valid) return;

  const users = JSON.parse(localStorage.getItem('taskmanager_users') || '[]');
  const user = users.find(u => u.email === email && u.password === pass);

  if (!user) {
    showError('loginEmailErr', 'loginEmail');
    showError('loginPassErr', 'loginPassword');
    document.querySelector('#loginEmailErr').textContent = 'Невірний email або пароль';
    document.querySelector('#loginPassErr').style.display = 'none';
    return;
  }

  const userData = { name: user.name, email: user.email };
  localStorage.setItem('taskmanager_current', JSON.stringify(userData));
  closeModal('authModal');
  setUserUI(userData);
  showToast('👋', `З поверненням, ${user.name}!`);
};

const logoutUser = () => {
  if (!confirm('Вийти з акаунту?')) return;
  localStorage.removeItem('taskmanager_current');
  setUserUI(null);
  showToast('👋', 'Ви вийшли з акаунту');
};

const setUserUI = user => {
  const authButtons = document.querySelector('#authButtons');
  const userAvatar = document.querySelector('#userAvatar');
  const userPic = document.querySelector('#userPic');
  const userNameEl = document.querySelector('#userName');
  const mobileActions = document.querySelector('#mobileMenuActions');

  if (user) {
    authButtons.classList.add('hidden');
    userAvatar.classList.add('visible');
    userNameEl.textContent = user.name;

    const parts = user.name.split(' ');
    const initials = parts[0][0].toUpperCase() + (parts[1]?.[0]?.toUpperCase() ?? '');
    userPic.textContent = initials;

    mobileActions.innerHTML = `<button class="btn btn--danger" onclick="closeMobileMenu(); logoutUser()">Вийти (${user.name})</button>`;
  } else {
    authButtons.classList.remove('hidden');
    userAvatar.classList.remove('visible');
    mobileActions.innerHTML = `
      <button class="btn btn--secondary" onclick="closeMobileMenu(); openAuthModal('login')">Увійти</button>
      <button class="btn btn--primary" onclick="closeMobileMenu(); openAuthModal('register')">Реєстрація</button>
    `;
  }
};

const handleSubscribe = (planName, planPrice) => {
  if (!localStorage.getItem('taskmanager_current')) {
    showToast('🔒', 'Спочатку увійди або зареєструйся');
    openAuthModal('login');
    return;
  }
  document.querySelector('#payPlanName').textContent = `${planName} план`;
  document.querySelector('#payPlanPrice').textContent = planPrice;
  openModal('paymentModal');
  clearPayErrors();
};

const formatCard = input => {
  const v = input.value.replace(/\D/g, '').slice(0, 16);
  input.value = v.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = input => {
  const v = input.value.replace(/\D/g, '').slice(0, 4);
  input.value = v.length >= 3 ? `${v.slice(0, 2)}/${v.slice(2)}` : v;
};

const clearPayErrors = () => {
  ['payNameErr', 'payCardErr', 'payExpiryErr', 'payCvvErr'].forEach(id => {
    document.querySelector(`#${id}`)?.classList.remove('active');
  });
  ['payName', 'payCard', 'payExpiry', 'payCvv'].forEach(id => {
    const el = document.querySelector(`#${id}`);
    if (el) { el.classList.remove('error'); el.value = ''; }
  });
};

const handlePayment = () => {
  const name = document.querySelector('#payName').value.trim();
  const card = document.querySelector('#payCard').value.replace(/\s/g, '');
  const expiry = document.querySelector('#payExpiry').value;
  const cvv = document.querySelector('#payCvv').value;
  let valid = true;

  if (name.length < 3) { showError('payNameErr', 'payName'); valid = false; }
  if (card.length !== 16 || !/^\d+$/.test(card)) { showError('payCardErr', 'payCard'); valid = false; }
  if (!/^\d{2}\/\d{2}$/.test(expiry)) { showError('payExpiryErr', 'payExpiry'); valid = false; }
  if (cvv.length !== 3) { showError('payCvvErr', 'payCvv'); valid = false; }

  if (!valid) return;

  const btn = document.querySelector('#paymentModal .modal__submit');
  btn.textContent = 'Обробляємо…';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Підтвердити оплату';
    btn.disabled = false;
    closeModal('paymentModal');
    clearPayErrors();
    const planName = document.querySelector('#payPlanName').textContent;
    showToast('🎉', `Підписка ${planName} успішно оформлена!`);
  }, 2000);
};

const toggleFaq = btn => {
  const item = btn.closest('.faq__item');
  const answer = item.querySelector('.faq__answer');
  const isOpen = item.classList.contains('active');

  document.querySelectorAll('.faq__item').forEach(i => {
    i.classList.remove('active');
    i.querySelector('.faq__answer').classList.remove('open');
  });

  if (!isOpen) {
    item.classList.add('active');
    answer.classList.add('open');
  }
};

const showError = (errorId, inputId) => {
  document.querySelector(`#${errorId}`)?.classList.add('active');
  document.querySelector(`#${inputId}`)?.classList.add('error');
};

const showToast = (icon, text) => {
  const toast = document.querySelector('#toast');
  document.querySelector('#toastIcon').textContent = icon;
  document.querySelector('#toastText').textContent = text;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
};
// .
(() => {
  const current = localStorage.getItem('taskmanager_current');
  if (!current) return;
  try {
    setUserUI(JSON.parse(current));
  } catch {
    localStorage.removeItem('taskmanager_current');
  }
})();
