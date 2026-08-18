import { useState } from 'react'

const dataAwal = [
  {
    id: 1,
    nama: 'Ruang Rapat Utama',
    kapasitas: 30,
    lokasi: 'Lantai 1',
    fasilitas: 'AC, Proyektor, Meja, Kursi',
    status: 'Tersedia',
  },
  {
    id: 2,
    nama: 'Ruang Rapat 1',
    kapasitas: 15,
    lokasi: 'Lantai 1',
    fasilitas: 'AC, TV, Meja, Kursi',
    status: 'Tersedia',
  },
  {
    id: 3,
    nama: 'Ruang Rapat 2',
    kapasitas: 15,
    lokasi: 'Lantai 2',
    fasilitas: 'AC, Proyektor, Meja, Kursi',
    status: 'Digunakan',
  },
  {
    id: 4,
    nama: 'Aula',
    kapasitas: 100,
    lokasi: 'Lantai 1',
    fasilitas: 'AC, Sound System, Proyektor',
    status: 'Tersedia',
  },
  {
    id: 5,
    nama: 'Ruang Arsip',
    kapasitas: 10,
    lokasi: 'Lantai 2',
    fasilitas: 'Rak Arsip, AC',
    status: 'Maintenance',
  },
]

const statusRuangan = (status) => {
  if (status === 'Tersedia') {
    return {
      label: 'Tersedia',
      cls: 'green',
    }
  }

  if (status === 'Digunakan') {
    return {
      label: 'Digunakan',
      cls: 'yellow',
    }
  }

  return {
    label: 'Maintenance',
    cls: 'red',
  }
}

function DataRuangan({ user }) {
  const isAdminRT =
    user.role === 'admin_rumahtangga' ||
    user.role === 'superadmin'

  const [data, setData] = useState(dataAwal)

  const [form, setForm] = useState({
    nama: '',
    kapasitas: '',
    lokasi: '',
    fasilitas: '',
    status: 'Tersedia',
  })

  const [searchNama, setSearchNama] = useState('')
  const [filterLokasi, setFilterLokasi] = useState('semua')

  const [currentPage, setCurrentPage] = useState(0)

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const daftarLokasi = [
    ...new Set(data.map((item) => item.lokasi)),
  ]

  const dataFiltered = data.filter((d) => {
    const cocokNama = d.nama
      .toLowerCase()
      .includes(searchNama.toLowerCase())

    const cocokLokasi =
      filterLokasi === 'semua' ||
      d.lokasi === filterLokasi

    return cocokNama && cocokLokasi
  })

  const totalRuangan = dataFiltered.length

  const totalTersedia = dataFiltered.filter(
    (d) => d.status === 'Tersedia'
  ).length

  const totalDigunakan = dataFiltered.filter(
    (d) => d.status === 'Digunakan'
  ).length

  const totalMaintenance = dataFiltered.filter(
    (d) => d.status === 'Maintenance'
  ).length

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const bukaTambah = () => {
    setEditId(null)

    setForm({
      nama: '',
      kapasitas: '',
      lokasi: '',
      fasilitas: '',
      status: 'Tersedia',
    })

    setShowForm(true)
  }

  const bukaEdit = (item) => {
    setEditId(item.id)

    setForm({
      nama: item.nama,
      kapasitas: item.kapasitas,
      lokasi: item.lokasi,
      fasilitas: item.fasilitas,
      status: item.status,
    })

    setShowForm(true)
  }

  const simpanData = (e) => {
    e.preventDefault()

    if (editId) {
      setData(
        data.map((item) =>
          item.id === editId
            ? {
                ...item,
                nama: form.nama,
                kapasitas: Number(form.kapasitas),
                lokasi: form.lokasi,
                fasilitas: form.fasilitas,
                status: form.status,
              }
            : item
        )
      )

      alert('Data ruangan berhasil diperbarui.')
    } else {
      const baru = {
        id: Date.now(),
        nama: form.nama,
        kapasitas: Number(form.kapasitas),
        lokasi: form.lokasi,
        fasilitas: form.fasilitas,
        status: form.status,
      }

      setData([...data, baru])

      alert('Data ruangan berhasil ditambahkan.')
    }

    setForm({
      nama: '',
      kapasitas: '',
      lokasi: '',
      fasilitas: '',
      status: 'Tersedia',
    })

    setEditId(null)
    setShowForm(false)
  }

  const hapusData = (id) => {
    if (
      window.confirm(
        'Yakin ingin menghapus data ruangan ini?'
      )
    ) {
      setData(
        data.filter((item) => item.id !== id)
      )
    }
  }

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-title">
        <h1>🏢 Data Ruangan</h1>

        <p>
          Mengelola dan memantau informasi ruangan,
          kapasitas, fasilitas, serta kondisi ruangan.
        </p>
      </div>

      {/* STATISTIK */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">🏢</div>

          <div className="stat-info">
            <h4>Total Ruangan</h4>

            <div className="stat-value">
              {totalRuangan}
            </div>

            <div className="stat-desc">
              Ruangan terdaftar
            </div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">✅</div>

          <div className="stat-info">
            <h4>Tersedia</h4>

            <div className="stat-value">
              {totalTersedia}
            </div>

            <div className="stat-desc">
              Siap digunakan
            </div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon">📅</div>

          <div className="stat-info">
            <h4>Digunakan</h4>

            <div className="stat-value">
              {totalDigunakan}
            </div>

            <div className="stat-desc">
              Sedang digunakan
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔧</div>

          <div className="stat-info">
            <h4>Maintenance</h4>

            <div className="stat-value">
              {totalMaintenance}
            </div>

            <div className="stat-desc">
              Sedang diperbaiki
            </div>
          </div>
        </div>

      </div>

      {/* TAMBAH / EDIT RUANGAN */}
      {isAdminRT && showForm && (
        <div className="card">

          <h3>
            {editId
              ? '✏️ Edit Data Ruangan'
              : '➕ Tambah Data Ruangan'}
          </h3>

          <form
            onSubmit={simpanData}
            className="form-row"
          >

            <input
              type="text"
              placeholder="Nama Ruangan"
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
              type="number"
              placeholder="Kapasitas"
              min="1"
              required
              value={form.kapasitas}
              onChange={(e) =>
                setForm({
                  ...form,
                  kapasitas: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Lokasi"
              required
              value={form.lokasi}
              onChange={(e) =>
                setForm({
                  ...form,
                  lokasi: e.target.value,
                })
              }
            />

            <input
              type="text"
              placeholder="Fasilitas"
              required
              value={form.fasilitas}
              onChange={(e) =>
                setForm({
                  ...form,
                  fasilitas: e.target.value,
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
              <option value="Tersedia">
                Tersedia
              </option>

              <option value="Digunakan">
                Digunakan
              </option>

              <option value="Maintenance">
                Maintenance
              </option>
            </select>

            <button
              type="submit"
              className="btn"
            >
              {editId ? 'Simpan Perubahan' : 'Simpan'}
            </button>

            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                setShowForm(false)
                setEditId(null)
              }}
            >
              Batal
            </button>

          </form>

        </div>
      )}

      {/* DAFTAR RUANGAN */}
      <div className="card">

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >

          <div>
            <h3>🏢 Daftar Ruangan</h3>

            <p>
              Menampilkan {dataFiltered.length} dari{' '}
              {data.length} data ruangan.
            </p>
          </div>

          {isAdminRT && !showForm && (
            <button
              type="button"
              className="btn"
              onClick={bukaTambah}
            >
              ➕ Tambah Ruangan
            </button>
          )}

        </div>

        {/* FILTER */}
        <div className="filter-row">

          <input
            type="text"
            placeholder="Cari nama ruangan..."
            value={searchNama}
            onChange={(e) => {
              setSearchNama(e.target.value)
              setCurrentPage(0)
            }}
          />

          <select
            value={filterLokasi}
            onChange={(e) => {
              setFilterLokasi(e.target.value)
              setCurrentPage(0)
            }}
          >
            <option value="semua">
              Semua Lokasi
            </option>

            {daftarLokasi.map((lokasi) => (
              <option
                key={lokasi}
                value={lokasi}
              >
                {lokasi}
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
                <th>Nama Ruangan</th>
                <th>Kapasitas</th>
                <th>Lokasi</th>
                <th>Fasilitas</th>
                <th>Status</th>

                {isAdminRT && (
                  <th>Aksi</th>
                )}
              </tr>
            </thead>

            <tbody>

              {(() => {
                const ITEMS_PER_PAGE = 10

                const totalPages = Math.ceil(
                  dataFiltered.length /
                    ITEMS_PER_PAGE
                )

                const startIndex =
                  currentPage * ITEMS_PER_PAGE

                const endIndex =
                  startIndex + ITEMS_PER_PAGE

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
                            statusRuangan(
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
                                {d.kapasitas} orang
                              </td>

                              <td>
                                {d.lokasi}
                              </td>

                              <td>
                                {d.fasilitas}
                              </td>

                              <td>
                                <span
                                  className={`badge ${st.cls}`}
                                >
                                  {st.label}
                                </span>
                              </td>

                              {isAdminRT && (
                                <td>

                                  <div
                                    style={{
                                      display: 'flex',
                                      gap: '5px',
                                    }}
                                  >

                                    <button
                                      type="button"
                                      className="btn"
                                      onClick={() =>
                                        bukaEdit(d)
                                      }
                                    >
                                      Edit
                                    </button>

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
                          colSpan={
                            isAdminRT ? 7 : 6
                          }
                          style={{
                            textAlign: 'center',
                            padding: '30px',
                          }}
                        >
                          Tidak ada data ruangan.
                        </td>

                      </tr>

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

          const totalPages = Math.ceil(
            dataFiltered.length /
              ITEMS_PER_PAGE
          )

          return (
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

export default DataRuangan