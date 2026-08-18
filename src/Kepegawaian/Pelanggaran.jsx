import { useState } from 'react'
import * as XLSX from 'xlsx'

const daftarPegawai = [
  { nip: '234', nama: 'Alya Deka Danisha', bidang: 'Umum' },
  { nip: '235', nama: 'Budi Santoso', bidang: 'P2' },
  { nip: '236', nama: 'Citra Lestari', bidang: 'KI' },
]

const BATAS_JAM = 24
const BATAS_WARNING2 = 40

function Pelanggaran({ user }) {
  const isAdmin = user.role === 'admin_kepegawaian' || user.role === 'superadmin'
  const [dataPelanggaran, setDataPelanggaran] = useState([
    // ===== BUDI SANTOSO - 40 JAM (🚨 WARNING 2 - Ancaman PHK) =====
    { 
      id: 1, 
      nip: '235', 
      nama: 'Budi Santoso', 
      totalJam: 40, 
      riwayat: [
        { id: 1, tanggal: '04/08/2026 08:00', jam: 8, sumber: 'Upload rekap_pelanggaran_minggu_1.xlsx' },
        { id: 2, tanggal: '05/08/2026 08:00', jam: 8, sumber: 'Upload rekap_pelanggaran_minggu_2.xlsx' },
        { id: 3, tanggal: '06/08/2026 08:00', jam: 8, sumber: 'Upload rekap_pelanggaran_minggu_3.xlsx' },
        { id: 4, tanggal: '07/08/2026 08:00', jam: 8, sumber: 'Upload rekap_pelanggaran_minggu_4.xlsx' },
        { id: 5, tanggal: '08/08/2026 08:00', jam: 8, sumber: 'Upload rekap_pelanggaran_minggu_5.xlsx' },
      ] 
    },
    
    // ===== CITRA LESTARI - 24 JAM (⚠️ WARNING 1 - Teguran Lisan) =====
    { 
      id: 2, 
      nip: '236', 
      nama: 'Citra Lestari', 
      totalJam: 24, 
      riwayat: [
        { id: 1, tanggal: '04/08/2026 08:00', jam: 8, sumber: 'Upload rekap_pelanggaran_minggu_1.xlsx' },
        { id: 2, tanggal: '05/08/2026 08:00', jam: 8, sumber: 'Upload rekap_pelanggaran_minggu_2.xlsx' },
        { id: 3, tanggal: '06/08/2026 08:00', jam: 8, sumber: 'Upload rekap_pelanggaran_minggu_3.xlsx' },
      ] 
    },
    
    // ===== ALYA DEKA DANISHA - 8 JAM (✅ Pantauan) =====
    { 
      id: 3, 
      nip: '234', 
      nama: 'Alya Deka Danisha', 
      totalJam: 8, 
      riwayat: [
        { id: 1, tanggal: '04/08/2026 08:00', jam: 8, sumber: 'Upload rekap_pelanggaran_minggu_1.xlsx' },
      ] 
    },
  ])
  const [uploadInfo, setUploadInfo] = useState('')
  const [showWarning, setShowWarning] = useState(true)
  const [currentPagePelanggaran, setCurrentPagePelanggaran] = useState(0)
  const [currentPageRiwayat, setCurrentPageRiwayat] = useState(0)

  const catatanku = !isAdmin ? dataPelanggaran.find((d) => d.nip === user.nip) : null

  // 🔥 Upload Excel: NIP sama = jam diakumulasi
  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws)
      setDataPelanggaran((prev) => {
        const next = [...prev]
        rows.forEach((r) => {
          const nip = String(r.NIP ?? r.nip ?? '').trim()
          const nama = String(r.Nama ?? r.nama ?? '').trim()
          const jam = Number(r.Jumlah ?? r.jumlah ?? 0)
          if (!nip || !jam) return
          const waktu = new Date().toLocaleString('id-ID')
          const idx = next.findIndex((d) => d.nip === nip)
          if (idx >= 0) {
            next[idx] = { ...next[idx], nama: nama || next[idx].nama, totalJam: next[idx].totalJam + jam, riwayat: [...next[idx].riwayat, { id: Date.now() + Math.random(), tanggal: waktu, jam, sumber: `Upload ${file.name}` }] }
          } else {
            next.push({ id: Date.now() + Math.random(), nip, nama: nama || nip, totalJam: jam, riwayat: [{ id: Date.now(), tanggal: waktu, jam, sumber: `Upload ${file.name}` }] })
          }
        })
        return next
      })
      setUploadInfo(`✅ File "${file.name}" diproses — ${rows.length} baris dibaca. NIP yang sama otomatis diakumulasikan.`)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  const hapus = (id) => {
    if (window.confirm('Yakin ingin menghapus catatan pelanggaran ini?')) {
      setDataPelanggaran(dataPelanggaran.filter((d) => d.id !== id))
    }
  }

  // 🎯 Status badge: 3 level (Pantauan / WARNING 1 / WARNING 2)
  const statusBadge = (jam) =>
    jam >= BATAS_WARNING2
      ? { backgroundColor: '#450a0a', color: '#fecaca', label: '🚨 WARNING 2' }
      : jam >= BATAS_JAM
        ? { backgroundColor: '#fee2e2', color: '#991b1b', label: '⚠️ WARNING 1' }
        : { backgroundColor: '#fef3c7', color: '#92400e', label: 'Pantauan' }

  const totalJamSemua = dataPelanggaran.reduce((a, b) => a + b.totalJam, 0)
  const jumlahWarning1 = dataPelanggaran.filter((d) => d.totalJam >= BATAS_JAM && d.totalJam < BATAS_WARNING2).length
  const jumlahWarning2 = dataPelanggaran.filter((d) => d.totalJam >= BATAS_WARNING2).length

  return (
    <div style={pageStyle}>
      {/* ===== POPUP WARNING 2 (≥ 40 JAM) - LEVEL SERIUS ===== */}
      {!isAdmin && catatanku && showWarning && catatanku.totalJam >= BATAS_WARNING2 && (
        <div className="warning-overlay">
          <div className="warning-card warning-card-2">
            <div className="warning-icon">🚨</div>
            <div className="warning-title">WARNING 2!</div>
            <div className="warning-hours">{catatanku.totalJam} JAM PELANGGARAN</div>
            <p className="warning-text">
              Anda telah terakumulasi pelanggaran melebihi 40 jam.<br />
              <b>APABILA MASIH MELAKUKAN PELANGGARAN, MAKA ANDA AKAN DIUSULKAN MENDAPAT SANKSI BERAT HINGGA PEMUTUSAN HUBUNGAN KERJA (PHK) SESUAI KETENTUAN YANG BERLAKU.</b>
            </p>
            <button className="warning-btn" onClick={() => setShowWarning(false)}>SAYA MENGERTI</button>
          </div>
        </div>
      )}

      {/* ===== POPUP WARNING 1 (24–39 JAM) ===== */}
      {!isAdmin && catatanku && showWarning && catatanku.totalJam >= BATAS_JAM && catatanku.totalJam < BATAS_WARNING2 && (
        <div className="warning-overlay">
          <div className="warning-card">
            <div className="warning-icon">⚠️</div>
            <div className="warning-title">WARNING 1!</div>
            <div className="warning-hours">{catatanku.totalJam} JAM PELANGGARAN</div>
            <p className="warning-text">
              Anda terdeteksi telah melakukan pelanggaran melebihi batas 24 jam.<br />
              <b>APABILA MASIH MELAKUKAN PELANGGARAN, MAKA ANDA AKAN MENDAPAT TEGURAN LISAN.</b>
            </p>
            <button className="warning-btn" onClick={() => setShowWarning(false)}>SAYA MENGERTI</button>
          </div>
        </div>
      )}

      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Pelanggaran</h1>
          <p style={subtitleStyle}>
            {isAdmin ? 'Upload Excel & kelola akumulasi pelanggaran pegawai.' : 'Data akumulasi pelanggaran kehadiran pribadi Anda.'}
          </p>
        </div>
      </div>

      {!isAdmin && (
        <div style={privacyNote}>🔒 Data bersifat pribadi — hanya Anda yang dapat melihat catatan ini.</div>
      )}

      {/* ===== UPLOAD EXCEL (ADMIN) ===== */}
      {isAdmin && (
        <div style={cardStyle}>
          <div style={sectionHeader}>
            <div>
              <h2 style={sectionTitle}>📥 Upload Excel Pelanggaran Harian</h2>
              <p style={sectionSubtitle}>Format kolom: <b>NIP | Nama | Jumlah</b> (jam). 1 hari kerja = 8 jam. NIP yang sama dari upload sebelumnya otomatis diakumulasikan hingga batas 40 jam.</p>
            </div>
          </div>
          <div style={filterGrid}>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={inputStyle} />
            {uploadInfo && <div style={{ ...privacyNote, marginBottom: 0 }}>{uploadInfo}</div>}
          </div>
        </div>
      )}

      {/* ===== RINGKASAN ===== */}
      <div style={summaryGrid}>
        {isAdmin && <SummaryCard title="Pegawai Terdeteksi" value={dataPelanggaran.length} />}
        <SummaryCard title={isAdmin ? 'Total Jam Pelanggaran' : 'Total Jam Anda'} value={isAdmin ? totalJamSemua : (catatanku ? catatanku.totalJam : 0)} />
        {isAdmin && <SummaryCard title="Pegawai WARNING 1" value={jumlahWarning1} />}
        {isAdmin && <SummaryCard title="Pegawai WARNING 2" value={jumlahWarning2} />}
        {!isAdmin && <SummaryCard title="Batas Warning" value={`24 jam (Level 1) • 40 jam (Level 2)`} />}
      </div>

      {/* ===== TABEL / RIWAYAT ===== */}
      <div style={cardStyle}>
        <div style={sectionHeader}>
          <div>
            <h2 style={sectionTitle}>{isAdmin ? 'Daftar Pelanggaran Pegawai' : 'Riwayat Pelanggaran Saya'}</h2>
            <p style={sectionSubtitle}>{isAdmin ? 'Akumulasi jam dari seluruh upload Excel.' : 'Rincian penambahan jam pelanggaran Anda.'}</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          {isAdmin ? (
            <>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>NIP</th><th style={thStyle}>Nama Pegawai</th><th style={thStyle}>Total Jam</th><th style={thStyle}>Progres ke 40 Jam</th><th style={thStyle}>Status</th><th style={thStyle}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const ITEMS_PER_PAGE = 10
                    const totalPages = Math.ceil(dataPelanggaran.length / ITEMS_PER_PAGE)
                    const startIndex = currentPagePelanggaran * ITEMS_PER_PAGE
                    const endIndex = startIndex + ITEMS_PER_PAGE
                    const dataPaginated = dataPelanggaran.slice(startIndex, endIndex)

                    return (
                      <>
                        {dataPaginated.map((d) => {
                          const st = statusBadge(d.totalJam)
                          return (
                            <tr key={d.id}>
                              <td style={tdStyle}>{d.nip}</td>
                              <td style={tdStyle}><strong>{d.nama}</strong></td>
                              <td style={{ ...tdStyle, fontWeight: 700, color: '#dc2626' }}>{d.totalJam} jam</td>
                              <td style={tdStyle}>
                                <div style={{ background: '#e2e8f0', borderRadius: 20, height: 8, width: 120, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: Math.min((d.totalJam / BATAS_WARNING2) * 100, 100) + '%', background: d.totalJam >= BATAS_WARNING2 ? '#7f1d1d' : d.totalJam >= BATAS_JAM ? '#dc2626' : '#f59e0b' }}></div>
                                </div>
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
              <table style={tableStyle}>
                <thead>
                  <tr><th style={thStyle}>No</th><th style={thStyle}>Waktu Terdeteksi</th><th style={thStyle}>Penambahan Jam</th><th style={thStyle}>Sumber</th></tr>
                </thead>
                <tbody>
                  {(() => {
                    const ITEMS_PER_PAGE = 10
                    const totalPages = Math.ceil(catatanku.riwayat.length / ITEMS_PER_PAGE)
                    const startIndex = currentPageRiwayat * ITEMS_PER_PAGE
                    const endIndex = startIndex + ITEMS_PER_PAGE
                    const dataPaginated = catatanku.riwayat.slice(startIndex, endIndex)

                    return (
                      <>
                        {dataPaginated.map((r, i) => (
                          <tr key={r.id}>
                            <td style={tdStyle}>{startIndex + i + 1}</td>
                            <td style={tdStyle}>{r.tanggal}</td>
                            <td style={{ ...tdStyle, fontWeight: 700, color: '#dc2626' }}>+{r.jam} jam</td>
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
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: '750px' }
const thStyle = { padding: '13px 15px', textAlign: 'left', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }
const tdStyle = { padding: '15px', color: '#64748b', fontSize: '13px', borderBottom: '1px solid #edf2f7' }
const badgeStyle = { display: 'inline-block', padding: '6px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }
const emptyStyle = { padding: '50px', textAlign: 'center', color: '#94a3b8' }
const btnHapus = { padding: '6px 10px', borderRadius: '8px', border: '1px solid #f5c2c2', backgroundColor: '#fdecec', color: '#b91c1c', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }

export default Pelanggaran