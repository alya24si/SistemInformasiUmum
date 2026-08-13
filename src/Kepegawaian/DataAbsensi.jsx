import { useState } from 'react'

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

const dataAwal = [
  {
    id: 1,
    nama: 'Delita Br Tinambunan',
    tanggal: '2026-08-01',
    jamMasuk: '07:45',
    jamPulang: '16:00',
    status: 'Hadir',
  },
  {
    id: 2,
    nama: 'Delita Br Tinambunan',
    tanggal: '2026-08-02',
    jamMasuk: '07:50',
    jamPulang: '16:05',
    status: 'Hadir',
  },
  {
    id: 3,
    nama: 'Delita Br Tinambunan',
    tanggal: '2026-08-03',
    jamMasuk: '-',
    jamPulang: '-',
    status: 'Alpa',
  },
  {
    id: 4,
    nama: 'Delita Br Tinambunan',
    tanggal: '2026-08-04',
    jamMasuk: '-',
    jamPulang: '-',
    status: 'Alpa',
  },
  {
    id: 5,
    nama: 'Delita Br Tinambunan',
    tanggal: '2026-08-05',
    jamMasuk: '-',
    jamPulang: '-',
    status: 'Alpa',
  },
  {
    id: 6,
    nama: 'Alya Deka Danisha',
    tanggal: '2026-08-01',
    jamMasuk: '-',
    jamPulang: '-',
    status: 'Izin',
  },
  {
    id: 7,
    nama: 'Alya Deka Danisha',
    tanggal: '2026-08-02',
    jamMasuk: '-',
    jamPulang: '-',
    status: 'Alpa',
  },
  {
    id: 8,
    nama: 'Alya Deka Danisha',
    tanggal: '2026-08-03',
    jamMasuk: '-',
    jamPulang: '-',
    status: 'Sakit',
  },
  {
    id: 9,
    nama: 'Budi Santoso',
    tanggal: '2026-08-01',
    jamMasuk: '-',
    jamPulang: '-',
    status: 'Alpa',
  },
  {
    id: 10,
    nama: 'Budi Santoso',
    tanggal: '2026-08-02',
    jamMasuk: '-',
    jamPulang: '-',
    status: 'Izin',
  },
  {
    id: 11,
    nama: 'Budi Santoso',
    tanggal: '2026-08-03',
    jamMasuk: '08:10',
    jamPulang: '16:15',
    status: 'Hadir',
  },
  {
    id: 12,
    nama: 'Budi Santoso',
    tanggal: '2026-08-04',
    jamMasuk: '-',
    jamPulang: '-',
    status: 'Alpa',
  },
]

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
  const [data, setData] = useState(dataAwal)

  const [form, setForm] = useState({
    nama: '',
    tanggal: '',
    jamMasuk: '',
    jamPulang: '',
    status: 'Hadir',
  })

  const [filterTahun, setFilterTahun] = useState(
    String(tahunIni)
  )

  const [filterBulan, setFilterBulan] = useState('semua')

  const [search, setSearch] = useState('')

  const pegawaiProfiles = [
    {
      nama: 'Delita Br Tinambunan',
      noHp: '081234567890',
    },
    {
      nama: 'Alya Deka Danisha',
      noHp: '081298765432',
    },
    {
      nama: 'Budi Santoso',
      noHp: '082112345678',
    },
  ]

  const handleUploadAbsensi = () => {
    alert(
    )
  }

  const chatWhatsApp = (noHp, nama) => {
    if (!noHp) {
      alert('Nomor WhatsApp tidak tersedia untuk pegawai ini.')
      return
    }

    const onlyNumbers = noHp
      .toString()
      .replace(/[^\d+]/g, '')
      .replace(/^0/, '62')

    const message = `Halo ${nama},\nKami ingin mengingatkan bahwa Anda sudah tidak hadir selama lebih dari 3 hari.`
    const url = `https://wa.me/${onlyNumbers}?text=${encodeURIComponent(message)}`

    window.open(url, '_blank')
  }

  const absenceSummary = data.reduce((summary, record) => {
    if (record.status !== 'Hadir') {
      summary[record.nama] = (summary[record.nama] || 0) + 1
    }
    return summary
  }, {})

  const absentEmployees = Object.entries(absenceSummary)
    .map(([nama, count]) => {
      const profile = pegawaiProfiles.find((pegawai) => pegawai.nama === nama)
      return {
        nama,
        count,
        noHp: profile?.noHp || '-',
      }
    })
    .filter((item) => item.count >= 3)

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

    const baru = {
      id: Date.now(),
      nama: form.nama,
      tanggal: form.tanggal,
      jamMasuk: form.jamMasuk || '-',
      jamPulang: form.jamPulang || '-',
      status: form.status,
    }

    setData([...data, baru])

    setForm({
      nama: '',
      tanggal: '',
      jamMasuk: '',
      jamPulang: '',
      status: 'Hadir',
    })
  }

  const hapusData = (id) => {
    if (
      window.confirm(
        'Yakin ingin menghapus data absensi ini?'
      )
    ) {
      setData(
        data.filter((d) => d.id !== id)
      )
    }
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

        <p>
          Upload file Excel absensi ke backend. Backend akan
          memproses dan menyimpan data ke MySQL.
        </p>

        <div className="form-row">

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleUploadAbsensi}
          />

        </div>

      </div>

      {absentEmployees.length > 0 ? (
        <div className="card">
          <h3>📱 Pegawai Perlu Dihubungi</h3>

          <p>
            Daftar pegawai yang tercatat tidak hadir/absen 3 hari atau lebih.
            Nomor WA diambil dari data pegawai.
          </p>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Pegawai</th>
                  <th>Jumlah Tidak Hadir</th>
                  <th>No. WA</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {absentEmployees.map((item, index) => (
                  <tr key={item.nama}>
                    <td>{index + 1}</td>
                    <td>{item.nama}</td>
                    <td>{item.count} hari</td>
                    <td>{item.noHp}</td>
                    <td>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => chatWhatsApp(item.noHp, item.nama)}
                      >
                        📱 Chat WA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <p className="text-sm text-slate-500">
            Belum ada pegawai yang tercatat absen 3 hari atau lebih.
            Jika ingin menguji fitur ini, tambahkan data absensi absen/izin/sakit pada pegawai yang sama sebanyak 3 hari.
          </p>
        </div>
      )}

      {/* TAMBAH DATA */}
      <div className="card">

        <h3>➕ Tambah Data Absensi</h3>

        <form
          onSubmit={tambahData}
          className="form-row"
        >

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
            value={form.jamMasuk}
            onChange={(e) =>
              setForm({
                ...form,
                jamMasuk: e.target.value,
              })
            }
          />

          <input
            type="time"
            value={form.jamPulang}
            onChange={(e) =>
              setForm({
                ...form,
                jamPulang: e.target.value,
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

              {dataFiltered.length > 0 ? (

                dataFiltered.map((d, index) => {

                  const st =
                    statusAbsensi(d.status)

                  return (
                    <tr key={d.id}>

                      <td>
                        {index + 1}
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
                        {d.jamMasuk}
                      </td>

                      <td>
                        {d.jamPulang}
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
                            hapusData(d.id)
                          }
                        >
                          🗑
                        </button>
                      </td>

                    </tr>
                  )
                })

              ) : (

                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: 'center',
                      padding: '30px',
                    }}
                  >
                    Tidak ada data absensi.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  )
}

export default DataAbsensi