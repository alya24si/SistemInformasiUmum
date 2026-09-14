import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

const API = 'http://localhost:8000/api'

/* ========================================================= */
/* ✨ KONVERSI WAKTU: input dalam MENIT                       */
/*    1 hari kerja = 8.5 jam = 510 menit                     */
/* ========================================================= */
const MENIT_PER_HARI = 510

const menitKeHari = (menit) => menit / MENIT_PER_HARI
const bulatkan2 = (n) => Math.round(n * 100) / 100

const formatDurasi = (menit) => {
  const hari = Math.floor(menit / MENIT_PER_HARI)
  const sisa = menit - hari * MENIT_PER_HARI
  const jam = Math.floor(sisa / 60)
  const mnt = sisa % 60
  const bagian = []
  if (hari > 0) bagian.push(`${hari} hari`)
  if (jam > 0) bagian.push(`${jam} jam`)
  if (mnt > 0 || bagian.length === 0) bagian.push(`${mnt} menit`)
  return bagian.join(' ')
}

/* ========================================================= */
/* ✨ BATAS WARNING (dalam HARI KERJA, sesuai aturan gambar)  */
/*    3 hari  -> teguran lisan          (WARNING 1)           */
/*    4 hari+ -> teguran tertulis /     (WARNING 2)           */
/*               pernyataan tidak puas                        */
/* ========================================================= */
const BATAS_WARNING1 = 3
const BATAS_WARNING2 = 4

// ✨ Kalimat sanksi PERSIS seperti pada gambar (sesuai rentang hari)
const kalimatSanksi = (hari) => {
  if (hari >= 7)
    return 'Pernyataan tidak puas secara tertulis bagi PNS yang tidak Masuk Kerja tanpa alasan yang sah secara kumulatif selama 7 (tujuh) sampai dengan 10 (sepuluh) hari kerja dalam 1 (satu) tahun.'
  if (hari >= 4)
    return 'Teguran tertulis bagi PNS yang tidak Masuk Kerja tanpa alasan yang sah secara kumulatif selama 4 (empat) sampai dengan 6 (enam) hari kerja dalam 1 (satu) tahun.'
  return 'Teguran lisan bagi PNS yang tidak Masuk Kerja tanpa alasan yang sah secara kumulatif selama 3 (tiga) hari kerja dalam 1 (satu) tahun.'
}

const cariKolom = (row, ...kemungkinan) => {
  for (const key of Object.keys(row)) {
    const k = key.toLowerCase().replace(/\s+/g, '')
    for (const nama of kemungkinan) {
      if (k === nama.toLowerCase().replace(/\s+/g, '')) return row[key]
    }
  }
  return 0
}

function Pelanggaran({ user }) {
  const isAdmin = user.role === 'admin_kepegawaian' || user.role === 'superadmin'

  const [dataPelanggaran, setDataPelanggaran] = useState([])
  const [uploadInfo, setUploadInfo] = useState('')
  const [showWarning, setShowWarning] = useState(true)
  const [currentPagePelanggaran, setCurrentPagePelanggaran] = useState(0)
  const [currentPageRiwayat, setCurrentPageRiwayat] = useState(0)

  const [showFormPegawai, setShowFormPegawai] = useState(false)
  const [formPegawai, setFormPegawai] = useState({ nama: '', nip: '', password: '' })
  const [loadingTambah, setLoadingTambah] = useState(false)
  const [errorTambah, setErrorTambah] = useState('')
  const [infoTambah, setInfoTambah] = useState('')

  // ✨ State: simpan nilai input menit per-baris saat sedang mengetik
  const [inputMenit, setInputMenit] = useState({})

  // ✨ State: simpan value dropdown "Tambah..." per-baris
  const [dropdownTambah, setDropdownTambah] = useState({})

  const muatData = async () => {
    const res = await fetch(API + '/pelanggaran')
    const json = await res.json()
    if (json.success) {
      setDataPelanggaran(
        json.data.map((d) => ({
          ...d,
          tk: Number(d.tk),
          total: Number(d.total),
          tl1: Number(d.tl1),
          tl2: Number(d.tl2),
          tl3: Number(d.tl3),
          psw1: Number(d.psw1),
          psw2: Number(d.psw2),
          psw3: Number(d.psw3),
          psw4: Number(d.psw4),
          riwayat: (d.riwayat || []).map((r) => ({
            ...r,
            tk: Number(r.tk),
            total: Number(r.total),
            tl1: Number(r.tl1),
            tl2: Number(r.tl2),
            tl3: Number(r.tl3),
            psw1: Number(r.psw1),
            psw2: Number(r.psw2),
            psw3: Number(r.psw3),
            psw4: Number(r.psw4),
          })),
        }))
      )
    }
  }

  useEffect(() => {
    muatData()
  }, [])

  const catatanku = !isAdmin ? dataPelanggaran.find((d) => d.nip === user.nip) : null
  const hariAku = catatanku ? menitKeHari(catatanku.total) : 0

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws)

      let masuk = 0
      let diskip = 0
      const waktu = new Date().toLocaleString('id-ID')
      const hasil = []

      rows.forEach((r) => {
        const nip = String(cariKolom(r, 'NIP', 'nip')).trim()
        const nama = String(cariKolom(r, 'NAMA', 'Nama', 'nama') || '').trim()
        const tk = Number(cariKolom(r, 'TK', 'tk')) || 0
        const tl1 = Number(cariKolom(r, 'TL1', 'TL 1')) || 0
        const tl2 = Number(cariKolom(r, 'TL2', 'TL 2')) || 0
        const tl3 = Number(cariKolom(r, 'TL3', 'TL 3')) || 0
        const psw1 = Number(cariKolom(r, 'PSW1', 'PSW 1')) || 0
        const psw2 = Number(cariKolom(r, 'PSW2', 'PSW 2')) || 0
        const psw3 = Number(cariKolom(r, 'PSW3', 'PSW 3')) || 0
        const psw4 = Number(cariKolom(r, 'PSW4', 'PSW 4')) || 0
        const total = tk + tl1 + tl2 + tl3 + psw1 + psw2 + psw3 + psw4

        if (!nip) return
        if (total === 0) {
          diskip++
          return
        }

        masuk++
        hasil.push({
          nip, nama: nama || nip, tk,
          tl1, tl2, tl3, psw1, psw2, psw3, psw4, total,
          tanggal: waktu,
          sumber: `Upload ${file.name}`,
        })
      })

      if (hasil.length > 0) {
        await fetch(API + '/pelanggaran/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: hasil }),
        })
        muatData()
      }

      setUploadInfo(`✅ ${masuk} pelanggar diproses, ${diskip} pegawai bersih dilewati.`)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  // ✨ Admin update total MENIT manual (input per-menit)
  const updateJumlah = (id, nilai) => {
    const angka = Number(nilai) || 0
    setDataPelanggaran(
      dataPelanggaran.map((d) =>
        d.id === id ? { ...d, total: angka } : d
      )
    )
    fetch(API + '/pelanggaran/' + id + '/jumlah', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jumlah: angka }),
    })
  }

  // ✨ Tambahkan menit ke total existing (dari dropdown)
  const tambahMenit = (id, menitTambah) => {
    if (!menitTambah || menitTambah === '') return
    const current = dataPelanggaran.find((d) => d.id === id)?.total || 0
    const baru = current + Number(menitTambah)

    setDataPelanggaran(
      dataPelanggaran.map((d) =>
        d.id === id ? { ...d, total: baru } : d
      )
    )

    fetch(API + '/pelanggaran/' + id + '/jumlah', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jumlah: baru }),
    })

    setDropdownTambah((prev) => ({ ...prev, [id]: '' }))
  }

  const tambahPegawai = async (e) => {
    e.preventDefault()
    setErrorTambah('')
    setInfoTambah('')
    setLoadingTambah(true)

    try {
      const res = await fetch(API + '/pelanggaran/tambah-pegawai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPegawai),
      })
      const json = await res.json()

      if (json.success) {
        setInfoTambah(`✅ ${formPegawai.nama} (NIP: ${formPegawai.nip}) berhasil didaftarkan!`)
        setFormPegawai({ nama: '', nip: '', password: '' })
      } else {
        setErrorTambah(json.message || 'Gagal menambahkan pegawai.')
      }
    } catch {
      setErrorTambah('Tidak bisa terhubung ke server.')
    } finally {
      setLoadingTambah(false)
    }
  }

  const hapus = async (id) => {
    if (window.confirm('Yakin ingin menghapus catatan pelanggaran ini?')) {
      await fetch(API + '/pelanggaran/' + id, { method: 'DELETE' })
      muatData()
    }
  }

  // ✨ Status badge berbasis HARI KERJA (konversi dari menit)
  const statusBadge = (totalMenit) => {
    const hari = menitKeHari(totalMenit)
    return hari >= BATAS_WARNING2
      ? { backgroundColor: '#450a0a', color: '#fecaca', label: '🚨 WARNING 2' }
      : hari >= BATAS_WARNING1
        ? { backgroundColor: '#fee2e2', color: '#991b1b', label: '⚠️ WARNING 1' }
        : { backgroundColor: '#fef3c7', color: '#92400e', label: 'Pantauan' }
  }

  const totalMenitSemua = dataPelanggaran.reduce((a, b) => a + b.total, 0)
  const jumlahWarning1 = dataPelanggaran.filter((d) => {
    const h = menitKeHari(d.total)
    return h >= BATAS_WARNING1 && h < BATAS_WARNING2
  }).length
  const jumlahWarning2 = dataPelanggaran.filter((d) => menitKeHari(d.total) >= BATAS_WARNING2).length

  return (
    <div style={pageStyle}>
      {/* 🚨 WARNING 2 (>= 4 hari kerja) */}
      {!isAdmin && catatanku && showWarning && hariAku >= BATAS_WARNING2 && (
        <div className="warning-overlay">
          <div className="warning-card warning-card-2">
            <div className="warning-icon">🚨</div>
            <div className="warning-title">WARNING 2!</div>
            <div className="warning-hours">{bulatkan2(hariAku)} HARI KERJA</div>
            <p className="warning-text">
              <b>{kalimatSanksi(hariAku)}</b>
            </p>
            <button className="warning-btn" onClick={() => setShowWarning(false)}>SAYA MENGERTI</button>
          </div>
        </div>
      )}

      {/* ⚠️ WARNING 1 (>= 3 hari kerja) */}
      {!isAdmin && catatanku && showWarning && hariAku >= BATAS_WARNING1 && hariAku < BATAS_WARNING2 && (
        <div className="warning-overlay">
          <div className="warning-card">
            <div className="warning-icon">⚠️</div>
            <div className="warning-title">WARNING 1!</div>
            <div className="warning-hours">{bulatkan2(hariAku)} HARI KERJA</div>
            <p className="warning-text">
              <b>{kalimatSanksi(hariAku)}</b>
            </p>
            <button className="warning-btn" onClick={() => setShowWarning(false)}>SAYA MENGERTI</button>
          </div>
        </div>
      )}

      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Pelanggaran</h1>
          <p style={subtitleStyle}>
            {isAdmin
              ? 'Upload Excel rekap pelanggaran (dalam MENIT), lalu edit kolom "Total Menit" sesuai keputusan admin. 510 menit = 1 hari kerja.'
              : 'Data pelanggaran kehadiran pribadi Anda (dalam menit & hari kerja).'}
          </p>
        </div>
      </div>

      {!isAdmin && (
        <div style={privacyNote}>🔒 Data bersifat pribadi — hanya Anda yang dapat melihat catatan ini.</div>
      )}

      {isAdmin && (
        <div style={cardStyle}>
          <div style={sectionHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={sectionTitle}>📥 Upload Excel Pelanggaran</h2>
                <p style={sectionSubtitle}>
                  Format kolom: <b>NAMA | NIP | TK | TL 1 | TL 2 | TL 3 | PSW 1 | PSW 2 | PSW 3 | PSW 4</b> (satuan <b>menit</b>).
                  Setelah upload, edit kolom <b>Total Menit</b> di tabel bawah untuk nilai final.
                </p>
              </div>
              <button
                onClick={() => { setShowFormPegawai(!showFormPegawai); setErrorTambah(''); setInfoTambah('') }}
                style={btnTambah}
              >
                {showFormPegawai ? '✖️ Tutup Form' : '➕ Tambah Pegawai Baru'}
              </button>
            </div>
          </div>

          {showFormPegawai && (
            <form onSubmit={tambahPegawai} style={{ padding: '20px', backgroundColor: '#fef9e7', borderBottom: '1px solid #fde68a' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#92400e' }}>
                👤 Daftarkan Pegawai Baru
              </h3>
              {errorTambah && <div style={errorStyle}>{errorTambah}</div>}
              {infoTambah && <div style={infoStyle}>{infoTambah}</div>}
              <div style={formGrid}>
                <div>
                  <label style={labelStyle}>Nama Lengkap</label>
                  <input type="text" value={formPegawai.nama} onChange={(e) => setFormPegawai({ ...formPegawai, nama: e.target.value })} required placeholder="Contoh: Budi Santoso" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>NIP (jadi username login)</label>
                  <input type="text" value={formPegawai.nip} onChange={(e) => setFormPegawai({ ...formPegawai, nip: e.target.value })} required placeholder="18 digit angka" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Password Awal</label>
                  <input type="text" value={formPegawai.password} onChange={(e) => setFormPegawai({ ...formPegawai, password: e.target.value })} required minLength={6} placeholder="Min 6 karakter" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="submit" disabled={loadingTambah} style={btnSimpanPegawai}>
                  {loadingTambah ? 'Menyimpan...' : '💾 Simpan Pegawai'}
                </button>
                <button type="button" onClick={() => setShowFormPegawai(false)} style={btnBatalPegawai}>
                  Batal
                </button>
              </div>
            </form>
          )}

          <div style={filterGrid}>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={inputStyle} />
            {uploadInfo && <div style={{ ...privacyNote, marginBottom: 0 }}>{uploadInfo}</div>}
          </div>
        </div>
      )}

      <div style={summaryGrid}>
        {isAdmin && <SummaryCard title="Pegawai Terdeteksi" value={dataPelanggaran.length} />}
         <SummaryCard
          title={isAdmin ? 'Total Hari Kerja Terlambat' : 'Hari Kerja Terlambat Anda'}
          value={`${bulatkan2(menitKeHari(isAdmin ? totalMenitSemua : (catatanku ? catatanku.total : 0)))} hari`}
        />
        {isAdmin && <SummaryCard title="Pegawai WARNING 1" value={jumlahWarning1} />}
        {isAdmin && <SummaryCard title="Pegawai WARNING 2" value={jumlahWarning2} />}
        {!isAdmin && <SummaryCard title="Batas Warning" value={`${BATAS_WARNING1} hari (W1) • ${BATAS_WARNING2} hari (W2)`} />}
      </div>

      <div style={cardStyle}>
        <div style={sectionHeader}>
          <div>
            <h2 style={sectionTitle}>{isAdmin ? 'Daftar Pegawai yang Melakukan Pelanggaran' : 'Riwayat Pelanggaran Saya'}</h2>
            <p style={sectionSubtitle}>
              {isAdmin
                ? 'Edit kolom "Total Menit" atau gunakan dropdown "Tambah..." untuk menambah menit ke akumulasi yang ada.'
                : 'Rincian pelanggaran Anda dari setiap upload.'}
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {isAdmin ? (
            <>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>NIP</th>
                    <th style={thStyle}>Nama</th>
                    <th style={thStyle}>TK</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>TL 1</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>TL 2</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>TL 3</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>PSW 1</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>PSW 2</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>PSW 3</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>PSW 4</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Total Menit</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const ITEMS_PER_PAGE = 10
                    const startIndex = currentPagePelanggaran * ITEMS_PER_PAGE
                    const endIndex = startIndex + ITEMS_PER_PAGE
                    const dataPaginated = dataPelanggaran.slice(startIndex, endIndex)

                    if (dataPaginated.length === 0) {
                      return (
                        <tr>
                          <td colSpan="13" style={emptyStyle}>
                            Belum ada data pelanggaran. Upload Excel untuk memulai. 📥
                          </td>
                        </tr>
                      )
                    }

                    return (
                      <>
                        {dataPaginated.map((d) => {
                          const st = statusBadge(d.total)
                          const nilaiDisplay =
                            inputMenit[d.id] !== undefined
                              ? inputMenit[d.id]
                              : String(d.total)

                          return (
                            <tr key={d.id}>
                              <td style={tdStyle}>{d.nip}</td>
                              <td style={tdStyle}><strong>{d.nama}</strong></td>
                              <td style={tdStyle}>{d.tk}</td>
                              <td style={{ ...tdStyle, textAlign: 'center', color: d.tl1 > 0 ? '#dc2626' : '#94a3b8', fontWeight: d.tl1 > 0 ? 700 : 400 }}>{d.tl1}</td>
                              <td style={{ ...tdStyle, textAlign: 'center', color: d.tl2 > 0 ? '#dc2626' : '#94a3b8', fontWeight: d.tl2 > 0 ? 700 : 400 }}>{d.tl2}</td>
                              <td style={{ ...tdStyle, textAlign: 'center', color: d.tl3 > 0 ? '#dc2626' : '#94a3b8', fontWeight: d.tl3 > 0 ? 700 : 400 }}>{d.tl3}</td>
                              <td style={{ ...tdStyle, textAlign: 'center', color: d.psw1 > 0 ? '#dc2626' : '#94a3b8', fontWeight: d.psw1 > 0 ? 700 : 400 }}>{d.psw1}</td>
                              <td style={{ ...tdStyle, textAlign: 'center', color: d.psw2 > 0 ? '#dc2626' : '#94a3b8', fontWeight: d.psw2 > 0 ? 700 : 400 }}>{d.psw2}</td>
                              <td style={{ ...tdStyle, textAlign: 'center', color: d.psw3 > 0 ? '#dc2626' : '#94a3b8', fontWeight: d.psw3 > 0 ? 700 : 400 }}>{d.psw3}</td>
                              <td style={{ ...tdStyle, textAlign: 'center', color: d.psw4 > 0 ? '#dc2626' : '#94a3b8', fontWeight: d.psw4 > 0 ? 700 : 400 }}>{d.psw4}</td>
                              <td style={{ ...tdStyle, textAlign: 'center', padding: '8px' }}>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={nilaiDisplay}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(/[^\d]/g, '')
                                    const bersih = raw === '' ? '' : String(Number(raw))
                                    setInputMenit({ ...inputMenit, [d.id]: bersih })
                                  }}
                                  onBlur={() => {
                                    if (inputMenit[d.id] !== undefined) {
                                      updateJumlah(d.id, inputMenit[d.id])
                                      setInputMenit((prev) => {
                                        const baru = { ...prev }
                                        delete baru[d.id]
                                        return baru
                                      })
                                    }
                                  }}
                                  style={{
                                    width: '90px',
                                    padding: '8px 10px',
                                    border: '2px solid #3b82f6',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    color: '#dc2626',
                                    textAlign: 'center',
                                    backgroundColor: '#eff6ff',
                                    outline: 'none',
                                  }}
                                />
                                <div style={{ fontSize: '10px', color: '#1e40af', fontWeight: 700, marginTop: '4px' }}>
                                  = {bulatkan2(menitKeHari(d.total))} hari
                                </div>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>{formatDurasi(d.total)}</div>

                                {/* ✨ DROPDOWN TAMBAH MENIT (kelipatan 5) */}
                                <select
                                  value={dropdownTambah[d.id] || ''}
                                  onChange={(e) => tambahMenit(d.id, e.target.value)}
                                  style={{
                                    marginTop: '6px',
                                    width: '90px',
                                    padding: '4px 4px',
                                    border: '1px solid #16a34a',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    color: '#166534',
                                    backgroundColor: '#f0fdf4',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                  }}
                                >
                                  <option value="">+ Tambah...</option>
                                  <option value="5">+ 5 menit</option>
                                  <option value="10">+ 10 menit</option>
                                  <option value="15">+ 15 menit</option>
                                  <option value="20">+ 20 menit</option>
                                  <option value="25">+ 25 menit</option>
                                  <option value="30">+ 30 menit</option>
                                  <option value="45">+ 45 menit</option>
                                  <option value="60">+ 60 menit (1 jam)</option>
                                  <option value="90">+ 90 menit (1.5 jam)</option>
                                  <option value="120">+ 120 menit (2 jam)</option>
                                </select>
                              </td>
                              <td style={tdStyle}><span style={{ ...badgeStyle, ...st }}>{st.label}</span></td>
                              <td style={tdStyle}><button style={btnHapus} onClick={() => hapus(d.id)}>🗑 Hapus</button></td>
                            </tr>
                          )
                        })}
                      </>
                    )
                  })()}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', alignItems: 'center', paddingBottom: '10px' }}>
                <button
                  onClick={() => setCurrentPagePelanggaran(prev => Math.max(0, prev - 1))}
                  disabled={currentPagePelanggaran === 0}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPagePelanggaran === 0 ? 'not-allowed' : 'pointer', opacity: currentPagePelanggaran === 0 ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
                >
                  Back
                </button>
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>
                  {currentPagePelanggaran + 1} / {Math.max(1, Math.ceil(dataPelanggaran.length / 10))}
                </span>
                <button
                  onClick={() => setCurrentPagePelanggaran(prev => (prev + 1 < Math.ceil(dataPelanggaran.length / 10) ? prev + 1 : prev))}
                  disabled={currentPagePelanggaran + 1 >= Math.ceil(dataPelanggaran.length / 10)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPagePelanggaran + 1 >= Math.ceil(dataPelanggaran.length / 10) ? 'not-allowed' : 'pointer', opacity: currentPagePelanggaran + 1 >= Math.ceil(dataPelanggaran.length / 10) ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
                >
                  Next
                </button>
              </div>
            </>
          ) : catatanku ? (
            <>
              <div style={{ padding: '16px 20px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: 600, marginBottom: '4px' }}>AKUMULASI KETERLAMBATAN ANDA</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#dc2626' }}>{bulatkan2(hariAku)} hari kerja</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    = {formatDurasi(catatanku.total)} ({catatanku.total} menit)
                  </div>
                </div>
                <div>
                  <span style={{ ...badgeStyle, ...statusBadge(catatanku.total), fontSize: '13px', padding: '8px 14px' }}>
                    {statusBadge(catatanku.total).label}
                  </span>
                </div>
              </div>

              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>No</th>
                    <th style={thStyle}>Waktu</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>TK</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>TL 1</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>TL 2</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>TL 3</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>PSW 1</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>PSW 2</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>PSW 3</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>PSW 4</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Akumulasi</th>
                    <th style={thStyle}>Sumber</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const ITEMS_PER_PAGE = 10
                    const startIndex = currentPageRiwayat * ITEMS_PER_PAGE
                    const endIndex = startIndex + ITEMS_PER_PAGE
                    const dataPaginated = catatanku.riwayat.slice(startIndex, endIndex)

                    return (
                      <>
                        {dataPaginated.map((r, i) => (
                          <tr key={r.id}>
                            <td style={tdStyle}>{startIndex + i + 1}</td>
                            <td style={tdStyle}>{r.tanggal}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', color: r.tk > 0 ? '#dc2626' : '#94a3b8', fontWeight: r.tk > 0 ? 700 : 400 }}>{r.tk}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', color: r.tl1 > 0 ? '#dc2626' : '#94a3b8', fontWeight: r.tl1 > 0 ? 700 : 400 }}>{r.tl1}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', color: r.tl2 > 0 ? '#dc2626' : '#94a3b8', fontWeight: r.tl2 > 0 ? 700 : 400 }}>{r.tl2}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', color: r.tl3 > 0 ? '#dc2626' : '#94a3b8', fontWeight: r.tl3 > 0 ? 700 : 400 }}>{r.tl3}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', color: r.psw1 > 0 ? '#dc2626' : '#94a3b8', fontWeight: r.psw1 > 0 ? 700 : 400 }}>{r.psw1}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', color: r.psw2 > 0 ? '#dc2626' : '#94a3b8', fontWeight: r.psw2 > 0 ? 700 : 400 }}>{r.psw2}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', color: r.psw3 > 0 ? '#dc2626' : '#94a3b8', fontWeight: r.psw3 > 0 ? 700 : 400 }}>{r.psw3}</td>
                            <td style={{ ...tdStyle, textAlign: 'center', color: r.psw4 > 0 ? '#dc2626' : '#94a3b8', fontWeight: r.psw4 > 0 ? 700 : 400 }}>{r.psw4}</td>
                                                        <td style={{ ...tdStyle, textAlign: 'center' }}>
                              <div style={{ fontWeight: 700, color: '#dc2626' }}>{bulatkan2(menitKeHari(catatanku.total))} hari</div>
                              <div style={{ fontSize: '10px', color: '#94a3b8' }}>{formatDurasi(catatanku.total)}</div>
                            </td>
                            <td style={tdStyle}>{r.sumber}</td>
                          </tr>
                        ))}
                      </>
                    )
                  })()}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', alignItems: 'center', paddingBottom: '10px' }}>
                <button
                  onClick={() => setCurrentPageRiwayat(prev => Math.max(0, prev - 1))}
                  disabled={currentPageRiwayat === 0}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPageRiwayat === 0 ? 'not-allowed' : 'pointer', opacity: currentPageRiwayat === 0 ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
                >
                  Back
                </button>
                <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>
                  {currentPageRiwayat + 1} / {Math.max(1, Math.ceil(catatanku.riwayat.length / 10))}
                </span>
                <button
                  onClick={() => setCurrentPageRiwayat(prev => (prev + 1 < Math.ceil(catatanku.riwayat.length / 10) ? prev + 1 : prev))}
                  disabled={currentPageRiwayat + 1 >= Math.ceil(catatanku.riwayat.length / 10)}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPageRiwayat + 1 >= Math.ceil(catatanku.riwayat.length / 10) ? 'not-allowed' : 'pointer', opacity: currentPageRiwayat + 1 >= Math.ceil(catatanku.riwayat.length / 10) ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div style={emptyStyle}>Tidak ada pelanggaran tercatat atas nama Anda. Pertahankan! 🎉</div>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ title, value }) {
  return (
    <div style={summaryCard}>
      <div style={summaryTitle}>{title}</div>
      <div style={summaryValue}>{value}</div>
    </div>
  )
}

const pageStyle = { padding: '32px', minHeight: '100%', backgroundColor: '#f5f8fc', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }
const headerStyle = { marginBottom: '24px' }
const titleStyle = { margin: 0, fontSize: '30px', color: '#102a43' }
const subtitleStyle = { margin: '7px 0 0', color: '#64748b', fontSize: '15px' }
const privacyNote = { backgroundColor: '#eaf2ff', border: '1px solid #bcd4f0', color: '#005ca9', fontSize: '13px', fontWeight: 600, padding: '12px 16px', borderRadius: '10px', marginBottom: '20px' }
const cardStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '22px', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }
const filterGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', padding: '20px' }
const labelStyle = { display: 'block', marginBottom: '7px', color: '#334155', fontSize: '13px', fontWeight: 600 }
const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#fff', color: '#334155', fontSize: '13px' }
const summaryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '22px' }
const summaryCard = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }
const summaryTitle = { color: '#94a3b8', fontSize: '12px', fontWeight: 600 }
const summaryValue = { marginTop: '5px', color: '#172b4d', fontSize: '25px', fontWeight: 700 }
const sectionHeader = { padding: '20px 22px', borderBottom: '1px solid #e2e8f0' }
const sectionTitle = { margin: 0, fontSize: '18px', color: '#172b4d' }
const sectionSubtitle = { margin: '5px 0 0', color: '#94a3b8', fontSize: '13px' }
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }
const thStyle = { padding: '13px 15px', textAlign: 'left', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }
const tdStyle = { padding: '15px', color: '#64748b', fontSize: '13px', borderBottom: '1px solid #edf2f7' }
const badgeStyle = { display: 'inline-block', padding: '6px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }
const emptyStyle = { padding: '50px', textAlign: 'center', color: '#94a3b8' }
const btnHapus = { padding: '6px 10px', borderRadius: '8px', border: '1px solid #f5c2c2', backgroundColor: '#fdecec', color: '#b91c1c', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }
const btnTambah = { padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(22,163,74,.2)', whiteSpace: 'nowrap' }
const btnSimpanPegawai = { padding: '10px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
const btnBatalPegawai = { padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#334155', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }
const errorStyle = { backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', fontWeight: 600 }
const infoStyle = { backgroundColor: '#dcfce7', color: '#166534', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px', fontWeight: 600 }
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }

export default Pelanggaran