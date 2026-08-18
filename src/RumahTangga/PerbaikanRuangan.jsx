import { useState } from "react";

function PerbaikanRuangan({ user }) {
  const isAdminRT = user.role === 'admin_rumahtangga' || user.role === 'superadmin';

  const [kerusakan] = useState([
    { id: 1, ruangan: "Ruang Rapat 2", kerusakan: "AC tidak dingin", tanggalLapor: "2026-08-10", status: "Menunggu" },
    { id: 2, ruangan: "Aula", kerusakan: "Lampu mati", tanggalLapor: "2026-08-09", status: "Menunggu" },
    { id: 3, ruangan: "Ruang Arsip", kerusakan: "Pintu sulit ditutup", tanggalLapor: "2026-08-08", status: "Selesai" },
  ]);

  const [perbaikan, setPerbaikan] = useState([
    { id: 1, kerusakanId: 3, ruangan: "Ruang Arsip", kerusakan: "Pintu sulit ditutup", jenisPerbaikan: "Perbaikan engsel pintu", penanggungJawab: "Bagian Rumah Tangga", tanggalMulai: "2026-08-08", status: "Selesai" },
  ]);

  const [formData, setFormData] = useState({ kerusakanId: "", jenisPerbaikan: "", penanggungJawab: "", tanggalMulai: "", status: "Diproses" });
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const kerusakanBelumDiperbaiki = kerusakan.filter((item) => {
    const sudahAda = perbaikan.some((p) => p.kerusakanId === item.id);
    return !sudahAda && item.status !== "Selesai";
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleKerusakanChange = (e) => setFormData({ ...formData, kerusakanId: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataKerusakan = kerusakan.find((i) => i.id === Number(formData.kerusakanId));
    if (!dataKerusakan) { alert("Pilih data kerusakan."); return; }
    setPerbaikan([...perbaikan, { id: Date.now(), kerusakanId: dataKerusakan.id, ruangan: dataKerusakan.ruangan, kerusakan: dataKerusakan.kerusakan, jenisPerbaikan: formData.jenisPerbaikan, penanggungJawab: formData.penanggungJawab, tanggalMulai: formData.tanggalMulai, status: formData.status }]);
    resetForm(); setShowForm(false);
  };

  const resetForm = () => setFormData({ kerusakanId: "", jenisPerbaikan: "", penanggungJawab: "", tanggalMulai: "", status: "Diproses" });

  const handleDelete = (id) => {
    if (!window.confirm("Hapus data perbaikan ini?")) return;
    setPerbaikan(perbaikan.filter((i) => i.id !== id));
  };

  const handleSelesai = (id) => {
    if (!window.confirm("Tandai perbaikan ini selesai?")) return;
    setPerbaikan(perbaikan.map((i) => i.id === id ? { ...i, status: "Selesai" } : i));
  };

  const getStatusStyle = (status) => status === "Diproses" ? { backgroundColor: "#dbeafe", color: "#1d4ed8" } : { backgroundColor: "#dcfce7", color: "#166534" };
  const formatTanggal = (tanggal) => !tanggal ? "-" : new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div style={{ padding: "32px", minHeight: "100%", backgroundColor: "#f5f8fc", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "24px" }}>
        <div><h1 style={{ margin: 0, fontSize: "30px", fontWeight: 700, color: "#102a43" }}>Perbaikan Ruangan</h1><p style={{ margin: "7px 0 0", color: "#64748b", fontSize: "15px" }}>{isAdminRT ? "Kelola tindak lanjut perbaikan fasilitas." : "Pantau status perbaikan fasilitas yang Anda laporkan."}</p></div>
        {isAdminRT && <button onClick={() => setShowForm(true)} disabled={kerusakanBelumDiperbaiki.length === 0} style={{ border: "none", backgroundColor: kerusakanBelumDiperbaiki.length === 0 ? "#cbd5e1" : "#0b72e7", color: "#fff", padding: "11px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: kerusakanBelumDiperbaiki.length === 0 ? "not-allowed" : "pointer" }}>+ Tambah Perbaikan</button>}
      </div>

      <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: isAdminRT ? "#0b72e7" : "#16a34a" }} />
          <strong style={{ color: "#1e293b", fontSize: "15px" }}>{isAdminRT ? "Mode Admin Rumah Tangga" : "Mode Pegawai (Tracking)"}</strong>
        </div>
        <p style={{ margin: "8px 0 0 19px", color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>
          {isAdminRT ? "Buat & kelola tindak lanjut perbaikan berdasarkan laporan kerusakan." : "Anda dapat melihat status perbaikan fasilitas yang telah dilaporkan."}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", marginBottom: "22px" }}>
        <SummaryCard title="Total Perbaikan" value={perbaikan.length} icon="🔧" />
        <SummaryCard title="Diproses" value={perbaikan.filter((i) => i.status === "Diproses").length} icon="⚙" />
        <SummaryCard title="Selesai" value={perbaikan.filter((i) => i.status === "Selesai").length} icon="✓" />
      </div>

      {showForm && isAdminRT && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }} onClick={() => { resetForm(); setShowForm(false); }}>
          <div style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", backgroundColor: "#fff", borderRadius: "14px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 22px", borderBottom: "1px solid #e2e8f0" }}>
              <div><h2 style={{ margin: 0, fontSize: "19px", fontWeight: 650, color: "#172b4d" }}>Tambah Data Perbaikan</h2></div>
              <button onClick={() => { resetForm(); setShowForm(false); }} style={{ width: "34px", height: "34px", border: "none", borderRadius: "8px", backgroundColor: "#f1f5f9", color: "#64748b", fontSize: "18px", cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "22px" }}>
              <div style={{ marginBottom: "17px" }}><label style={labelStyle}>Laporan Kerusakan</label>
                <select name="kerusakanId" value={formData.kerusakanId} onChange={handleKerusakanChange} required style={inputStyle}>
                  <option value="">Pilih Laporan</option>
                  {kerusakanBelumDiperbaiki.map((i) => <option key={i.id} value={i.id}>{i.ruangan} - {i.kerusakan}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: "17px" }}><label style={labelStyle}>Jenis Perbaikan</label><input type="text" name="jenisPerbaikan" value={formData.jenisPerbaikan} onChange={handleChange} required style={inputStyle} /></div>
              <div style={{ marginBottom: "17px" }}><label style={labelStyle}>Penanggung Jawab</label><input type="text" name="penanggungJawab" value={formData.penanggungJawab} onChange={handleChange} required style={inputStyle} /></div>
              <div style={{ marginBottom: "17px" }}><label style={labelStyle}>Tanggal Mulai</label><input type="date" name="tanggalMulai" value={formData.tanggalMulai} onChange={handleChange} required style={inputStyle} /></div>
              <div style={{ marginBottom: "22px" }}><label style={labelStyle}>Status</label><select name="status" value={formData.status} onChange={handleChange} style={inputStyle}><option>Diproses</option><option>Selesai</option></select></div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "18px", borderTop: "1px solid #e2e8f0" }}>
                <button type="button" onClick={() => { resetForm(); setShowForm(false); }} style={{ border: "1px solid #cbd5e1", backgroundColor: "#fff", color: "#475569", padding: "10px 17px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ border: "none", backgroundColor: "#0b72e7", color: "#fff", padding: "10px 17px", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "20px 22px", borderBottom: "1px solid #e2e8f0" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 650, color: "#172b4d" }}>Daftar Perbaikan</h2>
          <p style={{ margin: "5px 0 0", color: "#94a3b8", fontSize: "13px" }}>Tindak lanjut perbaikan fasilitas ruangan.</p>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "950px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={thStyle}>Ruangan</th><th style={thStyle}>Kerusakan</th><th style={thStyle}>Jenis Perbaikan</th><th style={thStyle}>Penanggung Jawab</th><th style={thStyle}>Tanggal Mulai</th><th style={thStyle}>Status</th>
                {isAdminRT && <th style={{ ...thStyle, textAlign: "center" }}>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const ITEMS_PER_PAGE = 10
                const totalPages = Math.ceil(perbaikan.length / ITEMS_PER_PAGE)
                const startIndex = currentPage * ITEMS_PER_PAGE
                const endIndex = startIndex + ITEMS_PER_PAGE
                const dataPaginated = perbaikan.slice(startIndex, endIndex)

                return (
                  <>
                    {dataPaginated.length > 0 ? dataPaginated.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #edf2f7" }}>
                        <td style={tdStyle}><div style={{ fontWeight: 600, color: "#334155" }}>{item.ruangan}</div></td>
                        <td style={tdStyle}><div style={{ fontWeight: 500, color: "#475569" }}>{item.kerusakan}</div></td>
                        <td style={tdStyle}>{item.jenisPerbaikan}</td>
                        <td style={tdStyle}>{item.penanggungJawab}</td>
                        <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{formatTanggal(item.tanggalMulai)}</td>
                        <td style={tdStyle}><span style={{ ...getStatusStyle(item.status), display: "inline-flex", alignItems: "center", padding: "6px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700 }}><span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "currentColor", marginRight: "6px" }} />{item.status}</span></td>
                        {isAdminRT && (
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                              {item.status === "Diproses" && <button onClick={() => handleSelesai(item.id)} style={{ padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", backgroundColor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}>Selesai</button>}
                              <button onClick={() => handleDelete(item.id)} style={{ padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}>Hapus</button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )) : <tr><td colSpan={isAdminRT ? 7 : 6} style={{ padding: "55px 20px", textAlign: "center" }}>Belum ada data perbaikan.</td></tr>}
                  </>
                )
              })()}
            </tbody>
          </table>
        </div>

        {(() => {
          const ITEMS_PER_PAGE = 10
          const totalPages = Math.ceil(perbaikan.length / ITEMS_PER_PAGE)
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

export default PerbaikanRuangan;