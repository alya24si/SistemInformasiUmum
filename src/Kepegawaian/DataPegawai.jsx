import { useState } from 'react'

const dataAwal = [
  {
    id: 1,
    nip: '198501012010011001',
    nama: 'Delita Br Tinambunan',
    jabatan: 'Staff Sistem Informasi',
    bagian: 'Umum',
    noHp: '081234567890',
    email: 'delita@example.com',
    status: 'Aktif',
  },
  {
    id: 2,
    nip: '198602022011021002',
    nama: 'Alya Deka Danisha',
    jabatan: 'Staff Administrasi',
    bagian: 'Kepegawaian',
    noHp: '081298765432',
    email: 'alya@example.com',
    status: 'Aktif',
  },
  {
    id: 3,
    nip: '198703032012031003',
    nama: 'Budi Santoso',
    jabatan: 'Staff Keuangan',
    bagian: 'Keuangan',
    noHp: '082112345678',
    email: 'budi@example.com',
    status: 'Aktif',
  },
]

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

  const [data, setData] = useState(dataAwal)
  const [search, setSearch] = useState('')
  const [filterBagian, setFilterBagian] = useState('semua')
  const [filterStatus, setFilterStatus] = useState('semua')

  const [form, setForm] = useState({
    nip: '',
    nama: '',
    jabatan: '',
    bagian: '',
    noHp: '',
    email: '',
    status: 'Aktif',
  })

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

    const baru = {
      id: Date.now(),
      nip: form.nip,
      nama: form.nama,
      jabatan: form.jabatan,
      bagian: form.bagian,
      noHp: form.noHp,
      email: form.email,
      status: form.status,
    }

    setData([...data, baru])

    setForm({
      nip: '',
      nama: '',
      jabatan: '',
      bagian: '',
      noHp: '',
      email: '',
      status: 'Aktif',
    })
  }

  const hapusData = (id) => {
    if (window.confirm('Yakin ingin menghapus data pegawai ini?')) {
      setData(data.filter((pegawai) => pegawai.id !== id))
    }
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

          <p>
            Upload file Excel pegawai ke backend. Backend akan
            memproses dan menyimpan data ke MySQL.
          </p>

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
              value={form.noHp}
              onChange={(e) =>
                setForm({
                  ...form,
                  noHp: e.target.value,
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
              {dataFiltered.length > 0 ? (
                dataFiltered.map((pegawai, index) => {
                  const status = statusPegawai(pegawai.status)

                  return (
                    <tr key={pegawai.id}>
                      <td>{index + 1}</td>
                      <td>{pegawai.nip}</td>
                      <td>{pegawai.nama}</td>
                      <td>{pegawai.jabatan}</td>
                      <td>{pegawai.bagian}</td>
                      <td>{pegawai.noHp || '-'}</td>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DataPegawai