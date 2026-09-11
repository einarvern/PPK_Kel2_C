# TaskTeam (Jara) — Aplikasi Manajemen Tugas & Kolaborasi Tim
> **Repositori Resmi:** PPK Kelompok 2 Kelas C  
> **Mata Kuliah / Praktikum:** Praktikum Pemrograman Komputer (PPK)  
> **Tech Stack:** Laravel Framework (PHP) • Inertia.js / Blade • React 19 • Tailwind CSS • MySQL 8.4

---

## 📌 1. Deskripsi Proyek

**TaskTeam (Jara)** adalah aplikasi berbasis web yang dirancang untuk mempermudah individu dan tim dalam merencanakan, mengorganisasi, dan memantau penyelesaian tugas secara terstruktur dan transparan.

Aplikasi ini mendukung alur kerja kolaboratif:
- **Pengguna** dapat membuat ruang kerja (*project*), mengatur prioritas dan tenggat waktu tugas, menandai tugas yang telah rampung, serta mengundang anggota tim untuk berkolaborasi.
- **Pemilik Proyek (*Project Owner*)** memiliki kontrol penuh terhadap keanggotaan dan pengaturan proyek.
- **Admin Sistem** memiliki hak akses khusus untuk mengelola akun pengguna di seluruh sistem.
- **Metrik Progres Real-time** menghitung persentase penyelesaian tugas secara dinamis dan mendeteksi tugas yang mendekati atau telah melewati tenggat waktu (*overdue*).

---

## 👥 2. Tim Pengembang & Pembagian Tugas

Proyek ini dikembangkan oleh **Kelompok 2 Kelas C** dengan pembagian tanggung jawab teknis sebagai berikut:

| Peran | Penanggung Jawab | Fokus Utama | Lingkup Pekerjaan |
| :--- | :--- | :--- | :--- |
| **Rafi Anandra Dharmawan 24060124130071** | *Backend Core & Admin* | Autentikasi, Keamanan, & Akun User | Skema tabel `users`, registrasi & login, hashing password, otorisasi role (`admin` vs `pengguna`), middleware token/sesi, serta API CRUD User oleh Admin. |
| **Yuma Hazza Yuditama 24060124120035** | *Backend Project & Task* | Logika Bisnis Proyek & Tugas | Skema tabel `projects`, `project_members`, `tasks`, API CRUD Proyek & Anggota, API CRUD Tugas & Status, kalkulasi persentase progres, dan query filter deadline. |
| **Rio Setiawan Hastanu Putra 24060124130068** | *Frontend UI/UX & Integrasi* | Antarmuka web responsif, layout & proteksi halaman, form login/register, dashboard metrik, board/list tugas, modal tugas & anggota, UI admin, serta integrasi penuh ke backend. |

### Matriks Tanggung Jawab & Integrasi

```
┌──────────────────────────────────────┐       ┌──────────────────────────────────────┐
│             Programmer 1             │       │             Programmer 2             │
│        (Backend Core & Admin)        │       │       (Backend Project & Task)       │
│  - User Schema & Role RBAC           │       │  - Project & Task Schema             │
│  - Auth API (Register/Login/Logout)  │       │  - Project & Member Management API   │
│  - Admin User Management API         │       │  - Task CRUD & Progress Calculation  │
└──────────────────┬───────────────────┘       └──────────────────┬───────────────────┘
                   │                                              │
                   │         Standardized API & Data Contract     │
                   └──────────────────────┬───────────────────────┘
                                          │
                                          ▼
                      ┌───────────────────────────────────────┐
                      │             Programmer 3              │
                      │     (Frontend UI/UX & Integrasi)      │
                      │  - Responsive UI/UX (Desktop & Mobile)│
                      │  - Auth & Admin Route Protection      │
                      │  - Dashboard & Project Board UI       │
                      │  - Task & Member Modals               │
                      │  - Dynamic Progress Bar & Filters     │
                      │  - Full API Integration & Feedback    │
                      └───────────────────────────────────────┘
```

---

## 🚀 3. Fitur Utama Aplikasi (Berdasarkan PRD)

### 3.1. Autentikasi & Otorisasi
- **Registrasi & Login Akun**: Pendaftaran akun baru dengan validasi format email unik dan password yang diamankan dengan algoritma hashing bcrypt.
- **Multi-Role Access**:
  - **Pengguna Biasa**: Mengelola proyek sendiri dan berkolaborasi pada proyek yang diundang.
  - **Admin**: Akses panel khusus untuk mengelola, menambah, dan menghapus pengguna sistem.
- **Proteksi Rute**: Mengalihkan pengguna non-otentikasi ke halaman login dan membatasi halaman admin hanya untuk role `admin`.

### 3.2. Ruang Kerja & Kolaborasi Proyek
- **Multi-Project Support**: Pengguna dapat membuat lebih dari satu proyek/daftar tugas.
- **Kepemilikan Proyek (*Project Ownership*)**: Setiap proyek memiliki satu pemilik tetap (*owner*).
- **Manajemen Anggota**: Pemilik proyek dapat mengundang anggota melalui email dan mengeluarkan anggota dari proyek.
- **Akses Anggota**: Anggota yang tergabung dapat melihat seluruh tugas dalam proyek tersebut.

### 3.3. Pengelolaan Tugas (*Task Management*)
- **Atribut Tugas Lengkap**: Judul tugas, deskripsi, status, prioritas, dan tenggat waktu (*deadline*).
- **Klasifikasi Status Tugas**:
  - `Belum dikerjakan` (*To Do*)
  - `Sedang dikerjakan` (*In Progress*)
  - `Selesai` (*Completed*)
- **Klasifikasi Prioritas Tugas**:
  - `Rendah` (*Low*)
  - `Sedang` (*Medium*)
  - `Tinggi` (*High*)
- **Quick Status Toggle**: Kemudahan menandai tugas selesai langsung dari kartu tugas.

### 3.4. Kalkulasi & Pemantauan Progres
- **Persentase Progres Otomatis**: Dihitung dengan formula:
  $$\text{Progres} = \frac{\text{Jumlah Tugas Selesai}}{\text{Jumlah Seluruh Tugas}} \times 100\%$$
  *(Bernilai 0% jika proyek belum memiliki tugas)*.
- **Monitoring Tenggat Waktu**:
  - Filter tugas yang mendekati tenggat waktu (*Due Soon*).
  - Indikator peringatan visual untuk tugas yang telah melewati batas waktu (*Overdue*).

### 3.5. Panel Administrasi Pengguna
- Melihat daftar lengkap pengguna terdaftar dalam sistem.
- Pembuatan akun pengguna baru secara manual oleh admin.
- Penghapusan akun pengguna dengan mekanisme penanganan data terkait (*cascading / data integrity*).

---

## 🗄️ 4. Skema Basis Data

Sistem menggunakan 4 entitas utama yang saling berelasi:

```mermaid
erDiagram
    User ||--o{ Project : "owns"
    User ||--o{ ProjectMember : "participates_in"
    Project ||--o{ ProjectMember : "has"
    Project ||--o{ Task : "contains"

    User {
        bigint id PK
        string nama
        string email UK
        string password
        string role "admin | user"
        datetime created_at
        datetime updated_at
    }

    Project {
        bigint id PK
        string nama
        text deskripsi
        bigint owner_id FK
        datetime tanggal_dibuat
        datetime updated_at
    }

    ProjectMember {
        bigint id PK
        bigint project_id FK
        bigint user_id FK
        datetime tanggal_bergabung
    }

    Task {
        bigint id PK
        bigint project_id FK
        string judul
        text deskripsi
        string prioritas "Rendah | Sedang | Tinggi"
        string status "Belum dikerjakan | Sedang dikerjakan | Selesai"
        date deadline "nullable"
        datetime created_at
        datetime updated_at
    }
```

---

## 🔌 5. Standardisasi Kontrak Rute & API

Untuk memudahkan integrasi antara **Programmer 1 & 2 (Backend)** dengan **Programmer 3 (Frontend)**, rute disepakati sebagai berikut:

### Format Standar Respon JSON
```json
// Respon Berhasil
{
  "success": true,
  "data": { ... },
  "message": "Operasi berhasil"
}

// Respon Gagal / Validasi
{
  "success": false,
  "message": "Validasi gagal atau terjadi kesalahan",
  "errors": {
    "field": ["Pesan error"]
  }
}
```

### Rincian Endpoint Rute

| Modul | Method | Endpoint | Akses | Penanggung Jawab |
| :--- | :---: | :--- | :---: | :--- |
| **Auth** | `POST` | `/register` | Public | Programmer 1 |
| **Auth** | `POST` | `/login` | Public | Programmer 1 |
| **Auth** | `POST` | `/logout` | Auth | Programmer 1 |
| **Admin** | `GET` | `/admin/users` | Admin | Programmer 1 |
| **Admin** | `POST` | `/admin/users` | Admin | Programmer 1 |
| **Admin** | `DELETE` | `/admin/users/{id}` | Admin | Programmer 1 |
| **Dashboard**| `GET` | `/dashboard` | Auth | Programmer 2 & 3 |
| **Project** | `GET` | `/projects/{id}` | Member/Owner | Programmer 2 |
| **Project** | `POST` | `/projects` | Auth | Programmer 2 |
| **Project** | `PUT` | `/projects/{id}` | Owner | Programmer 2 |
| **Project** | `DELETE` | `/projects/{id}` | Owner | Programmer 2 |
| **Member** | `POST` | `/projects/{id}/members` | Owner | Programmer 2 |
| **Member** | `DELETE` | `/projects/{id}/members/{userId}` | Owner | Programmer 2 |
| **Task** | `POST` | `/projects/{id}/tasks` | Member/Owner | Programmer 2 |
| **Task** | `PUT` | `/tasks/{id}` | Member/Owner | Programmer 2 |
| **Task** | `PATCH`| `/tasks/{id}/status` | Member/Owner | Programmer 2 |
| **Task** | `DELETE`| `/tasks/{id}` | Member/Owner | Programmer 2 |

---

## 🔑 6. Kredensial Akun Uji Coba (Demo Accounts)

Untuk mempermudah pengujian alur autentikasi, hak akses multi-role, dan fitur admin, gunakan akun-akun yang telah disediakan berikut:

| Peran (*Role*) | Nama Pengguna | Alamat Email | Kata Sandi (*Password*) | Hak Akses Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Administrator TaskTeam | `admin@taskteam.test` | `password123` | Akses penuh ke seluruh sistem + Panel Admin (`/admin/users`) untuk manajemen akun pengguna. |
| **Administrator (Cadangan)** | Admin Sistem | `admin@example.com` | `password123` | Akun administrator cadangan. |
| **Pengguna Biasa** | Rio Setiawan | `rio@taskteam.test` | `password123` | Mengelola proyek sendiri, membuat tugas, dan berkolaborasi pada proyek tim. |

> **Tips Cepat:** Di halaman login (`/login`), tersedia tombol demo **"Isi Akun Admin"** dan **"Isi User Rio"** yang secara otomatis mengisikan form kredensial untuk mempermudah demonstrasi.

---

## 💻 7. Panduan Instalasi & Menjalankan Proyek

### Prasyarat Sistem
- **PHP** >= 8.3 (dengan ekstensi `pdo_mysql`, `mbstring`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`)
- **Composer** >= 2.x
- **Node.js** >= 20.x & **npm**
- **Docker & Docker Compose** (Opsional untuk container MySQL) atau MySQL Server lokal

---

### Langkah-Langkah Menjalankan Proyek

#### 1. Masuk ke Direktori Aplikasi
```bash
cd TODOAPP
```

#### 2. Pasang Dependensi Backend & Frontend
```bash
# Install dependensi PHP (Laravel)
composer install

# Install dependensi JavaScript (React & Tailwind)
npm install
```

#### 3. Konfigurasi Environment File
Salin file konfigurasi `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Generate kunci enkripsi aplikasi:
```bash
php artisan key:generate
```

#### 4. Konfigurasi Basis Data (Docker Compose atau MySQL Lokal)
Jika menggunakan **Docker Compose** yang sudah disediakan:
Sesuaikan port dan kredensial pada file `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3307
DB_DATABASE=laravel
DB_USERNAME=nandra
DB_PASSWORD=password
DB_ROOT_PASSWORD=password123
```
Jalankan container database:
```bash
docker compose up -d
```

#### 5. Menjalankan Migrasi & Seeder Database
Jalankan migrasi skema tabel dan isi data awal (*seeder*) akun pengujian:
```bash
# Opsi 1: Migrasi sekaligus menjalankan seeder (Sangat Direkomendasikan)
php artisan migrate --seed

# Opsi 2: Migrasi terpisah lalu panggil seeder secara manual
php artisan migrate
php artisan db:seed
```
*Catatan: Jika ingin mereset ulang seluruh data database ke kondisi awal demo, jalankan `php artisan migrate:fresh --seed`.*

#### 6. Menjalankan Server Pengembangan (Dev Server)
Jalankan proses server Laravel dan asset bundler Vite:
```bash
# Opsi A: Menjalankan keduanya sekaligus via composer
composer run dev

# Opsi B: Menjalankan di dua terminal terpisah
# Terminal 1 (Backend):
php artisan serve

# Terminal 2 (Frontend Vite):
npm run dev
```
Buka browser dan akses aplikasi di: `http://localhost:8000`

---

## ✅ 8. Kriteria Penerimaan MVP (*Acceptance Criteria*)

Sebelum peluncuran rilis awal, seluruh tim menguji 6 skenario keberhasilan MVP:
1. **Autentikasi**: Pengguna berhasil melakukan registrasi, masuk sistem (login), dan keluar sistem (logout).
2. **Multi-Proyek**: Pengguna dapat membuat minimal 2 proyek dengan ruang kerja terpisah.
3. **Pengelolaan Tugas**: Pengguna dapat menambahkan tugas lengkap dengan prioritas dan tenggat waktu, lalu mengubah statusnya menjadi *Selesai*.
4. **Kolaborasi Anggota**: Pemilik proyek dapat menambahkan pengguna lain sebagai anggota, dan anggota tersebut dapat melihat daftar tugas proyek.
5. **Kalkulasi Progres**: Nilai persentase progres proyek ter-update otomatis ketika status tugas diubah menjadi *Selesai*.
6. **Administrasi Sistem**: Akun dengan peran Admin dapat melihat, menambahkan, dan menghapus akun pengguna dari sistem.

---

## 🔭 9. Batasan Sistem (*Out of Scope MVP*)

Fitur berikut tidak dimasukkan ke dalam ruang lingkup MVP dan direncanakan untuk pengembangan tahap lanjut:
- Notifikasi email atau notifikasi web push.
- Unggah berkas lampiran (*file attachment*), komentar pada tugas, dan log riwayat aktivitas.
- Pembagian tugas otomatis (*smart task assignment*) dan integrasi kalender eksternal (Google Calendar).
- Aplikasi mobile native (Android/iOS).

---

## 📂 10. Struktur Direktori Proyek

```
PPK_Kel2_C/
├── README.md                      # Dokumentasi utama proyek
└── TODOAPP/                       # Kode sumber aplikasi Laravel
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/       # Controller (Auth, Admin, Project, Task)
    │   │   └── Middleware/        # Auth & Role middleware
    │   └── Models/                # Model Eloquent (User, Project, ProjectMember, Task)
    ├── config/                    # File konfigurasi aplikasi
    ├── database/
    │   ├── migrations/            # File migrasi skema tabel
    │   └── seeders/               # Data awal (AdminUserSeeder, DatabaseSeeder)
    ├── docker-compose.yml         # Konfigurasi container database MySQL
    ├── resources/
    │   ├── css/                   # Styling Tailwind CSS
    │   ├── js/                    # Komponen frontend (React / Inertia)
    │   └── views/                 # Root blade template
    ├── routes/
    │   └── web.php                # Definisi rute web & API
    ├── composer.json              # Dependensi PHP
    └── package.json               # Dependensi JavaScript
```

---
*Dikembangkan oleh Kelompok 2 Kelas C — Praktikum Pemrograman Komputer (PPK).*
