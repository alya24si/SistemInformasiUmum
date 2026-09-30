<?php

/* ========================================================= */
/* KATALOG PERMISSION (daftar hak akses setiap role)         */
/* Format hak: "modul.aksi"   |   '*' = boleh semua          */
/* Dibaca oleh middleware CekPermission.php                  */
/* ========================================================= */

// Hak dasar semua orang yang sudah login
$dasar = [
    'ruangan.view',
    'booking.view',
    'booking.create',
    'kerusakan.view',
    'kerusakan.create',
    'perbaikan.view',
];

return [
    'superadmin' => ['*'],

    'admin_keuangan' => array_merge($dasar, [
        'program_kerja.view', 'program_kerja.manage', 'program_kerja.kegiatan_manage',
        'anggaran.view', 'anggaran.create', 'anggaran.update_pagu',
        'anggaran.input_realisasi', 'anggaran.delete', 'anggaran.riwayat_view',
        'iuran.view', 'iuran.import', 'iuran.create', 'iuran.update',
        'iuran.delete', 'iuran.kelola_bulanan',
    ]),

    'admin_kepegawaian' => array_merge($dasar, [
        'pegawai.view', 'pegawai.create', 'pegawai.import', 'pegawai.update', 'pegawai.delete',
        'absensi.view', 'absensi.create', 'absensi.import', 'absensi.update', 'absensi.delete',
        'pelanggaran.view', 'pelanggaran.import', 'pelanggaran.delete',
        'pelanggaran.update_jumlah', 'pelanggaran.tambah_pegawai',
    ]),

    'admin_rumahtangga' => array_merge($dasar, [
        'ruangan.manage', 'booking.manage', 'kerusakan.manage',
        'perbaikan.create', 'perbaikan.manage',
    ]),

    // sementara disamakan dengan rumah tangga, kabari kalau seharusnya beda
    'admin_umum' => array_merge($dasar, [
        'ruangan.manage', 'booking.manage', 'kerusakan.manage',
        'perbaikan.create', 'perbaikan.manage',
    ]),

    'pegawai' => array_merge($dasar, [
        'pelanggaran.view_own',
        'absensi.view_own',
        'iuran.view_own',
    ]),

    'guest' => array_merge($dasar, [
        'program_kerja.view',
        'anggaran.view',
    ]),
];