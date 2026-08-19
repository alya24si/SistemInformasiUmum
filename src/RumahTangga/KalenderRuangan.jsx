import { useEffect, useState } from "react";

const API = 'http://localhost:8000/api'

const toDateString = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const namaHariSingkat = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const todayString = toDateString(new Date());

// Bangun grid kalender bulanan: array minggu, tiap minggu array 7 hari (null jika di luar bulan)
const buatGridBulan = (tahun, bulan) => {
  const tanggalPertama = new Date(tahun, bulan, 1);
  const jumlahHari = new Date(tahun, bulan + 1, 0).getDate();
  const offsetAwal = tanggalPertama.getDay(); // 0 = Minggu

  const sel = [];
  for (let i = 0; i < offsetAwal; i++) sel.push(null);
  for (let d = 1; d <= jumlahHari; d++) {
    sel.push(toDateString(new Date(tahun, bulan, d)));
  }
  while (sel.length % 7 !== 0) sel.push(null);

  const minggu = [];
  for (let i = 0; i < sel.length; i += 7) minggu.push(sel.slice(i, i + 7));
  return minggu;
};

function KalenderRuangan({ user }) {
  const isAdminRT = user.role === 'admin_rumahtangga' || user.role === 'superadmin';

  const [bookingDisetujui, setBookingDisetujui] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const hariIni = new Date();
  const [bulanAktif, setBulanAktif] = useState(hariIni.getMonth());
  const [tahunAktif, setTahunAktif] = useState(hariIni.getFullYear());

  const gridBulan = buatGridBulan(tahunAktif, bulanAktif);

  const [tanggalDipilih, setTanggalDipilih] = useState(todayString);

  const keBulanSebelumnya = () => {
    if (bulanAktif === 0) {
      setBulanAktif(11);
      setTahunAktif((t) => t - 1);
    } else {
      setBulanAktif((b) => b - 1);
    }
  };

  const keBulanBerikutnya = () => {
    if (bulanAktif === 11) {
      setBulanAktif(0);
      setTahunAktif((t) => t + 1);
    } else {
      setBulanAktif((b) => b + 1);
    }
  };

  const keBulanIni = () => {
    setBulanAktif(hariIni.getMonth());
    setTahunAktif(hariIni.getFullYear());
    setTanggalDipilih(todayString);
  };

  useEffect(() => {
    const muatData = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const res = await fetch(API + '/booking_ruangan/kalender');
        const json = await res.json();
        setBookingDisetujui(json?.data || []);
      } catch (err) {
        setErrorMsg("Gagal memuat jadwal booking ruangan.");
      } finally {
        setLoading(false);
      }
    };

    muatData();
  }, []);

  const formatTanggal = (tanggal) => new Date(`${tanggal}T00:00:00`).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const bookingHariIni = bookingDisetujui.filter((item) => item.tanggal === tanggalDipilih).sort((a, b) => a.mulai.localeCompare(b.mulai));

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

      {errorMsg && (
        <div style={{ padding: "12px 16px", marginBottom: "16px", borderRadius: "8px", backgroundColor: "#fee2e2", color: "#991b1b", fontSize: "13px" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {loading && (
        <div style={{ padding: "12px 16px", marginBottom: "16px", borderRadius: "8px", backgroundColor: "#f1f5f9", color: "#475569", fontSize: "13px" }}>
          Memuat jadwal booking ruangan...
        </div>
      )}

      <div style={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "22px", marginBottom: "22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 650, color: "#172b4d" }}>{namaBulan[bulanAktif]} {tahunAktif}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={keBulanIni} style={{ padding: "7px 14px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#fff", color: "#475569", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Hari Ini</button>
            <button onClick={keBulanSebelumnya} aria-label="Bulan sebelumnya" style={{ width: "34px", height: "34px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#fff", color: "#475569", fontSize: "15px", cursor: "pointer" }}>‹</button>
            <button onClick={keBulanBerikutnya} aria-label="Bulan berikutnya" style={{ width: "34px", height: "34px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#fff", color: "#475569", fontSize: "15px", cursor: "pointer" }}>›</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px", marginBottom: "6px" }}>
          {namaHariSingkat.map((h) => (
            <div key={h} style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", padding: "4px 0" }}>{h}</div>
          ))}
        </div>

        <div style={{ display: "grid", gap: "6px" }}>
          {gridBulan.map((minggu, wi) => (
            <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
              {minggu.map((tanggal, di) => {
                if (!tanggal) return <div key={di} />;
                const aktif = tanggal === tanggalDipilih;
                const hariIniFlag = tanggal === todayString;
                const jumlah = bookingDisetujui.filter((i) => i.tanggal === tanggal).length;
                const nomorHari = Number(tanggal.split("-")[2]);
                return (
                  <button
                    key={tanggal}
                    onClick={() => setTanggalDipilih(tanggal)}
                    style={{
                      minHeight: "62px",
                      padding: "8px 6px",
                      border: aktif ? "2px solid #0b72e7" : hariIniFlag ? "1px solid #0b72e7" : "1px solid #e2e8f0",
                      borderRadius: "10px",
                      backgroundColor: aktif ? "#eff6ff" : "#fff",
                      color: aktif ? "#0b72e7" : "#334155",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: hariIniFlag ? 700 : 600 }}>{nomorHari}</span>
                    {jumlah > 0 && (
                      <span style={{ alignSelf: "flex-start", fontSize: "10px", fontWeight: 700, color: "#0b72e7", backgroundColor: "#eff6ff", borderRadius: "6px", padding: "1px 6px" }}>{jumlah}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
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
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                  <span style={{ backgroundColor: "#dcfce7", color: "#166534", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>Disetujui</span>
                  <span style={{ backgroundColor: item.jenis_pertemuan === "Online" ? "#dcfce7" : "#fef9c3", color: item.jenis_pertemuan === "Online" ? "#166534" : "#854d0e", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600 }}>{item.jenis_pertemuan || "Offline"}</span>
                </div>
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