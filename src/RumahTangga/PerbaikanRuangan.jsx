import { useEffect, useState } from 'react'

const API = 'http://localhost:8000/api'

function PerbaikanRuangan({ user }) {
  const isAdmin =
    user.role === 'admin_rumahtangga' ||
    user.role === 'superadmin'

  const [kerusakanBelumDiperbaiki, setKerusakanBelumDiperbaiki] =
    useState([])

  const [perbaikan, setPerbaikan] = useState([])

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    kerusakanId: '',
    jenisPerbaikan: '',
    penanggungJawab: '',
    tanggalMulai: '',
    status: 'Diproses',
  })

  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  // =========================
  // LOAD DATA
  // =========================

  const muatData = async () => {
    setLoading(true)
    setErrorMsg('')

    try {
      const [
        resPerbaikan,
        resBelum,
      ] = await Promise.all([
        fetch(API + '/perbaikan_ruangan'),
        fetch(API + '/perbaikan_ruangan/belum_diperbaiki'),
      ])

      const jsonPerbaikan = await resPerbaikan.json()
      const jsonBelum = await resBelum.json()

      setPerbaikan(
        (jsonPerbaikan?.data || []).map((d) => ({
          id: d.id,
          kerusakanId: d.kerusakan_id,
          ruangan: d.ruangan,
          kerusakan: d.kerusakan,
          jenisPerbaikan: d.jenis_perbaikan,
          penanggungJawab: d.penanggung_jawab,
          tanggalMulai: d.tanggal_mulai,
          status: d.status,
        }))
      )

      setKerusakanBelumDiperbaiki(
        jsonBelum?.data || []
      )
    } catch (err) {
      setErrorMsg(
        'Gagal memuat data perbaikan ruangan.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    muatData()
  }, [])

  // =========================
  // FORM
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleKerusakanChange = (e) => {
    setFormData({
      ...formData,
      kerusakanId: e.target.value,
    })
  }

  const resetForm = () => {
    setFormData({
      kerusakanId: '',
      jenisPerbaikan: '',
      penanggungJawab: '',
      tanggalMulai: '',
      status: 'Diproses',
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.kerusakanId) {
      alert('Pilih data kerusakan.')
      return
    }

    setSubmitting(true)

    try {
      await fetch(API + '/perbaikan_ruangan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kerusakan_id: formData.kerusakanId,
          jenis_perbaikan: formData.jenisPerbaikan,
          penanggung_jawab: formData.penanggungJawab,
          tanggal_mulai: formData.tanggalMulai,
          status: formData.status,
        }),
      })

      await muatData()

      resetForm()
      setShowForm(false)

      alert(
        'Data perbaikan berhasil ditambahkan.'
      )
    } catch (err) {
      alert(
        'Gagal menyimpan data perbaikan.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // =========================
  // AKSI ADMIN
  // =========================

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Hapus data perbaikan ini?'
      )
    ) {
      return
    }

    try {
      await fetch(
        API + '/perbaikan_ruangan/' + id,
        {
          method: 'DELETE',
        }
      )

      await muatData()
    } catch (err) {
      alert(
        'Gagal menghapus data perbaikan.'
      )
    }
  }

  const handleSelesai = async (id) => {
    if (
      !window.confirm(
        'Tandai perbaikan ini selesai?'
      )
    ) {
      return
    }

    try {
      await fetch(
        API +
          '/perbaikan_ruangan/' +
          id +
          '/selesai',
        {
          method: 'PUT',
        }
      )

      await muatData()
    } catch (err) {
      alert(
        'Gagal menandai perbaikan selesai.'
      )
    }
  }

  // =========================
  // STATUS
  // =========================

  const getStatusClass = (status) => {
    if (status === 'Selesai') {
      return 'green'
    }

    if (status === 'Diproses') {
      return 'blue'
    }

    return 'yellow'
  }

  const formatTanggal = (tanggal) => {
    if (!tanggal) {
      return '-'
    }

    return new Date(
      `${tanggal}T00:00:00`
    ).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // =========================
  // PAGINATION
  // =========================

  const ITEMS_PER_PAGE = 10

  const totalPages = Math.ceil(
    perbaikan.length / ITEMS_PER_PAGE
  )

  const startIndex =
    currentPage * ITEMS_PER_PAGE

  const dataPaginated = perbaikan.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  )

  return (
    <div className="page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="page-title">
        <h1>🔧 Perbaikan Ruangan</h1>

        <p>
          Kelola dan pantau proses perbaikan
          fasilitas ruangan.
        </p>
      </div>

      {/* =========================
          MODE USER
      ========================= */}

      {!isAdmin && (
        <div className="guest-note">
          👁️ Mode tamu: Anda dapat melihat
          status perbaikan fasilitas ruangan.
        </div>
      )}

      {/* =========================
          ERROR
      ========================= */}

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

      {/* =========================
          LOADING
      ========================= */}

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
          Memuat data perbaikan ruangan...
        </div>
      )}

      {/* =========================
          SUMMARY
      ========================= */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">
            🔧
          </div>

          <div className="stat-info">
            <h4>Total Perbaikan</h4>

            <div className="stat-value">
              {perbaikan.length}
            </div>

            <div className="stat-desc">
              Seluruh data perbaikan
            </div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon">
            ⚙️
          </div>

          <div className="stat-info">
            <h4>Diproses</h4>

            <div className="stat-value">
              {
                perbaikan.filter(
                  (item) =>
                    item.status ===
                    'Diproses'
                ).length
              }
            </div>

            <div className="stat-desc">
              Sedang diperbaiki
            </div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            ✅
          </div>

          <div className="stat-info">
            <h4>Selesai</h4>

            <div className="stat-value">
              {
                perbaikan.filter(
                  (item) =>
                    item.status ===
                    'Selesai'
                ).length
              }
            </div>

            <div className="stat-desc">
              Perbaikan selesai
            </div>
          </div>
        </div>

      </div>

      {/* =========================
          FORM TAMBAH PERBAIKAN
      ========================= */}

      {isAdmin && (
        <div className="card">

          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems:
                'flex-start',
              gap: '20px',
            }}
          >

            <div>
              <h3>
                ➕ Tambah Data Perbaikan
              </h3>

              <p
                style={{
                  margin:
                    '5px 0 0',
                  color: '#64748b',
                  fontSize: '13px',
                }}
              >
                Tambahkan tindak lanjut
                berdasarkan laporan
                kerusakan.
              </p>
            </div>

            <button
              type="button"
              className="btn"
              onClick={() =>
                setShowForm(
                  !showForm
                )
              }
              disabled={
                kerusakanBelumDiperbaiki.length ===
                0
              }
            >
              {showForm
                ? 'Tutup'
                : '+ Tambah Perbaikan'}
            </button>

          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              style={{
                marginTop: '20px',
                paddingTop: '20px',
                borderTop:
                  '1px solid #e2e8f0',
              }}
            >

              {/* LAPORAN KERUSAKAN */}

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
                  Laporan Kerusakan
                </label>

                <select
                  name="kerusakanId"
                  value={
                    formData.kerusakanId
                  }
                  onChange={
                    handleKerusakanChange
                  }
                  required
                  style={{
                    width: '100%',
                    boxSizing:
                      'border-box',
                    padding:
                      '9px 11px',
                    border:
                      '1px solid #cbd5e1',
                    borderRadius:
                      '6px',
                    backgroundColor:
                      '#fff',
                    color:
                      '#334155',
                    fontSize:
                      '12px',
                  }}
                >

                  <option value="">
                    -- Pilih Laporan Kerusakan --
                  </option>

                  {kerusakanBelumDiperbaiki.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.ruangan} -
                        {' '}
                        {item.kerusakan}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* JENIS + PENANGGUNG JAWAB */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap: '14px',
                  marginBottom:
                    '16px',
                }}
              >

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontSize:
                        '12px',
                      fontWeight:
                        600,
                      color:
                        '#475569',
                    }}
                  >
                    Jenis Perbaikan
                  </label>

                  <input
                    type="text"
                    name="jenisPerbaikan"
                    value={
                      formData.jenisPerbaikan
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Contoh: Perbaikan AC"
                    required
                    style={{
                      width:
                        '100%',
                      boxSizing:
                        'border-box',
                      padding:
                        '9px 11px',
                      border:
                        '1px solid #cbd5e1',
                      borderRadius:
                        '6px',
                      backgroundColor:
                        '#fff',
                      color:
                        '#334155',
                      fontSize:
                        '12px',
                    }}
                  />

                </div>

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontSize:
                        '12px',
                      fontWeight:
                        600,
                      color:
                        '#475569',
                    }}
                  >
                    Penanggung Jawab
                  </label>

                  <input
                    type="text"
                    name="penanggungJawab"
                    value={
                      formData.penanggungJawab
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Nama penanggung jawab"
                    required
                    style={{
                      width:
                        '100%',
                      boxSizing:
                        'border-box',
                      padding:
                        '9px 11px',
                      border:
                        '1px solid #cbd5e1',
                      borderRadius:
                        '6px',
                      backgroundColor:
                        '#fff',
                      color:
                        '#334155',
                      fontSize:
                        '12px',
                    }}
                  />

                </div>

              </div>

              {/* TANGGAL + STATUS */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap: '14px',
                  marginBottom:
                    '20px',
                }}
              >

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontSize:
                        '12px',
                      fontWeight:
                        600,
                      color:
                        '#475569',
                    }}
                  >
                    Tanggal Mulai
                  </label>

                  <input
                    type="date"
                    name="tanggalMulai"
                    value={
                      formData.tanggalMulai
                    }
                    onChange={
                      handleChange
                    }
                    required
                    style={{
                      width:
                        '100%',
                      boxSizing:
                        'border-box',
                      padding:
                        '9px 11px',
                      border:
                        '1px solid #cbd5e1',
                      borderRadius:
                        '6px',
                      backgroundColor:
                        '#fff',
                      color:
                        '#334155',
                      fontSize:
                        '12px',
                    }}
                  />

                </div>

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      marginBottom:
                        '6px',
                      fontSize:
                        '12px',
                      fontWeight:
                        600,
                      color:
                        '#475569',
                    }}
                  >
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleChange
                    }
                    style={{
                      width:
                        '100%',
                      boxSizing:
                        'border-box',
                      padding:
                        '9px 11px',
                      border:
                        '1px solid #cbd5e1',
                      borderRadius:
                        '6px',
                      backgroundColor:
                        '#fff',
                      color:
                        '#334155',
                      fontSize:
                        '12px',
                    }}
                  >

                    <option value="Diproses">
                      Diproses
                    </option>

                    <option value="Selesai">
                      Selesai
                    </option>

                  </select>

                </div>

              </div>

              {/* BUTTON */}

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'flex-end',
                  gap: '8px',
                  borderTop:
                    '1px solid #e2e8f0',
                  paddingTop:
                    '16px',
                }}
              >

                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    resetForm()
                    setShowForm(false)
                  }}
                  style={{
                    backgroundColor:
                      '#fff',
                    border:
                      '1px solid #cbd5e1',
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="btn"
                  disabled={
                    submitting
                  }
                >
                  {submitting
                    ? 'Menyimpan...'
                    : 'Simpan Perbaikan'}
                </button>

              </div>

            </form>
          )}

        </div>
      )}

      {/* =========================
          TABLE
      ========================= */}

      <div className="card">

        <h3>
          📋 Daftar Perbaikan Ruangan
        </h3>

        <div className="filter-info">
          Menampilkan {perbaikan.length}{' '}
          data perbaikan
        </div>

        <div className="table-wrap">

          <table className="table">

            <thead>
              <tr>

                <th>Ruangan</th>

                <th>Kerusakan</th>

                <th>Jenis Perbaikan</th>

                <th>Penanggung Jawab</th>

                <th>Tanggal Mulai</th>

                <th>Status</th>

                <th>Aksi</th>

              </tr>
            </thead>

            <tbody>

              {dataPaginated.length > 0 ? (

                dataPaginated.map(
                  (item) => {

                    const statusClass =
                      getStatusClass(
                        item.status
                      )

                    return (
                      <tr key={item.id}>

                        <td>
                          {item.ruangan}
                        </td>

                        <td>
                          {item.kerusakan}
                        </td>

                        <td>
                          {item.jenisPerbaikan}
                        </td>

                        <td>
                          {item.penanggungJawab}
                        </td>

                        <td>
                          {formatTanggal(
                            item.tanggalMulai
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
                                display:
                                  'flex',
                                gap: '5px',
                                alignItems:
                                  'center',
                              }}
                            >

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
                                  handleDelete(
                                    item.id
                                  )
                                }
                              >
                                🗑
                              </button>

                            </div>
                          )}

                        </td>

                      </tr>
                    )
                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan="7"
                    style={{
                      textAlign:
                        'center',
                      padding:
                        '30px',
                    }}
                  >
                    Belum ada data
                    perbaikan.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* =========================
            PAGINATION
        ========================= */}

        <div
          style={{
            display: 'flex',
            justifyContent:
              'flex-end',
            gap: '8px',
            marginTop: '16px',
            alignItems:
              'center',
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
              fontSize:
                '11px',
              fontWeight:
                '500',
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

      </div>

    </div>
  )
}

export default PerbaikanRuangan