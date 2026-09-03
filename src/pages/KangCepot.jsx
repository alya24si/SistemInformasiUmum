import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'

const API = 'http://localhost:8000/api'

const daftarBulan = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const tahunIni = new Date().getFullYear()

const cariKolom = (row, ...kemungkinan) => {
  for (const key of Object.keys(row)) {
    const k = key.toLowerCase().replace(/\s+/g, '')
    for (const nama of kemungkinan) {
      if (k === nama.toLowerCase().replace(/\s+/g, '')) return row[key]
    }
  }
  return ''
}

const angka = (v) => Number(String(v).replace(/[^\d]/g, '')) || 0
const formatTitik = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

const nomorWa = (no) => {
  let n = String(no || '').replace(/[^\d]/g, '')
  if (n.startsWith('0')) n = '62' + n.slice(1)
  else if (n.startsWith('8')) n = '62' + n
  return n
}

const buatPesan = (d) =>
`Selamat pagi, mohon izin dari Subbagian Tata Usaha dan Keuangan menginfokan Pejabat/Pegawai yang saldonya tidak di autodebet dengan rincian sebagai berikut :

Nama : ${d.nama}
DPP : ${formatTitik(d.dpp)}
Bapors : ${formatTitik(d.bapors)}
Keagamaan: ${formatTitik(d.keagamaan)}

Total : ${formatTitik(d.total)}

Mohon agar dapat mentransfer ke nomor rekening BNI "1910250198" (Tia Agustina) atau secara cash ke Ruangan Subbagian Tata Usaha dan Keuangan di Lantai 2.
Terima kasih 🙏🏻`

function KangCepot({ user }) {
  const isAdmin = user.role === 'admin_keuangan' || user.role === 'superadmin'

  const [data, setData] = useState([])
  const [uploadInfo, setUploadInfo] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formTambah, setFormTambah] = useState({ nama: '', nip: '', no_hp: '', status_bayar: 'belum' })
  const [editing, setEditing] = useState(null)
  const [formEdit, setFormEdit] = useState({ nama: '', no_hp: '', dpp: '', bapors: '', keagamaan: '', status_bayar: 'belum' })
  const [filterStatus, setFilterStatus] = useState('semua')
  const [kelola, setKelola] = useState(null)

  // ✨ STATE BARU untuk tampilan pegawai
  const [profil, setProfil] = useState(null)

  const muatData = async () => {
    const res = await fetch(API + '/iuran')
    const json = await res.json()
    if (json.success) {
      setData(json.data.map((d) => ({
        ...d,
        dpp: Number(d.dpp), bapors: Number(d.bapors),
        keagamaan: Number(d.keagamaan), total: Number(d.total),
        status_bayar: d.status_bayar || 'belum',
      })))
    }
  }

  useEffect(() => { muatData() }, [])

  // ✨ FETCH profil iuran pegawai (hanya kalau role pegawai)
  useEffect(() => {
    if (user.role === 'pegawai' && user.nip) {
      fetch(API + '/iuran/profil/' + user.nip)
        .then((r) => r.json())
        .then((j) => { setProfil(j.success ? j : false) })
        .catch(() => setProfil(false))
    }
  }, [user.role, user.nip])

  // ===== ✨ TAMPILAN PEGAWAI (hanya data sendiri) =====
  if (user.role === 'pegawai') {
    const bulananMap = {}
    ;(profil?.bulanan || []).forEach((b) => { bulananMap[b.bulan] = b.status })
    const belum = daftarBulan.filter((b) => bulananMap[b] !== 'sudah')

    return (
      <div style={{ ...pageStyle, backgroundImage: 'linear-gradient(rgba(245,248,252,.9), rgba(245,248,252,.94)), url(/kang-cepot.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img src="/kang-cepot.png" alt="Kang Cepot" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #ffc72c', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
            <div>
              <h1 style={{ ...titleStyle, color: '#002b5c' }}>🟢 KANG CEPOT — Iuran Saya</h1>
              <p style={subtitleStyle}>Data iuran pribadi Anda tahun {profil?.tahun || tahunIni}.</p>
            </div>
          </div>
        </div>

        {profil === null ? (
          <div style={cardStyle}><div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>⏳ Memuat data iuran Anda...</div></div>
        ) : profil === false ? (
          <div style={cardStyle}>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#172b4d', marginBottom: '8px' }}>Data Iuran Belum Terdaftar</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                NIP <b>{user.nip}</b> belum tercatat di sistem iuran. Hubungi Subbagian Tata Usaha & Keuangan untuk didaftarkan.
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Rincian nominal */}
            <div style={cardStyle}>
              <div style={sectionHeader}>
                <h2 style={sectionTitle}>💰 Rincian Iuran Bulanan Anda</h2>
                <p style={sectionSubtitle}>{profil.data.nama} • NIP {profil.data.nip}</p>
              </div>
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div style={statBox}><div style={statLabel}>DPP</div><div style={statValue}>{formatTitik(Number(profil.data.dpp))}</div></div>
                <div style={statBox}><div style={statLabel}>BAPORS</div><div style={statValue}>{formatTitik(Number(profil.data.bapors))}</div></div>
                <div style={statBox}><div style={statLabel}>KEAGAMAAN</div><div style={statValue}>{formatTitik(Number(profil.data.keagamaan))}</div></div>
                <div style={{ ...statBox, border: '2px solid #dc2626', background: '#fee2e2' }}><div style={statLabel}>TOTAL / BULAN</div><div style={{ ...statValue, color: '#dc2626' }}>{formatTitik(Number(profil.data.total))}</div></div>
              </div>
            </div>

            {/* Status 12 bulan */}
            <div style={cardStyle}>
              <div style={sectionHeader}>
                <h2 style={sectionTitle}>📅 Status Bayar per Bulan</h2>
                <p style={sectionSubtitle}>Bulan ❌ = belum tercatat bayar. Hubungi Subbagian TU & Keuangan bila ada ketidaksesuaian.</p>
              </div>
              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {daftarBulan.map((b) => {
                  const st = bulananMap[b] === 'sudah'
                  return (
                    <div key={b} style={{ padding: '12px', borderRadius: '10px', border: st ? '2px solid #16a34a' : '2px solid #dc2626', backgroundColor: st ? '#dcfce7' : '#fee2e2', color: st ? '#166534' : '#991b1b', fontWeight: 700, fontSize: '13px', textAlign: 'center' }}>
                      {b}<br />{st ? '✅ SUDAH' : '❌ BELUM'}
                    </div>
                  )
                })}
              </div>
              {belum.length > 0 && (
                <div style={{ margin: '0 20px 20px', padding: '14px 18px', backgroundColor: '#fee2e2', border: '1px solid #dc2626', borderRadius: '10px', color: '#7f1d1d', fontSize: '13px', fontWeight: 600 }}>
                  ⚠️ Anda belum bayar iuran bulan: <b>{belum.join(', ')}</b>. Mohon transfer ke rekening BNI "1910250198" (Tia Agustina) atau cash ke Ruangan Subbagian TU & Keuangan Lt. 2.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  // ===== ✨ TAMPILAN ADMIN (kode lama kamu, tidak diubah) =====
  if (!isAdmin) {
    return <div style={pageStyle}>❌ Halaman ini hanya dapat diakses oleh Admin Keuangan, Superadmin, dan Pegawai.</div>
  }

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const wb = XLSX.read(ev.target.result, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws)

      const hasil = []
      rows.forEach((r) => {
        const nip = String(cariKolom(r, 'NIP', 'nip')).trim()
        if (!nip) return
        const dpp = angka(cariKolom(r, 'DPP'))
        const bapors = angka(cariKolom(r, 'BAPORS', 'BAPOR'))
        const dkm = angka(cariKolom(r, 'DKM'))
        const pwk = angka(cariKolom(r, 'PWK'))
        hasil.push({
          nip,
          nama: String(cariKolom(r, 'NAMA', 'Nama', 'nama') || '').trim(),
          no_hp: String(cariKolom(r, 'NO HP', 'NOHP', 'NO_HP', 'WA', 'TELEPON') || '').trim(),
          dpp, bapors, keagamaan: dkm > 0 ? dkm : pwk,
        })
      })

      if (hasil.length > 0) {
        await fetch(API + '/iuran/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows: hasil }),
        })
        muatData()
      }
      setUploadInfo(`✅ ${hasil.length} baris diproses. Data lama dipertahankan, data sama di-update.`)
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  const tambahPegawai = async (e) => {
    e.preventDefault()
    const res = await fetch(API + '/iuran', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formTambah),
    })
    const json = await res.json()
    if (json.success) {
      setFormTambah({ nama: '', nip: '', no_hp: '', status_bayar: 'belum' })
      setShowForm(false)
      muatData()
    } else {
      alert(json.message || 'Gagal menambahkan pegawai.')
    }
  }

  const mulaiEdit = (d) => {
    setEditing(d)
    setFormEdit({
      nama: d.nama, no_hp: d.no_hp || '',
      dpp: formatTitik(d.dpp), bapors: formatTitik(d.bapors),
      keagamaan: formatTitik(d.keagamaan), status_bayar: d.status_bayar,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalEdit = angka(formEdit.dpp) + angka(formEdit.bapors) + angka(formEdit.keagamaan)

  const simpanEdit = async (e) => {
    e.preventDefault()
    if (!editing) return
    await fetch(API + '/iuran/' + editing.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nama: formEdit.nama, no_hp: formEdit.no_hp,
        dpp: angka(formEdit.dpp), bapors: angka(formEdit.bapors),
        keagamaan: angka(formEdit.keagamaan), status_bayar: formEdit.status_bayar,
      }),
    })
    setEditing(null)
    muatData()
  }

  const hapus = async (id) => {
    if (window.confirm('Yakin ingin menghapus data iuran ini?')) {
      await fetch(API + '/iuran/' + id, { method: 'DELETE' })
      muatData()
    }
  }

  const kirimWa = (d) => {
    if (!d.no_hp) { alert('Nomor HP pegawai ini belum diisi!'); return }
    if (d.total <= 0) { alert('Isi dulu nominal iuran lewat tombol ✏️ Edit!'); return }
    window.open('https://wa.me/' + nomorWa(d.no_hp) + '?text=' + encodeURIComponent(buatPesan(d)), '_blank')
  }

  const bukaKelola = async (d) => {
    setKelola({ id: d.id, nama: d.nama, loading: true, bulan: {} })
    const res = await fetch(API + '/iuran/' + d.id + '/bulanan')
    const json = await res.json()
    const map = {}
    if (json.success) json.data.forEach((b) => { map[b.bulan] = b.status })
    setKelola({ id: d.id, nama: d.nama, loading: false, bulan: map })
  }

  const toggleBulan = async (bulan) => {
    const baru = kelola.bulan[bulan] === 'sudah' ? 'belum' : 'sudah'
    await fetch(API + '/iuran/' + kelola.id + '/bulanan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bulan, status: baru }),
    })
    setKelola({ ...kelola, bulan: { ...kelola.bulan, [bulan]: baru } })
    muatData()
  }

  const dataFiltered = data.filter((d) =>
    filterStatus === 'semua' || d.status_bayar === filterStatus
  )

  return (
    <div style={{ ...pageStyle, backgroundImage: 'linear-gradient(rgba(245,248,252,.88), rgba(245,248,252,.92)), url(/kang-cepot.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src="/kang-cepot.png" alt="Kang Cepot" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #ffc72c' }} />
          <div>
            <h1 style={{ ...titleStyle, color: '#002b5c' }}>🟢 KANG CEPOT</h1>
            <p style={subtitleStyle}>Tagihan iuran via WhatsApp + pantauan bayar per bulan (tahun {tahunIni}).</p>
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={sectionHeader}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={sectionTitle}>📥 Upload Excel Iuran</h2>
              <p style={sectionSubtitle}>Kolom dibaca: NAMA | NIP | NO HP | DPP | BAPORS | DKM/PWK.</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} style={btnTambah}>{showForm ? '✖️ Tutup Form' : '➕ Tambah Pegawai Baru'}</button>
          </div>
        </div>

        {showForm && (
          <form onSubmit={tambahPegawai} style={{ padding: '20px', backgroundColor: '#fef9e7', borderBottom: '1px solid #fde68a' }}>
            <div style={formGrid}>
              <div><label style={labelStyle}>Nama</label><input type="text" required value={formTambah.nama} onChange={(e) => setFormTambah({ ...formTambah, nama: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>NIP</label><input type="text" required value={formTambah.nip} onChange={(e) => setFormTambah({ ...formTambah, nip: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>No HP (WA)</label><input type="text" required value={formTambah.no_hp} onChange={(e) => setFormTambah({ ...formTambah, no_hp: e.target.value })} style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Status Bayar</label>
                <select value={formTambah.status_bayar} onChange={(e) => setFormTambah({ ...formTambah, status_bayar: e.target.value })} style={inputStyle}>
                  <option value="belum">❌ Belum Bayar</option>
                  <option value="sudah">✅ Sudah Bayar</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="submit" style={btnSimpan}>💾 Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} style={btnBatal}>Batal</button>
            </div>
          </form>
        )}

        <div style={filterGrid}>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={inputStyle} />
          {uploadInfo && <div style={{ ...infoStyle, marginBottom: 0 }}>{uploadInfo}</div>}
        </div>
      </div>

      {editing && (
        <div style={{ ...cardStyle, border: '2px solid #f59e0b', background: '#fef3c7' }}>
          <div style={sectionHeader}><h2 style={{ ...sectionTitle, color: '#92400e' }}>✏️ Edit Iuran: {editing.nama}</h2></div>
          <form onSubmit={simpanEdit} style={{ padding: '20px' }}>
            <div style={formGrid}>
              <div><label style={labelStyle}>Nama</label><input type="text" required value={formEdit.nama} onChange={(e) => setFormEdit({ ...formEdit, nama: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>No HP (WA)</label><input type="text" required value={formEdit.no_hp} onChange={(e) => setFormEdit({ ...formEdit, no_hp: e.target.value })} style={inputStyle} /></div>
              <div><label style={labelStyle}>DPP</label><input type="text" required value={formEdit.dpp} onChange={(e) => setFormEdit({ ...formEdit, dpp: formatTitik(angka(e.target.value)) })} style={inputStyle} /></div>
              <div><label style={labelStyle}>BAPORS</label><input type="text" required value={formEdit.bapors} onChange={(e) => setFormEdit({ ...formEdit, bapors: formatTitik(angka(e.target.value)) })} style={inputStyle} /></div>
              <div><label style={labelStyle}>KEAGAMAAN</label><input type="text" required value={formEdit.keagamaan} onChange={(e) => setFormEdit({ ...formEdit, keagamaan: formatTitik(angka(e.target.value)) })} style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Status Bayar</label>
                <select value={formEdit.status_bayar} onChange={(e) => setFormEdit({ ...formEdit, status_bayar: e.target.value })} style={inputStyle}>
                  <option value="belum">❌ Belum Bayar</option>
                  <option value="sudah">✅ Sudah Bayar</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: '16px', fontSize: '18px', fontWeight: 800, color: '#92400e' }}>TOTAL OTOMATIS: {formatTitik(totalEdit)}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="submit" style={btnSimpan}>💾 Simpan</button>
              <button type="button" onClick={() => setEditing(null)} style={btnBatal}>Batal</button>
            </div>
          </form>
        </div>
      )}

      <div style={cardStyle}>
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>📋 Daftar Iuran Pegawai</h2>
          <p style={sectionSubtitle}>📅 Kelola = atur bayar per bulan. 🟢 WA = kirim tagihan otomatis.</p>
        </div>

        <div style={{ padding: '16px 20px 0', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>🔍 Filter Status:</span>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
            <option value="semua">Semua</option>
            <option value="sudah">✅ Sudah Bayar</option>
            <option value="belum">❌ Belum Bayar</option>
          </select>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Menampilkan {dataFiltered.length} dari {data.length} pegawai</span>
        </div>

        <div style={{ overflowX: 'auto', padding: '16px 20px 20px' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>No</th>
                <th style={thStyle}>Nama</th>
                <th style={thStyle}>NIP</th>
                <th style={thStyle}>No HP / WA</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>DPP</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Bapors</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Keagamaan</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Total</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataFiltered.length === 0 ? (
                <tr><td colSpan="10" style={emptyStyle}>Tidak ada data. Upload Excel atau tambah pegawai manual. 📥</td></tr>
              ) : (
                dataFiltered.map((d, i) => {
                  const siapWa = d.total > 0 && d.no_hp
                  return (
                    <tr key={d.id}>
                      <td style={tdStyle}>{i + 1}</td>
                      <td style={tdStyle}><strong>{d.nama}</strong></td>
                      <td style={tdStyle}>{d.nip}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{d.no_hp || '—'}</span>
                          <button onClick={() => kirimWa(d)} disabled={!siapWa}
                            style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', backgroundColor: siapWa ? '#25d366' : '#cbd5e1', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: siapWa ? 'pointer' : 'not-allowed', opacity: siapWa ? 1 : 0.6 }}>
                            🟢 WA
                          </button>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{formatTitik(d.dpp)}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{formatTitik(d.bapors)}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{formatTitik(d.keagamaan)}</td>
                      <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 800, color: '#dc2626' }}>{formatTitik(d.total)}</td>
                      <td style={tdStyle}>
                        <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, backgroundColor: d.status_bayar === 'sudah' ? '#dcfce7' : '#fee2e2', color: d.status_bayar === 'sudah' ? '#166534' : '#991b1b' }}>
                          {d.status_bayar === 'sudah' ? '✅ SUDAH' : '❌ BELUM'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button onClick={() => bukaKelola(d)} style={btnKelola}>📅 Kelola</button>
                          <button onClick={() => mulaiEdit(d)} style={btnEdit}>✏️ Edit</button>
                          <button onClick={() => hapus(d.id)} style={btnHapus}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {kelola && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,31,69,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setKelola(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '680px', maxWidth: '94%', maxHeight: '85vh', overflowY: 'auto', background: '#fff', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#002b5c', fontSize: '18px' }}>📅 Kelola Iuran Bulanan — {kelola.nama}</h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '13px' }}>Klik bulan untuk mengubah status sudah/belum bayar (tahun {tahunIni}).</p>
            {kelola.loading ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>⏳ Memuat...</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                {daftarBulan.map((b) => {
                  const st = kelola.bulan[b] === 'sudah'
                  return (
                    <button key={b} onClick={() => toggleBulan(b)}
                      style={{ padding: '12px', borderRadius: '10px', border: st ? '2px solid #16a34a' : '2px solid #dc2626', backgroundColor: st ? '#dcfce7' : '#fee2e2', color: st ? '#166534' : '#991b1b', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                      {b}<br />{st ? '✅ SUDAH' : '❌ BELUM'}
                    </button>
                  )
                })}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button onClick={() => setKelola(null)} style={btnBatal}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const pageStyle = { padding: '32px', minHeight: '100%', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }
const headerStyle = { marginBottom: '24px' }
const titleStyle = { margin: 0, fontSize: '30px', color: '#102a43' }
const subtitleStyle = { margin: '7px 0 0', color: '#64748b', fontSize: '15px' }
const cardStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '22px', boxShadow: '0 2px 8px rgba(15,23,42,.04)', overflow: 'hidden' }
const sectionHeader = { padding: '20px 22px', borderBottom: '1px solid #e2e8f0' }
const sectionTitle = { margin: 0, fontSize: '18px', color: '#172b4d' }
const sectionSubtitle = { margin: '5px 0 0', color: '#94a3b8', fontSize: '13px' }
const filterGrid = { display: 'grid', gridTemplateColumns: '1fr', gap: '15px', padding: '20px' }
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }
const labelStyle = { display: 'block', marginBottom: '7px', color: '#334155', fontSize: '13px', fontWeight: 600 }
const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#fff', color: '#334155', fontSize: '13px' }
const tableStyle = { width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }
const thStyle = { padding: '13px 15px', textAlign: 'left', backgroundColor: '#f8fafc', color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }
const tdStyle = { padding: '15px', color: '#64748b', fontSize: '13px', borderBottom: '1px solid #edf2f7' }
const emptyStyle = { padding: '50px', textAlign: 'center', color: '#94a3b8' }
const btnTambah = { padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#16a34a', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }
const btnSimpan = { padding: '10px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }
const btnBatal = { padding: '10px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#334155', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }
const btnEdit = { padding: '6px 10px', borderRadius: '8px', border: '1px solid #bfdbfe', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }
const btnHapus = { padding: '6px 10px', borderRadius: '8px', border: '1px solid #f5c2c2', backgroundColor: '#fdecec', color: '#b91c1c', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }
const btnKelola = { padding: '6px 10px', borderRadius: '8px', border: '1px solid #fde68a', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }
const infoStyle = { backgroundColor: '#dcfce7', color: '#166534', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }
const statBox = { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', textAlign: 'center' }
const statLabel = { fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }
const statValue = { fontSize: '18px', fontWeight: 800, color: '#172b4d' }

export default KangCepot