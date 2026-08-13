import { useState } from "react";

function BookingRuangan({ user }) {
  const isAdminRT = user.role === 'admin_rumahtangga' || user.role === 'superadmin';

  const [booking, setBooking] = useState([
    { id: 1, ruangan: "Ruang Rapat Utama", pemesan: "Delita Br Tinambunan", bagian: "Bagian Keuangan", kegiatan: "Rapat Koordinasi", tanggal: "2026-08-12", mulai: "08:00", selesai: "10:00", status: "Disetujui" },
    { id: 2, ruangan: "Aula", pemesan: "Alya Deka Danisha", bagian: "Bagian Kepegawaian", kegiatan: "Kegiatan Internal", tanggal: "2026-08-12", mulai: "13:00", selesai: "16:00", status: "Menunggu" },
    { id: 3, ruangan: "Ruang Rapat 1", pemesan: "Budi Santoso", bagian: "Bagian Umum", kegiatan: "Rapat Tim", tanggal: "2026-08-13", mulai: "09:00", selesai: "11:00", status: "Ditolak", alasanTolak: "Jadwal ruangan tidak tersedia." },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ ruangan: "", kegiatan: "", tanggal: "", mulai: "", selesai: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const cekBentrok = () => {
    return booking.some((item) => {
      if (item.ruangan !== formData.ruangan || item.tanggal !== formData.tanggal) return false;
      if (item.status === "Ditolak") return false;
      return formData.mulai < item.selesai && formData.selesai > item.mulai;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.selesai <= formData.mulai) { alert("Jam selesai harus lebih besar dari jam mulai."); return; }
    if (cekBentrok()) { alert("Ruangan sudah memiliki booking pada waktu tersebut."); return; }

    const bookingBaru = {
      id: Date.now(),
      ruangan: formData.ruangan,
      pemesan: user.nama,
      bagian: user.bidang,
      kegiatan: formData.kegiatan,
      tanggal: formData.tanggal,
      mulai: formData.mulai,
      selesai: formData.selesai,
      status: "Menunggu",
    };
    setBooking([...booking, bookingBaru]);
    setFormData({ ruangan: "", kegiatan: "", tanggal: "", mulai: "", selesai: "" });
    setShowForm(false);
    alert("Pengajuan booking berhasil dikirim.");
  };

  const handleSetujui = (id) => {
    const bookingDipilih = booking.find((item) => item.id === id);
    if (!bookingDipilih) return;
    const bentrok = booking.some((item) => {
      if (item.id === id || item.ruangan !== bookingDipilih.ruangan || item.tanggal !== bookingDipilih.tanggal || item.status !== "Disetujui") return false;
      return bookingDipilih.mulai < item.selesai && bookingDipilih.selesai > item.mulai;
    });
    if (bentrok) { alert("Booking tidak dapat disetujui karena jadwal bentrok."); return; }
    setBooking(booking.map((item) => item.id === id ? { ...item, status: "Disetujui" } : item));
  };

  const handleTolak = (id) => {
    const alasan = window.prompt("Masukkan alasan penolakan:");
    if (alasan === null) return;
    setBooking(booking.map((item) => item.id === id ? { ...item, status: "Ditolak", alasanTolak: alasan } : item));
  };

  const handleBatal = (id) => {
    if (!window.confirm("Batalkan booking ini?")) return;
    setBooking(booking.filter((item) => item.id !== id));
  };

  // Admin lihat semua, user lain hanya lihat booking miliknya sendiri
  const bookingDitampilkan = isAdminRT ? booking : booking.filter((item) => item.pemesan === user.nama);

  const getStatusStyle = (status) => {
    if (status === "Disetujui") return { backgroundColor: "#dcfce7", color: "#166534" };
    if (status === "Menunggu") return { backgroundColor: "#fef3c7", color: "#92400e" };
    return { backgroundColor: "#fee2e2", color: "#991b1b" };
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    return new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div style={{ padding: "32px", minHeight: "100%", backgroundColor: "#f5f8fc", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 700, color: "#102a43" }}>Booking Ruangan</h1>
          <p style={{ margin: "7px 0 0", color: "#64748b", fontSize: "15px" }}>Ajukan pemesanan ruangan. Admin Rumah Tangga akan menyetujui pengajuan Anda.</p>
        </div>
        <button onClick={() => setShowForm(true)} style={{ border: "none", backgroundColor: "#0b72e7", color: "#fff", padding: "11px 18px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", boxShadow: "0 3px 8px rgba(11,114,231,0.2)" }}>+ Ajukan Booking</button>
      </div>

      <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "9px", height: "9px", backgroundColor: isAdminRT ? "#0b72e7" : "#16a34a", borderRadius: "50%", display: "inline-block" }} />
          <strong style={{ color: "#1e293b", fontSize: "15px" }}>{isAdminRT ? "Mode Admin Rumah Tangga" : "Mode Pegawai"}</strong>
        </div>
        <p style={{ margin: "7px 0 0 19px", color: "#64748b", fontSize: "14px" }}>
          {isAdminRT ? "Anda dapat melihat & memproses seluruh pengajuan booking." : "Anda dapat mengajukan booking dan melihat status pengajuan Anda."}
        </p>
      </div>

      <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 10px rgba(15,23,42,0.05)" }}>
        <div style={{ padding: "20px 22px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 650, color: "#172b4d" }}>{isAdminRT ? "Seluruh Booking" : "Booking Saya"}</h2>
            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "13px" }}>Total {bookingDitampilkan.length} booking</p>
          </div>
        </div>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: "1000px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <th style={thStyle}>Ruangan</th>
                <th style={thStyle}>Pemesan</th>
                <th style={thStyle}>Bagian</th>
                <th style={thStyle}>Kegiatan</th>
                <th style={thStyle}>Tanggal</th>
                <th style={thStyle}>Waktu</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bookingDitampilkan.length > 0 ? bookingDitampilkan.map((item) => (
                <tr key={item.id} style={{ borderTop: "1px solid #edf2f7" }}>
                  <td style={tdStyle}><div style={{ fontWeight: 600, color: "#1e293b" }}>{item.ruangan}</div></td>
                  <td style={tdStyle}>{item.pemesan}</td>
                  <td style={tdStyle}>{item.bagian}</td>
                  <td style={{ ...tdStyle, maxWidth: "220px" }}>{item.kegiatan}</td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{formatTanggal(item.tanggal)}</td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}><span style={{ backgroundColor: "#f1f5f9", color: "#475569", padding: "6px 9px", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}>{item.mulai} - {item.selesai}</span></td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span style={{ ...getStatusStyle(item.status), display: "inline-block", padding: "6px 11px", borderRadius: "20px", fontSize: "12px", fontWeight: 600 }}>{item.status}</span>
                    {item.status === "Ditolak" && item.alasanTolak && <div style={{ marginTop: "6px", color: "#991b1b", fontSize: "11px", maxWidth: "180px" }}>{item.alasanTolak}</div>}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
                      {isAdminRT && item.status === "Menunggu" && (
                        <>
                          <button onClick={() => handleSetujui(item.id)} style={{ border: "1px solid #bbf7d0", backgroundColor: "#f0fdf4", color: "#15803d", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Setujui</button>
                          <button onClick={() => handleTolak(item.id)} style={{ border: "1px solid #fecaca", backgroundColor: "#fef2f2", color: "#dc2626", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Tolak</button>
                        </>
                      )}
                      {!isAdminRT && item.status === "Menunggu" && item.pemesan === user.nama && (
                        <button onClick={() => handleBatal(item.id)} style={{ border: "1px solid #fecaca", backgroundColor: "#fef2f2", color: "#dc2626", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Batalkan</button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" style={{ padding: "45px 20px", textAlign: "center", color: "#94a3b8" }}>Belum ada data booking.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
          <div style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", backgroundColor: "#fff", borderRadius: "14px", boxShadow: "0 20px 50px rgba(15,23,42,0.25)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><h2 style={{ margin: 0, color: "#172b4d", fontSize: "20px" }}>Ajukan Booking Ruangan</h2><p style={{ margin: "5px 0 0", color: "#94a3b8", fontSize: "13px" }}>Nama dan bagian otomatis terisi.</p></div>
              <button onClick={() => setShowForm(false)} style={{ border: "none", backgroundColor: "#f1f5f9", color: "#64748b", width: "34px", height: "34px", borderRadius: "50%", cursor: "pointer", fontSize: "18px" }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div><label style={labelStyle}>Pemesan</label><input type="text" value={user.nama} disabled style={{ ...inputStyle, backgroundColor: "#f8fafc" }} /></div>
              <div><label style={labelStyle}>Bagian</label><input type="text" value={user.bidang} disabled style={{ ...inputStyle, backgroundColor: "#f8fafc" }} /></div>
              <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Ruangan</label>
                <select name="ruangan" value={formData.ruangan} onChange={handleChange} required style={inputStyle}>
                  <option value="">Pilih Ruangan</option>
                  <option>Ruang Rapat Utama</option><option>Ruang Rapat 1</option><option>Ruang Rapat 2</option><option>Aula</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}><label style={labelStyle}>Kegiatan</label><input type="text" name="kegiatan" value={formData.kegiatan} onChange={handleChange} required style={inputStyle} /></div>
              <div><label style={labelStyle}>Tanggal</label><input type="date" name="tanggal" value={formData.tanggal} onChange={handleChange} required style={inputStyle} /></div>
              <div></div>
              <div><label style={labelStyle}>Jam Mulai</label><input type="time" name="mulai" value={formData.mulai} onChange={handleChange} required style={inputStyle} /></div>
              <div><label style={labelStyle}>Jam Selesai</label><input type="time" name="selesai" value={formData.selesai} onChange={handleChange} required style={inputStyle} /></div>
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "18px", borderTop: "1px solid #e5e7eb" }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 17px", border: "1px solid #cbd5e1", backgroundColor: "#fff", color: "#475569", borderRadius: "7px", fontWeight: 600, cursor: "pointer" }}>Batal</button>
                <button type="submit" style={{ padding: "10px 18px", border: "none", backgroundColor: "#0b72e7", color: "#fff", borderRadius: "7px", fontWeight: 600, cursor: "pointer" }}>Ajukan Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: "14px 16px", color: "#64748b", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", textAlign: "left", whiteSpace: "nowrap" };
const tdStyle = { padding: "15px 16px", color: "#475569", fontSize: "13px", verticalAlign: "middle" };
const labelStyle = { display: "block", marginBottom: "7px", color: "#334155", fontSize: "13px", fontWeight: 600 };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "7px", outline: "none", fontSize: "14px", color: "#334155", backgroundColor: "#fff" };

export default BookingRuangan;