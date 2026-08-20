import { useState, useEffect, useRef, Fragment } from 'react'

const API = 'http://localhost:8000/api'
const daftarBidang = ['Umum', 'P2', 'KI', 'Pabean', 'Fasilitas']
const daftarBulan = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const bulanSingkat = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const tahunIni = new Date().getFullYear()
const daftarTahun = Array.from({ length: 6 }, (_, i) => tahunIni - 1 + i)

const formatRupiah = (angka) =>
  'Rp ' + Number(angka).toLocaleString('id-ID')

const formatTitik = (angka) => {
  const n = String(angka).replace(/[^\d]/g, '')
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function ProgramKerja({ user }) {
  const isAdmin =
    user.role === 'admin_keuangan' ||
    user.role === 'superadmin'

  const [programs, setPrograms] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [editingKegiatan, setEditingKegiatan] = useState(null)
  const [editingProgram, setEditingProgram] = useState(null) // ✨ BARU
  const [filterTahun, setFilterTahun] = useState('semua')
  const [filterBidang, setFilterBidang] = useState('semua')
  const [currentPage, setCurrentPage] = useState(0)
  const panelKelolaRef = useRef(null)
  const panelEditProgramRef = useRef(null) // ✨ BARU

  const [formProgram, setFormProgram] = useState({
    tahun: tahunIni,
    bidang: daftarBidang[0],
    program: '',
    deskripsi: '',
    target: '',
  })

  const [formEditProgram, setFormEditProgram] = useState({ // ✨ BARU
    tahun: tahunIni,
    bidang: daftarBidang[0],
    program: '',
    deskripsi: '',
    target: '',
  })

  const [formKegiatan, setFormKegiatan] = useState({
    bulan: daftarBulan[0],
    target_anggaran: '',
    persen_realisasi: '0',
  })

  const muatData = async () => {
    const res = await fetch(API + '/program_kerja')
    const json = await res.json()
    if (json.success) {
      setPrograms(
        json.data.map((d) => ({
          ...d,
          tahun: Number(d.tahun),
          kegiatan: (d.kegiatan || []).map((k) => ({
            ...k,
            target_anggaran: Number(k.target_anggaran),
            persen_realisasi: Number(k.persen_realisasi),
          })),
        }))
      )
    }
  }

  useEffect(() => {
    muatData()
  }, [])

  const selectedProgram =
    programs.find((p) => p.id === selectedId) || null

  const milikUser = isAdmin
    ? programs
    : programs.filter((p) => p.bidang === user.bidang)

  const programsFiltered = milikUser.filter((p) => {
    const cocokTahun =
      filterTahun === 'semua' ||
      p.tahun === Number(filterTahun)
    const cocokBidang = isAdmin
      ? filterBidang === 'semua' || p.bidang === filterBidang
      : true
    return cocokTahun && cocokBidang
  })

  const totalProgram = milikUser.length
  const totalBidang = isAdmin
    ? new Set(milikUser.map((p) => p.bidang)).size
    : 1
  const totalKegiatan = milikUser.reduce(
    (acc, p) => acc + (p.kegiatan ? p.kegiatan.length : 0),
    0
  )
  const totalSelesai = milikUser.filter((p) => {
  if (!p.kegiatan || p.kegiatan.length === 0) return false
  const total = p.kegiatan.reduce((acc, k) => acc + k.persen_realisasi, 0)
  return Math.round(total / 12) === 100
}).length

  const persenProgram = (p) => {
  if (!p.kegiatan || p.kegiatan.length === 0) return 0
  const total = p.kegiatan.reduce((acc, k) => acc + k.persen_realisasi, 0)
  return Math.round(total / 12)  // ← dibagi 12 bulan
}

  const statusBadge = (persen) => {
    if (persen === 100) return { label: 'Selesai', cls: 'green' }
    if (persen > 0) return { label: persen + '%', cls: 'yellow' }
    return { label: 'Belum Mulai', cls: 'red' }
  }

  const warnaPersen = (persen) =>
    persen === 100 ? '#16a34a' : persen > 0 ? '#d97706' : '#94a3b8'

  const bukaKelola = (id) => {
    setSelectedId(id)
    setEditingKegiatan(null)
    setTimeout(() => {
      panelKelolaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // ✨ BARU: masuk mode edit program
  const mulaiEditProgram = (p) => {
    setEditingProgram(p)
    setFormEditProgram({
      tahun: p.tahun,
      bidang: p.bidang,
      program: p.program,
      deskripsi: p.deskripsi || '',
      target: p.target,
    })
    setTimeout(() => {
      panelEditProgramRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const batalEditProgram = () => {
    setEditingProgram(null)
    setFormEditProgram({
      tahun: tahunIni,
      bidang: daftarBidang[0],
      program: '',
      deskripsi: '',
      target: '',
    })
  }

  const mulaiEdit = (k) => {
    setEditingKegiatan(k)
    setFormKegiatan({
      bulan: k.bulan,
      target_anggaran: formatTitik(k.target_anggaran),
      persen_realisasi: String(k.persen_realisasi),
    })
    window.scrollTo({ top: panelKelolaRef.current?.offsetTop - 20 || 0, behavior: 'smooth' })
  }

  const batalEdit = () => {
    setEditingKegiatan(null)
    setFormKegiatan({
      bulan: daftarBulan[0],
      target_anggaran: '',
      persen_realisasi: '0',
    })
  }

  const tambahProgram = async (e) => {
    e.preventDefault()
    await fetch(API + '/program_kerja', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tahun: Number(formProgram.tahun),
        bidang: formProgram.bidang,
        program: formProgram.program,
        deskripsi: formProgram.deskripsi,
        target: formProgram.target,
      }),
    })
    setFormProgram({
      tahun: tahunIni,
      bidang: daftarBidang[0],
      program: '',
      deskripsi: '',
      target: '',
    })
    muatData()
  }

  // ✨ BARU: update program
  const updateProgram = async (e) => {
    e.preventDefault()
    if (!editingProgram) return

    await fetch(API + '/program_kerja/' + editingProgram.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tahun: Number(formEditProgram.tahun),
        bidang: formEditProgram.bidang,
        program: formEditProgram.program,
        deskripsi: formEditProgram.deskripsi,
        target: formEditProgram.target,
      }),
    })
    batalEditProgram()
    muatData()
  }

  const hapusProgram = async (id) => {
    if (
      window.confirm(
        'Yakin ingin menghapus program ini? Semua kegiatan bulanannya ikut terhapus.'
      )
    ) {
      await fetch(API + '/program_kerja/' + id, { method: 'DELETE' })
      setSelectedId(null)
      setEditingKegiatan(null)
      setEditingProgram(null)
      muatData()
    }
  }

  const simpanKegiatan = async (e) => {
    e.preventDefault()
    if (!selectedProgram) return

    const payload = {
      program_kerja_id: selectedProgram.id,
      bulan: formKegiatan.bulan,
      target_anggaran: Number(
        formKegiatan.target_anggaran.replace(/\./g, '')
      ),
      persen_realisasi: Number(formKegiatan.persen_realisasi),
    }

    if (editingKegiatan) {
      await fetch(API + '/kegiatan_program/' + editingKegiatan.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      await fetch(API + '/kegiatan_program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    setEditingKegiatan(null)
    setFormKegiatan({
      bulan: daftarBulan[0],
      target_anggaran: '',
      persen_realisasi: '0',
    })
    muatData()
  }

  const hapusKegiatan = async (id) => {
    if (window.confirm('Yakin ingin menghapus kegiatan bulan ini?')) {
      await fetch(API + '/kegiatan_program/' + id, { method: 'DELETE' })
      if (editingKegiatan && editingKegiatan.id === id) batalEdit()
      muatData()
    }
  }

  return (
    <div className="page">
      <div className="page-title">
        <h1>📋 Monitoring Program Kerja</h1>
        <p>
          Program kerja dilaporkan di awal tahun, lalu update target
          anggaran dan realisasi dilakukan per bulan.
        </p>
      </div>

      {!isAdmin && (
        <div className="guest-note">
          👁️ Mode tamu: Anda hanya melihat data bidang <b>{user.bidang}</b>.
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h4>Total Program</h4>
            <div className="stat-value">{totalProgram}</div>
            <div className="stat-desc">
              {isAdmin ? 'Program terdaftar' : `Bidang ${user.bidang}`}
            </div>
          </div>
        </div>
        <div className="stat-card gold">
          <div className="stat-icon">🏢</div>
          <div className="stat-info">
            <h4>Bidang Melapor</h4>
            <div className="stat-value">{totalBidang}</div>
            <div className="stat-desc">Dari 5 bidang</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h4>Total Kegiatan</h4>
            <div className="stat-value">{totalKegiatan}</div>
            <div className="stat-desc">Aktivitas per bulan</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h4>Program Selesai</h4>
            <div className="stat-value">{totalSelesai}</div>
            <div className="stat-desc">Realisasi 100%</div>
          </div>
        </div>
      </div>

      {/* ✨ BARU: Panel Edit Program (card kuning) */}
      {isAdmin && editingProgram && (
        <div ref={panelEditProgramRef} className="card" style={{ border: '2px solid #f59e0b', background: '#fef3c7' }}>
          <h3>
            ✏️ Edit Program: <span style={{ color: '#92400e' }}>{editingProgram.program}</span>
          </h3>
          <form onSubmit={updateProgram} style={{ marginTop: '12px' }}>
            <div className="form-row">
              <select
                value={formEditProgram.tahun}
                onChange={(e) => setFormEditProgram({ ...formEditProgram, tahun: e.target.value })}
              >
                {daftarTahun.map((t) => (
                  <option key={t} value={t}>Tahun {t}</option>
                ))}
              </select>
              <select
                value={formEditProgram.bidang}
                onChange={(e) => setFormEditProgram({ ...formEditProgram, bidang: e.target.value })}
              >
                {daftarBidang.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Nama program kerja"
                required
                value={formEditProgram.program}
                onChange={(e) => setFormEditProgram({ ...formEditProgram, program: e.target.value })}
              />
              <input
                type="text"
                placeholder="Deskripsi program"
                value={formEditProgram.deskripsi}
                onChange={(e) => setFormEditProgram({ ...formEditProgram, deskripsi: e.target.value })}
              />
              <input
                type="text"
                placeholder="Target (contoh: 4 Kegiatan)"
                required
                value={formEditProgram.target}
                onChange={(e) => setFormEditProgram({ ...formEditProgram, target: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button type="submit" className="btn" style={{ background: '#f59e0b' }}>
                  💾 Update
                </button>
                <button type="button" className="btn" onClick={batalEditProgram} style={{ background: '#e2e8f0', color: '#0f172a' }}>
                  Batal
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {isAdmin && !editingProgram && (
        <div className="card">
          <h3>➕ Lapor Program Kerja (Awal Tahun)</h3>
          <form onSubmit={tambahProgram} className="form-row">
            <select
              value={formProgram.tahun}
              onChange={(e) => setFormProgram({ ...formProgram, tahun: e.target.value })}
            >
              {daftarTahun.map((t) => (
                <option key={t} value={t}>Tahun {t}</option>
              ))}
            </select>
            <select
              value={formProgram.bidang}
              onChange={(e) => setFormProgram({ ...formProgram, bidang: e.target.value })}
            >
              {daftarBidang.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nama program kerja"
              required
              value={formProgram.program}
              onChange={(e) => setFormProgram({ ...formProgram, program: e.target.value })}
            />
            <input
              type="text"
              placeholder="Deskripsi program"
              value={formProgram.deskripsi}
              onChange={(e) => setFormProgram({ ...formProgram, deskripsi: e.target.value })}
            />
            <input
              type="text"
              placeholder="Target (contoh: 4 Kegiatan)"
              required
              value={formProgram.target}
              onChange={(e) => setFormProgram({ ...formProgram, target: e.target.value })}
            />
            <button type="submit" className="btn">Simpan</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>📋 Daftar Program Kerja & Kalender Realisasi</h3>
        <div className="filter-row">
          <select value={filterTahun} onChange={(e) => { setFilterTahun(e.target.value); setCurrentPage(0) }}>
            <option value="semua">Semua Tahun</option>
            {daftarTahun.map((t) => (
              <option key={t} value={t}>Tahun {t}</option>
            ))}
          </select>
          {isAdmin && (
            <select value={filterBidang} onChange={(e) => { setFilterBidang(e.target.value); setCurrentPage(0) }}>
              <option value="semua">Semua Bidang</option>
              {daftarBidang.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}
        </div>
        <div className="filter-info">
          Menampilkan {programsFiltered.length} dari {milikUser.length} program
        </div>

        <div className="table-wrap">
          <table className="table" style={{ minWidth: '900px' }}>
            <thead>
              <tr>
                <th>Tahun</th>
                <th>Bidang</th>
                <th style={{ minWidth: '220px' }}>Program Kerja</th>
                <th>Target</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const ITEMS_PER_PAGE = 5
                const totalPages = Math.ceil(programsFiltered.length / ITEMS_PER_PAGE)
                const startIndex = currentPage * ITEMS_PER_PAGE
                const endIndex = startIndex + ITEMS_PER_PAGE
                const dataPaginated = programsFiltered.slice(startIndex, endIndex)

                return (
                  <>
                    {dataPaginated.map((p) => {
                      const persen = persenProgram(p)
                      const st = statusBadge(persen)
                      return (
                        <Fragment key={p.id}>
                          <tr>
                            <td>{p.tahun}</td>
                            <td>{p.bidang}</td>
                            <td>
                              <div style={{ fontWeight: 700 }}>{p.program}</div>
                              {p.deskripsi && (
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                  {p.deskripsi}
                                </div>
                              )}
                            </td>
                            <td>{p.target}</td>
                            <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                            <td>
                              <button
                                className="btn"
                                style={{ padding: '4px 8px', fontSize: '11px', marginRight: '4px' }}
                                onClick={() => mulaiEditProgram(p)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                className="btn"
                                style={{ padding: '4px 8px', fontSize: '11px', marginRight: '4px' }}
                                onClick={() => bukaKelola(p.id)}
                              >
                                Kelola
                              </button>
                              {isAdmin && (
                                <button className="btn-danger" onClick={() => hapusProgram(p.id)}>🗑</button>
                              )}
                            </td>
                          </tr>
                          <tr style={{ background: '#fbfdff' }}>
                            <td colSpan={6} style={{ padding: '10px 14px' }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {daftarBulan.map((bulan, i) => {
                                  const k = (p.kegiatan || []).find((x) => x.bulan === bulan)
                                  return (
                                    <div
                                      key={bulan}
                                      style={{
                                        minWidth: '88px',
                                        padding: '6px 8px',
                                        borderRadius: '8px',
                                        background: k ? '#eff6ff' : '#f8fafc',
                                        border: k ? '1px solid #bfdbfe' : '1px dashed #e2e8f0',
                                        textAlign: 'center',
                                      }}
                                    >
                                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>
                                        {bulanSingkat[i]}
                                      </div>
                                      {k ? (
                                        <>
                                          <div style={{ fontSize: '10px', color: '#64748b' }}>
                                            {formatRupiah(k.target_anggaran)}
                                          </div>
                                          <div style={{ fontSize: '11px', fontWeight: 800, color: warnaPersen(k.persen_realisasi) }}>
                                            {k.persen_realisasi}%
                                          </div>
                                        </>
                                      ) : (
                                        <div style={{ fontSize: '10px', color: '#cbd5e1' }}>–</div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </td>
                          </tr>
                        </Fragment>
                      )
                    })}
                  </>
                )
              })()}
            </tbody>
          </table>
        </div>

        {(() => {
          const ITEMS_PER_PAGE = 5
          const totalPages = Math.ceil(programsFiltered.length / ITEMS_PER_PAGE)
          return (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', alignItems: 'center' }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="btn"
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', opacity: currentPage === 0 ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
              >
                Back
              </button>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>
                {currentPage + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
                disabled={currentPage + 1 >= totalPages}
                className="btn"
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPage + 1 >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage + 1 >= totalPages ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
              >
                Next
              </button>
            </div>
          )
        })()}
      </div>

      {selectedProgram && (
        <div ref={panelKelolaRef} className="card" style={{ border: '2px solid #3b82f6' }}>
          <h3>
            📅 Kegiatan Bulanan: <span style={{ color: '#3b82f6' }}>{selectedProgram.program}</span>
          </h3>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
            {selectedProgram.bidang} • {selectedProgram.tahun} • Target: {selectedProgram.target}
          </p>

          {isAdmin && (
            <form onSubmit={simpanKegiatan} style={{ marginBottom: '20px', padding: '16px', background: editingKegiatan ? '#fef3c7' : '#f8fafc', borderRadius: '10px', border: editingKegiatan ? '2px solid #f59e0b' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, marginBottom: '10px', color: editingKegiatan ? '#92400e' : '#0f172a' }}>
                {editingKegiatan ? `✏️ Edit Kegiatan: ${editingKegiatan.bulan}` : '➕ Tambah Kegiatan Baru'}
              </div>
              <div className="form-row">
                <select
                  value={formKegiatan.bulan}
                  onChange={(e) => setFormKegiatan({ ...formKegiatan, bulan: e.target.value })}
                >
                  {daftarBulan.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Target anggaran (contoh: 1.200.000)"
                  required
                  value={formKegiatan.target_anggaran}
                  onChange={(e) => {
                    const angka = e.target.value.replace(/[^\d]/g, '')
                    const format = angka.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                    setFormKegiatan({ ...formKegiatan, target_anggaran: format })
                  }}
                />
                <input
                  type="number"
                  placeholder="Persen (0-100)"
                  min="0"
                  max="100"
                  required
                  value={formKegiatan.persen_realisasi}
                  onChange={(e) => setFormKegiatan({ ...formKegiatan, persen_realisasi: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button type="submit" className="btn" style={{ background: editingKegiatan ? '#f59e0b' : undefined }}>
                    {editingKegiatan ? '💾 Update' : '➕ Tambah'}
                  </button>
                  {editingKegiatan && (
                    <button type="button" className="btn" onClick={batalEdit} style={{ background: '#e2e8f0', color: '#0f172a' }}>
                      Batal
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th>Target Anggaran</th>
                  <th>Persen Realisasi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {selectedProgram.kegiatan && selectedProgram.kegiatan.length > 0 ? (
                  selectedProgram.kegiatan.map((k) => (
                    <tr
                      key={k.id}
                      style={{
                        background: editingKegiatan && editingKegiatan.id === k.id ? '#fef3c7' : undefined,
                      }}
                    >
                      <td><strong>{k.bulan}</strong></td>
                      <td>{formatRupiah(k.target_anggaran)}</td>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: warnaPersen(k.persen_realisasi),
                          }}
                        >
                          {k.persen_realisasi}%
                        </span>
                      </td>
                      <td>
                        {isAdmin && (
                          <>
                            <button
                              className="btn"
                              onClick={() => mulaiEdit(k)}
                              style={{ padding: '4px 8px', fontSize: '11px', marginRight: '4px' }}
                            >
                              ✏️ Edit
                            </button>
                            <button className="btn-danger" onClick={() => hapusKegiatan(k.id)}>🗑</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
                      Belum ada kegiatan. Tambahkan kegiatan per bulan di atas!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <button className="btn" style={{ marginTop: '16px' }} onClick={() => { setSelectedId(null); setEditingKegiatan(null) }}>
            Tutup
          </button>
        </div>
      )}
    </div>
  )
}

export default ProgramKerja