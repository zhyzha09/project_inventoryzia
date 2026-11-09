'use strict';

/* =========================================================
   GudangAzira — js/login.js (v2)
   Login + Registrasi multi-user
========================================================= */

const KUNCI = {
  users: 'ga_users',
  sesi : 'ga_session'
};

/* Akun bawaan (di-seed sekali ke localStorage) */
const PENGGUNA_AWAL = [
  { username: 'admin',  password: 'admin123',  nama: 'Administrator', role: 'admin', createdAt: new Date().toISOString() },
  { username: 'gudang', password: 'gudang123', nama: 'Staff Gudang',  role: 'staff', createdAt: new Date().toISOString() }
];

if (!localStorage.getItem(KUNCI.users)) {
  localStorage.setItem(KUNCI.users, JSON.stringify(PENGGUNA_AWAL));
}

// /* Jika sudah login sebelumnya, langsung masuk dashboard */
// if (localStorage.getItem(KUNCI.sesi)) {
//   window.location.replace('dashboard.html');
// }

const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ============ TAB LOGIN / DAFTAR ============ */
 $$('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.auth-tab').forEach(t => t.classList.toggle('active', t === tab));
    $$('.auth-pane').forEach(p => p.classList.toggle('active', p.id === tab.dataset.tab + 'Form'));
  });
});

/* ============ TOGGLE PASSWORD ============ */
document.getElementById('togglePassword').addEventListener('click', function () {
  const input = document.getElementById('password');
  const ikon  = this.querySelector('i');
  const lihat = input.type === 'password';
  input.type = lihat ? 'text' : 'password';
  ikon.className = lihat ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
});

/* ============ LOGIN ============ */
const formLogin  = document.getElementById('loginForm');
const errLogin   = document.getElementById('loginError');
const suksesReg  = document.getElementById('regSuccess');

formLogin.addEventListener('submit', function (e) {
  e.preventDefault();
  suksesReg.hidden = true;

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  const daftar = JSON.parse(localStorage.getItem(KUNCI.users)) || [];
  const user = daftar.find(u => u.username === username && u.password === password);

  if (!user) {
    errLogin.hidden = false;
    errLogin.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Username atau password salah!';
    document.getElementById('password').value = '';
    return;
  }

  localStorage.setItem(KUNCI.sesi, JSON.stringify({
    username: user.username,
    nama    : user.nama,
    role    : user.role,
    loginAt : new Date().toISOString()
  }));

  window.location.href = 'dashboard.html';
});

/* ============ REGISTRASI ============ */
const formReg  = document.getElementById('registerForm');
const errReg   = document.getElementById('regError');

formReg.addEventListener('submit', function (e) {
  e.preventDefault();
  errReg.hidden = true;
  suksesReg.hidden = true;

  const nama     = document.getElementById('regNama').value.trim();
  const username = document.getElementById('regUser').value.trim().toLowerCase();
  const pass     = document.getElementById('regPass').value;
  const pass2    = document.getElementById('regPass2').value;
  const role     = document.getElementById('regRole').value;

  /* Validasi */
  if (nama.length < 3)                                            return gagalReg('Nama lengkap minimal 3 karakter.');
  if (!/^[a-z0-9_]{3,20}$/.test(username))                        return gagalReg('Username 3-20 karakter, hanya huruf kecil, angka, dan underscore.');
  if (pass.length < 6)                                            return gagalReg('Password minimal 6 karakter.');
  if (pass !== pass2)                                             return gagalReg('Konfirmasi password tidak sama.');

  const daftar = JSON.parse(localStorage.getItem(KUNCI.users)) || [];
  if (daftar.some(u => u.username === username))                  return gagalReg(`Username "${username}" sudah digunakan.`);

  /* Simpan user baru */
  daftar.push({ username, password: pass, nama, role, createdAt: new Date().toISOString() });
  localStorage.setItem(KUNCI.users, JSON.stringify(daftar));

  /* Berhasil → kembali ke tab login */
  formReg.reset();
  suksesReg.hidden = false;
  suksesReg.innerHTML = `<i class="fa-solid fa-circle-check"></i> Akun <strong>${username}</strong> berhasil dibuat! Silakan masuk.`;

  document.querySelector('[data-tab="login"]').click();
  document.getElementById('username').value = username;
  document.getElementById('password').focus();
});

function gagalReg(pesan) {
  errReg.hidden = false;
  errReg.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ' + pesan;
}