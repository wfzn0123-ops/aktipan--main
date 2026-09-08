# BE_AKTIPAN-MAIN - Backend Server & API

Layanan backend API dan Real-time WebSocket untuk platform **AKTIPAN Workspace** (Active & Fun Games SaaS).

---

## 📌 Fitur Utama

1. **Autentikasi & Otorisasi Maksimal (JWT & RBAC)**:
   - Registrasi user baru dengan validasi dan enkripsi bcrypt.
   - Login aman menghasilkan token JWT (JSON Web Token).
   - Middleware `verifyToken` dan `requireRole` untuk proteksi endpoint.
   - Role-Based Access Control: `Admin`, `Trainer`, `MC / Host`, `Fasilitator`, `HR / L&D`, `Guru / Dosen`, `EO`.
   - Audit trail sistem (Audit Logs) untuk mencatat aktivitas penting.

2. **Admin Dashboard API (`/api/admin/*`)**:
   - `GET /api/admin/stats`: Statistik komprehensif, metrik user, aktivitas, sesi, status server.
   - `GET /api/admin/users`: Daftar seluruh pengguna dengan filter dan pencarian.
   - `PUT /api/admin/users/:id`: Edit role (Promote ke Admin, Trainer, dll.) dan status aktif.
   - `DELETE /api/admin/users/:id`: Hapus akun pengguna.
   - `GET /api/admin/audit-logs`: Riwayat audit sistem.

3. **Manajemen Aktivitas & Game (`/api/activities/*`)**:
   - 132+ game standar terisi otomatis (Ice Breaking, Energizer, Team Building, dll.).
   - Tambah game kustom, edit, dan hapus.
   - Fitur favorit / bookmark tersimpan per akun.

4. **Sesi Acara & Paket Game (`/api/sessions/*`, `/api/packs/*`)**:
   - Manajemen rundown sesi acara per pengguna.
   - Paket game bundle premium.

5. **Real-time Live Arena (`ws://localhost:5000/ws/arena`)**:
   - WebSocket game arena untuk simulasi panggung, bel refleks cepat, dan live multiplayer.

---

## 🔑 Akun Default (Pre-seeded)

| Peran | Email | Password |
|---|---|---|
| **Super Admin** | `admin@aktipan.com` | `admin123` |
| **Trainer Demo** | `andika@aktipan.com` | `password123` |
| **MC / Host Demo** | `sarah@aktipan.com` | `password123` |

---

## 🚀 Cara Menjalankan Backend

```bash
# 1. Masuk ke direktori backend
cd be_aktipan-main

# 2. Install dependensi
npm install

# 3. Jalankan development server
npm run dev

# Server akan aktif di http://localhost:5000
```

---

## 📡 Daftar Endpoint API

### Autentikasi
- `POST /api/auth/register` - Daftar akun baru
- `POST /api/auth/login` - Masuk dengan email & password
- `GET /api/auth/me` - Verifikasi token & ambil data profil aktif
- `POST /api/auth/logout` - Keluar akun
- `PUT /api/auth/profile` - Perbarui profil (nama, telepon, dll.)
- `PUT /api/auth/change-password` - Ganti password

### Admin (Khusus Role `Admin`)
- `GET /api/admin/stats` - Statistik ringkasan sistem
- `GET /api/admin/users` - Kelola semua user
- `PUT /api/admin/users/:id` - Ubah role atau status user
- `DELETE /api/admin/users/:id` - Hapus user
- `GET /api/admin/audit-logs` - Log aktivitas sistem

### Aktivitas & Game
- `GET /api/activities` - Daftar semua game
- `GET /api/activities/:id` - Detail satu game
- `POST /api/activities` - Buat game baru
- `PUT /api/activities/:id` - Edit game
- `DELETE /api/activities/:id` - Hapus game
- `GET /api/activities/saved` - Ambil daftar game favorit user
- `POST /api/activities/saved/:id` - Toggle bookmark game

### Sesi Acara
- `GET /api/sessions` - Sesi acara milik user
- `POST /api/sessions` - Buat sesi acara baru
- `PUT /api/sessions/:id` - Update sesi
- `DELETE /api/sessions/:id` - Hapus sesi
