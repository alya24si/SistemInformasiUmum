import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  Plus,
  Pencil,
  Search,
  Trash2,
  XCircle,
  Building2,
  ShieldAlert,
  Ship,
  ShieldCheck,
  Handshake,
  Download,
} from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000/api'

function DataPegawai() {
  const isAdmin = true

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterEselonTiga, setFilterEselonTiga] = useState('semua')
  const [filterEselonEmpat, setFilterEselonEmpat] = useState('semua')
  const [currentPage, setCurrentPage] = useState(0)
  const [editId, setEditId] = useState(null)

  // Dropdown custom buat Eselon III & Eselon IV di form (ganti native
  // <datalist> biar warnanya konsisten sama tema web, gak ngikut dark mode browser)
  const [dropdownEselonIiiTerbuka, setDropdownEselonIiiTerbuka] = useState(false)
  const [dropdownEselonIvTerbuka, setDropdownEselonIvTerbuka] = useState(false)

  const [form, setForm] = useState({
    nip: '',
    nama: '',
    pangkat: '',
    jabatan: '',
    eselon_iii: '',
    bagian: '',
    no_hp: '',
    tanggal_masuk: '',
  })

  // Hitung masa kerja (tahun/bulan/hari) dari tanggal masuk sampai hari ini.
  // Dihitung penuh secara kalender (bukan estimasi 30 hari/bulan), supaya
  // hasilnya presisi walau bulan panjangnya beda-beda.
  const hitungMasaKerja = (tanggalMasuk) => {
    if (!tanggalMasuk) return null

    const mulai = new Date(`${tanggalMasuk}T00:00:00`)
    const sekarang = new Date()

    if (isNaN(mulai.getTime()) || mulai > sekarang) return null

    let tahun = sekarang.getFullYear() - mulai.getFullYear()
    let bulan = sekarang.getMonth() - mulai.getMonth()
    let hari = sekarang.getDate() - mulai.getDate()

    if (hari < 0) {
      bulan -= 1
      // jumlah hari di bulan sebelum bulan berjalan
      const bulanSebelumnya = new Date(
        sekarang.getFullYear(),
        sekarang.getMonth(),
        0
      )
      hari += bulanSebelumnya.getDate()
    }

    if (bulan < 0) {
      tahun -= 1
      bulan += 12
    }

    return { tahun, bulan, hari }
  }

  const formatMasaKerja = (tanggalMasuk) => {
    const hasil = hitungMasaKerja(tanggalMasuk)
    if (!hasil) return '-'

    const { tahun, bulan, hari } = hasil
    const bagianTeks = []

    if (tahun > 0) bagianTeks.push(`${tahun} tahun`)
    if (bulan > 0) bagianTeks.push(`${bulan} bulan`)
    if (hari > 0 || bagianTeks.length === 0) bagianTeks.push(`${hari} hari`)

    return bagianTeks.join(' ')
  }

  const formatTanggalMasuk = (tanggalMasuk) => {
    if (!tanggalMasuk) return '-'
    return new Date(`${tanggalMasuk}T00:00:00`).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const ambilData = () => {
    setLoading(true)

    fetch(`${API_URL}/pegawai`)
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

  // Normalisasi teks "bagian": hilangkan spasi berlebih & abaikan besar/kecil huruf.
  // Ini supaya nilai hasil import Excel seperti "Bagian Umum ", "BAGIAN UMUM",
  // atau "bagian   umum" tetap dihitung sebagai "Bagian Umum", bukan dianggap
  // berbeda (yang tadinya bikin kartu ringkasan selalu menampilkan 0).
  const normalisasiBagian = (teks) =>
    String(teks || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')

  const cocokkanBagian = (bagianData, bagianTarget) =>
    normalisasiBagian(bagianData) === normalisasiBagian(bagianTarget)

  const dataFiltered = data.filter((pegawai) => {
    const cocokSearch =
      pegawai.nama.toLowerCase().includes(search.toLowerCase()) ||
      pegawai.nip.toLowerCase().includes(search.toLowerCase())

    const cocokEselonTiga =
      filterEselonTiga === 'semua' ||
      normalisasiBagian(pegawai.eselon_iii) === normalisasiBagian(filterEselonTiga)

    const cocokEselonEmpat =
      filterEselonEmpat === 'semua' ||
      cocokkanBagian(pegawai.bagian, filterEselonEmpat)

    return cocokSearch && cocokEselonTiga && cocokEselonEmpat
  })

  // Daftar Eselon III diambil dinamis dari data yang ada (bukan daftar
  // tetap), karena isinya bebas diisi admin lewat form/import.
  const daftarEselonTiga = Array.from(
    new Set(
      data
        .map((pegawai) => (pegawai.eselon_iii || '').trim())
        .filter((nilai) => nilai !== '')
    )
  ).sort((a, b) => a.localeCompare(b))

  // Eselon IV sekarang juga diambil dinamis dari data, sama seperti Eselon III.
  // Sebelumnya dropdown filter ini pakai daftar tetap (5 opsi lama), padahal
  // hasil import Excel bisa punya nilai Eselon IV yang jauh lebih detail
  // (mis. "Subbagian Tata Usaha dan Keuangan", "Seksi Pemeriksaan", dst).
  const daftarEselonEmpat = Array.from(
    new Set(
      data
        .map((pegawai) => (pegawai.bagian || '').trim())
        .filter((nilai) => nilai !== '')
    )
  ).sort((a, b) => a.localeCompare(b))

  const totalPegawai = data.length

  // PENTING: kartu ringkasan ini hitung berdasarkan ESELON III (bukan
  // eselon_iv/"bagian"), karena Eselon III yang konsisten berisi 5 kategori
  // besar (Bagian Umum, Bidang Penindakan, dst) di SETIAP baris data.
  // Eselon IV sekarang isinya granular per Subbagian/Seksi (hasil import
  // Excel Kanwil), jadi gak cocok lagi dipakai buat pengelompokan besar ini.
  const totalBagianUmum = data.filter((pegawai) =>
    cocokkanBagian(pegawai.eselon_iii, 'Bagian Umum')
  ).length

  const totalPenindakan = data.filter((pegawai) =>
    cocokkanBagian(pegawai.eselon_iii, 'Bidang Penindakan dan Penyidikan')
  ).length

  const totalKepabeanan = data.filter((pegawai) =>
    cocokkanBagian(pegawai.eselon_iii, 'Bidang Kepabeanan dan Cukai')
  ).length

  const totalKepatuhan = data.filter((pegawai) =>
    cocokkanBagian(pegawai.eselon_iii, 'Bidang Kepatuhan Internal')
  ).length

  const totalFasilitas = data.filter((pegawai) =>
    cocokkanBagian(pegawai.eselon_iii, 'Bidang Fasilitas Kepabeanan dan Cukai')
  ).length

  const formKosong = {
    nip: '',
    nama: '',
    pangkat: '',
    jabatan: '',
    eselon_iii: '',
    bagian: '',
    no_hp: '',
    tanggal_masuk: '',
  }

  const simpanData = (e) => {
    e.preventDefault()

    const isEdit = editId !== null

    const url = isEdit
      ? `${API_URL}/pegawai/${editId}`
      : `${API_URL}/pegawai`

    const method = isEdit ? 'PUT' : 'POST'

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
        alert(
          `Gagal ${isEdit ? 'memperbarui' : 'menyimpan'} data pegawai.`
        )
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
      tanggal_masuk: pegawai.tanggal_masuk || '',
    })
    setEditId(pegawai.id)
    setShowForm(true)
  }

  const batalEdit = () => {
    setForm(formKosong)
    setEditId(null)
    setShowForm(false)
  }

  const hapusData = (id) => {
    if (!window.confirm('Yakin ingin menghapus data pegawai ini?')) {
      return
    }

    fetch(`${API_URL}/pegawai/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => ambilData())
      .catch(() => alert('Gagal menghapus data pegawai.'))
  }

  const [importing, setImporting] = useState(false)
  const [importInfo, setImportInfo] = useState(null)
  const [hapusLamaSebelumImport, setHapusLamaSebelumImport] = useState(false)

  const handleUploadPegawai = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // aksi destruktif -> minta konfirmasi eksplisit dulu sebelum lanjut
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
          setImportInfo({ type: 'error', text: 'File kosong atau tidak terbaca. Pastikan ada data di baris kedua ke bawah.' })
          setImporting(false)
          e.target.value = ''
          return
        }

        // Kolom yang didukung: NIP, Nama, Pangkat, Jabatan, Eselon III, Bagian, No HP, TMT
        // Catatan: kalau file Excel gak punya kolom "Bagian" tersendiri (kayak file
        // Kanwil), kolom "Eselon III" dipakai juga sebagai sumber Bagian — karena di
        // data aslinya kolom itu isinya nama unit kerja (Bagian Umum / Bidang ...),
        // bukan kode eselon.
        const dataSiapKirim = rows.map((baris) => {
          // cari(kunciPersis, kunciFallback):
          // 1) coba cocokkan header yang PERSIS SAMA dulu (paling aman)
          // 2) kalau gak ketemu, baru coba header yang MENGANDUNG salah satu kunciFallback
          //    (buat nangkep variasi nama kolom kayak "Nama Pegawai", "No HP Aktif", dst)
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
          // BUGFIX: sebelumnya cuma nyari header "Bagian", jadi file Excel yang
          // headernya "Eselon IV" (kayak file Kanwil) gak pernah kebaca dan selalu
          // jatuh ke nilai Eselon III (makanya kolom Eselon IV di tabel isinya
          // dobel sama Eselon III). Sekarang "Eselon IV" dicari duluan.
          const bagianEksplisit = String(
            cari(['eseloniv', 'eselon4', 'bagian'], ['eseloniv', 'eselon4', 'bagian']) ?? ''
          ).trim()

          return {
            nip: String(cari(['nip'], ['nip']) ?? '').trim(),
            nama: String(cari(['nama'], ['nama']) ?? '').trim(),
            pangkat: String(cari(['pangkat'], ['pangkat', 'golongan']) ?? '').trim() || null,
            jabatan: String(cari(['jabatan'], ['jabatan']) ?? '').trim(),
            eselon_iii: eselonIii || null,
            // Sebelumnya ada fallback "|| eselonIii" di sini — niatnya jaga-jaga
            // kalau kolom Eselon IV gak ketemu di file. Tapi di data asli Kanwil,
            // banyak pegawai (level pimpinan) yang MEMANG sengaja gak punya
            // Eselon IV, dan fallback itu malah nyalin nama Eselon III ke situ,
            // jadi daftar Eselon IV kecampur sama nama Eselon III. Sekarang
            // dibiarkan kosong/null kalau memang gak ada di file.
            bagian: bagianEksplisit || null,
            no_hp: String(
              cari(['nohp', 'hp', 'notelepon', 'telepon'], ['nohp', 'notelepon', 'telepon'])
                ?? ''
            ).trim(),
            tanggal_masuk:
              String(
                cari(
                  ['tanggalmasuk', 'tglmasuk', 'masuk', 'tmt'],
                  ['tanggalmasuk', 'tglmasuk', 'tmt']
                ) ?? ''
              ).trim() || null,
          }
        })

        fetch(`${API_URL}/pegawai/import`, {
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
              // reset checkbox ke default (aman) tiap habis import biar gak
              // ke-centang gak sengaja pas upload berikutnya
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
        setImportInfo({ type: 'error', text: 'Gagal membaca file. Pastikan formatnya .xlsx atau .xls yang valid.' })
        setImporting(false)
        e.target.value = ''
      }
    }

    reader.readAsArrayBuffer(file)
  }

  // Download data pegawai (yang lagi ditampilkan/difilter) jadi file Excel.
  // Urutan & nama kolom sengaja disamakan dengan tabel di layar, supaya kalau
  // nanti file ini di-edit lalu di-import ulang, kolomnya tetap kebaca benar.
  const exportExcel = () => {
    const rows = dataFiltered.map((pegawai, index) => ({
      No: index + 1,
      NIP: pegawai.nip,
      'Nama Pegawai': pegawai.nama,
      Pangkat: pegawai.pangkat || '',
      Jabatan: pegawai.jabatan || '',
      'Eselon IV': pegawai.bagian || '',
      'Eselon III': pegawai.eselon_iii || '',
      TMT: formatTanggalMasuk(pegawai.tanggal_masuk),
      'Masa Kerja': formatMasaKerja(pegawai.tanggal_masuk),
      'No HP': pegawai.no_hp || '',
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    // Lebarkan kolom biar gak kepotong pas dibuka di Excel
    worksheet['!cols'] = [
      { wch: 5 },   // No
      { wch: 22 },  // NIP
      { wch: 28 },  // Nama Pegawai
      { wch: 26 },  // Pangkat
      { wch: 32 },  // Jabatan
      { wch: 30 },  // Eselon IV
      { wch: 30 },  // Eselon III
      { wch: 12 },  // TMT
      { wch: 18 },  // Masa Kerja
      { wch: 16 },  // No HP
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Pegawai')

    const tanggalFile = new Date().toISOString().split('T')[0]
    XLSX.writeFile(workbook, `Data Pegawai - ${tanggalFile}.xlsx`)
  }

  return (
    <div className="page">

      {/* Grid kartu ringkasan khusus halaman Data Pegawai (6 kartu),
          supaya selalu rapi 3 kolom x 2 baris dan tidak ada kartu
          yang nyempil sendirian di baris terakhir seperti sebelumnya. */}
      <style>{`
        .pegawai-stats-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 16px !important;
        }
        @media (max-width: 900px) {
          .pegawai-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 560px) {
          .pegawai-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .pegawai-stats-grid .stat-card {
          width: auto !important;
          min-width: 0 !important;
        }
      `}</style>

      <div className="page-title">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={22} /> Data Pegawai
        </h1>

        <p>Kelola data pegawai kepegawaian.</p>
      </div>

      <div className="stats-grid pegawai-stats-grid">

        <div className="stat-card">
          <div className="stat-icon"><Users size={20} /></div>

          <div className="stat-info">
            <div className="stat-desc" style={{ fontWeight: 700 }}>Seluruh pegawai</div>
            <div className="stat-value">{totalPegawai}</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon"><Building2 size={20} /></div>

          <div className="stat-info">
            <div className="stat-desc" style={{ fontWeight: 700 }}>Bagian Umum</div>
            <div className="stat-value">{totalBagianUmum}</div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon"><ShieldAlert size={20} /></div>

          <div className="stat-info">
            <div className="stat-desc" style={{ fontWeight: 700 }}>Bidang Penindakan dan Penyidikan</div>
            <div className="stat-value">{totalPenindakan}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Ship size={20} /></div>

          <div className="stat-info">
            <div className="stat-desc" style={{ fontWeight: 700 }}>Bidang Kepabeanan dan Cukai</div>
            <div className="stat-value">{totalKepabeanan}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><ShieldCheck size={20} /></div>

          <div className="stat-info">
            <div className="stat-desc" style={{ fontWeight: 700 }}>Bidang Kepatuhan Internal</div>
            <div className="stat-value">{totalKepatuhan}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><Handshake size={20} /></div>

          <div className="stat-info">
            <div className="stat-desc" style={{ fontWeight: 700 }}>Bidang Fasilitas Kepabeanan dan Cukai</div>
            <div className="stat-value">{totalFasilitas}</div>
          </div>
        </div>

      </div>

      {isAdmin && (
        <div className="card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} /> Import Data Pegawai
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

              <p
                style={{
                  margin: '5px 0 0',
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                Kelola data identitas pegawai.
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
              {showForm ? (
                'Tutup'
              ) : (
                <><Plus size={16} /> Tambah Data Pegawai</>
              )}
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
              onChange={(e) =>
                setForm({
                  ...form,
                  nip: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Nama Pegawai"
              required
              value={form.nama}
              onChange={(e) =>
                setForm({
                  ...form,
                  nama: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Pangkat"
              value={form.pangkat}
              onChange={(e) =>
                setForm({
                  ...form,
                  pangkat: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Jabatan"
              required
              value={form.jabatan}
              onChange={(e) =>
                setForm({
                  ...form,
                  jabatan: e.target.value,
                })
              }
            />

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Eselon III"
                autoComplete="off"
                value={form.eselon_iii}
                onChange={(e) => {
                  setForm({
                    ...form,
                    eselon_iii: e.target.value,
                  })
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
                      nilai
                        .toLowerCase()
                        .includes((form.eselon_iii || '').toLowerCase())
                    )
                    .map((nilai) => (
                      <div
                        key={nilai}
                        onMouseDown={() => {
                          setForm({ ...form, eselon_iii: nilai })
                          setDropdownEselonIiiTerbuka(false)
                        }}
                        style={{
                          padding: '9px 11px',
                          fontSize: '12px',
                          color: '#334155',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        {nilai}
                      </div>
                    ))}

                  {daftarEselonTiga.filter((nilai) =>
                    nilai
                      .toLowerCase()
                      .includes((form.eselon_iii || '').toLowerCase())
                  ).length === 0 && (
                    <div
                      style={{
                        padding: '9px 11px',
                        fontSize: '12px',
                        color: '#94a3b8',
                      }}
                    >
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
                  setForm({
                    ...form,
                    bagian: e.target.value,
                  })
                  setDropdownEselonIvTerbuka(true)
                }}
                onFocus={() => setDropdownEselonIvTerbuka(true)}
                onBlur={() =>
                  // delay dikit biar sempat kebaca klik di opsi (onMouseDown)
                  // sebelum dropdown-nya ketutup duluan gara-gara blur
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
                      nilai
                        .toLowerCase()
                        .includes((form.bagian || '').toLowerCase())
                    )
                    .map((nilai) => (
                      <div
                        key={nilai}
                        onMouseDown={() => {
                          setForm({ ...form, bagian: nilai })
                          setDropdownEselonIvTerbuka(false)
                        }}
                        style={{
                          padding: '9px 11px',
                          fontSize: '12px',
                          color: '#334155',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#eff6ff'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                      >
                        {nilai}
                      </div>
                    ))}

                  {daftarEselonEmpat.filter((nilai) =>
                    nilai
                      .toLowerCase()
                      .includes((form.bagian || '').toLowerCase())
                  ).length === 0 && (
                    <div
                      style={{
                        padding: '9px 11px',
                        fontSize: '12px',
                        color: '#94a3b8',
                      }}
                    >
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
              onChange={(e) =>
                setForm({
                  ...form,
                  no_hp: e.target.value,
                })
              }
            />

            <div style={{ alignSelf: 'flex-end' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '4px',
                  fontSize: '11px',
                  color: '#64748b',
                }}
              >
                TMT
              </label>
              <input
                type="date"
                required
                value={form.tanggal_masuk}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tanggal_masuk: e.target.value,
                  })
                }
              />
            </div>

            <div
              style={{
                display: 'flex',
                gap: '8px',
                alignSelf: 'flex-end',
                height: 'fit-content',
              }}
            >
              <button
                type="submit"
                className="btn"
                style={{
                  width: 'auto',
                  height: 'auto',
                  padding: '8px 16px',
                  fontSize: '13px',
                }}
              >
                {editId !== null
                  ? 'Simpan Perubahan'
                  : 'Simpan Data Pegawai'}
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
            <Search size={18} /> Daftar Pegawai
          </h3>

          <button
            type="button"
            onClick={exportExcel}
            className="btn"
            title="Download data pegawai yang sedang ditampilkan ke file Excel"
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

          <select
            value={filterEselonTiga}
            onChange={(e) =>
              setFilterEselonTiga(e.target.value)
            }
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              backgroundColor: '#fff',
              color: '#334155',
            }}
          >
            <option value="semua">Semua Eselon III</option>
            {daftarEselonTiga.map((nilai) => (
              <option key={nilai} value={nilai}>
                {nilai}
              </option>
            ))}
          </select>

          <select
            value={filterEselonEmpat}
            onChange={(e) =>
              setFilterEselonEmpat(e.target.value)
            }
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              backgroundColor: '#fff',
              color: '#334155',
            }}
          >
            <option value="semua">Semua Eselon IV</option>
            {daftarEselonEmpat.map((nilai) => (
              <option key={nilai} value={nilai}>
                {nilai}
              </option>
            ))}
          </select>
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
                <th>TMT</th>
                <th>Masa Kerja</th>
                <th>No. HP</th>
                {isAdmin && <th>Aksi</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 11 : 10}
                    style={{
                      textAlign: 'center',
                      padding: '30px',
                    }}
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : (
                (() => {
                  const ITEMS_PER_PAGE = 10
                  const totalPages = Math.ceil(dataFiltered.length / ITEMS_PER_PAGE)
                  const startIndex = currentPage * ITEMS_PER_PAGE
                  const endIndex = startIndex + ITEMS_PER_PAGE
                  const dataPaginated = dataFiltered.slice(startIndex, endIndex)

                  return (
                    <>
                      {dataPaginated.length > 0 ? (
                        dataPaginated.map((pegawai, index) => {
                          return (
                            <tr key={pegawai.id}>
                              <td>{startIndex + index + 1}</td>
                              <td>{pegawai.nip}</td>
                              <td>{pegawai.nama}</td>
                              <td>{pegawai.pangkat || '-'}</td>
                              <td>{pegawai.jabatan}</td>
                              <td>{pegawai.bagian}</td>
                              <td>{pegawai.eselon_iii || '-'}</td>
                              <td>{formatTanggalMasuk(pegawai.tanggal_masuk)}</td>
                              <td>{formatMasaKerja(pegawai.tanggal_masuk)}</td>
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
                                      onClick={() => hapusData(pegawai.id)}
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
                                      <Trash2 size={14} color="#dc2626" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={isAdmin ? 11 : 10}
                            style={{
                              textAlign: 'center',
                              padding: '30px',
                            }}
                          >
                            Tidak ada data pegawai.
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })()
              )}
            </tbody>
          </table>
        </div>

        {(() => {
          const ITEMS_PER_PAGE = 10
          const totalPages = Math.ceil(dataFiltered.length / ITEMS_PER_PAGE)
          return (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="btn"
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', opacity: currentPage === 0 ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
              >
                Back
              </button>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>
                {currentPage + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                disabled={currentPage + 1 >= totalPages}
                className="btn"
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPage + 1 >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage + 1 >= totalPages ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
              >
                Next
              </button>
            </div>
          )
        })()}

      </div>
    </div>
  )
}

export default DataPegawai