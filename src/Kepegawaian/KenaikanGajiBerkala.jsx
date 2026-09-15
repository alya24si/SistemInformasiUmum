import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  CalendarClock,
  Search,
  TrendingUp,
  AlertTriangle,
  Users,
  X,
  Upload,
  Plus,
  Pencil,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000/api'

// Kenaikan Gaji Berkala (KGB) terjadi tiap 4 tahun sekali, dihitung dari
// TMT Pangkat. Begitu satu siklus 4 tahun lewat, TMT Pangkat yang
// ditampilkan "naik level" jadi tanggal KGB terakhir itu -- makanya kolom
// TMT Pangkat & KGB di halaman ini otomatis maju sendiri seiring waktu,
// tanpa perlu admin update manual.
// Contoh: TMT Pangkat awal 1 Okt 2026 -> KGB pertama 1 Okt 2030.
// Begitu tanggal 1 Okt 2030 lewat, TMT Pangkat yang ditampilkan otomatis
  const tambahTahun = (tanggal, jumlahTahun) => {
  const hasil = new Date(tanggal)
  hasil.setFullYear(hasil.getFullYear() + jumlahTahun)
  return hasil
}

const kurangiBulan = (tanggal, jumlahBulan) => {
  const hasil = new Date(tanggal)
  hasil.setMonth(hasil.getMonth() - jumlahBulan)
  return hasil
}

const hitungKGB = (tmtPangkatAwal) => {
  if (!tmtPangkatAwal) return null

  const tmtAwal = new Date(`${tmtPangkatAwal}T00:00:00`)
  if (isNaN(tmtAwal.getTime())) return null

  const sekarang = new Date()

  let tmtPangkat = tmtAwal
  let kgbBerikutnya = tambahTahun(tmtAwal, 4)

  // Majukan terus per 4 tahun selama siklus KGB-nya udah lewat/pas hari ini
  while (kgbBerikutnya <= sekarang) {
    tmtPangkat = kgbBerikutnya
    kgbBerikutnya = tambahTahun(tmtPangkat, 4)
  }

  return { tmtPangkat, kgbBerikutnya }
}

const formatTanggal = (tanggal) => {
  if (!tanggal) return '-'
  return tanggal.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function KenaikanGajiBerkala({ user }) {
  // Disamakan dengan MasaKerja.jsx: card Import/Tambah/Edit/Hapus selalu
  // ditampilkan (gak digantung ke string role tertentu), biar konsisten dan
  // gak hilang gara-gara nilai user.role di app kamu beda dengan yang dicek
  // di sini.
  const isAdmin = true

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [popupDitutup, setPopupDitutup] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  // Dropdown custom buat Eselon III & Eselon IV di form (samain polanya
  // kayak di halaman Masa Kerja, biar konsisten)
  const [dropdownEselonIiiTerbuka, setDropdownEselonIiiTerbuka] = useState(false)
  const [dropdownEselonIvTerbuka, setDropdownEselonIvTerbuka] = useState(false)

  const formKosong = {
    nip: '',
    nama: '',
    pangkat: '',
    jabatan: '',
    eselon_iii: '',
    bagian: '',
    no_hp: '',
    tmt_pangkat: '',
  }
  const [form, setForm] = useState(formKosong)

  const ambilData = () => {
    setLoading(true)
    fetch(`${API_URL}/kenaikan_gaji_berkala`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data || [])
        setLoading(false)
      })
      .catch(() => {
        alert('Gagal mengambil data pegawai.')
        setLoading(false)
      })
  }

  useEffect(() => {
    ambilData()
  }, [])

  // Normalisasi teks buat dropdown Eselon III/IV, biar gak kepengaruh spasi
  // ganda / besar-kecil huruf (sama seperti di halaman Masa Kerja)
  const daftarEselonTiga = Array.from(
    new Set(
      data
        .map((pegawai) => (pegawai.eselon_iii || '').trim())
        .filter((nilai) => nilai !== '')
    )
  ).sort((a, b) => a.localeCompare(b))

  const daftarEselonEmpat = Array.from(
    new Set(
      data
        .map((pegawai) => (pegawai.bagian || '').trim())
        .filter((nilai) => nilai !== '')
    )
  ).sort((a, b) => a.localeCompare(b))

  // Setiap pegawai dilengkapi hasil hitungan KGB-nya (tmtPangkat & kgbBerikutnya),
  // dihitung dari kolom tmt_pangkat (BUKAN tanggal_masuk)
  const dataDenganKGB = data
    .map((pegawai) => ({
      ...pegawai,
      kgb: hitungKGB(pegawai.tmt_pangkat),
    }))
    // Urutkan yang KGB-nya paling deket duluan, biar admin gampang lihat
    // siapa yang perlu ditindaklanjuti lebih dulu. Yang gak ada TMT Pangkat
    // (kgb null) ditaruh di paling bawah.
    .sort((a, b) => {
      if (!a.kgb && !b.kgb) return 0
      if (!a.kgb) return 1
      if (!b.kgb) return -1
      return a.kgb.kgbBerikutnya - b.kgb.kgbBerikutnya
    })

  const dataFiltered = dataDenganKGB.filter((pegawai) => {
    const kata = search.toLowerCase()
    return (
      pegawai.nama.toLowerCase().includes(kata) ||
      pegawai.nip.toLowerCase().includes(kata)
    )
  })

  const sekarang = new Date()

  // Pegawai yang KGB-nya jatuh dalam 2 bulan ke depan (batas notifikasi)
  const akanNaikDalam2Bulan = dataDenganKGB.filter((pegawai) => {
    if (!pegawai.kgb) return false
    const batasNotif = kurangiBulan(pegawai.kgb.kgbBerikutnya, 2)
    return sekarang >= batasNotif && sekarang <= pegawai.kgb.kgbBerikutnya
  })

  const ITEMS_PER_PAGE = 10
  const totalPages = Math.ceil(dataFiltered.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const dataPaginated = dataFiltered.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  // ================== TAMBAH / EDIT DATA PEGAWAI ==================
  const simpanData = (e) => {
    e.preventDefault()

    const isEdit = editId !== null
    const url = isEdit ? `${API_URL}/kenaikan_gaji_berkala/${editId}` : `${API_URL}/kenaikan_gaji_berkala`
    const method = isEdit ? 'PUT' : 'POST'

    // SENGAJA cuma kirim "tmt_pangkat" di sini (bukan "tanggal_masuk"),
    // supaya nilai TMT/Masa Kerja pegawai yang dikelola dari halaman Masa
    // Kerja gak ketiban/kehapus gara-gara disimpan dari halaman ini.
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          alert(
            res.message ||
              `Gagal ${isEdit ? 'memperbarui' : 'menyimpan'} data pegawai.`
          )
          return
        }

        ambilData()
        setForm(formKosong)
        setEditId(null)
        setShowForm(false)
      })
      .catch(() =>
        alert(`Gagal ${isEdit ? 'memperbarui' : 'menyimpan'} data pegawai.`)
      )
  }

  const mulaiEdit = (pegawai) => {
    setForm({
      nip: pegawai.nip,
      nama: pegawai.nama,
      pangkat: pegawai.pangkat || '',
      jabatan: pegawai.jabatan,
      eselon_iii: pegawai.eselon_iii || '',
      bagian: pegawai.bagian,
      no_hp: pegawai.no_hp || '',
      tmt_pangkat: pegawai.tmt_pangkat || '',
    })
    setEditId(pegawai.id)
    setShowForm(true)
  }

  const batalEdit = () => {
    setForm(formKosong)
    setEditId(null)
    setShowForm(false)
  }

  // PENTING: tombol "Hapus" di halaman KGB ini SENGAJA gak manggil endpoint
  // DELETE (yang bakal ngehapus seluruh baris pegawai dari tabel -- otomatis
  // ikut ngilangin pegawai itu dari halaman Masa Kerja juga, karena satu
  // tabel database yang sama dipakai bareng). Di sini "Hapus" artinya cuma
  // "kosongkan TMT Pangkat & KGB pegawai ini", jadi dikirim sebagai
  // PUT/update dengan tmt_pangkat dikosongkan. Identitas pegawai + data
  // Masa Kerja-nya TETAP UTUH.
  // Kalau memang mau menghapus pegawai itu sepenuhnya dari sistem, itu tetap
  // dilakukan lewat halaman Masa Kerja.
  const hapusData = (pegawai) => {
    if (
      !window.confirm(
        `Kosongkan TMT Pangkat & KGB milik ${pegawai.nama}?\n\n` +
          'Data identitas pegawai ini (dan data Masa Kerja-nya) TIDAK akan ' +
          'terhapus -- cuma TMT Pangkat & KGB-nya yang dikosongkan lagi.'
      )
    ) {
      return
    }

    fetch(`${API_URL}/kenaikan_gaji_berkala/${pegawai.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nip: pegawai.nip,
        nama: pegawai.nama,
        pangkat: pegawai.pangkat || '',
        jabatan: pegawai.jabatan,
        eselon_iii: pegawai.eselon_iii || '',
        bagian: pegawai.bagian,
        no_hp: pegawai.no_hp || '',
        tmt_pangkat: '',
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          alert(res.message || 'Gagal mengosongkan TMT Pangkat pegawai ini.')
          return
        }
        ambilData()
      })
      .catch(() => alert('Gagal mengosongkan TMT Pangkat pegawai ini.'))
  }

  // ================== IMPORT EXCEL ==================
  const [importing, setImporting] = useState(false)
  const [importInfo, setImportInfo] = useState(null)
  const [hapusLamaSebelumImport, setHapusLamaSebelumImport] = useState(false)

  const handleUploadPegawai = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (hapusLamaSebelumImport) {
      const yakin = window.confirm(
        'Checkbox "Hapus semua data pegawai lama" AKTIF.\n\n' +
          'SEMUA data pegawai (dan otomatis SEMUA data absensi terkait) yang sudah ada ' +
          'di database akan dihapus permanen, lalu diganti total dengan isi file ini.\n\n' +
          'Lanjutkan?'
      )
      if (!yakin) {
        e.target.value = ''
        return
      }
    }

    setImporting(true)
    setImportInfo(null)

    const reader = new FileReader()

    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws)

        if (rows.length === 0) {
          setImportInfo({
            type: 'error',
            text: 'File kosong atau tidak terbaca. Pastikan ada data di baris kedua ke bawah.',
          })
          setImporting(false)
          e.target.value = ''
          return
        }

        // Kolom yang didukung: NIP, Nama, Pangkat, Jabatan, Eselon III,
        // Eselon IV/Bagian, No HP, TMT Pangkat.
        // CATATAN PENTING: kolom tanggal di sini dibaca sebagai TMT PANGKAT
        // (tmt_pangkat), BUKAN TMT/tanggal masuk (yang dipakai di halaman
        // Masa Kerja). Makanya dicari dulu header "TMT Pangkat" secara
        // spesifik; kalau file cuma punya kolom "TMT" polos, itu juga
        // dianggap TMT Pangkat selama diimport dari halaman ini.
        const dataSiapKirim = rows.map((baris) => {
          const cari = (kunciPersis, kunciFallback = []) => {
            for (const key of Object.keys(baris)) {
              const bersih = key.trim().toLowerCase().replace(/[\s_]/g, '')
              if (kunciPersis.includes(bersih)) return baris[key]
            }
            for (const key of Object.keys(baris)) {
              const bersih = key.trim().toLowerCase().replace(/[\s_]/g, '')
              if (kunciFallback.some((k) => bersih.includes(k))) return baris[key]
            }
            return undefined
          }

          const eselonIii = String(
            cari(['eseloniii', 'eselon3', 'eselon'], ['eseloniii', 'eselon3']) ?? ''
          ).trim()
          const bagianEksplisit = String(
            cari(['eseloniv', 'eselon4', 'bagian'], ['eseloniv', 'eselon4', 'bagian']) ?? ''
          ).trim()

          return {
            nip: String(cari(['nip'], ['nip']) ?? '').trim(),
            nama: String(cari(['nama'], ['nama']) ?? '').trim(),
            pangkat: String(cari(['pangkat'], ['pangkat', 'golongan']) ?? '').trim() || null,
            jabatan: String(cari(['jabatan'], ['jabatan']) ?? '').trim(),
            eselon_iii: eselonIii || null,
            bagian: bagianEksplisit || null,
            no_hp: String(
              cari(['nohp', 'hp', 'notelepon', 'telepon'], ['nohp', 'notelepon', 'telepon']) ?? ''
            ).trim(),
            tmt_pangkat:
              String(
                cari(
                  ['tmtpangkat', 'tmt', 'kgb'],
                  ['tmtpangkat', 'tmt', 'kgb']
                ) ?? ''
              ).trim() || null,
          }
        })

        fetch(`${API_URL}/kenaikan_gaji_berkala/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: dataSiapKirim,
            hapus_lama: hapusLamaSebelumImport,
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              setImportInfo({
                type: 'success',
                text:
                  (res.hapus_lama
                    ? `${res.dihapus} data pegawai lama dihapus, lalu `
                    : '') +
                  `${res.ditambah} pegawai baru ditambahkan, ${res.diupdate} pegawai diperbarui` +
                  (res.dilewati > 0 ? `, ${res.dilewati} baris dilewati (NIP/Nama kosong).` : '.'),
              })
              setHapusLamaSebelumImport(false)
              ambilData()
            } else {
              setImportInfo({
                type: 'error',
                text: res.message || 'Gagal mengimpor data. Periksa format kolom pada file Excel.',
              })
            }
          })
          .catch(() => {
            setImportInfo({ type: 'error', text: 'Gagal terhubung ke server.' })
          })
          .finally(() => {
            setImporting(false)
            e.target.value = ''
          })
      } catch (err) {
        setImportInfo({
          type: 'error',
          text: 'Gagal membaca file. Pastikan formatnya .xlsx atau .xls yang valid.',
        })
        setImporting(false)
        e.target.value = ''
      }
    }

    reader.readAsArrayBuffer(file)
  }

  // ================== DOWNLOAD EXCEL ==================
  // Kolomnya disamakan dengan tabel di layar (TMT Pangkat & KGB, bukan
  // TMT & Masa Kerja), supaya kalau file ini diedit lalu diimport ulang
  // lewat halaman ini, kolomnya tetap kebaca benar sebagai TMT Pangkat.
  const exportExcel = () => {
    const rows = dataFiltered.map((pegawai, index) => ({
      No: index + 1,
      NIP: pegawai.nip,
      'Nama Pegawai': pegawai.nama,
      Pangkat: pegawai.pangkat || '',
      Jabatan: pegawai.jabatan || '',
      'Eselon IV': pegawai.bagian || '',
      'Eselon III': pegawai.eselon_iii || '',
      'TMT Pangkat': pegawai.kgb ? formatTanggal(pegawai.kgb.tmtPangkat) : '',
      KGB: pegawai.kgb ? formatTanggal(pegawai.kgb.kgbBerikutnya) : '',
      'No HP': pegawai.no_hp || '',
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    worksheet['!cols'] = [
      { wch: 5 },   // No
      { wch: 22 },  // NIP
      { wch: 28 },  // Nama Pegawai
      { wch: 26 },  // Pangkat
      { wch: 32 },  // Jabatan
      { wch: 30 },  // Eselon IV
      { wch: 30 },  // Eselon III
      { wch: 14 },  // TMT Pangkat
      { wch: 14 },  // KGB
      { wch: 16 },  // No HP
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kenaikan Gaji Berkala')

    const tanggalFile = new Date().toISOString().split('T')[0]
    XLSX.writeFile(workbook, `Kenaikan Gaji Berkala - ${tanggalFile}.xlsx`)
  }

  // Popup notifikasi (gaya sama seperti Kang Cepot & Pelanggaran) -- cuma
  // muncul buat Admin Kepegawaian/Superadmin, dan cuma kalau ada pegawai
  // yang KGB-nya udah masuk masa 2 bulan sebelum TMT Pangkat berikutnya.
  const popupKGB =
    isAdmin &&
    !popupDitutup &&
    akanNaikDalam2Bulan.length > 0 && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,31,69,.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'kgbOverlayFade 0.3s ease-out',
        }}
      >
        <div
          style={{
            width: '520px',
            maxWidth: '94%',
            maxHeight: '86vh',
            overflowY: 'auto',
            background: 'linear-gradient(145deg, #ffffff 0%, #fef2f2 100%)',
            borderRadius: '20px',
            padding: '36px 32px',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(220,38,38,.4)',
            border: '4px solid #dc2626',
            animation: 'kgbPopupZoomIn 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #dc2626, #f59e0b, #dc2626)',
            }}
          />

          <button
            type="button"
            onClick={() => setPopupDitutup(true)}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} color="#475569" />
          </button>

          <div
            style={{
              marginBottom: '8px',
              display: 'inline-block',
              filter: 'drop-shadow(0 4px 8px rgba(220,38,38,.3))',
            }}
          >
            <TrendingUp size={64} style={{ color: '#dc2626' }} />
          </div>

          <h2
            style={{
              margin: '0 0 6px 0',
              color: '#991b1b',
              fontSize: '22px',
              fontWeight: 900,
            }}
          >
            Ada yang naik gaji berkala nih
          </h2>

          <p
            style={{
              margin: '0 0 18px',
              fontSize: '13px',
              color: '#475569',
            }}
          >
            Segera usulkan KGB, TMT berdasarkan KGB terakhir.
          </p>

          <div
            style={{
              backgroundColor: '#fff',
              border: '2px solid #bfdbfe',
              borderRadius: '12px',
              padding: '8px',
              textAlign: 'left',
            }}
          >
            {akanNaikDalam2Bulan.map((pegawai) => (
              <div
                key={pegawai.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '13px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {pegawai.nama}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {pegawai.nip}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#dc2626',
                    backgroundColor: '#fee2e2',
                    padding: '4px 10px',
                    borderRadius: '999px',
                  }}
                >
                  {formatTanggal(pegawai.kgb.kgbBerikutnya)}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPopupDitutup(true)}
            style={{
              marginTop: '22px',
              padding: '12px 32px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(220,38,38,.4)',
            }}
          >
            Oke, Mengerti
          </button>
        </div>

        <style>{`
          @keyframes kgbOverlayFade {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes kgbPopupZoomIn {
            0% { opacity: 0; transform: scale(0.7); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    )

  return (
    <div className="page">
      {popupKGB}

      <div className="page-title">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarClock size={22} /> Kenaikan Gaji Berkala
        </h1>

        <p>
          Pantau jadwal Kenaikan Gaji Berkala (KGB) pegawai, dihitung
          otomatis 4 tahun sekali dari TMT Pangkat.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={20} />
          </div>

          <div className="stat-info">
            <div className="stat-desc" style={{ fontWeight: 700 }}>
              Seluruh Pegawai
            </div>
            <div className="stat-value">{data.length}</div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon">
            <AlertTriangle size={20} />
          </div>

          <div className="stat-info">
            <div className="stat-desc" style={{ fontWeight: 700 }}>
              KGB dalam 2 Bulan Ke Depan
            </div>
            <div className="stat-value">{akanNaikDalam2Bulan.length}</div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} /> Import Data Pegawai (TMT Pangkat)
          </h3>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: hapusLamaSebelumImport ? '#dc2626' : '#374151',
              marginBottom: '10px',
              cursor: importing ? 'not-allowed' : 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={hapusLamaSebelumImport}
              onChange={(e) => setHapusLamaSebelumImport(e.target.checked)}
              disabled={importing}
            />
            Hapus semua data pegawai lama sebelum import ini
          </label>

          {hapusLamaSebelumImport && (
            <p
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                color: '#dc2626',
                marginTop: '-4px',
                marginBottom: '10px',
              }}
            >
              <AlertTriangle size={14} />
              Semua data pegawai lama (dan absensi terkait) akan dihapus permanen dan diganti total dengan isi file ini.
            </p>
          )}

          <div className="form-row">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUploadPegawai}
              disabled={importing}
            />
          </div>

          {importing && (
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0b72e7', marginTop: '10px' }}>
              <Clock size={14} /> Memproses file...
            </p>
          )}

          {!importing && importInfo && (
            <p
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: importInfo.type === 'success' ? '#15803d' : '#dc2626',
                marginTop: '10px',
              }}
            >
              {importInfo.type === 'success' ? (
                <CheckCircle2 size={14} />
              ) : (
                <XCircle size={14} />
              )}
              {importInfo.text}
            </p>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '20px',
            }}
          >
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editId !== null
                  ? (<><Pencil size={18} /> Edit Data Pegawai</>)
                  : (<><Plus size={18} /> Tambah Data Pegawai</>)}
              </h3>

              <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '13px' }}>
                Kelola data identitas pegawai beserta TMT Pangkat-nya.
              </p>
            </div>

            <button
              type="button"
              className="btn"
              onClick={() => {
                if (showForm) {
                  batalEdit()
                } else {
                  setShowForm(true)
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {showForm ? 'Tutup' : (<><Plus size={16} /> Tambah Data Pegawai</>)}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={simpanData}
              className="form-row"
              style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <input
                type="text"
                placeholder="NIP"
                required
                value={form.nip}
                onChange={(e) => setForm({ ...form, nip: e.target.value })}
              />

              <input
                type="text"
                placeholder="Nama Pegawai"
                required
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />

              <input
                type="text"
                placeholder="Pangkat"
                value={form.pangkat}
                onChange={(e) => setForm({ ...form, pangkat: e.target.value })}
              />

              <input
                type="text"
                placeholder="Jabatan"
                required
                value={form.jabatan}
                onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              />

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Eselon III"
                  autoComplete="off"
                  value={form.eselon_iii}
                  onChange={(e) => {
                    setForm({ ...form, eselon_iii: e.target.value })
                    setDropdownEselonIiiTerbuka(true)
                  }}
                  onFocus={() => setDropdownEselonIiiTerbuka(true)}
                  onBlur={() =>
                    setTimeout(() => setDropdownEselonIiiTerbuka(false), 120)
                  }
                />

                {dropdownEselonIiiTerbuka && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      zIndex: 20,
                      backgroundColor: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
                      maxHeight: '220px',
                      overflowY: 'auto',
                    }}
                  >
                    {daftarEselonTiga
                      .filter((nilai) =>
                        nilai.toLowerCase().includes((form.eselon_iii || '').toLowerCase())
                      )
                      .map((nilai) => (
                        <div
                          key={nilai}
                          onMouseDown={() => {
                            setForm({ ...form, eselon_iii: nilai })
                            setDropdownEselonIiiTerbuka(false)
                          }}
                          style={{ padding: '9px 11px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          {nilai}
                        </div>
                      ))}

                    {daftarEselonTiga.filter((nilai) =>
                      nilai.toLowerCase().includes((form.eselon_iii || '').toLowerCase())
                    ).length === 0 && (
                      <div style={{ padding: '9px 11px', fontSize: '12px', color: '#94a3b8' }}>
                        Ketik untuk isi Eselon III baru
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Eselon IV"
                  required
                  autoComplete="off"
                  value={form.bagian}
                  onChange={(e) => {
                    setForm({ ...form, bagian: e.target.value })
                    setDropdownEselonIvTerbuka(true)
                  }}
                  onFocus={() => setDropdownEselonIvTerbuka(true)}
                  onBlur={() =>
                    setTimeout(() => setDropdownEselonIvTerbuka(false), 120)
                  }
                />

                {dropdownEselonIvTerbuka && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      zIndex: 20,
                      backgroundColor: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
                      maxHeight: '220px',
                      overflowY: 'auto',
                    }}
                  >
                    {daftarEselonEmpat
                      .filter((nilai) =>
                        nilai.toLowerCase().includes((form.bagian || '').toLowerCase())
                      )
                      .map((nilai) => (
                        <div
                          key={nilai}
                          onMouseDown={() => {
                            setForm({ ...form, bagian: nilai })
                            setDropdownEselonIvTerbuka(false)
                          }}
                          style={{ padding: '9px 11px', fontSize: '12px', color: '#334155', cursor: 'pointer' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff' }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          {nilai}
                        </div>
                      ))}

                    {daftarEselonEmpat.filter((nilai) =>
                      nilai.toLowerCase().includes((form.bagian || '').toLowerCase())
                    ).length === 0 && (
                      <div style={{ padding: '9px 11px', fontSize: '12px', color: '#94a3b8' }}>
                        Ketik untuk isi Eselon IV baru
                      </div>
                    )}
                  </div>
                )}
              </div>

              <input
                type="tel"
                placeholder="No. HP"
                required
                value={form.no_hp}
                onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
              />

              <div style={{ alignSelf: 'flex-end' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#64748b' }}>
                  TMT Pangkat
                </label>
                <input
                  type="date"
                  required
                  value={form.tmt_pangkat}
                  onChange={(e) => setForm({ ...form, tmt_pangkat: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', height: 'fit-content' }}>
                <button
                  type="submit"
                  className="btn"
                  style={{ width: 'auto', height: 'auto', padding: '8px 16px', fontSize: '13px' }}
                >
                  {editId !== null ? 'Simpan Perubahan' : 'Simpan Data Pegawai'}
                </button>

                {editId !== null && (
                  <button
                    type="button"
                    onClick={batalEdit}
                    className="btn"
                    style={{
                      width: 'auto',
                      height: 'auto',
                      padding: '8px 16px',
                      fontSize: '13px',
                      backgroundColor: '#94a3b8',
                      color: '#fff',
                    }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={18} /> Daftar Kenaikan Gaji Berkala
          </h3>

          <button
            type="button"
            onClick={exportExcel}
            className="btn"
            title="Download data Kenaikan Gaji Berkala yang sedang ditampilkan ke file Excel"
            style={{
              width: 'auto',
              height: 'auto',
              padding: '8px 16px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#16a34a',
              color: '#fff',
            }}
          >
            <Download size={16} /> Download Excel
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            margin: '12px 0 16px',
          }}
        >
          <input
            type="text"
            placeholder="Cari nama atau NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: '1 1 240px',
              minWidth: '200px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
            }}
          />
        </div>

        <div className="filter-info">
          Menampilkan {dataFiltered.length} dari {data.length} data
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>NIP</th>
                <th>Nama Pegawai</th>
                <th>Pangkat</th>
                <th>Jabatan</th>
                <th>Eselon IV</th>
                <th>Eselon III</th>
                <th>TMT Pangkat</th>
                <th>KGB</th>
                <th>No. HP</th>
                {isAdmin && <th>Aksi</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 11 : 10} style={{ textAlign: 'center', padding: '30px' }}>
                    Memuat data...
                  </td>
                </tr>
              ) : dataPaginated.length > 0 ? (
                dataPaginated.map((pegawai, index) => {
                  const segeraKGB = akanNaikDalam2Bulan.some((p) => p.id === pegawai.id)

                  return (
                    <tr key={pegawai.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>{pegawai.nip}</td>
                      <td>{pegawai.nama}</td>
                      <td>{pegawai.pangkat || '-'}</td>
                      <td>{pegawai.jabatan}</td>
                      <td>{pegawai.bagian}</td>
                      <td>{pegawai.eselon_iii || '-'}</td>
                      <td>{pegawai.kgb ? formatTanggal(pegawai.kgb.tmtPangkat) : '-'}</td>
                      <td>
                        {pegawai.kgb ? (
                          <span
                            style={{
                              fontWeight: segeraKGB ? 700 : 400,
                              color: segeraKGB ? '#b45309' : 'inherit',
                            }}
                          >
                            {formatTanggal(pegawai.kgb.kgbBerikutnya)}
                            {segeraKGB && (
                              <span
                                style={{
                                  marginLeft: '6px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  color: '#b45309',
                                  backgroundColor: '#fef3c7',
                                  padding: '2px 6px',
                                  borderRadius: '999px',
                                }}
                              >
                                segera
                              </span>
                            )}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{pegawai.no_hp || '-'}</td>
                      {isAdmin && (
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => mulaiEdit(pegawai)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '30px',
                                height: '30px',
                                padding: 0,
                                backgroundColor: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <Pencil size={14} color="#0b72e7" />
                            </button>
                            <button
                              type="button"
                              onClick={() => hapusData(pegawai)}
                              title="Kosongkan TMT Pangkat & KGB pegawai ini (identitas pegawai TIDAK terhapus)"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '30px',
                                height: '30px',
                                padding: 0,
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <X size={14} color="#dc2626" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 11 : 10} style={{ textAlign: 'center', padding: '30px' }}>
                    Tidak ada data pegawai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            marginTop: '16px',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="btn"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 0 ? 0.5 : 1,
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            Back
          </button>
          <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>
            {currentPage + 1} / {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage + 1 >= totalPages}
            className="btn"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              cursor: currentPage + 1 >= totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage + 1 >= totalPages ? 0.5 : 1,
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default KenaikanGajiBerkala