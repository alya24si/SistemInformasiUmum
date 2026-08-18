import { useState } from "react";

function KerusakanRuangan({ user }) {
  const isAdminRT = user.role === 'admin_rumahtangga' || user.role === 'superadmin';

  const [laporan, setLaporan] = useState([
    { id: 1, ruangan: "Ruang Rapat Utama", pelapor: "Delita Br Tinambunan", bagian: "Bagian Keuangan", tanggal: "2026-08-10", kerusakan: "AC tidak dingin", deskripsi: "AC ruangan tidak menghasilkan udara dingin sejak pagi.", status: "Menunggu", sumber: "Laporan Pegawai" },
    { id: 2, ruangan: "Ruang Rapat 1", pelapor: "Alya Deka Danisha", bagian: "Bagian Kepegawaian", tanggal: "2026-08-09", kerusakan: "Proyektor tidak menyala", deskripsi: "Proyektor tidak dapat digunakan ketika akan dipakai untuk rapat.", status: "Diproses", sumber: "Laporan Pegawai" },
    { id: 3, ruangan: "Aula", pelapor: "Admin Rumah Tangga", bagian: "Rumah Tangga", tanggal: "2026-08-08", kerusakan: "Lampu mati", deskripsi: "Beberapa lampu di bagian depan aula tidak menyala.", status: "Selesai", sumber: "Pemeriksaan Admin" },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ ruangan: "", kerusakan: "", deskripsi: "" });
  const [currentPage, setCurrentPage] = useState(0);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const laporanBaru = {
      id: Date.now(),
      ruangan: formData.ruangan,
      pelapor: user.nama,
      bagian: user.bidang,
      tanggal: new Date().toISOString().split("T")[0],
      kerusakan: formData.kerusakan,
      deskripsi: formData.deskripsi,
      status: isAdminRT ? "Diproses" : "Menunggu",
      sumber: isAdminRT ? "Pemeriksaan Admin" : "Laporan Pegawai",
    };
    setLaporan([...laporan, laporanBaru]);
    setFormData({ ruangan: "", kerusakan: "", deskripsi: "" });
    setShowForm(false);
    alert(isAdminRT ? "Data kerusakan berhasil ditambahkan." : "Laporan kerusakan berhasil dikirim.");
  };

  const handleProses = (id) => setLaporan(laporan.map((i) => i.id === id ? { ...i, status: "Diproses" } : i));
  const handleSelesai = (id) => setLaporan(laporan.map((i) => i.id === id ? { ...i, status: "Selesai" } : i));
  const handleHapus = (id) => { if (window.confirm("Hapus data ini?")) setLaporan(laporan.filter((i) => i.id !== id)); };

  // Admin lihat semua, user lain hanya lihat laporan miliknya sendiri
  const laporanDitampilkan = isAdminRT ? laporan : laporan.filter((i) => i.pelapor === user.nama);

  const getStatusStyle = (status) => {
    if (status === "Menunggu") return { backgroundColor: "#fef3c7", color: "#92400e" };
    if (status === "Diproses") return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
    return { backgroundColor: "#dcfce7", color: "#166534" };
  };

  const formatTanggal = (tanggal) => new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{ padding: "32px", minHeight: "100%", backgroundColor: "#f5f8fc", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "24px" }}>
        <div><h1 style={{ margin: 0, fontSize: "30px", fontWeight: 700, color: "#102a43" }}>Kerusakan Ruangan</h1><p style={{ margin: "7px 0 0", color: "#64748b", fontSize: "15px" }}>Laporkan kerusakan fasilitas. Admin akan memproses & menindaklanjuti.</p></div>
        <button onClick={() => setShowForm(true)} style={{ border: "none", backgroundColor: "#0b72e7", color: "#fff", padding: "11px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 8px rgba(11,114,231,0.18)" }}>+ {isAdminRT ? "Tambah Kerusakan" : "Lapor Kerusakan"}</button>
      </div>

      <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", marginBottom: "22px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: isAdminRT ? "#0b72e7" : "#16a34a" }} />
          <strong style={{ color: "#1e293b", fontSize: "15px" }}>{isAdminRT ? "Mode Admin Rumah Tangga" : "Mode Pegawai"}</strong>
        </div>
        <p style={{ margin: "8px 0 0 19px", color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>
          {isAdminRT ? "Anda dapat menambahkan, memproses, dan mengelola seluruh data kerusakan." : "Anda dapat melaporkan kerusakan dan melihat status laporan Anda."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "22px" }}>
        <SummaryCard title="Total Laporan" value={laporanDitampilkan.length} icon="📋" />
        <SummaryCard title="Menunggu" value={laporanDitampilkan.filter((i) => i.status === "Menunggu").length} icon="⏳" />
        <SummaryCard title="Diproses" value={laporanDitampilkan.filter((i) => i.status === "Diproses").length} icon="🔧" />
        <SummaryCard title="Selesai" value={laporanDitampilkan.filter((i) => i.status === "Selesai").length} icon="✓" />
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }} onClick={() => setShowForm(false)}>
          <div style={{ width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto", backgroundColor: "#fff", borderRadius: "14px", boxShadow: "0 20px 50px rgba(15,23,42,0.18)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 22px", borderBottom: "1px solid #e2e8f0" }}>
              <div><h2 style={{ margin: 0, fontSize: "19px", fontWeight: 650, color: "#172b4d" }}>{isAdminRT ? "Tambah Data Kerusakan" : "Laporkan Kerusakan"}</h2><p style={{ margin: "5px 0 0", fontSize: "13px", color: "#94a3b8" }}>Pelapor otomatis: {user.nama}</p></div>
              <button onClick={() => setShowForm(false)} style={{ width: "34px", height: "34px", border: "none", borderRadius: "8px", backgroundColor: "#f1f5f9", color: "#64748b", fontSize: "18px", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "22px" }}>
              <div style={{ marginBottom: "17px" }}><label style={labelStyle}>Ruangan</label>
                <select name="ruangan" value={formData.ruangan} onChange={handleChange} required style={inputStyle}><option value="">Pilih Ruangan</option><option>Ruang Rapat Utama</option><option>Ruang Rapat 1</option><option>Ruang Rapat 2</option><option>Aula</option></select>
              </div>
              <div style={{ marginBottom: "17px" }}><label style={labelStyle}>Jenis Kerusakan</label><input type="text" name="kerusakan" value={formData.kerusakan} onChange={handleChange} required style={inputStyle} /></div>
              <div style={{ marginBottom: "22px" }}><label style={labelStyle}>Deskripsi</label><textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="5" required style={{ ...inputStyle, resize: "vertical", minHeight: "110px" }} /></div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "18px", borderTop: "1px solid #e2e8f0" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ border: "1px solid #cbd5e1", backgroundColor: "#fff", color: "#475569", padding: "10px 17px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ border: "none", backgroundColor: "#0b72e7", color: "#fff", padding: "10px 17px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Kirim Laporan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "20px 22px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 650, color: "#172b4d" }}>{isAdminRT ? "Seluruh Data Kerusakan" : "Laporan Saya"}</h2>
          <p style={{ margin: "5px 0 0", color: "#94a3b8", fontSize: "13px" }}>{isAdminRT ? "Kelola seluruh laporan kerusakan." : "Daftar laporan kerusakan yang Anda kirim."}</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1100px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={thStyle}>Ruangan</th><th style={thStyle}>Pelapor</th><th style={thStyle}>Bagian</th><th style={thStyle}>Tanggal</th><th style={thStyle}>Kerusakan</th><th style={{ ...thStyle, minWidth: "220px" }}>Deskripsi</th><th style={thStyle}>Sumber</th><th style={thStyle}>Status</th>
                {isAdminRT && <th style={{ ...thStyle, textAlign: "center" }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const ITEMS_PER_PAGE = 10
                const totalPages = Math.ceil(laporanDitampilkan.length / ITEMS_PER_PAGE)
                const startIndex = currentPage * ITEMS_PER_PAGE
                const endIndex = startIndex + ITEMS_PER_PAGE
                const dataPaginated = laporanDitampilkan.slice(startIndex, endIndex)

                return (
                  <>
                    {dataPaginated.length > 0 ? dataPaginated.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #edf2f7" }}>
                        <td style={tdStyle}><div style={{ fontWeight: 600, color: "#334155" }}>{item.ruangan}</div></td>
                        <td style={tdStyle}>{item.pelapor}</td>
                        <td style={tdStyle}>{item.bagian}</td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{formatTanggal(item.tanggal)}</td>
                        <td style={tdStyle}><div style={{ fontWeight: 600, color: "#334155" }}>{item.kerusakan}</div></td>
                        <td style={{ ...tdStyle, maxWidth: "260px", color: "#64748b" }}>{item.deskripsi}</td>
                        <td style={tdStyle}><span style={{ backgroundColor: "#f1f5f9", color: "#475569", padding: "5px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }}>{item.sumber}</span></td>
                        <td style={tdStyle}><span style={{ ...getStatusStyle(item.status), display: "inline-flex", alignItems: "center", padding: "6px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "currentColor", marginRight: "6px" }} />{item.status}</span></td>
                        {isAdminRT && (
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                              {item.status === "Menunggu" && <button onClick={() => handleProses(item.id)} style={{ ...actionButtonStyle, backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>Proses</button>}
                              {item.status === "Diproses" && <button onClick={() => handleSelesai(item.id)} style={{ ...actionButtonStyle, backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>Selesai</button>}
                              <button onClick={() => handleHapus(item.id)} style={{ ...actionButtonStyle, backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>Hapus</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )) : <tr><td colSpan={isAdminRT ? 9 : 8} style={{ padding: "55px 20px", textAlign: "center" }}>Belum ada laporan kerusakan.</td></tr>}
                  </>
                )
              })()}
            </tbody>
          </table>
        </div>

        {(() => {
          const ITEMS_PER_PAGE = 10
          const totalPages = Math.ceil(laporanDitampilkan.length / ITEMS_PER_PAGE)
          return (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', alignItems: 'center', paddingBottom: '10px' }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', opacity: currentPage === 0 ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
              >
                Back
              </button>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#64748b' }}>
                {currentPage + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => (prev + 1 < totalPages ? prev + 1 : prev))}
                disabled={currentPage + 1 >= totalPages}
                style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPage + 1 >= totalPages ? 'not-allowed' : 'pointer', opacity: currentPage + 1 >= totalPages ? 0.5 : 1, fontSize: '11px', fontWeight: 600 }}
              >
                Next
              </button>
            </div>
          )
        })()}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon }) {
  return (
    <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "17px", display: "flex", alignItems: "center", gap: "13px" }}>
      <div style={{ width: "42px", height: "42px", borderRadius: "9px", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "19px" }}>{icon}</div>
      <div><div style={{ color: "#94a3b8", fontSize: "12px", fontWeight: 600 }}>{title}</div><div style={{ marginTop: "2px", color: "#172b4d", fontSize: "23px", fontWeight: 700 }}>{value}</div></div>
    </div>
  );
}

const labelStyle = { display: "block", marginBottom: "7px", color: "#334155", fontSize: "13px", fontWeight: 600 };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", outline: "none", backgroundColor: "#fff", color: "#334155", fontSize: "13px" };
const thStyle = { padding: "13px 15px", textAlign: "left", color: "#64748b", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", whiteSpace: "nowrap" };
const tdStyle = { padding: "15px", color: "#64748b", fontSize: "12px", verticalAlign: "top" };
const actionButtonStyle = { padding: "6px 9px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" };

export default KerusakanRuangan;