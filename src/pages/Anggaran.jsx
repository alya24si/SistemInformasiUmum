import { useState, useEffect } from 'react'

const API = 'http://localhost:8000/api'

const daftarBidang = [
  'Umum',
  'P2',
  'KI',
  'Pabean',
  'Fasilitas',
]

const daftarBulan = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const tahunIni = new Date().getFullYear()

const daftarTahun = Array.from(
  { length: 6 },
  (_, i) => tahunIni - 1 + i
)

const formatRupiah = (angka) =>
  'Rp ' + Number(angka).toLocaleString('id-ID')

// ✨ REVISI: Helper untuk format angka dengan titik di input
const formatTitik = (angka) => {
  const n = Number(String(angka).replace(/[^\d]/g, '')) || 0
  return n.toLocaleString('id-ID')
}

const parseAngka = (str) => {
  return Number(String(str || '').replace(/[^\d]/g, '')) || 0
}

/* ========================================================= */
/* ✨ ICON SET (stroke flat style, seperti icon VS Code)      */
/*    Murni pengganti emoji — tidak menyentuh logika apapun  */
/* ========================================================= */
const SvgIkon = ({ children, size = 18, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ verticalAlign: '-4px', ...style }}
  >
    {children}
  </svg>
)

const IkonChart = (p) => (
  <SvgIkon {...p}>
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </SvgIkon>
)

const IkonLock = (p) => (
  <SvgIkon {...p}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </SvgIkon>
)

const IkonLandmark = (p) => (
  <SvgIkon {...p}>
    <line x1="3" x2="21" y1="22" y2="22" />
    <line x1="6" x2="6" y1="18" y2="11" />
    <line x1="10" x2="10" y1="18" y2="11" />
    <line x1="14" x2="14" y1="18" y2="11" />
    <line x1="18" x2="18" y1="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </SvgIkon>
)

const IkonCard = (p) => (
  <SvgIkon {...p}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </SvgIkon>
)

const IkonTrending = (p) => (
  <SvgIkon {...p}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </SvgIkon>
)

const IkonPlus = (p) => (
  <SvgIkon {...p}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </SvgIkon>
)

const IkonCalendar = (p) => (
  <SvgIkon {...p}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </SvgIkon>
)

const IkonBriefcase = (p) => (
  <SvgIkon {...p}>
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
  </SvgIkon>
)

const IkonSearch = (p) => (
  <SvgIkon {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </SvgIkon>
)

const IkonX = (p) => (
  <SvgIkon {...p}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </SvgIkon>
)

const IkonClipboard = (p) => (
  <SvgIkon {...p}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </SvgIkon>
)

const IkonClock = (p) => (
  <SvgIkon {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </SvgIkon>
)

const IkonFolder = (p) => (
  <SvgIkon {...p}>
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </SvgIkon>
)

const dataAwal = [
  {
    id: 1,
    tahun: 2026,
    bidang: 'P2',
    tipe: 'utama',
    kodeAkun: '4787.AEF.101',
    deskripsi: 'Sosialisasi dan Penyuluhan (Eksternal)',
    unit: 56,
    satuan: 'Orang',
    hargaSatuan: 798000,
    pagu: 44688000,
    realisasi: 9927400,
  },
  {
    id: 2,
    tahun: 2026,
    bidang: 'Umum',
    tipe: 'detail',
    kodeAkun: '521211',
    deskripsi: 'KDM - Snack [52 ORANG x 2 KALI x 2 FR]',
    unit: 208,
    satuan: 'OK',
    hargaSatuan: 22116,
    pagu: 4600000,
    realisasi: 4563400,
  },
  {
    id: 3,
    tahun: 2026,
    bidang: 'Umum',
    tipe: 'detail',
    kodeAkun: '524111',
    deskripsi: 'Uang Harian [4 FR x 4 ORANG x 3 HARI]',
    unit: 48,
    satuan: 'OH',
    hargaSatuan: 36084,
    pagu: 1732000,
    realisasi: 1732000,
  },
  {
    id: 4,
    tahun: 2026,
    bidang: 'KI',
    tipe: 'utama',
    kodeAkun: '4787.BIG.001',
    deskripsi: 'Pemeriksaan Kepabeanan dan Cukai',
    unit: 5,
    satuan: 'Laporan',
    hargaSatuan: 6619800,
    pagu: 33099000,
    realisasi: 30748274,
  },
  {
    id: 5,
    tahun: 2026,
    bidang: 'Fasilitas',
    tipe: 'utama',
    kodeAkun: '4787.CDE.002',
    deskripsi: 'Pemeliharaan Gedung dan Bangunan',
    unit: 12,
    satuan: 'Kegiatan',
    hargaSatuan: 1500000,
    pagu: 18000000,
    realisasi: 7200000,
  },
]

// ✨ REVISI: Range baru + label lebih natural
const statusAnggaran = (persen) => {
  const p = Math.min(persen, 100)

  if (p >= 90) {
    return {
      label: 'Baik',
      cls: 'green',
    }
  }

  if (p >= 50) {
    return {
      label: 'Cukup',
      cls: 'yellow',
    }
  }

  return {
    label: 'Kurang',
    cls: 'red',
  }
}

// ✨ REVISI: Warna progress bar dinamis
const warnaProgress = (persen) => {
  const p = Math.min(persen, 100)
  if (p >= 90) return 'linear-gradient(90deg, #16a34a, #4ade80)'
  if (p >= 50) return 'linear-gradient(90deg, #eab308, #facc15)'
  return 'linear-gradient(90deg, #dc2626, #f87171)'
}

function Anggaran({ user }) {
  const isAdmin =
    user.role === 'admin_keuangan' ||
    user.role === 'superadmin'

  const [data, setData] = useState([])

  // ✨ STATE BARU: untuk modal riwayat realisasi
  const [riwayatModal, setRiwayatModal] = useState({
    open: false,
    loading: false,
    anggaran: null,
    riwayat: [],
  })

  // ✨ REVISI: State untuk simpan nilai input pagu (dengan titik) per baris
  const [paguInput, setPaguInput] = useState({})

  const muatData = async () => {
    const res = await fetch(API + '/anggaran')
    const json = await res.json()
    if (json.success) {
      setData(
        json.data.map((d) => ({
          ...d,
          tahun: Number(d.tahun),
          unit: Number(d.unit),
          hargaSatuan: Number(d.harga_satuan),
          pagu: Number(d.pagu),
          realisasi: Number(d.realisasi),
          kodeAkun: d.kode_akun,
        }))
      )
    }
  }

  useEffect(() => {
    muatData()
  }, [])

  const [form, setForm] = useState({
    tahun: tahunIni,
    bidang: daftarBidang[0],
    tipe: 'utama',
    kodeAkun: '',
    deskripsi: '',
    unit: '',
    satuan: '',
    hargaSatuan: '',
  })

  const [formRealisasi, setFormRealisasi] = useState({
    id: '',
    bulan: daftarBulan[0],
    jumlah: '',
  })

  const [filterTahun, setFilterTahun] =
    useState('semua')

  const [filterBidang, setFilterBidang] =
    useState('semua')

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(0)

  const milikUser = isAdmin
    ? data
    : data.filter(
        (d) => d.bidang === user.bidang
      )

  const dataFiltered = milikUser.filter((d) => {
    const cocokTahun =
      filterTahun === 'semua' ||
      d.tahun === Number(filterTahun)

    const cocokBidang = isAdmin
      ? filterBidang === 'semua' ||
        d.bidang === filterBidang
      : true

    return cocokTahun && cocokBidang
  })

  const totalPagu = milikUser.reduce(
    (a, b) => a + b.pagu,
    0
  )

  const totalRealisasi = milikUser.reduce(
    (a, b) => a + b.realisasi,
    0
  )

  // ✨ REVISI: Cap maksimal 100%
  const persenTotal =
    totalPagu > 0
      ? Math.min(Math.round(
          (totalRealisasi / totalPagu) * 100
        ), 100)
      : 0

  const previewPagu =
    Number(form.unit || 0) *
    parseAngka(form.hargaSatuan)

    const tambahData = async (e) => {
    e.preventDefault()

    await fetch(API + '/anggaran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tahun: Number(form.tahun),
        bidang: form.bidang,
        tipe: form.tipe,
        kode_akun: form.kodeAkun,
        deskripsi: form.deskripsi,
        unit: Number(form.unit),
        satuan: form.satuan,
        // ✨ REVISI: parse dulu baru kirim (hilangkan titik)
        harga_satuan: parseAngka(form.hargaSatuan),
      }),
    })

    setForm({
      tahun: tahunIni,
      bidang: daftarBidang[0],
      tipe: 'utama',
      kodeAkun: '',
      deskripsi: '',
      unit: '',
      satuan: '',
      hargaSatuan: '',
    })

    muatData()
  }

   const tambahRealisasi = async (e) => {
    e.preventDefault()

    await fetch(
      API + '/anggaran/' + formRealisasi.id + '/realisasi',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
          // ✨ REVISI: parse dulu baru kirim
          jumlah: parseAngka(formRealisasi.jumlah),
          bulan: formRealisasi.bulan,
        }),
      }
    )

    setFormRealisasi({
      id: '',
      bulan: daftarBulan[0],
      jumlah: '',
    })

    muatData()
  }

  // ✨ REVISI: update pagu dengan parsing (karena input sudah ada titiknya)
  const updatePagu = (id, nilai) => {
    const angkaBersih = parseAngka(nilai)
    setData(
      data.map((d) =>
        d.id === id
          ? { ...d, pagu: angkaBersih }
          : d
      )
    )

    fetch(API + '/anggaran/' + id + '/pagu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagu: angkaBersih }),
    })
  }

  const hapusData = async (id) => {
    if (
      window.confirm(
        'Yakin ingin menghapus baris anggaran ini?'
      )
    ) {
      await fetch(API + '/anggaran/' + id, {
        method: 'DELETE',
      })
      muatData()
    }
  }

  // ✨ FUNCTION BARU: buka modal & fetch riwayat realisasi
  const lihatRiwayat = async (d) => {
    setRiwayatModal({
      open: true,
      loading: true,
      anggaran: d,
      riwayat: [],
    })

    try {
      const res = await fetch(API + '/anggaran/' + d.id + '/realisasi')
      const json = await res.json()
      if (json.success) {
        setRiwayatModal({
          open: true,
          loading: false,
          anggaran: d,
          riwayat: json.data || [],
        })
      }
    } catch {
      setRiwayatModal({
        open: false,
        loading: false,
        anggaran: null,
        riwayat: [],
      })
    }
  }

  const tutupModal = () => {
    setRiwayatModal({
      open: false,
      loading: false,
      anggaran: null,
      riwayat: [],
    })
  }

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-title">
        <h1><IkonChart size={22} /> Penyerapan Anggaran</h1>

        <p>
          Data dari bagian keuangan. Pagu diupload
          per tahun, realisasi diperbarui per bulan.
        </p>
      </div>

      {/* MODE TAMU */}
      {!isAdmin && (
        <div className="guest-note">
          <IkonLock size={15} /> Mode tamu: Anda hanya melihat data
          bidang <b>{user.bidang}</b>.
        </div>
      )}

      {/* STATISTIK */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">
            <IkonLandmark size={22} style={{ color: '#005ca9' }} />
          </div>

          <div className="stat-info">
            <h4>Total Pagu</h4>

            <div
              className="stat-value"
              style={{
                fontSize: '16px',
              }}
            >
              {formatRupiah(totalPagu)}
            </div>

            <div className="stat-desc">
              {isAdmin
                ? 'Seluruh bidang'
                : `Bidang ${user.bidang}`}
            </div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon">
            <IkonCard size={22} style={{ color: '#b45309' }} />
          </div>

          <div className="stat-info">
            <h4>Total Realisasi</h4>

            <div
              className="stat-value"
              style={{
                fontSize: '16px',
              }}
            >
              {formatRupiah(totalRealisasi)}
            </div>

            <div className="stat-desc">
              Sudah terserap
            </div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <IkonTrending size={22} style={{ color: '#15803d' }} />
          </div>

          <div className="stat-info">
            <h4>Penyerapan</h4>

            <div className="stat-value">
              {persenTotal}%
            </div>

            <div className="stat-desc">
              Dari total pagu
            </div>
          </div>
        </div>

      </div>

      {/* FORM ADMIN */}
      {isAdmin && (
        <>

          {/* UPLOAD PAGU */}
          <div className="card">

            <h3>
              <IkonPlus size={16} /> Tambah Baris Anggaran
              (unit × harga satuan)
            </h3>

            <form
              onSubmit={tambahData}
              className="form-row"
            >

              <select
                value={form.tahun}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tahun: e.target.value,
                  })
                }
              >
                {daftarTahun.map((t) => (
                  <option
                    key={t}
                    value={t}
                  >
                    Tahun {t}
                  </option>
                ))}
              </select>

              <select
                value={form.bidang}
                onChange={(e) =>
                  setForm({
                    ...form,
                    bidang: e.target.value,
                  })
                }
              >
                {daftarBidang.map((b) => (
                  <option
                    key={b}
                    value={b}
                  >
                    {b}
                  </option>
                ))}
              </select>

              <select
                value={form.tipe}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tipe: e.target.value,
                  })
                }
              >
                <option value="utama">
                  Baris Utama
                </option>

                <option value="detail">
                  Baris Detail
                </option>
              </select>

              <input
                type="text"
                placeholder="Kode Akun"
                required
                value={form.kodeAkun}
                onChange={(e) =>
                  setForm({
                    ...form,
                    kodeAkun: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Deskripsi"
                required
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deskripsi: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Unit"
                required
                value={form.unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unit: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Satuan"
                required
                value={form.satuan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    satuan: e.target.value,
                  })
                }
              />

              {/* ✨ REVISI: Input Harga Satuan dengan titik otomatis */}
              <input
                type="text"
                placeholder="Harga Satuan (Rp)"
                required
                value={form.hargaSatuan}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, '')
                  setForm({
                    ...form,
                    hargaSatuan: raw ? formatTitik(raw) : '',
                  })
                }}
              />

              <button
                type="submit"
                className="btn"
              >
                Simpan
              </button>

            </form>

            <div className="form-info">
              Pagu otomatis:{' '}
              <b>
                {formatRupiah(previewPagu)}
              </b>
            </div>

          </div>

          {/* INPUT REALISASI */}
          <div className="card">

            <h3>
              <IkonCalendar size={16} /> Input Realisasi Bulan Ini
            </h3>

            <form
              onSubmit={tambahRealisasi}
              className="form-row"
            >

              <select
                value={formRealisasi.id}
                required
                onChange={(e) =>
                  setFormRealisasi({
                    ...formRealisasi,
                    id: e.target.value,
                  })
                }
              >
                <option value="">
                  -- Pilih Baris Anggaran --
                </option>

                {data.map((d) => (
                  <option
                    key={d.id}
                    value={d.id}
                  >
                    {d.kodeAkun} | {d.deskripsi}
                  </option>
                ))}
              </select>

              <select
                value={formRealisasi.bulan}
                onChange={(e) =>
                  setFormRealisasi({
                    ...formRealisasi,
                    bulan: e.target.value,
                  })
                }
              >
                {daftarBulan.map((b) => (
                  <option
                    key={b}
                    value={b}
                  >
                    {b}
                  </option>
                ))}
              </select>

              {/* ✨ REVISI: Input Jumlah Realisasi dengan titik otomatis */}
              <input
                type="text"
                placeholder="Jumlah realisasi bulan ini (Rp)"
                required
                value={formRealisasi.jumlah}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, '')
                  setFormRealisasi({
                    ...formRealisasi,
                    jumlah: raw ? formatTitik(raw) : '',
                  })
                }}
              />

              <button
                type="submit"
                className="btn"
              >
                Tambah Realisasi
              </button>

            </form>

          </div>

        </>
      )}

      {/* REKAPITULASI */}
      <div className="card">

        <h3>
          <IkonBriefcase size={16} /> Rekapitulasi Penyerapan Anggaran
        </h3>

        {/* FILTER */}
        <div className="filter-row">

          <select
            value={filterTahun}
            onChange={(e) => {
              setFilterTahun(e.target.value)
              setCurrentPage(0)
            }}
          >
            <option value="semua">
              Semua Tahun
            </option>

            {daftarTahun.map((t) => (
              <option
                key={t}
                value={t}
              >
                Tahun {t}
              </option>
            ))}
          </select>

          {isAdmin && (
            <select
              value={filterBidang}
              onChange={(e) => {
                setFilterBidang(e.target.value)
                setCurrentPage(0)
              }}
            >
              <option value="semua">
                Semua Bidang
              </option>

              {daftarBidang.map((b) => (
                <option
                  key={b}
                  value={b}
                >
                  {b}
                </option>
              ))}
            </select>
          )}

        </div>

        <div className="filter-info">
          Menampilkan {dataFiltered.length} dari{' '}
          {milikUser.length} baris
        </div>

        {/* ✨ REVISI: LEGENDA STATUS (tambahan baru, tidak mengubah logika lain) */}
        <div style={{ display: 'flex', gap: '14px', padding: '10px 14px', background: '#f8fafc', borderRadius: '10px', marginBottom: '14px', fontSize: '12px', color: '#475569', flexWrap: 'wrap', border: '1px solid #e2e8f0' }}>
          <span style={{ fontWeight: 700, color: '#002b5c' }}>Keterangan Status:</span>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a', marginRight: '5px' }}></span>Baik (≥90%)</span>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#eab308', marginRight: '5px' }}></span>Cukup (50-89%)</span>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626', marginRight: '5px' }}></span>Kurang (&lt;50%)</span>
        </div>

        {/* TABLE */}
        <div className="table-wrap">

          <table className="table">

            <thead>
              <tr>

                <th
                  style={{
                    minWidth: '240px',
                  }}
                >
                  Kode Akun / Deskripsi
                </th>

                <th>
                  Volume
                </th>

                <th className="num">
                  Harga Satuan
                </th>

                <th className="num">
                  Pagu
                </th>

                <th className="num">
                  Realisasi
                </th>

                <th className="num">
                  Sisa Anggaran
                </th>

                <th>
                  Penyerapan
                </th>

                <th>
                  Status
                </th>

                <th>
                  Aksi
                </th>

              </tr>
            </thead>

            <tbody>

              {(() => {

                const ITEMS_PER_PAGE = 10

                const totalPages =
                  Math.ceil(
                    dataFiltered.length /
                      ITEMS_PER_PAGE
                  )

                const startIndex =
                  currentPage *
                  ITEMS_PER_PAGE

                const endIndex =
                  startIndex +
                  ITEMS_PER_PAGE

                const dataPaginated =
                  dataFiltered.slice(
                    startIndex,
                    endIndex
                  )

                return (
                  <>
                    {dataPaginated.map(
                      (d) => {

                        // ✨ REVISI: hitung persen asli + cap max 100
                        const persenAsli =
                          d.pagu > 0
                            ? (d.realisasi /
                              d.pagu) *
                              100
                            : 0

                        const persen =
                          Math.min(Math.round(persenAsli), 100)

                        const sisa =
                          d.pagu -
                          d.realisasi

                        const st =
                          statusAnggaran(
                            persenAsli
                          )

                        // ✨ REVISI: Ambil nilai input pagu dari state (jika ada, pakai itu; kalau tidak, format dari d.pagu)
                        const nilaiPaguDisplay =
                          paguInput[d.id] !== undefined
                            ? paguInput[d.id]
                            : formatTitik(d.pagu)

                        return (
                          <tr
                            key={d.id}
                            className={
                              d.tipe ===
                              'detail'
                                ? 'row-kuning'
                                : ''
                            }
                          >

                            <td>

                              <div className="cell-sub">
                                {d.kodeAkun} •{' '}
                                {d.bidang} •{' '}
                                {d.tahun}
                              </div>

                              <div className="cell-main">
                                {d.deskripsi}
                              </div>

                            </td>

                            <td>
                              {d.unit}{' '}
                              {d.satuan}
                            </td>

                            <td className="num">
                              {formatRupiah(
                                d.hargaSatuan
                              )}
                            </td>

                            <td className="num">

                              {isAdmin ? (
                                <input
                                  type="text"
                                  className="pagu-input"
                                  value={nilaiPaguDisplay}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/[^\d]/g, '')
                                    const formatted = raw ? formatTitik(raw) : ''
                                    setPaguInput({
                                      ...paguInput,
                                      [d.id]: formatted,
                                    })
                                  }}
                                  onBlur={() => {
                                    // ✨ Saat blur (lepas fokus), simpan ke server
                                    if (paguInput[d.id] !== undefined) {
                                      updatePagu(d.id, paguInput[d.id])
                                      // Reset state lokal supaya ambil dari data lagi
                                      setPaguInput((prev) => {
                                        const baru = { ...prev }
                                        delete baru[d.id]
                                        return baru
                                      })
                                    }
                                  }}
                                />
                              ) : (
                                formatRupiah(
                                  d.pagu
                                )
                              )}

                            </td>

                            <td className="num">
                              {formatRupiah(
                                d.realisasi
                              )}
                            </td>

                            <td className="num">
                              {formatRupiah(
                                sisa
                              )}
                            </td>

                            <td>

                              <div className="progress">

                                <div
                                  className="progress-bar"
                                  style={{
                                    width:
                                      persen +
                                      '%',
                                    // ✨ REVISI: warna dinamis
                                    background: warnaProgress(persenAsli),
                                  }}
                                ></div>

                              </div>

                              <small>
                                {persen}%
                                {/* ✨ REVISI: label kalau melebihi pagu */}
                                {persenAsli > 100 && (
                                  <span style={{ color: '#dc2626', fontSize: '10px', marginLeft: '4px', fontWeight: 700 }}>
                                    (melebihi pagu)
                                  </span>
                                )}
                              </small>

                            </td>

                            <td>

                              <span
                                className={`badge ${st.cls}`}
                              >
                                {st.label}
                              </span>

                            </td>

                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {/* ✨ TOMBOL LIHAT RIWAYAT */}
                                <button
                                  className="btn"
                                  onClick={() => lihatRiwayat(d)}
                                  style={{
                                    padding: '6px 10px',
                                    fontSize: '12px',
                                    background: 'linear-gradient(135deg, #005ca9, #0072ce)',
                                    color: '#fff',
                                  }}
                                >
                                  <IkonSearch size={13} /> Lihat
                                </button>

                                {isAdmin && (
                                  <button
                                    className="btn-danger"
                                    onClick={() =>
                                      hapusData(
                                        d.id
                                      )
                                    }
                                  >
                                    <IkonX size={13} />
                                  </button>
                                )}
                              </div>
                            </td>

                          </tr>
                        )
                      }
                    )}
                  </>
                )

              })()}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}
        {(() => {

          const ITEMS_PER_PAGE = 10

          const totalPages =
            Math.ceil(
              dataFiltered.length /
                ITEMS_PER_PAGE
            )

          return (
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'flex-end',
                gap: '8px',
                marginTop: '16px',
                alignItems: 'center',
              }}
            >

              <button
                onClick={() =>
                  setCurrentPage(
                    (prev) =>
                      Math.max(
                        0,
                        prev - 1
                      )
                  )
                }
                disabled={
                  currentPage === 0
                }
                className="btn"
                style={{
                  padding:
                    '6px 10px',
                  borderRadius:
                    '6px',
                  border:
                    '1px solid #cbd5e1',
                  backgroundColor:
                    '#fff',
                  cursor:
                    currentPage === 0
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    currentPage === 0
                      ? 0.5
                      : 1,
                  fontSize:
                    '11px',
                  fontWeight: 600,
                }}
              >
                Back
              </button>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color:
                    '#64748b',
                }}
              >
                {currentPage + 1} /{' '}
                {Math.max(
                  1,
                  totalPages
                )}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(
                    (prev) =>
                      prev + 1 <
                      totalPages
                        ? prev + 1
                        : prev
                  )
                }
                disabled={
                  currentPage + 1 >=
                  totalPages
                }
                className="btn"
                style={{
                  padding:
                    '6px 10px',
                  borderRadius:
                    '6px',
                  border:
                    '1px solid #cbd5e1',
                  backgroundColor:
                    '#fff',
                  cursor:
                    currentPage + 1 >=
                    totalPages
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    currentPage + 1 >=
                    totalPages
                      ? 0.5
                      : 1,
                  fontSize:
                    '11px',
                  fontWeight: 600,
                }}
              >
                Next
              </button>

            </div>
          )

        })()}

      </div>

      {/* ✨ MODAL RIWAYAT REALISASI */}
      {riwayatModal.open && (
        <div
          className="warning-overlay"
          style={{
            background: 'rgba(0, 31, 69, 0.75)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={tutupModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '560px',
              maxWidth: '94%',
              maxHeight: '85vh',
              background: '#fff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header Modal */}
            <div
              style={{
                background: 'linear-gradient(90deg, #002b5c, #004080)',
                color: '#fff',
                padding: '18px 22px',
                borderBottom: '3px solid #ffc72c',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '16px' }}>
                  <IkonClipboard size={17} /> Histori Realisasi
                </h3>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: '12px',
                    color: '#ffd76e',
                    opacity: 0.9,
                  }}
                >
                  {riwayatModal.anggaran?.kodeAkun} •{' '}
                  {riwayatModal.anggaran?.deskripsi}
                </p>
              </div>
              <button
                onClick={tutupModal}
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IkonX size={16} />
              </button>
            </div>

            {/* Ringkasan Singkat */}
            <div
              style={{
                padding: '14px 22px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Pagu
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#002b5c' }}>
                  {formatRupiah(riwayatModal.anggaran?.pagu || 0)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Total Realisasi
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#16a34a' }}>
                  {formatRupiah(riwayatModal.anggaran?.realisasi || 0)}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: '10px',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Sisa
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    color:
                      (riwayatModal.anggaran?.pagu || 0) -
                        (riwayatModal.anggaran?.realisasi || 0) >
                      0
                        ? '#d97706'
                        : '#16a34a',
                  }}
                >
                  {formatRupiah(
                    (riwayatModal.anggaran?.pagu || 0) -
                      (riwayatModal.anggaran?.realisasi || 0)
                  )}
                </div>
              </div>
            </div>

            {/* Isi Tabel Riwayat */}
            <div style={{ padding: '18px 22px', overflowY: 'auto' }}>
              {riwayatModal.loading ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '30px',
                    color: '#64748b',
                    fontSize: '13px',
                  }}
                >
                  <IkonClock size={15} /> Memuat riwayat...
                </div>
              ) : riwayatModal.riwayat.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: '#94a3b8',
                    fontSize: '13px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px dashed #cbd5e1',
                  }}
                >
                  <IkonFolder size={16} /> Belum ada realisasi tercatat untuk anggaran ini.
                </div>
              ) : (
                <table className="table" style={{ minWidth: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>No</th>
                      <th>Bulan</th>
                      <th className="num">Jumlah Realisasi</th>
                      <th>Waktu Input</th>
                    </tr>
                  </thead>
                  <tbody>
                    {riwayatModal.riwayat.map((r, i) => (
                      <tr key={r.id}>
                        <td>{i + 1}</td>
                        <td>
                          <strong>{r.bulan}</strong>
                        </td>
                        <td
                          className="num"
                          style={{ fontWeight: 700, color: '#16a34a' }}
                        >
                          {formatRupiah(Number(r.jumlah))}
                        </td>
                        <td style={{ fontSize: '11px', color: '#64748b' }}>
                          {r.created_at
                            ? new Date(r.created_at).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f1f5f9' }}>
                      <td colSpan="2" style={{ fontWeight: 700, textAlign: 'right' }}>
                        TOTAL
                      </td>
                      <td
                        className="num"
                        style={{
                          fontWeight: 800,
                          color: '#002b5c',
                          fontSize: '14px',
                        }}
                      >
                        {formatRupiah(
                          riwayatModal.riwayat.reduce(
                            (a, r) => a + Number(r.jumlah),
                            0
                          )
                        )}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Footer Modal */}
            <div
              style={{
                padding: '14px 22px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={tutupModal}
                className="btn"
                style={{
                  padding: '8px 20px',
                  fontSize: '13px',
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Anggaran