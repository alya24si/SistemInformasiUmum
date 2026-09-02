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
} from 'lucide-react'

const API_URL = 'http://127.0.0.1:8000/api'

function DataPegawai() {
  const isAdmin = true

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterBagian, setFilterBagian] = useState('semua')
  const [currentPage, setCurrentPage] = useState(0)
  const [editId, setEditId] = useState(null)

  const [form, setForm] = useState({
    nip: '',
    nama: '',
    pangkat: '',
    jabatan: '',
    eselon_iii: '',
    bagian: '',
    no_hp: '',
  })

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

    const cocokBagian =
      filterBagian === 'semua' ||
      cocokkanBagian(pegawai.bagian, filterBagian)

    return cocokSearch && cocokBagian
  })

  const totalPegawai = data.length

  const totalBagianUmum = data.filter((pegawai) =>
    cocokkanBagian(pegawai.bagian, 'Bagian Umum')
  ).length

  const totalPenindakan = data.filter((pegawai) =>
    cocokkanBagian(pegawai.bagian, 'Bidang Penindakan dan Penyidikan')
  ).length

  const totalKepabeanan = data.filter((pegawai) =>
    cocokkanBagian(pegawai.bagian, 'Bidang Kepabeanan dan Cukai')
  ).length

  const totalKepatuhan = data.filter((pegawai) =>
    cocokkanBagian(pegawai.bagian, 'Bidang Kepatuhan Internal')
  ).length

  const totalFasilitas = data.filter((pegawai) =>
    cocokkanBagian(pegawai.bagian, 'Bidang Fasilitas Kepabeanan dan Cukai')
  ).length

  const formKosong = {
    nip: '',
    nama: '',
    pangkat: '',
    jabatan: '',
    eselon_iii: '',
    bagian: '',
    no_hp: '',
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

        // Kolom yang didukung: NIP, Nama, Pangkat, Jabatan, Eselon III, Bagian, No HP
        // Catatan: kalau file Excel gak punya kolom "Bagian" tersendiri (kayak file
        // Kanwil), kolom "Eselon III" dipakai juga sebagai sumber Bagian — karena di
        // data aslinya kolom itu isinya nama unit kerja (Bagian Umum / Bidang ...),
        // bukan kode eselon.
        const dataSiapKirim = rows.map((baris) => {
          const cari = (kunciList) => {
            for (const key of Object.keys(baris)) {
              const bersih = key.trim().toLowerCase().replace(/[\s_]/g, '')
              if (kunciList.includes(bersih)) return baris[key]
            }
            return undefined
          }

          const eselonIii = String(cari(['eseloniii', 'eselon3', 'eselon']) ?? '').trim()
          const bagianEksplisit = String(cari(['bagian']) ?? '').trim()

          return {
            nip: String(cari(['nip']) ?? '').trim(),
            nama: String(cari(['nama']) ?? '').trim(),
            pangkat: String(cari(['pangkat']) ?? '').trim() || null,
            jabatan: String(cari(['jabatan']) ?? '').trim(),
            eselon_iii: eselonIii || null,
            bagian: bagianEksplisit || eselonIii,
            no_hp: String(cari(['nohp', 'hp', 'notelepon', 'telepon']) ?? '').trim(),
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
            <h4>Total Pegawai</h4>
            <div className="stat-value">{totalPegawai}</div>
            <div className="stat-desc">Seluruh pegawai</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon"><CheckCircle2 size={20} /></div>

          <div className="stat-info">
            <h4>Bagian Umum</h4>
            <div className="stat-value">{totalBagianUmum}</div>
            <div className="stat-desc">Bagian Umum</div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon"><Clock size={20} /></div>

          <div className="stat-info">
            <h4>Penindakan</h4>
            <div className="stat-value">{totalPenindakan}</div>
            <div className="stat-desc">Bidang Penindakan dan Penyidikan</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><AlertTriangle size={20} /></div>

          <div className="stat-info">
            <h4>Kepabeanan</h4>
            <div className="stat-value">{totalKepabeanan}</div>
            <div className="stat-desc">Bidang Kepabeanan dan Cukai</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><AlertTriangle size={20} /></div>

          <div className="stat-info">
            <h4>Kepatuhan Internal</h4>
            <div className="stat-value">{totalKepatuhan}</div>
            <div className="stat-desc">Bidang Kepatuhan Internal</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><AlertTriangle size={20} /></div>

          <div className="stat-info">
            <h4>Fasilitas</h4>
            <div className="stat-value">{totalFasilitas}</div>
            <div className="stat-desc">Bidang Fasilitas Kepabeanan dan Cukai</div>
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

            <input
              type="text"
              placeholder="Eselon III"
              value={form.eselon_iii}
              onChange={(e) =>
                setForm({
                  ...form,
                  eselon_iii: e.target.value,
                })
              }
            />

            <select
              required
              value={form.bagian}
              onChange={(e) =>
                setForm({
                  ...form,
                  bagian: e.target.value,
                })
              }
            >
              <option value="">Pilih Bagian</option>
              <option value="Bagian Umum">Bagian Umum</option>
              <option value="Bidang Penindakan dan Penyidikan">Bidang Penindakan dan Penyidikan</option>
              <option value="Bidang Kepabeanan dan Cukai">Bidang Kepabeanan dan Cukai</option>
              <option value="Bidang Kepatuhan Internal">Bidang Kepatuhan Internal</option>
              <option value="Bidang Fasilitas Kepabeanan dan Cukai">Bidang Fasilitas Kepabeanan dan Cukai</option>
            </select>

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

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" className="btn">
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
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={18} /> Daftar Pegawai
        </h3>

        <div className="filter-row">
          <input
            type="text"
            placeholder="Cari nama atau NIP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filterBagian}
            onChange={(e) =>
              setFilterBagian(e.target.value)
            }
          >
            <option value="semua">Semua Bagian</option>
            <option value="Bagian Umum">Bagian Umum</option>
            <option value="Bidang Penindakan dan Penyidikan">Bidang Penindakan dan Penyidikan</option>
            <option value="Bidang Kepabeanan dan Cukai">Bidang Kepabeanan dan Cukai</option>
            <option value="Bidang Kepatuhan Internal">Bidang Kepatuhan Internal</option>
            <option value="Bidang Fasilitas Kepabeanan dan Cukai">Bidang Fasilitas Kepabeanan dan Cukai</option>
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
                <th>Eselon III</th>
                <th>Bagian</th>
                <th>No. HP</th>
                {isAdmin && <th>Aksi</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 9 : 8}
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
                              <td>{pegawai.eselon_iii || '-'}</td>
                              <td>{pegawai.bagian}</td>
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
                            colSpan={isAdmin ? 9 : 8}
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