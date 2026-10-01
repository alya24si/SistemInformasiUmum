<?php

/* ========================================================= */
/* KATALOG PERMISSION (daftar hak akses setiap role)         */
/* Format hak: "modul.aksi"   |   '*' = boleh semua          */
/* Dibaca oleh middleware CekPermission.php                  */
/* ========================================================= */

return [
    // Superadmin: Akses penuh ke semua fitur tanpa batasan permission
    'superadmin' => ['*'],

    // Admin Keuangan: Mengelola program kerja, anggaran, dan iuran (Kang Cepot)
    'admin_keuangan' => [
        'ruangan.view', 'booking.view', 'booking.create', 'kerusakan.view', 'kerusakan.create', 'perbaikan.view',
        'program_kerja.view', 'program_kerja.manage', 'program_kerja.kegiatan_manage',
        'anggaran.view', 'anggaran.create', 'anggaran.update_pagu',
        'anggaran.input_realisasi', 'anggaran.delete', 'anggaran.riwayat_view',
        'iuran.view', 'iuran.import', 'iuran.create', 'iuran.update',
        'iuran.delete', 'iuran.kelola_bulanan',
    ],

    // Admin Kepegawaian: Mengelola data pegawai, absensi, dan pelanggaran
    'admin_kepegawaian' => [
        'ruangan.view', 'booking.view', 'booking.create', 'kerusakan.view', 'kerusakan.create', 'perbaikan.view',
        'pegawai.view', 'pegawai.create', 'pegawai.import', 'pegawai.update', 'pegawai.delete',
        'absensi.view', 'absensi.create', 'absensi.import', 'absensi.update', 'absensi.delete',
        'pelanggaran.view', 'pelanggaran.import', 'pelanggaran.delete',
        'pelanggaran.update_jumlah', 'pelanggaran.tambah_pegawai',
    ],

    // Admin Rumah Tangga: Mengelola fasilitas, booking, kerusakan, dan perbaikan
    // ✨ DIBUAT EKSPLISIT TANPA array_merge UNTUK MENGHINDARI MASALAH CACHE/VARIABEL
    'admin_rumahtangga' => [
        'ruangan.view', 'ruangan.manage',
        'booking.view', 'booking.create', 'booking.manage',
        'kerusakan.view', 'kerusakan.create', 'kerusakan.manage',
        'perbaikan.view', 'perbaikan.create', 'perbaikan.manage',
    ],

    // Admin Umum: Sementara disamakan dengan rumah tangga
    'admin_umum' => [
        'ruangan.view', 'ruangan.manage',
        'booking.view', 'booking.create', 'booking.manage',
        'kerusakan.view', 'kerusakan.create', 'kerusakan.manage',
        'perbaikan.view', 'perbaikan.create', 'perbaikan.manage',
    ],

    // Pegawai: Hanya boleh melihat data miliknya sendiri
    'pegawai' => [
        'ruangan.view', 'booking.view', 'booking.create', 'kerusakan.view', 'kerusakan.create', 'perbaikan.view',
        'pegawai.view',
        'absensi.view', 'absensi.view_own',
        'pelanggaran.view', 'pelanggaran.view_own',
        'iuran.view', 'iuran.view_own',
    ],

    // Guest: Hanya boleh melihat data program kerja dan anggaran (read-only)
    'guest' => [
        'ruangan.view', 'booking.view', 'booking.create', 'kerusakan.view', 'kerusakan.create', 'perbaikan.view',
        'program_kerja.view',
        'anggaran.view',
        'anggaran.riwayat_view',
    ],
];