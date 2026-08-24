<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    // Helper: insert hanya kalau username belum ada (aman dijalankan ulang)
    private function tambah(array $data): void
    {
        if (DB::table('users')->where('username', $data['username'])->first()) return;
        DB::table('users')->insert(array_merge($data, [
            'created_at' => now(),
            'updated_at' => now(),
        ]));
    }

    public function up(): void
    {
        // ============ 1. SUPERADMIN & ADMIN ============
      
        $this->tambah(['username' => 'superadmin',  'password' => Hash::make('Super@2026'),     'nama' => 'Super Admin',       'role' => 'superadmin',       'bidang' => '', 'nip' => null]);
        $this->tambah(['username' => 'keuangan',    'password' => Hash::make('Keuangan#2026'),  'nama' => 'Admin Keuangan',    'role' => 'admin_keuangan',   'bidang' => '', 'nip' => null]);
        $this->tambah(['username' => 'kepegawaian', 'password' => Hash::make('Pegawai@2026'),   'nama' => 'Admin Kepegawaian', 'role' => 'admin_kepegawaian','bidang' => '', 'nip' => null]);
        $this->tambah(['username' => 'umum',        'password' => Hash::make('Umum#2026'),      'nama' => 'Admin Umum',        'role' => 'admin_umum',       'bidang' => '', 'nip' => null]);
        $this->tambah(['username' => 'rumahtangga', 'password' => Hash::make('Rumah@2026'),     'nama' => 'Admin Rumah Tangga', 'role' => 'admin_rumah_tangga', 'bidang' => '', 'nip' => null]);


                // ============ 2. GUEST PER BIDANG (password berbeda-beda) ============
        $this->tambah(['username' => 'guest.umum',      'password' => Hash::make('TamuUmum1'),      'nama' => 'Tamu Bidang Umum',      'role' => 'guest', 'bidang' => 'Umum',      'nip' => null]);
        $this->tambah(['username' => 'guest.p2',        'password' => Hash::make('TamuP2_1'),       'nama' => 'Tamu Bidang P2',        'role' => 'guest', 'bidang' => 'P2',        'nip' => null]);
        $this->tambah(['username' => 'guest.ki',        'password' => Hash::make('TamuKI_1'),       'nama' => 'Tamu Bidang KI',        'role' => 'guest', 'bidang' => 'KI',        'nip' => null]);
        $this->tambah(['username' => 'guest.pabean',    'password' => Hash::make('TamuPabean1'),    'nama' => 'Tamu Bidang Pabean',    'role' => 'guest', 'bidang' => 'Pabean',    'nip' => null]);
        $this->tambah(['username' => 'guest.fasilitas', 'password' => Hash::make('TamuFasilitas1'), 'nama' => 'Tamu Bidang Fasilitas','role' => 'guest', 'bidang' => 'Fasilitas', 'nip' => null]);

        // ============ 3. PEGAWAI (username = NIP) ============
        $pegawai = [
            ['Mury90#', '197103061990121001'],
            ['Hilma61@', '196811161996031001'],
            ['Edi95*', '197409201995031001'],
            ['Mora93!', '197209051993011001'],
            ['Sayu12@', '197512061996021003'],
            ['Hart92#', '197211041992012001'],
            ['Bamb20!', '197911162001121001'],
            ['Fari96@', '196911291996032000'],
            ['Shid10#', '198510132010121004'],
            ['Betr06!', '198506222006021005'],
            ['Hend98@', '197202241998031001'],
            ['Hart24#', '197412241998031002'],
            ['Donn15!', '197310151995031001'],
            ['Ilha90@', '197009011990121001'],
            ['Calv98#', '197204131998031001'],
            ['Bern15!', '197707151998031001'],
            ['Bayu92@', '197204011992121001'],
            ['Nugh07#', '198507222006021001'],
            ['Eko97!', '197611281997031002'],
            ['Angg20@', '197607131998031002'],
            ['Wand97#', '197706081997031004'],
            ['Fati03!', '198011052003122001'],
            ['Tjah19@', '197106241992011001'],
            ['Peng80#', '197804012000011001'],
            ['Swee18!', '199609292018012001'],
            ['Asli96@', '199610152018012002'],
            ['Refa20#', '199702072015122001'],
            ['Simar05!', '200005132019121001'],
            ['Atri72@', '197412102005012001'],
            ['Wahy15#', '199510212015021002'],
            ['Flow16!', '199602222016122001'],
            ['Hafa09@', '200009282019122001'],
            ['Kris21#', '199412312016121001'],
            ['Arie08!', '199608312016121001'],
            ['Tia18@', '199708042018012002'],
            ['Wibo91#', '199809112018121002'],
            ['Jung12!', '199211062012101002'],
            ['Fuji04@', '199504092015022002'],
            ['Nauf22#', '200001302022011001'],
            ['Bell80!', '199807302018012001'],
            ['Widy51@', '199511242018011002'],
            ['Rizk90#', '199903072018122001'],
            ['Doni50!', '199505302015021001'],
            ['Fata02@', '200002252019121001'],
            ['Fern19#', '199706182018011003'],
            ['Niko05!', '199705232025051003'],
            ['Ferd88@', '198801262007011002'],
            ['Jann15#', '199608132015122001'],
            ['Widi93!', '199306022013101002'],
            ['Irha15@', '199606232015121003'],
            ['Feli99#', '199901272018122003'],
            ['Arfa30!', '199806302018011001'],
            ['Angg25@', '200002282025052002'],
            ['Sisk03#', '197901212003121002'],
            ['Perm12!', '199006012012101002'],
            ['Aqil04@', '198402212004121002'],
            ['Syah90#', '199007172009121001'],
            ['Rodi87!', '198710312007011003'],
            ['Manu13@', '198909282013101001'],
            ['Sukr05#', '197808082005011002'],
            ['Andi26!', '199506212018011005'],
            ['Gust08@', '199608152018011002'],
            ['Benh21#', '199205212012101001'],
            ['Dedi07!', '198908272010121007'],
            ['Nauf03@', '199203232013101003'],
            ['Fera12#', '199209102012101002'],
            ['Rifk08!', '199507082015021007'],
            ['Dede23@', '199512232015121003'],
            ['Rido31#', '199805312018011001'],
            ['Sito18!', '199811122018122003'],
            ['Yosa09@', '199909072019121001'],
            ['Kama07#', '199807232018011001'],
            ['Yehe90!', '199905032018121001'],
            ['Dion02@', '199902012018121002'],
            ['Lala04#', '200004232019122001'],
            ['Fath12!', '199901012018121004'],
            ['Petr19@', '198604192004121003'],
            ['Linda07#', '198007162003122001'],
            ['Udu04!', '198704012007011002'],
            ['Nugh23@', '199201232014111005'],
            ['Dhik08#', '198901042008121001'],
            ['Mich19!', '199110092012101002'],
            ['Faja03@', '198601032004121005'],
            ['Sugi80#', '198001012003122001'],
        ];

        foreach ($pegawai as [$pass, $nip]) {
            preg_match('/^([A-Za-z]+)/', $pass, $m);
            $this->tambah([
                'username' => $nip,               // 👈 pegawai login pakai NIP
                'password' => Hash::make($pass),
                'nama'     => $m[1] ?? 'Pegawai',
                'role'     => 'pegawai',
                'bidang'   => '',
                'nip'      => $nip,
            ]);
        }
    }

    public function down(): void
    {
        DB::table('users')->whereIn('role', ['pegawai', 'guest'])->delete();
        DB::table('users')->whereIn('username', ['superadmin', 'keuangan', 'kepegawaian', 'umum', 'rumahtangga'])->delete();
    }
};
