import { useEffect, useState } from 'react'

const API = 'http://localhost:8000/api'
const STORAGE_URL = 'http://localhost:8000/storage'

function KerusakanRuangan({ user }) {
  const isAdmin =
    user.role === 'admin_rumahtangga' ||
    user.role === 'superadmin'

  const [laporan, setLaporan] = useState([])
  const [daftarRuangan, setDaftarRuangan] = useState([])

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    ruangan_id: '',
    kerusakan: '',
    deskripsi: '',
    bukti: null,
  })

  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  const muatData = async () => {
    setLoading(true)
    setErrorMsg('')

    try {
      const [resLaporan, resRuangan] = await Promise.all([
        fetch(API + '/kerusakan_ruangan'),
        fetch(API + '/ruangan'),
      ])

      const jsonLaporan = await resLaporan.json()
      const jsonRuangan = await resRuangan.json()

      setLaporan(jsonLaporan?.data || [])
      setDaftarRuangan(jsonRuangan?.data || [])
    } catch (err) {
      setErrorMsg('Gagal memuat data kerusakan ruangan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    muatData()
  }, [])

  const handleChange = (e) => {
    const { name, value, files } = e.target

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.bukti) {
      alert('Bukti gambar wajib dilampirkan.')
      return
    }

    const payload = new FormData()
    payload.append('ruangan_id', formData.ruangan_id)
    payload.append('pelapor', user.nama)
    payload.append('bagian', user.bidang)
    payload.append('kerusakan', formData.kerusakan)
    payload.append('deskripsi', formData.deskripsi)
    payload.append('bukti', formData.bukti)
    payload.append(
      'sumber',
      isAdmin ? 'Pemeriksaan Admin' : 'Laporan Pegawai'
    )
    payload.append(
      'status',
      isAdmin ? 'Diproses' : 'Menunggu'
    )

    setSubmitting(true)

    try {
      await fetch(API + '/kerusakan_ruangan', {
        method: 'POST',
        body: payload,
      })

      await muatData()

      setFormData({
        ruangan_id: '',
        kerusakan: '',
        deskripsi: '',
        bukti: null,
      })

      setShowForm(false)

      alert(
        isAdmin
          ? 'Data kerusakan berhasil ditambahkan.'
          : 'Laporan kerusakan berhasil dikirim.'
      )
    } catch (err) {
      alert('Gagal mengirim laporan kerusakan.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleProses = async (id) => {
    try {
      await fetch(API + '/kerusakan_ruangan/' + id + '/proses', {
        method: 'PUT',
      })
      await muatData()
    } catch (err) {
      alert('Gagal memproses laporan.')
    }
  }

  const handleSelesai = async (id) => {
    try {
      await fetch(API + '/kerusakan_ruangan/' + id + '/selesai', {
        method: 'PUT',
      })
      await muatData()
    } catch (err) {
      alert('Gagal menyelesaikan laporan.')
    }
  }

  const handleHapus = async (id) => {
    if (
      window.confirm(
        'Yakin ingin menghapus data kerusakan ini?'
      )
    ) {
      try {
        await fetch(API + '/kerusakan_ruangan/' + id, {
          method: 'DELETE',
        })
        await muatData()
      } catch (err) {
        alert('Gagal menghapus data.')
      }
    }
  }

  const laporanDitampilkan = isAdmin
    ? laporan
    : laporan.filter(
        (item) => item.pelapor === user.nama
      )

  const totalLaporan = laporanDitampilkan.length

  const totalMenunggu = laporanDitampilkan.filter(
    (item) => item.status === 'Menunggu'
  ).length

  const totalDiproses = laporanDitampilkan.filter(
    (item) => item.status === 'Diproses'
  ).length

  const totalSelesai = laporanDitampilkan.filter(
    (item) => item.status === 'Selesai'
  ).length

  const getStatusClass = (status) => {
    if (status === 'Selesai') return 'green'
    if (status === 'Diproses') return 'blue'
    return 'yellow'
  }

  const formatTanggal = (tanggal) => {
    return new Date(
      `${tanggal}T00:00:00`
    ).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const ITEMS_PER_PAGE = 10

  const totalPages = Math.ceil(
    laporanDitampilkan.length / ITEMS_PER_PAGE
  )

  const startIndex = currentPage * ITEMS_PER_PAGE

  const dataPaginated = laporanDitampilkan.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-title">
        <h1>🛠️ Kerusakan Ruangan</h1>
        <p>
          Laporkan kerusakan fasilitas ruangan dan pantau
          proses penanganannya.
        </p>
      </div>

      {/* MODE USER */}
      {!isAdmin && (
        <div className="guest-note">
          👁️ Mode tamu: Anda dapat melaporkan kerusakan
          dan melihat laporan kerusakan Anda sendiri.
        </div>
      )}

      {/* ERROR */}
      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '16px',
            borderRadius: '8px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            fontSize: '13px',
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '16px',
            borderRadius: '8px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
            fontSize: '13px',
          }}
        >
          Memuat data kerusakan ruangan...
        </div>
      )}

      {/* SUMMARY */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">📋</div>

          <div className="stat-info">
            <h4>Total Laporan</h4>

            <div className="stat-value">
              {totalLaporan}
            </div>

            <div className="stat-desc">
              {isAdmin
                ? 'Seluruh laporan kerusakan'
                : 'Laporan kerusakan Anda'}
            </div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon">⏳</div>

          <div className="stat-info">
            <h4>Menunggu</h4>

            <div className="stat-value">
              {totalMenunggu}
            </div>

            <div className="stat-desc">
              Menunggu diproses
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔧</div>

          <div className="stat-info">
            <h4>Diproses</h4>

            <div className="stat-value">
              {totalDiproses}
            </div>

            <div className="stat-desc">
              Sedang ditindaklanjuti
            </div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">✅</div>

          <div className="stat-info">
            <h4>Selesai</h4>

            <div className="stat-value">
              {totalSelesai}
            </div>

            <div className="stat-desc">
              Kerusakan telah selesai
            </div>
          </div>
        </div>

      </div>

      {/* FORM TAMBAH KERUSAKAN */}
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
            <h3>
              {isAdmin
                ? '➕ Tambah Data Kerusakan'
                : '➕ Lapor Kerusakan'}
            </h3>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b',
                fontSize: '13px',
              }}
            >
              {isAdmin
                ? 'Tambahkan data kerusakan fasilitas ruangan.'
                : 'Laporkan kerusakan fasilitas dengan melampirkan bukti gambar.'}
            </p>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm
              ? 'Tutup'
              : '+ Tambah Kerusakan'}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #e2e8f0',
            }}
          >

            {/* INFORMASI OTOMATIS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr 1fr',
                gap: '14px',
                marginBottom: '16px',
              }}
            >

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                  }}
                >
                  Pelapor
                </label>

                <input
                  type="text"
                  value={user.nama}
                  disabled
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    fontSize: '12px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                  }}
                >
                  Bagian
                </label>

                <input
                  type="text"
                  value={user.bidang}
                  disabled
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    fontSize: '12px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                  }}
                >
                  Tanggal
                </label>

                <input
                  type="text"
                  value={formatTanggal(
                    new Date()
                      .toISOString()
                      .split('T')[0]
                  )}
                  disabled
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    fontSize: '12px',
                  }}
                />
              </div>

            </div>

            {/* DATA KERUSAKAN */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                marginBottom: '16px',
              }}
            >

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                  }}
                >
                  Ruangan
                </label>

                <select
                  name="ruangan_id"
                  value={formData.ruangan_id}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    color: '#334155',
                    fontSize: '12px',
                  }}
                >
                  <option value="">
                    -- Pilih Ruangan --
                  </option>

                  {daftarRuangan.map(
                    (ruangan) => (
                      <option
                        key={ruangan.id}
                        value={ruangan.id}
                      >
                        {ruangan.nama}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                  }}
                >
                  Jenis Kerusakan
                </label>

                <input
                  type="text"
                  name="kerusakan"
                  placeholder="Contoh: AC tidak dingin"
                  value={formData.kerusakan}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    color: '#334155',
                    fontSize: '12px',
                  }}
                />
              </div>

            </div>

            {/* DESKRIPSI */}
            <div
              style={{
                marginBottom: '16px',
              }}
            >

              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                Deskripsi Kerusakan
              </label>

              <textarea
                name="deskripsi"
                placeholder="Jelaskan kondisi atau kerusakan yang terjadi..."
                value={formData.deskripsi}
                onChange={handleChange}
                required
                rows="4"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 11px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  color: '#334155',
                  fontSize: '12px',
                  resize: 'vertical',
                }}
              />

            </div>

            {/* BUKTI */}
            <div
              style={{
                marginBottom: '18px',
              }}
            >

              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                Bukti Gambar
              </label>

              <input
                type="file"
                name="bukti"
                accept="image/*"
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  color: '#475569',
                  fontSize: '12px',
                }}
              />

              <div
                style={{
                  marginTop: '5px',
                  fontSize: '11px',
                  color: '#94a3b8',
                }}
              >
                Wajib melampirkan gambar sebagai bukti
                kerusakan.
              </div>

            </div>

            {/* DATA OTOMATIS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '14px',
                marginBottom: '20px',
              }}
            >

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                  }}
                >
                  Sumber
                </label>

                <input
                  type="text"
                  value={
                    isAdmin
                      ? 'Pemeriksaan Admin'
                      : 'Laporan Pegawai'
                  }
                  disabled
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    fontSize: '12px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                  }}
                >
                  Status
                </label>

                <input
                  type="text"
                  value={
                    isAdmin
                      ? 'Diproses'
                      : 'Menunggu'
                  }
                  disabled
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#f8fafc',
                    color: '#64748b',
                    fontSize: '12px',
                  }}
                />
              </div>

            </div>

            {/* BUTTON */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '16px',
              }}
            >

              {/* BATAL */}
              <button
                type="button"
                className="btn"
                onClick={() => setShowForm(false)}
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #cbd5e1',
                }}
              >
                Batal
              </button>

              {/* SIMPAN */}
              <button
                type="submit"
                className="btn"
                disabled={submitting}
              >
                {submitting
                  ? 'Mengirim...'
                  : 'Simpan Laporan'}
              </button>

            </div>

          </form>
        )}

      </div>

      {/* TABLE */}
      <div className="card">

        <h3>📋 Daftar Kerusakan Ruangan</h3>

        <div className="filter-info">
          Menampilkan {laporanDitampilkan.length} laporan
        </div>

        <div className="table-wrap">

          <table className="table">

            <thead>
              <tr>
                <th>Ruangan</th>
                <th>Pelapor</th>
                <th>Bagian</th>
                <th>Tanggal</th>
                <th>Kerusakan</th>
                <th>Deskripsi</th>
                <th>Bukti</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>

              {dataPaginated.length > 0 ? (
                dataPaginated.map((item) => {

                  const statusClass =
                    getStatusClass(item.status)

                  return (
                    <tr key={item.id}>

                      <td>{item.ruangan}</td>

                      <td>{item.pelapor}</td>

                      <td>{item.bagian}</td>

                      <td>
                        {formatTanggal(
                          item.tanggal
                        )}
                      </td>

                      <td>{item.kerusakan}</td>

                      <td>{item.deskripsi}</td>

                      <td>
                        {item.bukti ? (
                          <a
                            href={`${STORAGE_URL}/${item.bukti}`}
                            target="_blank"
                            rel="noreferrer"
                            className="badge blue"
                            style={{
                              textDecoration: 'none',
                            }}
                          >
                            📷 Lihat
                          </a>
                        ) : (
                          <span className="badge yellow">
                            Tidak ada
                          </span>
                        )}
                      </td>

                      <td>
                        <span
                          className={`badge ${statusClass}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        {isAdmin && (
                          <div
                            style={{
                              display: 'flex',
                              gap: '5px',
                              alignItems: 'center',
                            }}
                          >

                            {item.status ===
                              'Menunggu' && (
                              <button
                                className="btn"
                                onClick={() =>
                                  handleProses(
                                    item.id
                                  )
                                }
                              >
                                Proses
                              </button>
                            )}

                            {item.status ===
                              'Diproses' && (
                              <button
                                className="btn"
                                onClick={() =>
                                  handleSelesai(
                                    item.id
                                  )
                                }
                              >
                                Selesai
                              </button>
                            )}

                            <button
                              className="btn-danger"
                              onClick={() =>
                                handleHapus(item.id)
                              }
                            >
                              🗑
                            </button>

                          </div>
                        )}
                      </td>

                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    style={{
                      textAlign: 'center',
                      padding: '30px',
                    }}
                  >
                    Belum ada laporan kerusakan.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}
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
              setCurrentPage((prev) =>
                Math.max(0, prev - 1)
              )
            }
            disabled={currentPage === 0}
            className="btn"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              cursor:
                currentPage === 0
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                currentPage === 0 ? 0.5 : 1,
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
            {Math.max(1, totalPages)}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                prev + 1 < totalPages
                  ? prev + 1
                  : prev
              )
            }
            disabled={
              currentPage + 1 >= totalPages
            }
            className="btn"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#fff',
              cursor:
                currentPage + 1 >= totalPages
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                currentPage + 1 >= totalPages
                  ? 0.5
                  : 1,
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

export default KerusakanRuangan