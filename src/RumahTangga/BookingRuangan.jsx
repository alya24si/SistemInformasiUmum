import { useState } from 'react'

const daftarRuangan = [
  'Ruang Rapat Utama',
  'Ruang Rapat 1',
  'Ruang Rapat 2',
  'Aula',
]

const dataAwal = [
  {
    id: 1,
    ruangan: 'Ruang Rapat Utama',
    pemesan: 'Delita Br Tinambunan',
    bagian: 'Bagian Keuangan',
    kegiatan: 'Rapat Koordinasi',
    deskripsi:
      'Rapat koordinasi terkait kegiatan dan anggaran bagian.',
    tanggal: '2026-08-12',
    mulai: '08:00',
    selesai: '10:00',
    status: 'Disetujui',
  },
  {
    id: 2,
    ruangan: 'Aula',
    pemesan: 'Alya Deka Danisha',
    bagian: 'Bagian Kepegawaian',
    kegiatan: 'Kegiatan Internal',
    deskripsi:
      'Kegiatan internal bersama pegawai.',
    tanggal: '2026-08-12',
    mulai: '13:00',
    selesai: '16:00',
    status: 'Menunggu',
  },
  {
    id: 3,
    ruangan: 'Ruang Rapat 1',
    pemesan: 'Budi Santoso',
    bagian: 'Bagian Umum',
    kegiatan: 'Rapat Tim',
    deskripsi:
      'Rapat pembahasan pekerjaan tim.',
    tanggal: '2026-08-13',
    mulai: '09:00',
    selesai: '11:00',
    status: 'Ditolak',
    alasanTolak:
      'Jadwal ruangan tidak tersedia.',
  },
]

const formatTanggal = (tanggal) => {
  if (!tanggal) return '-'

  return new Date(
    `${tanggal}T00:00:00`
  ).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const statusBooking = (status) => {
  if (status === 'Disetujui') {
    return {
      label: 'Disetujui',
      cls: 'green',
    }
  }

  if (status === 'Menunggu') {
    return {
      label: 'Menunggu',
      cls: 'yellow',
    }
  }

  return {
    label: 'Ditolak',
    cls: 'red',
  }
}

function BookingRuangan({ user }) {
  const isAdminRT =
    user.role === 'admin_rumahtangga' ||
    user.role === 'superadmin'

  const [booking, setBooking] = useState(dataAwal)

  const [form, setForm] = useState({
    ruangan: '',
    kegiatan: '',
    deskripsi: '',
    tanggal: '',
    mulai: '',
    selesai: '',
  })

  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  const bookingDitampilkan = isAdminRT
    ? booking
    : booking.filter(
        (item) => item.pemesan === user.nama
      )

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm({
      ...form,
      [name]: value,
    })
  }

  const resetForm = () => {
    setForm({
      ruangan: '',
      kegiatan: '',
      deskripsi: '',
      tanggal: '',
      mulai: '',
      selesai: '',
    })
  }

  const cekBentrok = () => {
    return booking.some((item) => {
      if (
        item.ruangan !== form.ruangan ||
        item.tanggal !== form.tanggal
      ) {
        return false
      }

      if (item.status === 'Ditolak') {
        return false
      }

      return (
        form.mulai < item.selesai &&
        form.selesai > item.mulai
      )
    })
  }

  const tambahBooking = (e) => {
    e.preventDefault()

    if (form.selesai <= form.mulai) {
      alert(
        'Jam selesai harus lebih besar dari jam mulai.'
      )
      return
    }

    if (cekBentrok()) {
      alert(
        'Ruangan sudah memiliki booking pada waktu tersebut.'
      )
      return
    }

    const baru = {
      id: Date.now(),
      ruangan: form.ruangan,
      pemesan: user.nama,
      bagian: user.bidang,
      kegiatan: form.kegiatan,
      deskripsi: form.deskripsi,
      tanggal: form.tanggal,
      mulai: form.mulai,
      selesai: form.selesai,
      status: 'Menunggu',
    }

    setBooking([...booking, baru])

    resetForm()
    setShowForm(false)
    setCurrentPage(0)

    alert(
      'Pengajuan booking berhasil dikirim.'
    )
  }

  const handleSetujui = (id) => {
    const bookingDipilih = booking.find(
      (item) => item.id === id
    )

    if (!bookingDipilih) return

    const bentrok = booking.some((item) => {
      if (
        item.id === id ||
        item.ruangan !== bookingDipilih.ruangan ||
        item.tanggal !== bookingDipilih.tanggal ||
        item.status !== 'Disetujui'
      ) {
        return false
      }

      return (
        bookingDipilih.mulai < item.selesai &&
        bookingDipilih.selesai > item.mulai
      )
    })

    if (bentrok) {
      alert(
        'Booking tidak dapat disetujui karena jadwal bentrok.'
      )
      return
    }

    setBooking(
      booking.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Disetujui',
            }
          : item
      )
    )
  }

  const handleTolak = (id) => {
    const alasan = window.prompt(
      'Masukkan alasan penolakan:'
    )

    if (alasan === null) return

    setBooking(
      booking.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'Ditolak',
              alasanTolak: alasan,
            }
          : item
      )
    )
  }

  const handleBatal = (id) => {
    if (
      !window.confirm(
        'Yakin ingin membatalkan booking ini?'
      )
    ) {
      return
    }

    setBooking(
      booking.filter((item) => item.id !== id)
    )
  }

  const totalDisetujui =
    bookingDitampilkan.filter(
      (item) => item.status === 'Disetujui'
    ).length

  const totalMenunggu =
    bookingDitampilkan.filter(
      (item) => item.status === 'Menunggu'
    ).length

  const totalDitolak =
    bookingDitampilkan.filter(
      (item) => item.status === 'Ditolak'
    ).length

  const ITEMS_PER_PAGE = 10

  const totalPages = Math.ceil(
    bookingDitampilkan.length / ITEMS_PER_PAGE
  )

  const startIndex =
    currentPage * ITEMS_PER_PAGE

  const dataPaginated =
    bookingDitampilkan.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    )

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-title">
        <h1>🏢 Booking Ruangan</h1>

        <p>
          Mengelola pengajuan pemesanan ruangan
          untuk kegiatan pegawai.
        </p>
      </div>

      {/* MODE USER */}
      {!isAdminRT && (
        <div className="guest-note">
          👁️ Mode pegawai: Anda dapat mengajukan
          booking dan melihat pengajuan booking Anda
          sendiri.
        </div>
      )}

      {/* SUMMARY */}
      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-icon">
            📋
          </div>

          <div className="stat-info">
            <h4>Total Booking</h4>

            <div className="stat-value">
              {bookingDitampilkan.length}
            </div>

            <div className="stat-desc">
              {isAdminRT
                ? 'Seluruh pengajuan booking'
                : 'Booking Anda'}
            </div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            ✅
          </div>

          <div className="stat-info">
            <h4>Disetujui</h4>

            <div className="stat-value">
              {totalDisetujui}
            </div>

            <div className="stat-desc">
              Booking disetujui
            </div>
          </div>
        </div>

        <div className="stat-card gold">
          <div className="stat-icon">
            ⏳
          </div>

          <div className="stat-info">
            <h4>Menunggu</h4>

            <div className="stat-value">
              {totalMenunggu}
            </div>

            <div className="stat-desc">
              Menunggu persetujuan
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            ❌
          </div>

          <div className="stat-info">
            <h4>Ditolak</h4>

            <div className="stat-value">
              {totalDitolak}
            </div>

            <div className="stat-desc">
              Booking ditolak
            </div>
          </div>
        </div>

      </div>

      {/* FORM AJUKAN BOOKING */}
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
              ➕ Ajukan Booking Ruangan
            </h3>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b',
                fontSize: '13px',
              }}
            >
              Ajukan pemesanan ruangan untuk
              kegiatan pegawai.
            </p>
          </div>

          <button
            type="button"
            className="btn"
            onClick={() => {
              setShowForm(!showForm)

              if (!showForm) {
                resetForm()
              }
            }}
          >
            {showForm
              ? 'Tutup'
              : '+ Ajukan Booking'}
          </button>

        </div>

        {showForm && (
          <form
            onSubmit={tambahBooking}
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop:
                '1px solid #e2e8f0',
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

              {/* PEMESAN */}
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
                  Pemesan
                </label>

                <input
                  type="text"
                  value={user.nama}
                  disabled
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border:
                      '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor:
                      '#f8fafc',
                    color: '#64748b',
                    fontSize: '12px',
                  }}
                />
              </div>

              {/* BAGIAN */}
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
                    border:
                      '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor:
                      '#f8fafc',
                    color: '#64748b',
                    fontSize: '12px',
                  }}
                />
              </div>

              {/* TANGGAL PENGAJUAN */}
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
                  Tanggal Pengajuan
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
                    border:
                      '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor:
                      '#f8fafc',
                    color: '#64748b',
                    fontSize: '12px',
                  }}
                />
              </div>

            </div>

            {/* DATA BOOKING */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '14px',
                marginBottom: '16px',
              }}
            >

              {/* RUANGAN */}
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
                  name="ruangan"
                  value={form.ruangan}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border:
                      '1px solid #cbd5e1',
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
                        key={ruangan}
                        value={ruangan}
                      >
                        {ruangan}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* KEGIATAN */}
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
                  Kegiatan
                </label>

                <input
                  type="text"
                  name="kegiatan"
                  placeholder="Contoh: Rapat Koordinasi"
                  value={form.kegiatan}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border:
                      '1px solid #cbd5e1',
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
                Deskripsi Kegiatan
              </label>

              <textarea
                name="deskripsi"
                placeholder="Jelaskan tujuan atau keperluan penggunaan ruangan..."
                value={form.deskripsi}
                onChange={handleChange}
                required
                rows="4"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 11px',
                  border:
                    '1px solid #cbd5e1',
                  borderRadius: '6px',
                  backgroundColor: '#fff',
                  color: '#334155',
                  fontSize: '12px',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* TANGGAL & WAKTU */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr 1fr',
                gap: '14px',
                marginBottom: '20px',
              }}
            >

              {/* TANGGAL */}
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
                  Tanggal Booking
                </label>

                <input
                  type="date"
                  name="tanggal"
                  value={form.tanggal}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border:
                      '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    color: '#334155',
                    fontSize: '12px',
                  }}
                />
              </div>

              {/* JAM MULAI */}
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
                  Jam Mulai
                </label>

                <input
                  type="time"
                  name="mulai"
                  value={form.mulai}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border:
                      '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    color: '#334155',
                    fontSize: '12px',
                  }}
                />
              </div>

              {/* JAM SELESAI */}
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
                  Jam Selesai
                </label>

                <input
                  type="time"
                  name="selesai"
                  value={form.selesai}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border:
                      '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    color: '#334155',
                    fontSize: '12px',
                  }}
                />
              </div>

            </div>

            {/* DATA OTOMATIS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
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
                  Status
                </label>

                <input
                  type="text"
                  value="Menunggu"
                  disabled
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border:
                      '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor:
                      '#f8fafc',
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
                  Keterangan
                </label>

                <input
                  type="text"
                  value="Menunggu persetujuan admin"
                  disabled
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '9px 11px',
                    border:
                      '1px solid #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor:
                      '#f8fafc',
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
                borderTop:
                  '1px solid #e2e8f0',
                paddingTop: '16px',
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
                  backgroundColor: '#fff',
                  border:
                    '1px solid #cbd5e1',
                }}
              >
                Batal
              </button>

              <button
                type="submit"
                className="btn"
              >
                Simpan Booking
              </button>

            </div>

          </form>
        )}

      </div>

      {/* TABLE */}
      <div className="card">

        <h3>
          {isAdminRT
            ? '📋 Seluruh Booking'
            : '📋 Booking Saya'}
        </h3>

        <div className="filter-info">
          Menampilkan {bookingDitampilkan.length}{' '}
          data booking
        </div>

        <div className="table-wrap">

          <table className="table">

            <thead>
              <tr>
                <th>No</th>
                <th>Ruangan</th>
                <th>Pemesan</th>
                <th>Bagian</th>
                <th>Kegiatan</th>
                <th>Deskripsi</th>
                <th>Tanggal</th>
                <th>Waktu</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>

            <tbody>

              {dataPaginated.length > 0 ? (

                dataPaginated.map(
                  (item, index) => {

                    const st =
                      statusBooking(
                        item.status
                      )

                    return (
                      <tr key={item.id}>

                        <td>
                          {startIndex +
                            index +
                            1}
                        </td>

                        <td>
                          <div className="cell-main">
                            {item.ruangan}
                          </div>
                        </td>

                        <td>
                          {item.pemesan}
                        </td>

                        <td>
                          {item.bagian}
                        </td>

                        <td>
                          {item.kegiatan}
                        </td>

                        <td
                          style={{
                            maxWidth: '220px',
                          }}
                        >
                          {item.deskripsi || '-'}
                        </td>

                        <td>
                          {formatTanggal(
                            item.tanggal
                          )}
                        </td>

                        <td>
                          {item.mulai} -{' '}
                          {item.selesai}
                        </td>

                        <td>

                          <span
                            className={`badge ${st.cls}`}
                          >
                            {st.label}
                          </span>

                          {item.status ===
                            'Ditolak' &&
                            item.alasanTolak && (
                              <div
                                style={{
                                  marginTop:
                                    '6px',
                                  color:
                                    '#991b1b',
                                  fontSize:
                                    '11px',
                                  maxWidth:
                                    '180px',
                                }}
                              >
                                {item.alasanTolak}
                              </div>
                            )}

                        </td>

                        <td>

                          <div
                            style={{
                              display: 'flex',
                              gap: '5px',
                              justifyContent:
                                'center',
                              alignItems:
                                'center',
                            }}
                          >

                            {/* ADMIN */}
                            {isAdminRT &&
                              item.status ===
                                'Menunggu' && (
                                <>

                                  <button
                                    type="button"
                                    className="btn"
                                    title="Setujui booking"
                                    onClick={() =>
                                      handleSetujui(
                                        item.id
                                      )
                                    }
                                    style={{
                                      padding:
                                        '5px 8px',
                                      fontSize:
                                        '12px',
                                    }}
                                  >
                                    ✓
                                  </button>

                                  <button
                                    type="button"
                                    className="btn-danger"
                                    title="Tolak booking"
                                    onClick={() =>
                                      handleTolak(
                                        item.id
                                      )
                                    }
                                    style={{
                                      padding:
                                        '5px 8px',
                                      fontSize:
                                        '12px',
                                    }}
                                  >
                                    ✕
                                  </button>

                                </>
                              )}

                            {/* PEGAWAI */}
                            {!isAdminRT &&
                              item.status ===
                                'Menunggu' &&
                              item.pemesan ===
                                user.nama && (
                                <button
                                  type="button"
                                  className="btn-danger"
                                  title="Batalkan booking"
                                  onClick={() =>
                                    handleBatal(
                                      item.id
                                    )
                                  }
                                  style={{
                                    padding:
                                      '5px 8px',
                                    fontSize:
                                      '12px',
                                  }}
                                >
                                  ✕
                                </button>
                              )}

                          </div>

                        </td>

                      </tr>
                    )
                  }
                )

              ) : (

                <tr>
                  <td
                    colSpan="10"
                    style={{
                      textAlign: 'center',
                      padding: '30px',
                    }}
                  >
                    Belum ada data booking.
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
            type="button"
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
              fontWeight: 500,
              color: '#64748b',
            }}
          >
            {currentPage + 1} /{' '}
            {Math.max(1, totalPages)}
          </span>

          <button
            type="button"
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
              border:
                '1px solid #cbd5e1',
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

export default BookingRuangan