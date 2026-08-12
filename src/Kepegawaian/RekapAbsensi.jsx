import { useState } from "react";

function RekapAbsensi() {
  const [tahun, setTahun] = useState("2026");
  const [bulan, setBulan] = useState("");

  const dataPegawai = [
    {
      nama: "Delita Br Tinambunan",
      hadir: 220,
      izin: 2,
      sakit: 1,
      alpa: 0,
    },
    {
      nama: "Alya Deka Danisha",
      hadir: 215,
      izin: 3,
      sakit: 2,
      alpa: 3,
    },
    {
      nama: "Budi Santoso",
      hadir: 210,
      izin: 4,
      sakit: 5,
      alpa: 4,
    },
    {
      nama: "Citra Lestari",
      hadir: 218,
      izin: 2,
      sakit: 2,
      alpa: 1,
    },
  ];

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>
            Rekap Absensi
          </h1>

          <p style={subtitleStyle}>
            Melihat rekapitulasi kehadiran pegawai.
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div style={cardStyle}>
        <div style={filterGrid}>
          <div>
            <label style={labelStyle}>
              Periode Tahun
            </label>

            <select
              value={tahun}
              onChange={(e) =>
                setTahun(e.target.value)
              }
              style={inputStyle}
            >
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>
              Periode
            </label>

            <select
              value={bulan}
              onChange={(e) =>
                setBulan(e.target.value)
              }
              style={inputStyle}
            >
              <option value="">
                Rekap Tahunan
              </option>
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
        </div>
      </div>

      {/* RINGKASAN */}
      <div style={summaryGrid}>
        <SummaryCard
          title="Total Pegawai"
          value={dataPegawai.length}
        />

        <SummaryCard
          title="Total Hadir"
          value={dataPegawai.reduce(
            (total, item) =>
              total + item.hadir,
            0
          )}
        />

        <SummaryCard
          title="Total Izin"
          value={dataPegawai.reduce(
            (total, item) =>
              total + item.izin,
            0
          )}
        />

        <SummaryCard
          title="Total Alpa"
          value={dataPegawai.reduce(
            (total, item) =>
              total + item.alpa,
            0
          )}
        />
      </div>

      {/* TABLE */}
      <div style={cardStyle}>
        <div style={sectionHeader}>
          <div>
            <h2 style={sectionTitle}>
              Rekap {bulan ? "Bulanan" : "Tahunan"}
            </h2>

            <p style={sectionSubtitle}>
              Periode {tahun}
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>No</th>
                <th style={thStyle}>Nama Pegawai</th>
                <th style={thStyle}>Hadir</th>
                <th style={thStyle}>Izin</th>
                <th style={thStyle}>Sakit</th>
                <th style={thStyle}>Alpa</th>
                <th style={thStyle}>Total Tidak Hadir</th>
              </tr>
            </thead>

            <tbody>
              {dataPegawai.map((item, index) => {
                const tidakHadir =
                  item.izin +
                  item.sakit +
                  item.alpa;

                return (
                  <tr key={item.nama}>
                    <td style={tdStyle}>
                      {index + 1}
                    </td>

                    <td style={tdStyle}>
                      <strong>{item.nama}</strong>
                    </td>

                    <td style={tdStyle}>
                      {item.hadir}
                    </td>

                    <td style={tdStyle}>
                      {item.izin}
                    </td>

                    <td style={tdStyle}>
                      {item.sakit}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        color:
                          item.alpa > 0
                            ? "#dc2626"
                            : "#64748b",
                        fontWeight:
                          item.alpa > 0
                            ? 700
                            : 400,
                      }}
                    >
                      {item.alpa}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          ...totalBadge,
                          backgroundColor:
                            tidakHadir >= 5
                              ? "#fee2e2"
                              : "#f1f5f9",
                          color:
                            tidakHadir >= 5
                              ? "#991b1b"
                              : "#475569",
                        }}
                      >
                        {tidakHadir} hari
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div style={summaryCard}>
      <div style={summaryTitle}>
        {title}
      </div>

      <div style={summaryValue}>
        {value}
      </div>
    </div>
  );
}

const pageStyle = {
  padding: "32px",
  minHeight: "100%",
  backgroundColor: "#f5f8fc",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, sans-serif",
};

const headerStyle = {
  marginBottom: "24px",
};

const titleStyle = {
  margin: 0,
  fontSize: "30px",
  color: "#102a43",
};

const subtitleStyle = {
  margin: "7px 0 0",
  color: "#64748b",
  fontSize: "15px",
};

const cardStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  marginBottom: "22px",
  boxShadow: "0 2px 8px rgba(15,23,42,.04)",
  overflow: "hidden",
};

const filterGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "15px",
  padding: "20px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#334155",
  fontSize: "13px",
  fontWeight: 600,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  backgroundColor: "#fff",
  color: "#334155",
  fontSize: "13px",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "15px",
  marginBottom: "22px",
};

const summaryCard = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "18px",
};

const summaryTitle = {
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: 600,
};

const summaryValue = {
  marginTop: "5px",
  color: "#172b4d",
  fontSize: "25px",
  fontWeight: 700,
};

const sectionHeader = {
  padding: "20px 22px",
  borderBottom: "1px solid #e2e8f0",
};

const sectionTitle = {
  margin: 0,
  fontSize: "18px",
  color: "#172b4d",
};

const sectionSubtitle = {
  margin: "5px 0 0",
  color: "#94a3b8",
  fontSize: "13px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "850px",
};

const thStyle = {
  padding: "13px 15px",
  textAlign: "left",
  backgroundColor: "#f8fafc",
  color: "#64748b",
  fontSize: "11px",
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "15px",
  color: "#64748b",
  fontSize: "13px",
  borderBottom: "1px solid #edf2f7",
};

const totalBadge = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: 700,
};

export default RekapAbsensi;