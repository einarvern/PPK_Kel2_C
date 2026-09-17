# JARA — Panduan Pengembangan

Panduan ini berlaku untuk setiap perubahan di aplikasi JARA. Prioritasnya adalah menjaga perilaku yang sudah ada, konsistensi desain, dan data yang aman. Jangan melakukan perubahan di luar kebutuhan tugas.

## Gambaran proyek

- Backend: Laravel 13, PHP 8.3+, Eloquent, Inertia, dan API bearer token.
- Frontend: React 19, TypeScript, Inertia, Tailwind CSS 4, serta Vite.
- Aplikasi selalu memakai tema terang (*light-only*).
- Bahasa antarmuka dan pesan validasi adalah Bahasa Indonesia.
- Jalankan perintah dari root proyek ini (`TODOAPP`).

## Aturan Backend

### Struktur dan tanggung jawab

- Pertahankan kontrak yang sudah ada: nama route, HTTP status, bentuk respons JSON/Inertia, teks validasi, dan otorisasi tidak boleh berubah kecuali memang diminta.
- API berada di `routes/api.php` dan controller di `app/Http/Controllers`; halaman Inertia menggunakan route web di `routes/web.php`.
- Gunakan model Eloquent untuk relasi, query/reusable scope, dan aturan domain yang dipakai berulang. Hindari menyalin pengecekan atau query yang sama ke banyak route/controller.
- Gunakan request validation Laravel di server untuk seluruh input. UI validation bukan pengganti validasi backend.
- Selalu lakukan otorisasi sebelum membaca atau mengubah data proyek/tugas.
- Untuk proyek, gunakan helper yang tersedia bila sesuai: `isOwnedBy()`, `hasMember()`, `isVisibleTo()`, `withDashboardStats()`, dan `dashboardData()`.
- Role middleware tunggal adalah `role:admin` dan `role:not-admin`. Jangan menambahkan kembali `EnsureUserIsAdmin`, `EnsureUserIsNotAdmin`, alias `admin`, atau alias `not_admin`.
- Route API yang membutuhkan login menggunakan `auth.api`; route web yang membutuhkan login menggunakan `auth`.
- Admin hanya mengelola akun pengguna. Jangan memberi admin akses membuat, bergabung, atau mengelola proyek/tugas tanpa perubahan kebutuhan yang eksplisit.
- Gunakan nama, pesan, dan status HTTP yang konsisten dengan endpoint sejenis. Untuk API, pertahankan pola respons `success`, `message`, dan/atau `data` yang sudah digunakan.

### Migration dan perubahan skema

1. Periksa schema, model, relasi, factory, seeder, dan migration terkait sebelum membuat perubahan.
2. Untuk tabel baru, buat migration baru dengan Artisan, misalnya `php artisan make:migration create_example_table --create=example_table`.
3. Untuk perubahan tabel yang sudah ada, selalu buat migration baru, misalnya `php artisan make:migration add_example_to_projects_table --table=projects`. Jangan mengedit migration lama yang mungkin sudah dijalankan di mesin lain.
4. Beri nama migration yang menjelaskan aksi dan tabelnya: `create_*_table`, `add_*_to_*_table`, `change_*_on_*_table`, atau `drop_*_from_*_table`.
5. Tentukan kolom secara eksplisit: tipe data, `nullable()`, nilai default, batas panjang, `unique()`, dan `index()` harus mencerminkan aturan data sebenarnya.
6. Gunakan foreign key Eloquent/Laravel yang jelas, misalnya `foreignId('project_id')->constrained()->cascadeOnDelete()`, hanya bila penghapusan berantai memang benar secara bisnis.
7. `up()` menerapkan satu perubahan terarah; `down()` harus membalik perubahan tersebut dengan aman. Hapus index/foreign key sebelum kolom atau tabel bila diperlukan.
8. Setelah schema berubah, selaraskan model (`$fillable`, `$casts`, relasi), validasi, factory, seeder, controller/resource yang terkait, dan test. Jangan menambah kolom database yang tidak benar-benar dipakai.
9. Jangan menjalankan `migrate:fresh`, `db:wipe`, atau operasi penghapusan data pada database bersama/berisi data tanpa persetujuan eksplisit. Untuk perubahan normal, gunakan `php artisan migrate` pada database pengembangan.
10. Verifikasi migration baru dengan test yang relevan dan `php artisan migrate:status`. Gunakan `RefreshDatabase` untuk test yang membutuhkan database bersih.

### Kualitas dan verifikasi backend

- Format PHP dengan `vendor/bin/pint` dan cek dengan `vendor/bin/pint --test`.
- Jalankan analisis statis dengan `vendor/bin/phpstan analyse --memory-limit=512M`.
- Jalankan `php artisan test` setelah mengubah backend. Tambahkan/ubah test feature ketika perilaku yang dipengaruhi berubah atau belum tercakup.
- Jangan menyembunyikan error PHPStan dengan baseline atau `@phpstan-ignore`; perbaiki tipe atau logika dasarnya.

## Aturan Frontend

### Tema visual JARA

- JARA adalah aplikasi hijau dengan tampilan putih/terang. Jangan menambah mode gelap, toggle tema, atau kelas `dark:` pada kode baru.
- Font utama adalah `Instrument Sans`, didefinisikan melalui `--font-sans` di `resources/css/app.css`. Jangan mengganti font global tanpa persetujuan desain.
- Gunakan Tailwind CSS 4 dan token utilitas yang sudah ada; jangan membuat stylesheet ad-hoc untuk satu komponen bila utilitas Tailwind cukup.
- Palet utama:

  | Peran | Kelas utama |
  | --- | --- |
  | Aksi/brand utama | `emerald-600`; hover `emerald-700`; focus ring `emerald-500` |
  | Latar aksen lembut | `emerald-50` atau `emerald-100` |
  | Teks utama | `slate-900` |
  | Teks sekunder | `slate-500` atau `slate-600` |
  | Latar halaman | `slate-50` |
  | Permukaan/card | `white` dengan border `slate-100`/`slate-200` |
  | Status selesai/sukses | emerald |
  | Status sedang/progres | teal |
  | Prioritas sedang/peringatan | amber |
  | Hapus/error/prioritas tinggi | rose |

- Jangan memakai warna acak untuk elemen semantik. Pakai `Button`, `Badge`, `Toast`, dan `ProgressBar` agar status dan aksi selalu konsisten.

### Komponen, layout, dan interaksi

- Gunakan komponen dasar di `resources/js/components/ui` sebelum membuat komponen baru: `Button`, `Input`, `Textarea`, `Select`, `Modal`, `ConfirmDialog`, `Badge`, `Toast`, dan `ProgressBar`.
- Gunakan `cn()` dari `resources/js/lib/utils` untuk menggabungkan class conditional.
- Gunakan ukuran visual yang konsisten: card `rounded-xl` atau `rounded-2xl`, kontrol/form `rounded-lg`, badge `rounded-md`, avatar/tag kecil `rounded-full` bila berbentuk bulat.
- Tombol aksi primer memakai `Button variant="primary"`; aksi destruktif memakai `variant="danger"`; aksi sekunder/aman memakai `secondary` atau `outline`.
- Aksi hapus harus melalui `ConfirmDialog` yang ringkas. Jangan membuat halaman 404, halaman baru, atau dialog yang terlalu besar untuk konfirmasi sederhana.
- Layout halaman terautentikasi memakai `AppLayout`; halaman tamu memakai `GuestLayout`. Jangan menduplikasi navigation, header, atau footer di setiap halaman.
- Gunakan aset publik yang tersedia dengan path absolut, misalnya `/notetakingcat.png` untuk logo dan `/defaultprofile.png` sebagai fallback avatar.
- Bedakan peran di UI secara jelas namun ringan: tampilkan `Owner` untuk pemilik dan `Member` untuk anggota; admin hanya melihat ruang pengelolaan pengguna.
- Pertahankan aksesibilitas: semua tombol punya `type` yang sesuai, input berlabel, gambar bermakna memiliki `alt`, state disabled/loading jelas, dan focus ring tetap tersedia.

### Data, TypeScript, dan verifikasi frontend

- Simpan tipe domain di `resources/js/types`; jangan menambah props, tipe, atau konstanta yang belum dipakai.
- Gunakan helper bersama di `resources/js/lib` untuk logika kecil yang digunakan di beberapa lokasi. Contoh: `formatDateOnly`, `toDateInputValue`, dan `firstError`.
- Jangan mengubah payload Inertia/API secara sepihak di frontend. Selaraskan perubahan kontrak dengan backend dan type terkait dalam satu perubahan.
- Gunakan `router`/`Link` dari Inertia untuk navigasi dan mutasi data, bukan refresh browser manual.
- Jalankan `npm run types:check`, `npm run check`, dan `npm run build` setelah mengubah frontend. Pastikan tidak ada warning/lint error baru.

## Checklist sebelum menyerahkan perubahan

- Perubahan hanya mencakup kebutuhan yang diminta dan tidak menghapus pekerjaan pengguna yang tidak terkait.
- Migration baru memiliki `up()` dan `down()` yang benar serta model/test terkait telah diselaraskan.
- Role, authorization, validasi server, dan respons error telah dipertahankan atau sengaja diuji bila berubah.
- UI tetap light-only, memakai palet JARA, responsive, dan menggunakan komponen bersama bila tersedia.
- Test, type check, formatter/lint, serta build yang relevan sudah lulus.
