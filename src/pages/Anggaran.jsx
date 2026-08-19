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

const statusAnggaran = (persen) => {
  if (persen >= 60) {
    return {
      label: 'Aman',
      cls: 'green',
    }
  }

  if (persen >= 25) {
    return {
      label: 'Waspada',
      cls: 'yellow',
    }
  }

  return {
    label: 'Kritis',
    cls: 'red',
  }
}

function Anggaran({ user }) {
  const isAdmin =
    user.role === 'admin_keuangan' ||
    user.role === 'superadmin'

  const [data, setData] = useState([])

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

  const persenTotal =
    totalPagu > 0
      ? Math.round(
          (totalRealisasi / totalPagu) * 100
        )
      : 0

  const previewPagu =
    Number(form.unit || 0) *
    Number(form.hargaSatuan || 0)

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
        harga_satuan: Number(form.hargaSatuan),
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
          jumlah: Number(formRealisasi.jumlah),
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

  const updatePagu = (id, nilai) => {
    setData(
      data.map((d) =>
        d.id === id
          ? { ...d, pagu: Number(nilai) || 0 }
          : d
      )
    )

    fetch(API + '/anggaran/' + id + '/pagu', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagu: Number(nilai) || 0 }),
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

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-title">
        <h1>💰 Penyerapan Anggaran</h1>

        <p>
          Data dari bagian keuangan. Pagu diupload
          per tahun, realisasi diperbarui per bulan.
        </p>
      </div>

      {/* MODE TAMU */}
      {!isAdmin && (
        <div className="guest-note">
          👁️ Mode tamu: Anda hanya melihat data
          bidang <b>{user.bidang}</b>.
        </div>
      )}

      {/* STATISTIK */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">🏦</div>

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
          <div className="stat-icon">💵</div>

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
          <div className="stat-icon">📊</div>

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
              ➕ Upload Pagu Tahunan
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

              <input
                type="number"
                placeholder="Harga Satuan (Rp)"
                required
                value={form.hargaSatuan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    hargaSatuan: e.target.value,
                  })
                }
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
              📅 Input Realisasi Bulan Ini
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

              <input
                type="number"
                placeholder="Jumlah realisasi bulan ini (Rp)"
                required
                value={formRealisasi.jumlah}
                onChange={(e) =>
                  setFormRealisasi({
                    ...formRealisasi,
                    jumlah: e.target.value,
                  })
                }
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
          💰 Rekapitulasi Penyerapan Anggaran
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

                        const persen =
                          d.pagu > 0
                            ? Math.round(
                                (d.realisasi /
                                  d.pagu) *
                                  100
                              )
                            : 0

                        const sisa =
                          d.pagu -
                          d.realisasi

                        const st =
                          statusAnggaran(
                            persen
                          )

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
                                  type="number"
                                  className="pagu-input"
                                  value={d.pagu}
                                  onChange={(e) =>
                                    updatePagu(
                                      d.id,
                                      e.target
                                        .value
                                    )
                                  }
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
                                      Math.min(
                                        persen,
                                        100
                                      ) +
                                      '%',
                                  }}
                                ></div>

                              </div>

                              <small>
                                {persen}%
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

                              {isAdmin && (
                                <button
                                  className="btn-danger"
                                  onClick={() =>
                                    hapusData(
                                      d.id
                                    )
                                  }
                                >
                                  🗑
                                </button>
                              )}

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

    </div>
  )
}

export default Anggaran