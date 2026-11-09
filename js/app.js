'use strict';

/* =========================================================
   GudangAzira — js/app.js (v3)
   + Kode unik barang, grafik Chart.js, export CSV,
     manajemen multi-user, ikon Font Awesome, Tempat Sampah (Restore/Pulih)
========================================================= */

/* ---------------- KONSTANTA ---------------- */
const KAPASITAS_RAK = 1000;

const KUNCI = {
  items : 'ga_items_v2',        // v2: struktur baru dengan kode unik
  trx   : 'ga_transaksi_v2',
  users : 'ga_users',
  sesi  : 'ga_session',
  trash : 'ga_trash_v1'          // Tempat sampah (barang terhapus)
};

/* Prefix kode unik per kategori */
const KODE_KATEGORI = {
  'Laptop':'LPT','Smartphone':'SMP','Tablet':'TBL','TV':'TVS',
  'Audio':'AUD','Kamera':'KAM','Aksesoris':'AKS','Lainnya':'LNN'
};

const PALET_WARNA = ['#2563eb','#16a34a','#f59e0b','#dc2626','#8b5cf6','#06b6d4','#ec4899','#64748b','#84cc16','#f97316'];

/* ---------------- PENJAGA SESI LOGIN ---------------- */
const SESSION = JSON.parse(localStorage.getItem(KUNCI.sesi) || 'null');
if (!SESSION) {
  window.location.replace('index.html');
  document.body.innerHTML = '<p style="padding:2rem;font-family:sans-serif">Mengalihkan ke halaman login…</p>';
  throw new Error('Belum login');
}

/* ---------------- HELPER TANGGAL SEED ---------------- */
const hariLalu = (n, jam = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(jam, 0, 0, 0);
  return d.toISOString();
};

/* ---------------- DATA SEED ---------------- */
const SEED_ITEMS = [
  { id:'BRG-001', kode:'LPT-7KX2', nama:'Macbook Pro M2',              kategori:'Laptop',     stok:20,  harga:28999000, minStok:5,  lokasi:'Rak A-01', keterangan:'Laptop 13 inch Apple Silicon', updateAt:hariLalu(2,9)  },
  { id:'BRG-002', kode:'SMP-9FJ4', nama:'iPhone 15 Pro 256GB',         kategori:'Smartphone', stok:120, harga:18999000, minStok:20, lokasi:'Rak B-02', keterangan:'',                             updateAt:hariLalu(1,14) },
  { id:'BRG-003', kode:'TVS-3BQ8', nama:'Samsung QLED TV 55"',         kategori:'TV',         stok:45,  harga:12500000, minStok:10, lokasi:'Rak C-01', keterangan:'Smart TV 4K',                    updateAt:hariLalu(3,11) },
  { id:'BRG-004', kode:'AUD-6HM2', nama:'Sony WH-1000XM5',             kategori:'Audio',      stok:60,  harga:4999000,  minStok:10, lokasi:'Rak D-03', keterangan:'Headphone ANC',                   updateAt:hariLalu(4,16) },
  { id:'BRG-005', kode:'AKS-4TN7', nama:'Logitech G Pro X Superlight', kategori:'Aksesoris',  stok:80,  harga:1599000,  minStok:15, lokasi:'Rak E-05', keterangan:'Mouse gaming wireless',           updateAt:hariLalu(7,13) },
  { id:'BRG-006', kode:'KAM-8RW3', nama:'Canon EOS R50',               kategori:'Kamera',     stok:15,  harga:11750000, minStok:5,  lokasi:'Rak F-01', keterangan:'Mirrorless kit lens',             updateAt:hariLalu(0,10) },
  { id:'BRG-007', kode:'LPT-2VY9', nama:'Asus ROG Strix G16',          kategori:'Laptop',     stok:30,  harga:24999000, minStok:5,  lokasi:'Rak A-04', keterangan:'Laptop gaming RTX 4060',          updateAt:hariLalu(3,15) },
  { id:'BRG-008', kode:'SMP-7DQ5', nama:'Xiaomi Redmi Note 13',        kategori:'Smartphone', stok:100, harga:3299000,  minStok:25, lokasi:'Rak B-05', keterangan:'',                             updateAt:hariLalu(6,9)  },
  { id:'BRG-009', kode:'AUD-5ZK8', nama:'JBL Flip 6',                  kategori:'Audio',      stok:90,  harga:1799000,  minStok:20, lokasi:'Rak D-06', keterangan:'Speaker portable',               updateAt:hariLalu(11,10) },
  { id:'BRG-010', kode:'AKS-9PL3', nama:'Keychron K2 Keyboard',        kategori:'Aksesoris',  stok:90,  harga:1299000,  minStok:15, lokasi:'Rak E-08', keterangan:'Mechanical keyboard',             updateAt:hariLalu(5,8)  }
];

const SEED_TRX = [
  { id:'TRX-0001', jenis:'masuk',  itemId:'BRG-009', namaBarang:'JBL Flip 6',                  jumlah:20, keterangan:'Barang baru masuk gudang',  petugas:'Administrator', tanggal:hariLalu(11,10) },
  { id:'TRX-0002', jenis:'masuk',  itemId:'BRG-002', namaBarang:'iPhone 15 Pro 256GB',         jumlah:50, keterangan:'Restock dari distributor', petugas:'Administrator', tanggal:hariLalu(10,9)  },
  { id:'TRX-0003', jenis:'keluar', itemId:'BRG-002', namaBarang:'iPhone 15 Pro 256GB',         jumlah:8,  keterangan:'Pengiriman pesanan online', petugas:'Staff Gudang',  tanggal:hariLalu(9,14)  },
  { id:'TRX-0004', jenis:'masuk',  itemId:'BRG-004', namaBarang:'Sony WH-1000XM5',             jumlah:30, keterangan:'Restock dari distributor', petugas:'Administrator', tanggal:hariLalu(8,11)  },
  { id:'TRX-0005', jenis:'keluar', itemId:'BRG-005', namaBarang:'Logitech G Pro X Superlight', jumlah:12, keterangan:'Penjualan offline',         petugas:'Staff Gudang',  tanggal:hariLalu(7,16)  },
  { id:'TRX-0006', jenis:'masuk',  itemId:'BRG-003', namaBarang:'Samsung QLED TV 55"',         jumlah:15, keterangan:'Barang baru masuk gudang',  petugas:'Administrator', tanggal:hariLalu(6,10)  },
  { id:'TRX-0007', jenis:'keluar', itemId:'BRG-008', namaBarang:'Xiaomi Redmi Note 13',        jumlah:25, keterangan:'Pengiriman pesanan online', petugas:'Staff Gudang',  tanggal:hariLalu(6,15)  },
  { id:'TRX-0008', jenis:'masuk',  itemId:'BRG-010', namaBarang:'Keychron K2 Keyboard',        jumlah:40, keterangan:'Restock dari distributor', petugas:'Administrator', tanggal:hariLalu(5,9)   },
  { id:'TRX-0009', jenis:'keluar', itemId:'BRG-004', namaBarang:'Sony WH-1000XM5',             jumlah:10, keterangan:'Penjualan offline',         petugas:'Staff Gudang',  tanggal:hariLalu(4,13)  },
  { id:'TRX-0010', jenis:'masuk',  itemId:'BRG-007', namaBarang:'Asus ROG Strix G16',          jumlah:10, keterangan:'Barang baru masuk gudang',  petugas:'Administrator', tanggal:hariLalu(3,11)  },
  { id:'TRX-0011', jenis:'keluar', itemId:'BRG-003', namaBarang:'Samsung QLED TV 55"',         jumlah:5,  keterangan:'Pengiriman pesanan online', petugas:'Staff Gudang',  tanggal:hariLalu(3,16)  },
  { id:'TRX-0012', jenis:'masuk',  itemId:'BRG-001', namaBarang:'Macbook Pro M2',              jumlah:5,  keterangan:'Restock dari distributor', petugas:'Administrator', tanggal:hariLalu(2,9)   },
  { id:'TRX-0013', jenis:'keluar', itemId:'BRG-002', namaBarang:'iPhone 15 Pro 256GB',         jumlah:3,  keterangan:'Penjualan offline',         petugas:'Staff Gudang',  tanggal:hariLalu(1,14)  },
  { id:'TRX-0014', jenis:'masuk',  itemId:'BRG-006', namaBarang:'Canon EOS R50',               jumlah:5,  keterangan:'Barang baru masuk gudang',  petugas:'Administrator', tanggal:hariLalu(0,10)  }
];

/* ---------------- PENGGUNA ---------------- */
if (!localStorage.getItem(KUNCI.users)) {
  localStorage.setItem(KUNCI.users, JSON.stringify([
    { username:'admin',  password:'admin123',  nama:'Administrator', role:'admin', createdAt:new Date().toISOString() },
    { username:'gudang', password:'gudang123', nama:'Staff Gudang',  role:'staff', createdAt:new Date().toISOString() }
  ]));
}

let users = JSON.parse(localStorage.getItem(KUNCI.users) || '[]');
let usersBerubah = false;
users.forEach(u => {
  if (!u.nama)      { u.nama = u.username; usersBerubah = true; }
  if (!u.createdAt) { u.createdAt = new Date().toISOString(); usersBerubah = true; }
});
if (usersBerubah) simpanUsers();

function simpanUsers() { localStorage.setItem(KUNCI.users, JSON.stringify(users)); }

/* ---------------- STATE APLIKASI ---------------- */
let items      = muatData(KUNCI.items, SEED_ITEMS);
let transaksi  = muatData(KUNCI.trx, SEED_TRX);
let trashItems = muatData(KUNCI.trash, []);
let modeStok   = 'masuk';
let idEdit     = null;
let aksiHapus  = null;            // { tipe:'barang'|'user', id }
let chartTren = null, chartHarian = null, chartKategori = null;

/* ---------------- UTILITAS ---------------- */
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function muatData(kunci, seed) {
  const mentah = localStorage.getItem(kunci);
  if (!mentah) {
    localStorage.setItem(kunci, JSON.stringify(seed));
    return [...seed];
  }
  try { return JSON.parse(mentah); } catch { return [...seed]; }
}
function simpanItems() { localStorage.setItem(KUNCI.items, JSON.stringify(items)); }
function simpanTrx()   { localStorage.setItem(KUNCI.trx, JSON.stringify(transaksi)); }
function simpanTrash() { localStorage.setItem(KUNCI.trash, JSON.stringify(trashItems)); }

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
function formatRupiah(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}
function formatTanggal(iso) {
  return new Date(iso).toLocaleDateString('id-ID',
    { day:'2-digit', month:'long', year:'numeric' });
}
function formatTanggalPendek(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day:'2-digit', month:'short' });
}
function formatTanggalWaktu(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) +
         ' ' + d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
}
function statusStok(item) {
  if (item.stok <= 0)            return { label:'Habis',   class:'badge-red'    };
  if (item.stok <= item.minStok) return { label:'Menipis', class:'badge-orange' };
  return { label:'Tersedia', class:'badge-green' };
}
function totalUnit()      { return items.reduce((a,b) => a + b.stok, 0); }
function nilaiInventori() { return items.reduce((a,b) => a + b.stok * b.harga, 0); }
function jumlahMenipis()  { return items.filter(i => i.stok <= i.minStok).length; }
function kodeBarang(id)   { const i = items.find(x => x.id === id); return i ? i.kode : '—'; }

function buatId(awalan, daftar, digit) {
  const maks = daftar.reduce((m, x) => {
    const n = parseInt(String(x.id).replace(/\D/g, ''), 10) || 0;
    return Math.max(m, n);
  }, 0);
  return awalan + String(maks + 1).padStart(digit, '0');
}

/* ---------- Generator kode unik barang ---------- */
function generateKodeUnik(kategori) {
  const prefix = KODE_KATEGORI[kategori] || 'BRG';
  const chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa I/O/0/1 agar tak ambigu
  let kode, coba = 0;
  do {
    let suf = '';
    for (let i = 0; i < 4; i++) suf += chars[Math.floor(Math.random() * chars.length)];
    kode = prefix + '-' + suf;
    coba++;
  } while (items.some(i => i.kode === kode) && coba < 200);
  return kode;
}

/* ---------- Toast ---------- */
function toast(pesan, tipe = 'info') {
  const el = document.createElement('div');
  el.className = 'toast ' + tipe;
  const ikon = { success:'fa-circle-check', error:'fa-triangle-exclamation', info:'fa-circle-info' }[tipe] || 'fa-circle-info';
  el.innerHTML = `<i class="fa-solid ${ikon}"></i><span>${escapeHtml(pesan)}</span>`;
  const container = $('#toastContainer');
  if (container) container.appendChild(el);
  setTimeout(() => {
    el.classList.add('hide');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/* =========================================================
   EXPORT CSV
========================================================= */
function unduhCSV(namaFile, baris) {
  const csv = '\uFEFF' + baris.map(r =>
    r.map(sel => {
      const s = String(sel ?? '');
      return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(';')
  ).join('\r\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
function namaFileCSV(prefix) {
  return `GudangAzira_${prefix}_${new Date().toISOString().slice(0,10)}.csv`;
}

function exportBarangCSV() {
  const data = barangTersaring();
  if (!data.length) return toast('Tidak ada barang untuk diexport.', 'error');
  const baris = [['ID','Kode Unik','Nama Barang','Kategori','Stok','Stok Minimum','Harga (Rp)','Lokasi','Status','Terakhir Diperbarui']];
  data.forEach(i => baris.push([i.id, i.kode, i.nama, i.kategori, i.stok, i.minStok, i.harga, i.lokasi || '-', statusStok(i).label, formatTanggalWaktu(i.updateAt)]));
  unduhCSV(namaFileCSV('DaftarBarang'), baris);
  toast(`${data.length} barang berhasil diexport ke CSV.`, 'success');
}

function exportTrxCSV() {
  const data = transaksiTersaring();
  if (!data.length) return toast('Tidak ada transaksi untuk diexport.', 'error');
  const baris = [['ID','Tanggal & Waktu','Jenis','Kode Barang','Nama Barang','Jumlah','Keterangan','Petugas']];
  data.forEach(t => baris.push([t.id, formatTanggalWaktu(t.tanggal), t.jenis, kodeBarang(t.itemId), t.namaBarang, t.jumlah, t.keterangan || '-', t.petugas]));
  unduhCSV(namaFileCSV('RiwayatTransaksi'), baris);
  toast(`${data.length} transaksi berhasil diexport ke CSV.`, 'success');
}

function exportLaporanCSV() {
  const baris = [];
  baris.push(['LAPORAN INVENTORI GUDANGAZIRA']);
  baris.push(['Diexport', formatTanggalWaktu(new Date().toISOString())]);
  baris.push(['Petugas', SESSION.nama]);
  baris.push([]);

  baris.push(['RINGKASAN']);
  baris.push(['Jenis Barang', items.length]);
  baris.push(['Total Unit Stok', totalUnit()]);
  baris.push(['Nilai Inventori (Rp)', nilaiInventori()]);
  baris.push(['Stok Menipis', jumlahMenipis()]);
  baris.push(['Kapasitas Rak', `${totalUnit()} / ${KAPASITAS_RAK}`]);
  baris.push([]);

  baris.push(['KOMPOSISI PER KATEGORI']);
  baris.push(['Kategori', 'Jumlah Unit', 'Nilai (Rp)']);
  const perKat = {};
  items.forEach(i => {
    perKat[i.kategori] = perKat[i.kategori] || { unit:0, nilai:0 };
    perKat[i.kategori].unit  += i.stok;
    perKat[i.kategori].nilai += i.stok * i.harga;
  });
  Object.entries(perKat).forEach(([k, v]) => baris.push([k, v.unit, v.nilai]));
  baris.push([]);

  baris.push(['DAFTAR BARANG']);
  baris.push(['ID','Kode Unik','Nama Barang','Kategori','Stok','Stok Minimum','Harga (Rp)','Lokasi','Status','Terakhir Diperbarui']);
  items.forEach(i => baris.push([i.id, i.kode, i.nama, i.kategori, i.stok, i.minStok, i.harga, i.lokasi || '-', statusStok(i).label, formatTanggalWaktu(i.updateAt)]));
  baris.push([]);

  baris.push(['RIWAYAT TRANSAKSI']);
  baris.push(['ID','Tanggal & Waktu','Jenis','Kode Barang','Nama Barang','Jumlah','Keterangan','Petugas']);
  [...transaksi]
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .forEach(t => baris.push([t.id, formatTanggalWaktu(t.tanggal), t.jenis, kodeBarang(t.itemId), t.namaBarang, t.jumlah, t.keterangan || '-', t.petugas]));

  unduhCSV(namaFileCSV('LaporanLengkap'), baris);
  toast('Laporan lengkap berhasil diexport ke CSV.', 'success');
}

/* =========================================================
   NAVIGASI HALAMAN
========================================================= */
const JUDUL_HALAMAN = {
  dashboard: 'Dashboard',
  tambah   : 'Tambah Barang',
  daftar   : 'Daftar Barang',
  riwayat  : 'Riwayat Transaksi',
  grafik   : 'Laporan & Grafik',
  users    : 'Manajemen Pengguna',
  sampah   : 'Tempat Sampah'
};

function pindahHalaman(halaman) {
  if (halaman === 'users' && SESSION.role !== 'admin') {
    toast('Hanya Administrator yang dapat mengakses halaman tersebut.', 'error');
    return;
  }
  $$('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + halaman));
  $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.page === halaman));
  const pTitle = $('#pageTitle');
  if (pTitle) pTitle.textContent = JUDUL_HALAMAN[halaman] || 'Dashboard';
  tutupSidebar();
  window.scrollTo({ top: 0 });
  if (halaman === 'grafik') renderSemuaGrafik();
}

function bukaSidebar()  { $('#sidebar').classList.add('open'); $('#sidebarOverlay').classList.add('show'); }
function tutupSidebar() { $('#sidebar').classList.remove('open'); $('#sidebarOverlay').classList.remove('show'); }

/* ---------------- MODAL ---------------- */
function bukaModal(id)  { const m = $('#' + id); if (m) m.classList.add('show'); document.body.style.overflow = 'hidden'; }
function tutupModal(id) { const m = $('#' + id); if (m) m.classList.remove('show'); document.body.style.overflow = ''; }

/* =========================================================
   RENDER
========================================================= */
function renderSemua() {
  renderRingkasan();
  renderKapasitas();
  renderTerbaru();
  renderTabelBarang();
  renderRiwayat();
  renderSampah();
  isiPilihanBarang();
  isiFilterKategori();
  isiFilterPetugas();
  isiPilihanChartBarang();
  if (SESSION.role === 'admin') renderUsers();
  if ($('#page-grafik') && $('#page-grafik').classList.contains('active')) renderSemuaGrafik();
}

function renderRingkasan() {
  if ($('#sumJenis'))   $('#sumJenis').textContent   = items.length;
  if ($('#sumUnit'))    $('#sumUnit').textContent    = totalUnit().toLocaleString('id-ID');
  if ($('#sumNilai'))   $('#sumNilai').textContent   = formatRupiah(nilaiInventori());
  if ($('#sumMenipis')) $('#sumMenipis').textContent = jumlahMenipis();
}

function renderKapasitas() {
  const terpakai = totalUnit();
  const persen = Math.min(100, (terpakai / KAPASITAS_RAK) * 100);
  const warna  = persen >= 90 ? 'red' : persen >= 70 ? 'orange' : 'green';

  if ($('#capacityText')) $('#capacityText').textContent = `${terpakai} / ${KAPASITAS_RAK} slot digunakan`;
  if ($('#capacityInfo')) $('#capacityInfo').textContent = `Tersisa ${Math.max(0, KAPASITAS_RAK - terpakai)} slot kosong pada rak gudang.`;

  const fill = $('#capacityFill');
  if (fill) {
    fill.style.width = persen + '%';
    fill.className = 'progress-fill ' + warna;
  }

  if ($('#capMiniText')) $('#capMiniText').textContent = `${terpakai}/${KAPASITAS_RAK}`;
  const mini = $('#capMiniFill');
  if (mini) {
    mini.style.width = persen + '%';
    mini.className = 'progress-fill ' + warna;
  }
}

function renderTerbaru() {
  const tbody = $('#tbodyLatest');
  if (!tbody) return;
  const data = [...items]
    .sort((a, b) => new Date(b.updateAt) - new Date(a.updateAt))
    .slice(0, 5);

  tbody.innerHTML = data.map(i => `
    <tr>
      <td>
        <div class="item-name">${escapeHtml(i.nama)}</div>
        <div class="item-sub mono">${i.id}</div>
      </td>
      <td><span class="kode-unik"><i class="fa-solid fa-barcode"></i> ${i.kode}</span></td>
      <td><span class="badge badge-blue">${escapeHtml(i.kategori)}</span></td>
      <td><strong>${i.stok}</strong> Unit</td>
      <td>${formatRupiah(i.harga)}</td>
      <td class="muted small">${formatTanggal(i.updateAt)}</td>
      <td><span class="badge ${statusStok(i).class}">${statusStok(i).label}</span></td>
    </tr>`).join('') || `<tr><td colspan="7" class="empty">Belum ada barang.</td></tr>`;
}

function barangTersaring() {
  const qEl = $('#searchBarang');
  const katEl = $('#filterKategori');
  const q   = (qEl ? qEl.value : '').toLowerCase().trim();
  const kat = katEl ? katEl.value : '';
  return items.filter(i =>
    (!kat || i.kategori === kat) &&
    (i.nama.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.kode.toLowerCase().includes(q))
  );
}

function renderTabelBarang() {
  const tbody = $('#tbodyItems');
  if (!tbody) return;
  const data = barangTersaring();

  tbody.innerHTML = data.map(i => `
    <tr>
      <td><span class="kode-unik"><i class="fa-solid fa-barcode"></i> ${i.kode}</span></td>
      <td>
        <div class="item-name">${escapeHtml(i.nama)}</div>
        <div class="item-sub mono">${i.id} • ${escapeHtml(i.keterangan || '—')}</div>
      </td>
      <td><span class="badge badge-blue">${escapeHtml(i.kategori)}</span></td>
      <td><strong>${i.stok}</strong> <span class="muted small">/ min ${i.minStok}</span></td>
      <td>${formatRupiah(i.harga)}</td>
      <td class="muted small">${escapeHtml(i.lokasi || '—')}</td>
      <td><span class="badge ${statusStok(i).class}">${statusStok(i).label}</span></td>
      <td>
        <div class="aksi">
          <button class="btn-icon in"   data-aksi="masuk"  data-id="${i.id}" title="Stok masuk"><i class="fa-solid fa-arrow-down"></i></button>
          <button class="btn-icon out"  data-aksi="keluar" data-id="${i.id}" title="Stok keluar"><i class="fa-solid fa-arrow-up"></i></button>
          <button class="btn-icon edit" data-aksi="edit"   data-id="${i.id}" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon del"  data-aksi="hapus"  data-id="${i.id}" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </td>
    </tr>`).join('') || `<tr><td colspan="8" class="empty"><i class="fa-solid fa-box-open"></i> Tidak ada barang ditemukan.</td></tr>`;
}

function transaksiTersaring() {
  const jEl = $('#filterTrx');
  const pEl = $('#filterPetugas');
  const j = jEl ? jEl.value : '';
  const p = pEl ? pEl.value : '';
  return [...transaksi]
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .filter(t => (!j || t.jenis === j) && (!p || t.petugas === p));
}

function renderRiwayat() {
  const tbody = $('#tbodyTrx');
  if (!tbody) return;
  const data = transaksiTersaring();

  tbody.innerHTML = data.map(t => `
    <tr>
      <td class="mono muted">${t.id}</td>
      <td class="small">${formatTanggalWaktu(t.tanggal)}</td>
      <td><span class="badge ${t.jenis === 'masuk' ? 'badge-green' : 'badge-red'}">${t.jenis === 'masuk' ? '⬇ Masuk' : '⬆ Keluar'}</span></td>
      <td><span class="kode-unik"><i class="fa-solid fa-barcode"></i> ${kodeBarang(t.itemId)}</span></td>
      <td class="item-name">${escapeHtml(t.namaBarang)}</td>
      <td><strong>${t.jumlah}</strong> unit</td>
      <td class="muted small">${escapeHtml(t.keterangan || '—')}</td>
      <td class="small">${escapeHtml(t.petugas)}</td>
    </tr>`).join('') || `<tr><td colspan="8" class="empty"><i class="fa-solid fa-clock-rotate-left"></i> Belum ada transaksi.</td></tr>`;
}

/* =========================================================
   TEMPAT SAMPAH (RESTORE / HAPUS PERMANEN)
========================================================= */
function renderSampah() {
  const tbody = $('#tbodySampah');
  if (!tbody) return;

  tbody.innerHTML = trashItems.map(i => `
    <tr>
      <td><span class="kode-unik"><i class="fa-solid fa-barcode"></i> ${i.kode}</span></td>
      <td>
        <div class="item-name">${escapeHtml(i.nama)}</div>
        <div class="item-sub mono">${i.id}</div>
      </td>
      <td><span class="badge badge-blue">${escapeHtml(i.kategori)}</span></td>
      <td><strong>${i.stok}</strong> Unit</td>
      <td>${formatRupiah(i.harga)}</td>
      <td class="muted small">${formatTanggalWaktu(i.deletedAt || new Date().toISOString())}</td>
      <td>
        <div class="aksi">
          <button class="btn-icon restore" data-aksi="pulihkan" data-id="${i.id}" title="Pulihkan Barang"><i class="fa-solid fa-rotate-left"></i></button>
          <button class="btn-icon del" data-aksi="hapus-permanen" data-id="${i.id}" title="Hapus Permanen"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </td>
    </tr>`).join('') || `<tr><td colspan="7" class="empty"><i class="fa-solid fa-trash-can"></i> Tempat sampah kosong.</td></tr>`;
}

function pulihkanBarang(id) {
  const idx = trashItems.findIndex(i => i.id === id);
  if (idx === -1) return;

  const [pulih] = trashItems.splice(idx, 1);
  delete pulih.deletedAt;

  const sisaSlot = KAPASITAS_RAK - totalUnit();
  if (pulih.stok > sisaSlot) {
    toast(`Gagal memulihkan! Kapasitas rak tidak cukup (Sisa slot: ${sisaSlot}).`, 'error');
    trashItems.push(pulih);
    return;
  }

  items.push(pulih);
  simpanItems();
  simpanTrash();
  renderSemua();
  toast(`Barang "${pulih.nama}" berhasil dipulihkan ke daftar utama!`, 'success');
}

function hapusPermanen(id) {
  trashItems = trashItems.filter(i => i.id !== id);
  simpanTrash();
  renderSampah();
  toast('Barang dihapus secara permanen.', 'error');
}

function isiPilihanBarang() {
  const sel = $('#stokBarang');
  if (!sel) return;
  sel.innerHTML = items.map(i =>
    `<option value="${i.id}">${escapeHtml(i.nama)} • ${i.kode} — stok: ${i.stok}</option>`).join('')
    || '<option value="">(Belum ada barang)</option>';
}

function isiFilterKategori() {
  const sel = $('#filterKategori');
  if (!sel) return;
  const lama = sel.value;
  const unik = [...new Set(items.map(i => i.kategori))].sort();
  sel.innerHTML = '<option value="">Semua Kategori</option>' +
    unik.map(k => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join('');
  sel.value = unik.includes(lama) ? lama : '';
}

function isiFilterPetugas() {
  const sel = $('#filterPetugas');
  if (!sel) return;
  const lama = sel.value;
  const unik = [...new Set(transaksi.map(t => t.petugas))].sort();
  sel.innerHTML = '<option value="">Semua Petugas</option>' +
    unik.map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('');
  sel.value = unik.includes(lama) ? lama : '';
}

/* =========================================================
   GRAFIK (Chart.js)
========================================================= */
function isiPilihanChartBarang() {
  const sel = $('#chartBarang');
  if (!sel) return;
  const lama = sel.value;
  sel.innerHTML = items.map(i =>
    `<option value="${i.id}">${escapeHtml(i.nama)} (${i.kode})</option>`).join('');
  if (items.some(i => i.id === lama)) sel.value = lama;
}

function hitungRiwayatStok(item) {
  const trxItem = transaksi
    .filter(t => t.itemId === item.id)
    .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

  let awal = item.stok;
  trxItem.forEach(t => { awal -= (t.jenis === 'masuk' ? t.jumlah : -t.jumlah); });

  const titik = trxItem.length
    ? [{ label: 'Stok Awal', nilai: awal }]
    : [{ label: 'Saat ini', nilai: item.stok }];

  let jalan = awal;
  trxItem.forEach(t => {
    jalan += (t.jenis === 'masuk' ? t.jumlah : -t.jumlah);
    titik.push({ label: formatTanggalPendek(t.tanggal), nilai: jalan });
  });
  return titik;
}

function renderSemuaGrafik() {
  if (typeof Chart === 'undefined') {
    if ($('#chartOffline')) $('#chartOffline').classList.remove('hidden');
    return;
  }
  if ($('#chartOffline')) $('#chartOffline').classList.add('hidden');
  [chartTren, chartHarian, chartKategori].forEach(c => { if (c) c.destroy(); });
  chartTren = chartHarian = chartKategori = null;
  renderChartTren();
  renderChartHarian();
  renderChartKategori();
}

function renderChartTren() {
  const cEl = $('#chartTren');
  if (!cEl) return;
  const item = items.find(i => i.id === ($('#chartBarang') ? $('#chartBarang').value : '')) || items[0];
  if (!item) return;

  const titik = hitungRiwayatStok(item);
  chartTren = new Chart(cEl, {
    type: 'line',
    data: {
      labels: titik.map(p => p.label),
      datasets: [{
        label: `Stok ${item.nama}`,
        data: titik.map(p => p.nilai),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,.12)',
        fill: true,
        tension: .35,
        pointRadius: 4,
        pointBackgroundColor: '#2563eb'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

function renderChartHarian() {
  const cEl = $('#chartHarian');
  if (!cEl) return;
  const JUMLAH_HARI = 14;
  const labels = [], dataMasuk = [], dataKeluar = [];

  for (let i = JUMLAH_HARI - 1; i >= 0; i--) {
    const awal = new Date(); awal.setHours(0,0,0,0); awal.setDate(awal.getDate() - i);
    const akhir = new Date(awal); akhir.setHours(23,59,59,999);
    labels.push(awal.toLocaleDateString('id-ID', { day:'2-digit', month:'short' }));
    dataMasuk.push(transaksi.filter(t => {
      const w = new Date(t.tanggal);
      return w >= awal && w <= akhir && t.jenis === 'masuk';
    }).reduce((a, t) => a + t.jumlah, 0));
    dataKeluar.push(transaksi.filter(t => {
      const w = new Date(t.tanggal);
      return w >= awal && w <= akhir && t.jenis === 'keluar';
    }).reduce((a, t) => a + t.jumlah, 0));
  }

  chartHarian = new Chart(cEl, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: 'Masuk',  data: dataMasuk,  backgroundColor: '#16a34a', borderRadius: 6 },
        { label: 'Keluar', data: dataKeluar, backgroundColor: '#dc2626', borderRadius: 6 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });
}

function renderChartKategori() {
  const cEl = $('#chartKategori');
  if (!cEl) return;
  const perKat = {};
  items.forEach(i => { perKat[i.kategori] = (perKat[i.kategori] || 0) + i.stok; });

  chartKategori = new Chart(cEl, {
    type: 'doughnut',
    data: {
      labels: Object.keys(perKat),
      datasets: [{
        data: Object.values(perKat),
        backgroundColor: PALET_WARNA,
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } }
    }
  });
}

/* =========================================================
   TRANSAKSI STOK MASUK / KELUAR
========================================================= */
function catatTransaksi(jenis, item, jumlah, keterangan) {
  transaksi.push({
    id        : buatId('TRX-', transaksi, 4),
    jenis,
    itemId    : item.id,
    namaBarang: item.nama,
    jumlah,
    keterangan: keterangan || (jenis === 'masuk' ? 'Stok masuk gudang' : 'Pengeluaran stok'),
    petugas   : SESSION.nama,
    tanggal   : new Date().toISOString()
  });
}

function bukaModalStok(mode, itemId) {
  modeStok = mode;
  isiPilihanBarang();

  if ($('#modalStokIcon')) $('#modalStokIcon').className = mode === 'masuk' ? 'fa-solid fa-arrow-down' : 'fa-solid fa-arrow-up';
  if ($('#modalStokTitle')) $('#modalStokTitle').textContent = mode === 'masuk' ? 'Stok Masuk' : 'Stok Keluar';

  const btn = $('#btnSubmitStok');
  if (btn) {
    btn.className = 'btn ' + (mode === 'masuk' ? 'btn-success' : 'btn-danger');
    btn.innerHTML = mode === 'masuk'
      ? '<i class="fa-solid fa-arrow-down"></i> Simpan Stok Masuk'
      : '<i class="fa-solid fa-arrow-up"></i> Simpan Stok Keluar';
  }

  if (itemId && $('#stokBarang')) $('#stokBarang').value = itemId;
  if ($('#stokJumlah')) $('#stokJumlah').value = 1;
  if ($('#stokKet')) $('#stokKet').value = '';
  updateInfoStok();
  bukaModal('modalStok');
  setTimeout(() => { if ($('#stokJumlah')) $('#stokJumlah').focus(); }, 100);
}

function updateInfoStok() {
  const item = items.find(i => i.id === ($('#stokBarang') ? $('#stokBarang').value : ''));
  const sInfo = $('#stokInfo');
  if (!sInfo) return;
  if (!item) { sInfo.textContent = 'Stok saat ini: —'; return; }
  sInfo.innerHTML = modeStok === 'keluar'
    ? `<i class="fa-solid fa-barcode"></i> ${item.kode} — stok saat ini: <strong>${item.stok} unit</strong> (maksimal keluar ${item.stok}).`
    : `<i class="fa-solid fa-barcode"></i> ${item.kode} — stok saat ini: <strong>${item.stok} unit</strong>.`;
}

function prosesStok(e) {
  e.preventDefault();

  const item = items.find(i => i.id === $('#stokBarang').value);
  if (!item) { toast('Silakan pilih barang terlebih dahulu.', 'error'); return; }

  const jumlah = parseInt($('#stokJumlah').value, 10);
  if (!jumlah || jumlah < 1) { toast('Jumlah harus berupa angka minimal 1.', 'error'); return; }

  if (modeStok === 'masuk') {
    const sisaSlot = KAPASITAS_RAK - totalUnit();
    if (jumlah > sisaSlot) {
      toast(`Kapasitas rak tidak cukup! Sisa slot hanya ${sisaSlot}.`, 'error');
      return;
    }
    item.stok += jumlah;
    catatTransaksi('masuk', item, jumlah, $('#stokKet').value.trim());
    toast(`Stok masuk ${jumlah} unit — ${item.nama}.`, 'success');

  } else {
    if (jumlah > item.stok) {
      toast(`Stok tidak cukup! ${item.nama} hanya tersisa ${item.stok} unit.`, 'error');
      return;
    }
    item.stok -= jumlah;
    catatTransaksi('keluar', item, jumlah, $('#stokKet').value.trim());
    toast(`Stok keluar ${jumlah} unit — ${item.nama}.`, 'success');
  }

  item.updateAt = new Date().toISOString();
  simpanItems();
  simpanTrx();
  tutupModal('modalStok');
  renderSemua();
}

/* =========================================================
   TAMBAH BARANG
========================================================= */
function setKodeOtomatis() {
  const kat = $('#tbKategori') ? $('#tbKategori').value : '';
  if ($('#tbKode')) $('#tbKode').value = kat ? generateKodeUnik(kat) : '';
}

function simpanBarangBaru(e) {
  e.preventDefault();

  const nama       = $('#tbNama').value.trim();
  const kategori   = $('#tbKategori').value;
  const stok       = parseInt($('#tbStok').value, 10)   || 0;
  const harga      = parseInt($('#tbHarga').value, 10)  || 0;
  const minStok    = parseInt($('#tbMin').value, 10)    || 0;
  const lokasi     = $('#tbLokasi').value.trim();
  const keterangan = $('#tbKet').value.trim();

  if (stok > 0 && totalUnit() + stok > KAPASITAS_RAK) {
    toast(`Kapasitas rak tidak cukup! Sisa slot: ${KAPASITAS_RAK - totalUnit()}.`, 'error');
    return;
  }

  let kode = $('#tbKode').value.trim() || generateKodeUnik(kategori);
  while (items.some(i => i.kode === kode)) kode = generateKodeUnik(kategori);

  const barangBaru = {
    id: buatId('BRG-', items, 3),
    kode, nama, kategori, stok, harga, minStok, lokasi, keterangan,
    updateAt: new Date().toISOString()
  };
  items.push(barangBaru);
  if (stok > 0) catatTransaksi('masuk', barangBaru, stok, 'Stok awal barang baru');

  simpanItems();
  simpanTrx();

  e.target.reset();
  if ($('#tbStok')) $('#tbStok').value = 0;
  if ($('#tbMin'))  $('#tbMin').value  = 5;
  if ($('#tbKode')) $('#tbKode').value = '';

  renderSemua();
  pindahHalaman('daftar');
  toast(`Barang "${nama}" ditambahkan dengan kode ${kode}!`, 'success');
}

/* =========================================================
   EDIT & HAPUS BARANG (PEMINDAHAN KE TEMPAT SAMPAH)
========================================================= */
function bukaModalEdit(id) {
  idEdit = id;
  const item = items.find(i => i.id === id);
  if (!item) return;

  if ($('#editKodeShow')) $('#editKodeShow').innerHTML = `<i class="fa-solid fa-barcode"></i> Kode unik: <strong>${item.kode}</strong> (tidak dapat diubah)`;
  if ($('#editNama'))     $('#editNama').value     = item.nama;
  if ($('#editKategori')) $('#editKategori').value = item.kategori;
  if ($('#editHarga'))    $('#editHarga').value    = item.harga;
  if ($('#editMin'))      $('#editMin').value      = item.minStok;
  if ($('#editLokasi'))   $('#editLokasi').value   = item.lokasi || '';
  bukaModal('modalEdit');
}

function simpanEdit(e) {
  e.preventDefault();
  const item = items.find(i => i.id === idEdit);
  if (!item) return;

  item.nama     = $('#editNama').value.trim();
  item.kategori = $('#editKategori').value;
  item.harga    = parseInt($('#editHarga').value, 10) || 0;
  item.minStok  = parseInt($('#editMin').value, 10)  || 0;
  item.lokasi   = $('#editLokasi').value.trim();
  item.updateAt = new Date().toISOString();

  simpanItems();
  tutupModal('modalEdit');
  renderSemua();
  toast('Data barang berhasil diperbarui.', 'success');
}

function mintaHapus(tipe, id, label) {
  aksiHapus = { tipe, id };
  if (tipe === 'barang') {
    const item = items.find(i => i.id === id);
    if ($('#hapusNama')) $('#hapusNama').textContent = item ? `${item.nama} (${item.kode})` : id;
    if ($('#hapusIcon')) $('#hapusIcon').className = 'fa-solid fa-box-open';
  } else {
    if ($('#hapusNama')) $('#hapusNama').textContent = `akun "${label}"`;
    if ($('#hapusIcon')) $('#hapusIcon').className = 'fa-solid fa-user';
  }
  bukaModal('modalHapus');
}

function konfirmasiHapus() {
  if (!aksiHapus) return;

  if (aksiHapus.tipe === 'barang') {
    const idx = items.findIndex(i => i.id === aksiHapus.id);
    if (idx !== -1) {
      const [dihapus] = items.splice(idx, 1);
      dihapus.deletedAt = new Date().toISOString();
      trashItems.push(dihapus);
      simpanTrash();
      simpanItems();
      renderSemua();
      toast(`Barang "${dihapus.nama}" dipindahkan ke Tempat Sampah.`, 'info');
    }
  } else {
    users = users.filter(u => u.username !== aksiHapus.id);
    simpanUsers();
    renderUsers();
    toast(`Akun "${aksiHapus.id}" telah dihapus.`, 'success');
  }

  aksiHapus = null;
  tutupModal('modalHapus');
}

function tanganiAksiTabel(e) {
  const btn = e.target.closest('button[data-aksi]');
  if (!btn) return;
  const { aksi, id } = btn.dataset;

  if (aksi === 'masuk' || aksi === 'keluar') bukaModalStok(aksi, id);
  else if (aksi === 'edit')  bukaModalEdit(id);
  else if (aksi === 'hapus') mintaHapus('barang', id);
}

/* =========================================================
   MANAJEMEN PENGGUNA (ADMIN)
========================================================= */
function renderUsers() {
  if (SESSION.role !== 'admin') return;
  const tbody = $('#tbodyUsers');
  if (!tbody) return;

  tbody.innerHTML = users.map(u => {
    const iniSaya     = u.username === SESSION.username;
    const dilindungi  = iniSaya || u.username === 'admin';
    return `
      <tr>
        <td>
          <div class="item-name">${escapeHtml(u.nama)}</div>
          ${iniSaya ? '<span class="badge badge-blue">Anda</span>' : ''}
        </td>
        <td class="mono">${escapeHtml(u.username)}</td>
        <td><span class="badge ${u.role === 'admin' ? 'badge-orange' : 'badge-green'}">${u.role === 'admin' ? 'Administrator' : 'Staff Gudang'}</span></td>
        <td class="small muted">${u.createdAt ? formatTanggal(u.createdAt) : '—'}</td>
        <td>${dilindungi
          ? '<span class="muted small">—</span>'
          : `<button class="btn-icon del" data-user="${escapeHtml(u.username)}" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>`}
        </td>
      </tr>`;
  }).join('');
}

function simpanUserBaru(e) {
  e.preventDefault();
  const nama     = $('#uNama').value.trim();
  const username = $('#uUser').value.trim().toLowerCase();
  const pass     = $('#uPass').value;
  const role     = $('#uRole').value;

  if (nama.length < 3)                          return toast('Nama minimal 3 karakter.', 'error');
  if (!/^[a-z0-9_]{3,20}$/.test(username))      return toast('Username 3-20 karakter (huruf kecil, angka, underscore).', 'error');
  if (users.some(u => u.username === username)) return toast(`Username "${username}" sudah digunakan.`, 'error');
  if (pass.length < 6)                          return toast('Password minimal 6 karakter.', 'error');

  users.push({ username, password: pass, nama, role, createdAt: new Date().toISOString() });
  simpanUsers();

  e.target.reset();
  tutupModal('modalUser');
  renderUsers();
  toast(`User "${nama}" berhasil ditambahkan.`, 'success');
}

/* =========================================================
   INISIALISASI
========================================================= */
function init() {
  if ($('#userName'))   $('#userName').textContent   = SESSION.nama;
  if ($('#userRole'))   $('#userRole').textContent   = SESSION.role === 'admin' ? 'Administrator' : 'Staff Gudang';
  if ($('#userAvatar')) $('#userAvatar').textContent = (SESSION.nama || '?').charAt(0).toUpperCase();

  if (SESSION.role !== 'admin' && $('#navUsers')) $('#navUsers').style.display = 'none';

  $$('.nav-link').forEach(l => l.addEventListener('click', e => {
    e.preventDefault();
    pindahHalaman(l.dataset.page);
  }));
  $$('[data-goto]').forEach(el => el.addEventListener('click', e => {
    e.preventDefault();
    pindahHalaman(el.dataset.goto);
  }));

  if ($('#btnHamburger')) {
    $('#btnHamburger').addEventListener('click', () =>
      $('#sidebar').classList.contains('open') ? tutupSidebar() : bukaSidebar());
  }
  if ($('#sidebarOverlay')) $('#sidebarOverlay').addEventListener('click', tutupSidebar);

  ['btnTopMasuk', 'btnQuickMasuk'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => bukaModalStok('masuk'));
  });
  ['btnTopKeluar', 'btnQuickKeluar'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', () => bukaModalStok('keluar'));
  });

  if ($('#searchBarang'))   $('#searchBarang').addEventListener('input', renderTabelBarang);
  if ($('#filterKategori')) $('#filterKategori').addEventListener('change', renderTabelBarang);
  if ($('#filterTrx'))      $('#filterTrx').addEventListener('change', renderRiwayat);
  if ($('#filterPetugas'))  $('#filterPetugas').addEventListener('change', renderRiwayat);

  if ($('#btnExportBarang'))  $('#btnExportBarang').addEventListener('click', exportBarangCSV);
  if ($('#btnExportTrx'))     $('#btnExportTrx').addEventListener('click', exportTrxCSV);
  if ($('#btnExportLaporan')) $('#btnExportLaporan').addEventListener('click', exportLaporanCSV);

  if ($('#chartBarang')) $('#chartBarang').addEventListener('change', renderSemuaGrafik);

  if ($('#tbodyItems')) $('#tbodyItems').addEventListener('click', tanganiAksiTabel);

  /* Aksi tabel Tempat Sampah */
  const tbodySampah = $('#tbodySampah');
  if (tbodySampah) {
    tbodySampah.addEventListener('click', e => {
      const btn = e.target.closest('button[data-aksi]');
      if (!btn) return;
      const { aksi, id } = btn.dataset;
      if (aksi === 'pulihkan') pulihkanBarang(id);
      if (aksi === 'hapus-permanen') hapusPermanen(id);
    });
  }

  const btnKosongkan = $('#btnKosongkanSampah');
  if (btnKosongkan) {
    btnKosongkan.addEventListener('click', () => {
      if (trashItems.length === 0) {
        toast('Tempat sampah sudah kosong.', 'info');
        return;
      }
      if (confirm('Yakin ingin mengosongkan seluruh isi tempat sampah secara permanen?')) {
        trashItems = [];
        simpanTrash();
        renderSampah();
        toast('Tempat sampah berhasil dikosongkan.', 'success');
      }
    });
  }

  if ($('#formTambah')) {
    $('#formTambah').addEventListener('submit', simpanBarangBaru);
    $('#formTambah').addEventListener('reset', () => setTimeout(() => {
      if ($('#tbStok')) $('#tbStok').value = 0;
      if ($('#tbMin'))  $('#tbMin').value  = 5;
      if ($('#tbKode')) $('#tbKode').value = '';
    }, 0));
  }
  if ($('#tbKategori')) $('#tbKategori').addEventListener('change', setKodeOtomatis);
  if ($('#btnAcakKode')) {
    $('#btnAcakKode').addEventListener('click', () => {
      if (!$('#tbKategori') || !$('#tbKategori').value) { toast('Pilih kategori terlebih dahulu.', 'error'); return; }
      setKodeOtomatis();
    });
  }

  if ($('#formStok')) $('#formStok').addEventListener('submit', prosesStok);
  if ($('#formEdit')) $('#formEdit').addEventListener('submit', simpanEdit);
  if ($('#stokBarang')) $('#stokBarang').addEventListener('change', updateInfoStok);

  if ($('#btnTambahUser')) $('#btnTambahUser').addEventListener('click', () => bukaModal('modalUser'));
  if ($('#formUser'))       $('#formUser').addEventListener('submit', simpanUserBaru);
  if ($('#tbodyUsers')) {
    $('#tbodyUsers').addEventListener('click', e => {
      const btn = e.target.closest('button[data-user]');
      if (!btn) return;
      mintaHapus('user', btn.dataset.user, btn.dataset.user);
    });
  }

  $$('[data-close]').forEach(b => b.addEventListener('click', () => tutupModal(b.dataset.close)));
  $$('.modal-overlay').forEach(m => m.addEventListener('click', e => {
    if (e.target === m) tutupModal(m.id);
  }));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.modal-overlay.show').forEach(m => tutupModal(m.id));
  });

  if ($('#btnConfirmHapus')) $('#btnConfirmHapus').addEventListener('click', konfirmasiHapus);
  if ($('#btnLogout')) {
    $('#btnLogout').addEventListener('click', () => {
      if (confirm('Yakin ingin keluar dari aplikasi?')) {
        localStorage.removeItem(KUNCI.sesi);
        window.location.href = 'index.html';
      }
    });
  }

  renderSemua();
}

init();