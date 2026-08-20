import { useEffect, useState } from 'react'

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

const statusAbsensi = (status) => {
  if (status === 'Hadir') {
    return {
      label: 'Hadir',
      cls: 'green',
    }
  }

  if (status === 'Izin') {
    return {
      label: 'Izin',
      cls: 'yellow',
    }
  }

  if (status === 'Sakit') {
    return {
      label: 'Sakit',
      cls: 'blue',
    }
  }

  return {
    label: 'Alpa',
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

function DataAbsensi() {
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
    status: 'Hadir',
  })

  const [filterTahun, setFilterTahun] = useState(
    String(tahunIni)
  )

  const [filterBulan, setFilterBulan] = useState('semua')

  const [search, setSearch] = useState('')

  const [currentPage, setCurrentPage] = useState(0)

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

  const handleUploadAbsensi = () => {
    alert(
      'File Excel akan dikirim ke backend untuk diproses dan disimpan ke MySQL nanti.'
    )
  }

  const dataFiltered = data.filter((d) => {
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

    const cocokNama =
      d.nama
        .toLowerCase()
        .includes(search.toLowerCase())

    return (
      cocokTahun &&
      cocokBulan &&
      cocokNama
    )
  })

  const totalHadir = dataFiltered.filter(
    (d) => d.status === 'Hadir'
  ).length

  const totalIzin = dataFiltered.filter(
    (d) => d.status === 'Izin'
  ).length

  const totalSakit = dataFiltered.filter(
    (d) => d.status === 'Sakit'
  ).length

  const totalAlpa = dataFiltered.filter(
    (d) => d.status === 'Alpa'
  ).length

  const tambahData = (e) => {
    e.preventDefault()

    if (!form.pegawai_id) {
      alert('Pilih pegawai terlebih dahulu.')
      return
    }

    fetch(`${API_URL}/absensi`, {
      method: 'POST',
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
              'Gagal menyimpan data absensi.'
          )

          return
        }

        ambilAbsensi()
        ambilAlpaBerturut()

        setForm({
          pegawai_id: '',
          tanggal: '',
          jam_masuk: '',
          jam_pulang: '',
          status: 'Hadir',
        })

        setShowForm(false)
      })
      .catch(() =>
        alert('Gagal menyimpan data absensi.')
      )
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
        <h1>📋 Data Absensi</h1>

        <p>
          Mengelola dan memantau data kehadiran pegawai.
          Data absensi dapat digunakan untuk membuat rekap
          kehadiran pegawai.
        </p>
      </div>

      {/* STATISTIK */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">👥</div>

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
          <div className="stat-icon">✅</div>

          <div className="stat-info">
            <h4>Hadir</h4>

            <div className="stat-value">
              {totalHadir}
            </div>

            <div className="stat-desc">
              Pegawai hadir
            </div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon">📝</div>

          <div className="stat-info">
            <h4>Izin / Sakit</h4>

            <div className="stat-value">
              {totalIzin + totalSakit}
            </div>

            <div className="stat-desc">
              Tidak hadir dengan keterangan
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>

          <div className="stat-info">
            <h4>Alpa</h4>

            <div className="stat-value">
              {totalAlpa}
            </div>

            <div className="stat-desc">
              Tidak hadir tanpa keterangan
            </div>
          </div>
        </div>

      </div>

      {/* IMPORT EXCEL */}
      <div className="card">

        <h3>📥 Import Data Absensi</h3>

        <div className="form-row">

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleUploadAbsensi}
          />

        </div>

      </div>

      {/* PEGAWAI ALPA 3 HARI BERTURUT */}
      {alpaList.length > 0 && (
        <div className="card">

          <h3>📱 Pegawai Perlu Dihubungi</h3>

          <p>
            Daftar pegawai yang tidak absen 3 hari kerja
            berturut-turut (Senin-Jumat). Pesan WA sudah
            otomatis disiapkan, tinggal klik kirim.
          </p>

          <div className="table-wrap">

            <table className="table">

              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Pegawai</th>
                  <th>NIP</th>
                  <th>Tanggal Alpa</th>
                  <th>No. WA</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>

                {alpaList.map((item, index) => (
                  <tr key={item.pegawai_id}>

                    <td>
                      {index + 1}
                    </td>

                    <td>
                      {item.nama}
                    </td>

                    <td>
                      {item.nip}
                    </td>

                    <td>
                      {item.tanggal_alpa
                        .map((t) =>
                          formatTanggal(t)
                        )
                        .join(', ')}
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
                      >
                        📱 Kirim WA
                      </a>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

      {/* TAMBAH DATA */}
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

            <h3>➕ Tambah Data Absensi</h3>

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
              setShowForm(!showForm)

              if (!showForm) {
                setForm({
                  pegawai_id: '',
                  tanggal: '',
                  jam_masuk: '',
                  jam_pulang: '',
                  status: 'Hadir',
                })
              }
            }}
          >
            {showForm
              ? 'Tutup'
              : '+ Tambah Data Absensi'}
          </button>

        </div>

        {showForm && (
          <form
            onSubmit={tambahData}
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

              <option value="Alpa">
                Alpa
              </option>

            </select>

            <button
              type="submit"
              className="btn"
            >
              Simpan
            </button>

          </form>
        )}

      </div>

      {/* DAFTAR ABSENSI */}
      <div className="card">

        <h3>🔎 Daftar Absensi</h3>

        <div className="filter-row">

          <input
            type="text"
            placeholder="Cari nama pegawai..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

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
          {data.length} data
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
                <th>Status</th>
                <th>Aksi</th>
              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={7}
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
                                  <span
                                    className={`badge ${st.cls}`}
                                  >
                                    {st.label}
                                  </span>
                                </td>

                                <td>
                                  <button
                                    type="button"
                                    className="btn-danger"
                                    onClick={() =>
                                      hapusData(
                                        d.id
                                      )
                                    }
                                  >
                                    🗑
                                  </button>
                                </td>

                              </tr>
                            )
                          }
                        )

                      ) : (

                        <tr>

                          <td
                            colSpan={7}
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
