import { useState } from "react";

function KalenderRuangan({ user }) {
  const isAdminRT = user.role === 'admin_rumahtangga' || user.role === 'superadmin';

  const [booking] = useState([
    { id: 1, ruangan: "Ruang Rapat Utama", pemesan: "Delita Br Tinambunan", bagian: "Bagian Keuangan", kegiatan: "Rapat Koordinasi", tanggal: "2026-08-12", mulai: "08:00", selesai: "10:00", status: "Disetujui" },
    { id: 2, ruangan: "Aula", pemesan: "Alya Deka Danisha", bagian: "Bagian Kepegawaian", kegiatan: "Kegiatan Internal", tanggal: "2026-08-12", mulai: "13:00", selesai: "16:00", status: "Disetujui" },
    { id: 3, ruangan: "Ruang Rapat 1", pemesan: "Budi Santoso", bagian: "Bagian Umum", kegiatan: "Rapat Tim", tanggal: "2026-08-13", mulai: "09:00", selesai: "11:00", status: "Disetujui" },
    { id: 4, ruangan: "Ruang Rapat 2", pemesan: "Siti Rahma", bagian: "Bagian Keuangan", kegiatan: "Evaluasi Anggaran", tanggal: "2026-08-15", mulai: "10:00", selesai: "12:00", status: "Disetujui" },
  ]);

  const [tanggalDipilih, setTanggalDipilih] = useState("2026-08-12");

  const formatTanggal = (tanggal) => new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const formatTanggalSingkat = (tanggal) => {
    const d = new Date(`${tanggal}T00:00:00`);
    return { hari: d.toLocaleDateString("id-ID", { weekday: "short" }), tanggal: d.toLocaleDateString("id-ID", { day: "numeric" }), bulan: d.toLocaleDateString("id-ID", { month: "short" }) };
  };

  const bookingDisetujui = booking.filter((item) => item.status === "Disetujui");
  const bookingHariIni = bookingDisetujui.filter((item) => item.tanggal === tanggalDipilih).sort((a, b) => a.mulai.localeCompare(b.mulai));

  const daftarTanggal = ["2026-08-10", "2026-08-11", "2026-08-12", "2026-08-13", "2026-08-14", "2026-08-15", "2026-08-16"];

  return (
    <div style={{ padding: "32px", minHeight: "100%", backgroundColor: "#f5f8fc", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "30px", fontWeight: 700, color: "#102a43" }}>Kalender Ruangan</h1>
        <p style={{ margin: "7px 0 0", color: "#64748b", fontSize: "15px" }}>Lihat jadwal penggunaan ruangan yang telah disetujui.</p>
      </div>

      <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px 20px", marginBottom: "22px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "9px", height: "9px", borderRadius: "50%", backgroundColor: "#0b72e7" }} />
          <strong style={{ color: "#1e293b", fontSize: "15px" }}>Kalender Otomatis</strong>
        </div>
        <p style={{ margin: "8px 0 0 19px", color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>Jadwal berasal dari booking yang telah disetujui oleh Admin Rumah Tangga.</p>
      </div>

      <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "22px", marginBottom: "22px" }}>
        <div style={{ marginBottom: "16px" }}><h2 style={{ margin: 0, fontSize: "18px", fontWeight: 650, color: "#172b4d" }}>Pilih Tanggal</h2></div>
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "4px" }}>
          {daftarTanggal.map((tanggal) => {
            const info = formatTanggalSingkat(tanggal);
            const aktif = tanggal === tanggalDipilih;
            const jumlah = bookingDisetujui.filter((i) => i.tanggal === tanggal).length;
            return (
              <button key={tanggal} onClick={() => setTanggalDipilih(tanggal)} style={{ minWidth: "86px", padding: "12px 10px", border: aktif ? "2px solid #0b72e7" : "1px solid #e2e8f0", borderRadius: "10px", backgroundColor: aktif ? "#eff6ff" : "#fff", color: aktif ? "#0b72e7" : "#475569", cursor: "pointer", textAlign: "center" }}>
                <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", marginBottom: "3px" }}>{info.hari}</div>
                <div style={{ fontSize: "20px", fontWeight: 700 }}>{info.tanggal}</div>
                <div style={{ fontSize: "11px", marginTop: "2px" }}>{info.bulan}</div>
                {jumlah > 0 && <div style={{ marginTop: "7px", fontSize: "10px", fontWeight: 600 }}>{jumlah} jadwal</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: "18px" }}>
        <h2 style={{ margin: 0, fontSize: "21px", fontWeight: 650, color: "#172b4d" }}>{formatTanggal(tanggalDipilih)}</h2>
        <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: "14px" }}>{bookingHariIni.length} ruangan digunakan pada tanggal ini.</p>
      </div>

      {bookingHariIni.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {bookingHariIni.map((item) => (
            <div key={item.id} style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(15,23,42,0.04)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", backgroundColor: "#0b72e7" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "18px", paddingLeft: "5px" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 650, color: "#172b4d" }}>{item.ruangan}</h3>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "9px", backgroundColor: "#eff6ff", color: "#0b72e7", padding: "6px 10px", borderRadius: "7px", fontSize: "12px", fontWeight: 700 }}>🕐 {item.mulai} - {item.selesai}</div>
                </div>
                <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>Disetujui</span>
              </div>
              <div style={{ borderTop: "1px solid #edf2f7", paddingTop: "15px", paddingLeft: "5px", display: "grid", gap: "11px" }}>
                <div><div style={detailLabelStyle}>Kegiatan</div><div style={detailValueStyle}>{item.kegiatan}</div></div>
                <div><div style={detailLabelStyle}>Pemesan</div><div style={detailValueStyle}>{item.pemesan}</div></div>
                <div><div style={detailLabelStyle}>Bagian</div><div style={detailValueStyle}>{item.bagian}</div></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "55px 20px", textAlign: "center" }}>
          <div style={{ width: "60px", height: "60px", margin: "0 auto 15px", borderRadius: "50%", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px" }}>📅</div>
          <h3 style={{ margin: 0, color: "#334155", fontSize: "17px", fontWeight: 650 }}>Tidak ada booking</h3>
          <p style={{ margin: "7px 0 0", color: "#94a3b8", fontSize: "14px" }}>Tidak ada ruangan yang digunakan pada tanggal ini.</p>
        </div>
      )}
    </div>
  );
}

const detailLabelStyle = { color: "#94a3b8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "3px" };
const detailValueStyle = { color: "#475569", fontSize: "13px", fontWeight: 500 };

export default KalenderRuangan;