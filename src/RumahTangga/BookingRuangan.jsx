import { useEffect, useState } from 'react'

const API = 'http://localhost:8000/api'

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

  const [booking, setBooking] = useState([])
  const [daftarRuangan, setDaftarRuangan] = useState([])

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    ruangan_id: '',
    kegiatan: '',
    jenis_pertemuan: 'Offline',
    deskripsi: '',
    tanggal: '',
    mulai: '',
    selesai: '',
  })

  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  const [kataKunci, setKataKunci] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua')

  const muatData = async () => {
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch(API + '/booking_ruangan')
      const json = await res.json()
      setBooking(json?.data || [])
    } catch (err) {
      setErrorMsg('Gagal memuat data booking ruangan.')
    } finally {
      setLoading(false)
    }
  }

  const muatRuangan = async () => {
    try {
      const res = await fetch(API + '/ruangan')
      const json = await res.json()
      setDaftarRuangan(json?.data || [])
    } catch (err) {
      // dropdown ruangan tetap kosong kalau gagal, error utama ditangani muatData
    }
  }

  useEffect(() => {
    muatData()
    muatRuangan()
  }, [])

  const bookingMilikSaya = isAdminRT
    ? booking
    : booking.filter(
        (item) => item.pemesan === user.nama
      )

  const bookingDitampilkan = bookingMilikSaya
    .filter((item) =>
      filterStatus === 'Semua'
        ? true
        : item.status === filterStatus
    )
    .filter((item) => {
      if (!kataKunci.trim()) return true

      const q = kataKunci.trim().toLowerCase()

      return (
        (item.ruangan || '')
          .toLowerCase()
          .includes(q) ||
        (item.pemesan || '')
          .toLowerCase()
          .includes(q) ||
        (item.kegiatan || '')
          .toLowerCase()
          .includes(q) ||
        (item.bagian || '')
          .toLowerCase()
          .includes(q)
      )
    })

  const handleKataKunciChange = (e) => {
    setKataKunci(e.target.value)
    setCurrentPage(0)
  }

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value)
    setCurrentPage(0)
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm({
      ...form,
      [name]: value,
    })
  }

  const resetForm = () => {
    setForm({
      ruangan_id: '',
      kegiatan: '',
      jenis_pertemuan: 'Offline',
      deskripsi: '',
      tanggal: '',
      mulai: '',
      selesai: '',
    })
  }

  const tambahBooking = async (e) => {
    e.preventDefault()

    if (form.selesai <= form.mulai) {
      alert(
        'Jam selesai harus lebih besar dari jam mulai.'
      )
      return
    }

    setSubmitting(true)

    const payload = {
      ruangan_id: form.ruangan_id,
      pemesan: user.nama,
      bagian: user.bidang,
      kegiatan: form.kegiatan,
      jenis_pertemuan: form.jenis_pertemuan,
      deskripsi: form.deskripsi,
      tanggal: form.tanggal,
      mulai: form.mulai,
      selesai: form.selesai,
    }

    try {
      const res = await fetch(API + '/booking_ruangan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) {
        alert(
          json.message ||
            'Ruangan sudah memiliki booking pada waktu tersebut.'
        )
        return
      }

      await muatData()

      resetForm()
      setShowForm(false)
      setCurrentPage(0)

      alert('Pengajuan booking berhasil dikirim.')
    } catch (err) {
      alert('Gagal mengirim pengajuan booking.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSetujui = async (id) => {
    try {
      const res = await fetch(
        API + '/booking_ruangan/' + id + '/setujui',
        { method: 'PUT' }
      )

      const json = await res.json()

      if (!res.ok) {
        alert(
          json.message ||
            'Booking tidak dapat disetujui karena jadwal bentrok.'
        )
        return
      }

      await muatData()
    } catch (err) {
      alert('Gagal menyetujui booking.')
    }
  }

  const handleTolak = async (id) => {
    const alasan = window.prompt(
      'Masukkan alasan penolakan:'
    )

    if (alasan === null || alasan.trim() === '') return

    try {
      await fetch(API + '/booking_ruangan/' + id + '/tolak', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alasan_tolak: alasan }),
      })
      await muatData()
    } catch (err) {
      alert('Gagal menolak booking.')
    }
  }

  const handleBatal = async (id) => {
    if (
      !window.confirm(
        'Yakin ingin membatalkan booking ini?'
      )
    ) {
      return
    }

    try {
      await fetch(API + '/booking_ruangan/' + id, {
        method: 'DELETE',
      })
      await muatData()
    } catch (err) {
      alert('Gagal membatalkan booking.')
    }
  }

  const totalDisetujui =
    bookingMilikSaya.filter(
      (item) => item.status === 'Disetujui'
    ).length

  const totalMenunggu =
    bookingMilikSaya.filter(
      (item) => item.status === 'Menunggu'
    ).length

  const totalDitolak =
    bookingMilikSaya.filter(
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
          Memuat data booking ruangan...
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
              {bookingMilikSaya.length}
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
              Pesan ruangan untuk rapat, pelatihan,
              atau kegiatan kantor lainnya.
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
                  Pemesan{' '}
                  <span
                    style={{
                      fontWeight: 400,
                      color: '#94a3b8',
                      textTransform: 'none',
                    }}
                  >
                    (otomatis)
                  </span>
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
                      '1px dashed #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor:
                      '#f1f5f9',
                    color: '#94a3b8',
                    fontSize: '12px',
                    cursor: 'not-allowed',
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
                  Bagian{' '}
                  <span
                    style={{
                      fontWeight: 400,
                      color: '#94a3b8',
                      textTransform: 'none',
                    }}
                  >
                    (otomatis)
                  </span>
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
                      '1px dashed #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor:
                      '#f1f5f9',
                    color: '#94a3b8',
                    fontSize: '12px',
                    cursor: 'not-allowed',
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
                  Tanggal Pengajuan{' '}
                  <span
                    style={{
                      fontWeight: 400,
                      color: '#94a3b8',
                      textTransform: 'none',
                    }}
                  >
                    (otomatis)
                  </span>
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
                      '1px dashed #cbd5e1',
                    borderRadius: '6px',
                    backgroundColor:
                      '#f1f5f9',
                    color: '#94a3b8',
                    fontSize: '12px',
                    cursor: 'not-allowed',
                  }}
                />
              </div>

            </div>

            {/* DATA BOOKING */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr 1fr',
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
                  name="ruangan_id"
                  value={form.ruangan_id}
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
                        key={ruangan.id}
                        value={ruangan.id}
                      >
                        {ruangan.nama}
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

              {/* JENIS PERTEMUAN */}
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
                  Jenis Pertemuan
                </label>

                <select
                  name="jenis_pertemuan"
                  value={form.jenis_pertemuan}
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
                  <option value="Offline">
                    Offline
                  </option>
                  <option value="Online">
                    Online
                  </option>
                </select>
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

            {/* CATATAN STATUS */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                marginBottom: '20px',
                borderRadius: '8px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontSize: '12px',
              }}
            >
              ⏳ Booking ini akan berstatus{' '}
              <strong>Menunggu</strong> hingga
              disetujui oleh Admin Rumah Tangga.
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
                disabled={submitting}
                style={{
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                {submitting
                  ? 'Menyimpan...'
                  : 'Simpan Booking'}
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

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            alignItems: 'center',
            margin: '12px 0 16px',
          }}
        >
          <input
            type="text"
            placeholder="Cari ruangan, pemesan, kegiatan, atau bagian..."
            value={kataKunci}
            onChange={handleKataKunciChange}
            style={{
              flex: '1 1 240px',
              minWidth: '200px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
            }}
          />

          <select
            value={filterStatus}
            onChange={handleFilterStatusChange}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              backgroundColor: '#fff',
              color: '#334155',
            }}
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>

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
                <th>Jenis</th>
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

                        <td>
                          <span
                            className={`badge ${
                              item.jenis_pertemuan ===
                              'Online'
                                ? 'green'
                                : 'yellow'
                            }`}
                          >
                            {item.jenis_pertemuan ||
                              'Offline'}
                          </span>
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
                            item.alasan_tolak && (
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
                                {item.alasan_tolak}
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
                    colSpan="11"
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