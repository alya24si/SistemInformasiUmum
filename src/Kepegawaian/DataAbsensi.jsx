import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  ClipboardList,
  Users,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Upload,
  MessageCircle,
  Plus,
  Pencil,
  Search,
  Trash2,
  XCircle,
  Clock,
} from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000/api'

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

// nama bulan (Indonesia & Inggris disingkat) -> angka bulan, buat parsing teks tanggal
// yang bukan format Excel-date beneran (misal: "19 Aug 2026")
const namaBulanKeAngka = {
  jan: '01', feb: '02', mar: '03', apr: '04',
  mei: '05', may: '05', jun: '06', jul: '07',
  agu: '08', aug: '08', sep: '09',
  okt: '10', oct: '10', nov: '11',
  des: '12', dec: '12',
}

// Status presensi yang dianggap AMAN (samain sama backend STATUS_PRESENSI_AMAN)
const STATUS_PRESENSI_AMAN = ['Hadir Normal', 'Cuti Tahunan', 'ST']

const statusAbsensi = (status) => {
  if (STATUS_PRESENSI_AMAN.includes(status)) {
    return {
      label: status,
      cls: 'green',
    }
  }

  // apapun di luar status aman (Tanpa Keterangan, PSW1-4, TL1-3, kombinasi, dst) = bermasalah
  return {
    label: status || 'Tanpa Keterangan',
    cls: 'red',
  }
}

const formatTanggal = (tanggal) => {
  return new Date(`${tanggal}T00:00:00`).toLocaleDateString(
    'id-ID',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  )
}

function DataAbsensi({ user }) {
  const isAdmin =
    user.role === 'admin_kepegawaian' ||
    user.role === 'superadmin'

  const [data, setData] = useState([])
  const [pegawaiList, setPegawaiList] = useState([])
  const [alpaList, setAlpaList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    pegawai_id: '',
    tanggal: '',
    jam_masuk: '',
    jam_pulang: '',
    status_penugasan: '',
    status: 'Hadir',
  })

  const [filterTahun, setFilterTahun] = useState(
    String(tahunIni)
  )

  const [filterBulan, setFilterBulan] = useState('semua')

  const [search, setSearch] = useState('')

  const [currentPage, setCurrentPage] = useState(0)
  const [editId, setEditId] = useState(null)
  const [alpaPage, setAlpaPage] = useState(0)

  const ambilAbsensi = () => {
    fetch(`${API_URL}/absensi`)
      .then((res) => res.json())
      .then((res) => setData(res.data || []))
      .catch(() => alert('Gagal mengambil data absensi.'))
  }

  const ambilPegawai = () => {
    fetch(`${API_URL}/pegawai`)
      .then((res) => res.json())
      .then((res) => setPegawaiList(res.data || []))
      .catch(() => alert('Gagal mengambil data pegawai.'))
  }

  const ambilAlpaBerturut = () => {
    fetch(`${API_URL}/absensi/alpa-berturut`)
      .then((res) => res.json())
      .then((res) => setAlpaList(res.data || []))
      .catch(() => alert('Gagal mengambil data pegawai yang alpa.'))
  }

  useEffect(() => {
    setLoading(true)

    ambilAbsensi()
    ambilPegawai()
    ambilAlpaBerturut()

    setLoading(false)
  }, [])

  const [importing, setImporting] = useState(false)
  const [importInfo, setImportInfo] = useState(null)

  // Excel kadang nyimpen tanggal/jam sebagai object Date, kadang teks biasa
  // (contoh dari sistem absensi kantor: "19 Aug 2026" — teks murni, bukan Excel-date)
  const keFormatTanggalISO = (nilai) => {
    if (!nilai) return ''

    if (nilai instanceof Date) {
      const y = nilai.getFullYear()
      const m = String(nilai.getMonth() + 1).padStart(2, '0')
      const d = String(nilai.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    const teks = String(nilai).trim()

    // sudah format ISO (yyyy-mm-dd)
    if (/^\d{4}-\d{2}-\d{2}$/.test(teks)) return teks

    // format "19 Aug 2026" / "19 Agustus 2026"
    const cocokNamaBulan = teks.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/)
    if (cocokNamaBulan) {
      const [, tgl, bulanTeks, tahun] = cocokNamaBulan
      const kunciBulan = bulanTeks.trim().toLowerCase().slice(0, 3)
      const bulan = namaBulanKeAngka[kunciBulan]
      if (bulan) {
        return `${tahun}-${bulan}-${String(tgl).padStart(2, '0')}`
      }
    }

    // format dd/mm/yyyy atau dd-mm-yyyy
    const cocokAngka = teks.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (cocokAngka) {
      const [, tgl, bulan, tahun] = cocokAngka
      return `${tahun}-${String(bulan).padStart(2, '0')}-${String(tgl).padStart(2, '0')}`
    }

    // gak dikenali formatnya, kirim apa adanya (biar kelihatan salah di importInfo)
    return teks
  }

  const keFormatJam = (nilai) => {
    if (!nilai) return null
    if (nilai instanceof Date) {
      const h = String(nilai.getHours()).padStart(2, '0')
      const m = String(nilai.getMinutes()).padStart(2, '0')
      return `${h}:${m}`
    }
    return String(nilai).trim()
  }

  const handleUploadAbsensi = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImporting(true)
    setImportInfo(null)

    const reader = new FileReader()

    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, {
          type: 'array',
          cellDates: true,
        })
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

        // Kolom yang didukung: NIP, Tanggal, Jam Masuk, Jam Pulang, Status Penugasan, Status
        const dataSiapKirim = rows.map((baris) => {
          const cari = (kunciList) => {
            for (const key of Object.keys(baris)) {
              const bersih = key
                .trim()
                .toLowerCase()
                .replace(/[\s_]/g, '')
              if (kunciList.includes(bersih)) return baris[key]
            }
            return undefined
          }

          return {
            nip: String(cari(['nip']) ?? '').trim(),
            tanggal: keFormatTanggalISO(cari(['tanggal'])),
            jam_masuk: keFormatJam(
              cari(['jammasuk', 'masuk'])
            ),
            jam_pulang: keFormatJam(
              cari(['jampulang', 'pulang'])
            ),
            status_penugasan:
              String(
                cari(['statuspenugasan', 'penugasan']) ?? ''
              ).trim() || null,
            status:
              String(
                cari(['status', 'statuspresensi', 'presensi']) ?? ''
              ).trim() || 'Hadir',
          }
        })

        fetch(`${API_URL}/absensi/import`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: dataSiapKirim }),
        })
          .then((res) => res.json())
          .then((res) => {
            if (res.success) {
              setImportInfo({
                type: 'success',
                text:
                  `Import selesai — ${res.ditambah} data baru ditambahkan, ${res.diupdate} data diperbarui` +
                  (res.dilewati > 0
                    ? `, ${res.dilewati} baris dilewati (NIP tidak ditemukan atau tanggal kosong).`
                    : '.'),
              })
              ambilAbsensi()
              ambilAlpaBerturut()
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

  // Non-admin (pegawai) cuma boleh liat baris miliknya sendiri (dicocokkan lewat NIP)
  const dataUntukSaya = isAdmin
    ? data
    : data.filter((d) => d.nip === user.nip)

  const dataFiltered = dataUntukSaya.filter((d) => {
    const tanggal = new Date(`${d.tanggal}T00:00:00`)

    const tahun = String(tanggal.getFullYear())

    const bulan = String(
      tanggal.getMonth() + 1
    ).padStart(2, '0')

    const cocokTahun =
      filterTahun === 'semua' ||
      tahun === filterTahun

    const cocokBulan =
      filterBulan === 'semua' ||
      bulan === filterBulan

    const cocokNama = (d.nama || '')
      .toLowerCase()
      .includes(search.toLowerCase())

    return (
      cocokTahun &&
      cocokBulan &&
      cocokNama
    )
  })

  const totalAman = dataFiltered.filter((d) =>
    STATUS_PRESENSI_AMAN.includes(d.status)
  ).length

  const totalBermasalah = dataFiltered.filter(
    (d) => !STATUS_PRESENSI_AMAN.includes(d.status)
  ).length

  const totalAlpa = dataFiltered.filter(
    (d) => d.status === 'Tanpa Keterangan'
  ).length

  const formKosong = {
    pegawai_id: '',
    tanggal: '',
    jam_masuk: '',
    jam_pulang: '',
    status_penugasan: '',
    status: 'Hadir',
  }

  const simpanData = (e) => {
    e.preventDefault()

    if (!form.pegawai_id) {
      alert('Pilih pegawai terlebih dahulu.')
      return
    }

    const isEdit = editId !== null

    const url = isEdit
      ? `${API_URL}/absensi/${editId}`
      : `${API_URL}/absensi`

    const method = isEdit ? 'PUT' : 'POST'

    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          alert(
            res.message ||
              `Gagal ${isEdit ? 'memperbarui' : 'menyimpan'} data absensi.`
          )

          return
        }

        ambilAbsensi()
        ambilAlpaBerturut()

        setForm(formKosong)
        setEditId(null)
        setShowForm(false)
      })
      .catch(() =>
        alert(
          `Gagal ${isEdit ? 'memperbarui' : 'menyimpan'} data absensi.`
        )
      )
  }

  const mulaiEdit = (absensi) => {
    setForm({
      pegawai_id: String(absensi.pegawai_id),
      tanggal: absensi.tanggal,
      jam_masuk: absensi.jam_masuk || '',
      jam_pulang: absensi.jam_pulang || '',
      status_penugasan: absensi.status_penugasan || '',
      status: absensi.status,
    })
    setEditId(absensi.id)
    setShowForm(true)
  }

  const batalEdit = () => {
    setForm(formKosong)
    setEditId(null)
    setShowForm(false)
  }

  const hapusData = (id) => {
    if (
      !window.confirm(
        'Yakin ingin menghapus data absensi ini?'
      )
    ) {
      return
    }

    fetch(`${API_URL}/absensi/${id}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then(() => {
        ambilAbsensi()
        ambilAlpaBerturut()
      })
      .catch(() =>
        alert('Gagal menghapus data absensi.')
      )
  }

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-title">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={22} /> Data Absensi
        </h1>

        <p>
          {isAdmin
            ? 'Kelola data kehadiran pegawai.'
            : 'Riwayat kehadiran Anda.'}
        </p>
      </div>

      {!isAdmin && (
        <div className="guest-note">
          🔒 Data bersifat pribadi — hanya Anda yang dapat melihat riwayat absensi ini.
        </div>
      )}

      {/* STATISTIK */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon"><Users size={20} /></div>

          <div className="stat-info">
            <h4>Total Data</h4>

            <div className="stat-value">
              {dataFiltered.length}
            </div>

            <div className="stat-desc">
              Data absensi
            </div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon"><CheckCircle2 size={20} /></div>

          <div className="stat-info">
            <h4>Presensi Aman</h4>

            <div className="stat-value">
              {totalAman}
            </div>

            <div className="stat-desc">
              Hadir Normal / Cuti Tahunan / ST
            </div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon"><FileText size={20} /></div>

          <div className="stat-info">
            <h4>Bermasalah</h4>

            <div className="stat-value">
              {totalBermasalah}
            </div>

            <div className="stat-desc">
              Perlu ditindaklanjuti (WA)
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><AlertTriangle size={20} /></div>

          <div className="stat-info">
            <h4>Tanpa Keterangan</h4>

            <div className="stat-value">
              {totalAlpa}
            </div>

            <div className="stat-desc">
              Tidak hadir tanpa keterangan
            </div>
          </div>
        </div>

      </div>

      {/* IMPORT EXCEL — admin saja */}
      {isAdmin && (
        <div className="card">

          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Upload size={18} /> Import Data Absensi
          </h3>

          <div className="form-row">

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUploadAbsensi}
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

      {/* PEGAWAI ALPA / PERLU DIHUBUNGI — admin saja */}
      {isAdmin && alpaList.length > 0 && (
        <div className="card">

          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageCircle size={18} /> Pegawai Perlu Dihubungi
          </h3>

          <div className="table-wrap">

            <table className="table">

              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Pegawai</th>
                  <th>NIP</th>
                  <th>Tanggal & Status Bermasalah</th>
                  <th>No. WA</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>

                {alpaList
                  .slice(alpaPage * 10, alpaPage * 10 + 10)
                  .map((item, index) => (
                  <tr
                    key={item.pegawai_id}
                    style={
                      item.tiga_hari_berturut
                        ? {
                            backgroundColor: '#fff7ed',
                            borderLeft: '4px solid #f97316',
                          }
                        : undefined
                    }
                  >

                    <td>
                      {alpaPage * 10 + index + 1}
                    </td>

                    <td>
                      {item.nama}

                      {item.tiga_hari_berturut && (
                        <span
                          className="badge red"
                          style={{
                            marginLeft: '8px',
                            fontSize: '10px',
                          }}
                        >
                          3 Hari Berturut
                        </span>
                      )}
                    </td>

                    <td>
                      {item.nip}
                    </td>

                    <td>
                      {(item.detail_alpa || []).map((d, i) => (
                        <div
                          key={i}
                          style={{
                            whiteSpace: 'nowrap',
                            marginBottom:
                              i < item.detail_alpa.length - 1
                                ? '4px'
                                : 0,
                          }}
                        >
                          {formatTanggal(d.tanggal)}
                          {' — '}
                          <span
                            style={{
                              fontWeight: 600,
                              color:
                                d.status === 'Tanpa Keterangan'
                                  ? '#dc2626'
                                  : '#b45309',
                            }}
                          >
                            {d.status}
                          </span>
                        </div>
                      ))}
                    </td>

                    <td>
                      {item.no_hp}
                    </td>

                    <td>
                      <a
                        href={item.wa_link}
                        target="_blank"
                        rel="noreferrer"
                        className="btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <MessageCircle size={14} /> Kirim WA
                      </a>
                    </td>

                  </tr>
                ))}

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
              onClick={() =>
                setAlpaPage((prev) => Math.max(0, prev - 1))
              }
              disabled={alpaPage === 0}
              className="btn"
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#fff',
                cursor: alpaPage === 0 ? 'not-allowed' : 'pointer',
                opacity: alpaPage === 0 ? 0.5 : 1,
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              Back
            </button>

            <span
              style={{
                fontSize: '11px',
                fontWeight: '500',
                color: '#64748b',
              }}
            >
              {alpaPage + 1} /{' '}
              {Math.max(1, Math.ceil(alpaList.length / 10))}
            </span>

            <button
              onClick={() =>
                setAlpaPage((prev) =>
                  (prev + 1) * 10 < alpaList.length ? prev + 1 : prev
                )
              }
              disabled={(alpaPage + 1) * 10 >= alpaList.length}
              className="btn"
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#fff',
                cursor:
                  (alpaPage + 1) * 10 >= alpaList.length
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  (alpaPage + 1) * 10 >= alpaList.length ? 0.5 : 1,
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              Next
            </button>

          </div>

        </div>
      )}

      {/* TAMBAH DATA — admin saja */}
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
                  ? (<><Pencil size={18} /> Edit Data Absensi</>)
                  : (<><Plus size={18} /> Tambah Data Absensi</>)}
              </h3>

              <p
                style={{
                  margin: '5px 0 0',
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                Isi data kehadiran pegawai untuk tanggal tertentu.
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
                <><Plus size={16} /> Tambah Data Absensi</>
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

              <select
                required
                value={form.pegawai_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pegawai_id: e.target.value,
                  })
                }
              >
                <option value="">
                  Pilih Pegawai
                </option>

                {pegawaiList.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                  >
                    {p.nama}
                  </option>
                ))}
              </select>

              <input
                type="date"
                required
                value={form.tanggal}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tanggal: e.target.value,
                  })
                }
              />

              <input
                type="time"
                value={form.jam_masuk}
                onChange={(e) =>
                  setForm({
                    ...form,
                    jam_masuk: e.target.value,
                  })
                }
              />

              <input
                type="time"
                value={form.jam_pulang}
                onChange={(e) =>
                  setForm({
                    ...form,
                    jam_pulang: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Status Penugasan (opsional)"
                value={form.status_penugasan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status_penugasan: e.target.value,
                  })
                }
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >

                <option value="Hadir">
                  Hadir
                </option>

                <option value="Izin">
                  Izin
                </option>

                <option value="Sakit">
                  Sakit
                </option>

                <option value="Tanpa Keterangan">
                  Tanpa Keterangan (Alpa)
                </option>

              </select>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  className="btn"
                >
                  {editId !== null ? 'Simpan Perubahan' : 'Simpan'}
                </button>

                {editId !== null && (
                  <button
                    type="button"
                    onClick={batalEdit}
                    className="btn"
                    style={{
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

      {/* DAFTAR ABSENSI */}
      <div className="card">

        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={18} />{' '}
          {isAdmin ? 'Daftar Absensi' : 'Riwayat Absensi Saya'}
        </h3>

        <div className="filter-row">

          {isAdmin && (
            <input
              type="text"
              placeholder="Cari nama pegawai..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          )}

          <select
            value={filterTahun}
            onChange={(e) =>
              setFilterTahun(e.target.value)
            }
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

          <select
            value={filterBulan}
            onChange={(e) =>
              setFilterBulan(e.target.value)
            }
          >

            <option value="semua">
              Semua Bulan
            </option>

            {daftarBulan.map((b, index) => (
              <option
                key={b}
                value={String(index + 1).padStart(
                  2,
                  '0'
                )}
              >
                {b}
              </option>
            ))}

          </select>

        </div>

        <div className="filter-info">
          Menampilkan {dataFiltered.length} dari{' '}
          {dataUntukSaya.length} data
        </div>

        <div className="table-wrap">

          <table className="table">

            <thead>

              <tr>
                <th>No</th>
                <th>Nama Pegawai</th>
                <th>Tanggal</th>
                <th>Jam Masuk</th>
                <th>Jam Pulang</th>
                <th>Penugasan</th>
                <th>Status</th>
                {isAdmin && <th>Aksi</th>}
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={isAdmin ? 8 : 7}
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
                      {dataPaginated.length > 0 ? (

                        dataPaginated.map(
                          (d, index) => {

                            const st =
                              statusAbsensi(
                                d.status
                              )

                            return (
                              <tr key={d.id}>

                                <td>
                                  {startIndex +
                                    index +
                                    1}
                                </td>

                                <td>
                                  <div className="cell-main">
                                    {d.nama}
                                  </div>
                                </td>

                                <td>
                                  {formatTanggal(
                                    d.tanggal
                                  )}
                                </td>

                                <td>
                                  {d.jam_masuk ||
                                    '-'}
                                </td>

                                <td>
                                  {d.jam_pulang ||
                                    '-'}
                                </td>

                                <td>
                                  {d.status_penugasan ||
                                    '-'}
                                </td>

                                <td>
                                  <span
                                    className={`badge ${st.cls}`}
                                  >
                                    {st.label}
                                  </span>
                                </td>

                                {isAdmin && (
                                  <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                      <button
                                        type="button"
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
                                        onClick={() =>
                                          mulaiEdit(d)
                                        }
                                      >
                                        <Pencil size={14} color="#0b72e7" />
                                      </button>
                                      <button
                                        type="button"
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
                                        onClick={() =>
                                          hapusData(
                                            d.id
                                          )
                                        }
                                      >
                                        <Trash2 size={14} color="#dc2626" />
                                      </button>
                                    </div>
                                  </td>
                                )}

                              </tr>
                            )
                          }
                        )

                      ) : (

                        <tr>

                          <td
                            colSpan={isAdmin ? 8 : 7}
                            style={{
                              textAlign:
                                'center',
                              padding:
                                '30px',
                            }}
                          >
                            Tidak ada data absensi.
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
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border:
                    '1px solid #cbd5e1',
                  backgroundColor: '#fff',
                  cursor:
                    currentPage === 0
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    currentPage === 0
                      ? 0.5
                      : 1,
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                Back
              </button>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  color: '#64748b',
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
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border:
                    '1px solid #cbd5e1',
                  backgroundColor: '#fff',
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
                  fontSize: '11px',
                  fontWeight: 600,
                }}
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

export default DataAbsensi