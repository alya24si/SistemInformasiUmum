import { useEffect, useState } from 'react'

const API_URL = 'http://127.0.0.1:8000/api'

const statusPegawai = (status) => {
  if (status === 'Aktif') {
    return {
      label: 'Aktif',
      className: 'bg-green-100 text-green-700',
    }
  }

  if (status === 'Cuti') {
    return {
      label: 'Cuti',
      className: 'bg-yellow-100 text-yellow-700',
    }
  }

  return {
    label: 'Tidak Aktif',
    className: 'bg-red-100 text-red-700',
  }
}

function DataPegawai() {
  // Halaman Data Pegawai khusus untuk admin
  const isAdmin = true

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterBagian, setFilterBagian] = useState('semua')
  const [filterStatus, setFilterStatus] = useState('semua')
  const [currentPage, setCurrentPage] = useState(0)

  const [form, setForm] = useState({
    nip: '',
    nama: '',
    jabatan: '',
    bagian: '',
    no_hp: '',
    email: '',
    status: 'Aktif',
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
        alert('Gagal mengambil data pegawai. Pastikan backend (php artisan serve) sudah menyala.')
        setLoading(false)
      })
  }

  useEffect(() => {
    ambilData()
  }, [])

  const dataFiltered = data.filter((pegawai) => {
    const cocokSearch =
      pegawai.nama.toLowerCase().includes(search.toLowerCase()) ||
      pegawai.nip.toLowerCase().includes(search.toLowerCase())

    const cocokBagian =
      filterBagian === 'semua' ||
      pegawai.bagian === filterBagian

    const cocokStatus =
      filterStatus === 'semua' ||
      pegawai.status === filterStatus

    return cocokSearch && cocokBagian && cocokStatus
  })

  const totalPegawai = data.length

  const totalAktif = data.filter(
    (pegawai) => pegawai.status === 'Aktif'
  ).length

  const totalCuti = data.filter(
    (pegawai) => pegawai.status === 'Cuti'
  ).length

  const totalTidakAktif = data.filter(
    (pegawai) => pegawai.status === 'Tidak Aktif'
  ).length

  const tambahData = (e) => {
    e.preventDefault()

    fetch(`${API_URL}/pegawai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          alert(res.message || 'Gagal menyimpan data pegawai.')
          return
        }

        ambilData()

        setForm({
          nip: '',
          nama: '',
          jabatan: '',
          bagian: '',
          no_hp: '',
          email: '',
          status: 'Aktif',
        })
      })
      .catch(() => alert('Gagal menyimpan data pegawai.'))
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

  const handleUploadPegawai = () => {
    alert(
      'File Excel akan dikirim ke backend untuk diproses dan disimpan ke MySQL nanti.'
    )
  }

  return (
    <div className="page">

      <div className="page-title">
        <h1>👥 Data Pegawai</h1>

        <p>
          Mengelola dan memantau data pegawai pada bagian
          kepegawaian.
        </p>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">👥</div>

          <div className="stat-info">
            <h4>Total Pegawai</h4>
            <div className="stat-value">{totalPegawai}</div>
            <div className="stat-desc">Seluruh pegawai</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">✅</div>

          <div className="stat-info">
            <h4>Pegawai Aktif</h4>
            <div className="stat-value">{totalAktif}</div>
            <div className="stat-desc">Pegawai aktif</div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon">📝</div>

          <div className="stat-info">
            <h4>Sedang Cuti</h4>
            <div className="stat-value">{totalCuti}</div>
            <div className="stat-desc">Pegawai cuti</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>

          <div className="stat-info">
            <h4>Tidak Aktif</h4>
            <div className="stat-value">{totalTidakAktif}</div>
            <div className="stat-desc">Pegawai tidak aktif</div>
          </div>
        </div>

      </div>

      {isAdmin && (
        <div className="card">
          <h3>📥 Import Data Pegawai</h3>

          <div className="form-row">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUploadPegawai}
            />
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="card">
          <h3>➕ Tambah Data Pegawai</h3>

          <form onSubmit={tambahData} className="form-row">
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
              <option value="Keuangan">Keuangan</option>
              <option value="Kepegawaian">Kepegawaian</option>
              <option value="Umum">Umum</option>
              <option value="Rumah Tangga">Rumah Tangga</option>
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

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
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
              <option value="Aktif">Aktif</option>
              <option value="Cuti">Cuti</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>

            <button type="submit" className="btn">
              Simpan Data Pegawai
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>🔎 Daftar Pegawai</h3>

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
            <option value="Keuangan">Keuangan</option>
            <option value="Kepegawaian">Kepegawaian</option>
            <option value="Umum">Umum</option>
            <option value="Rumah Tangga">Rumah Tangga</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value)
            }
          >
            <option value="semua">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Cuti">Cuti</option>
            <option value="Tidak Aktif">Tidak Aktif</option>
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
                <th>Jabatan</th>
                <th>Bagian</th>
                <th>No. HP</th>
                <th>Email</th>
                <th>Status</th>
                {isAdmin && <th>Aksi</th>}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8}>
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
                          const status = statusPegawai(pegawai.status)

                          return (
                            <tr key={pegawai.id}>
                              <td>{startIndex + index + 1}</td>
                              <td>{pegawai.nip}</td>
                              <td>{pegawai.nama}</td>
                              <td>{pegawai.jabatan}</td>
                              <td>{pegawai.bagian}</td>
                              <td>{pegawai.no_hp || '-'}</td>
                              <td>{pegawai.email || '-'}</td>
                              <td>
                                <span
                                  className={`badge ${status.className}`}
                                >
                                  {status.label}
                                </span>
                              </td>
                              {isAdmin && (
                                <td>
                                  <button
                                    type="button"
                                    onClick={() => hapusData(pegawai.id)}
                                    className="btn-danger"
                                  >
                                    🗑
                                  </button>
                                </td>
                              )}
                            </tr>
                          )
                        })
                      ) : (
                        <tr>
                          <td colSpan={isAdmin ? 9 : 8}>
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
                onClick={() => setCurrentPage(prev => (prev + 1 < totalPages ? prev + 1 : prev))}
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