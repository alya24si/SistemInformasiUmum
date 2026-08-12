import { useState } from "react";

function Pelanggaran() {
  const [tahun, setTahun] = useState("2026");
  const [filter, setFilter] = useState("Semua");

  const dataPelanggaran = [
    {
      id: 1,
      nama: "Alya Deka Danisha",
      jenis: "Alpa",
      jumlah: 3,
      periode: "2026",
      keterangan:
        "Tidak hadir tanpa keterangan.",
    },
    {
      id: 2,
      nama: "Budi Santoso",
      jenis: "Alpa",
      jumlah: 4,
      periode: "2026",
      keterangan:
        "Tidak hadir tanpa keterangan.",
    },
    {
      id: 3,
      nama: "Budi Santoso",
      jenis: "Terlambat",
      jumlah: 8,
      periode: "2026",
      keterangan:
        "Datang melewati jam kerja.",
    },
    {
      id: 4,
      nama: "Citra Lestari",
      jenis: "Alpa",
      jumlah: 1,
      periode: "2026",
      keterangan:
        "Tidak hadir tanpa keterangan.",
    },
  ];

  const dataDitampilkan =
    filter === "Semua"
      ? dataPelanggaran
      : dataPelanggaran.filter(
          (item) => item.jenis === filter
        );

  const getJenisStyle = (jenis) => {
    if (jenis === "Alpa") {
      return {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
      };
    }

    return {
      backgroundColor: "#fef3c7",
      color: "#92400e",
    };
  };

  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>
            Pelanggaran
          </h1>

          <p style={subtitleStyle}>
            Memantau ketidakhadiran dan pelanggaran pegawai.
          </p>
        </div>
      </div>

      {/* FILTER */}
      <div style={cardStyle}>
        <div style={filterGrid}>
          <div>
            <label style={labelStyle}>
              Tahun
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
              Jenis Pelanggaran
            </label>

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              style={inputStyle}
            >
              <option>Semua</option>
              <option>Alpa</option>
              <option>Terlambat</option>
            </select>
          </div>
        </div>
      </div>

      {/* RINGKASAN */}
      <div style={summaryGrid}>
        <SummaryCard
          title="Total Pelanggaran"
          value={dataDitampilkan.length}
        />

        <SummaryCard
          title="Total Alpa"
          value={dataPelanggaran
            .filter((item) => item.jenis === "Alpa")
            .reduce(
              (total, item) =>
                total + item.jumlah,
              0
            )}
        />

        <SummaryCard
          title="Total Terlambat"
          value={dataPelanggaran
            .filter(
              (item) =>
                item.jenis === "Terlambat"
            )
            .reduce(
              (total, item) =>
                total + item.jumlah,
              0
            )}
        />
      </div>

      {/* TABLE */}
      <div style={cardStyle}>
        <div style={sectionHeader}>
          <div>
            <h2 style={sectionTitle}>
              Daftar Pelanggaran
            </h2>

            <p style={sectionSubtitle}>
              Data pelanggaran pegawai tahun {tahun}.
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>No</th>
                <th style={thStyle}>
                  Nama Pegawai
                </th>
                <th style={thStyle}>
                  Jenis Pelanggaran
                </th>
                <th style={thStyle}>
                  Jumlah
                </th>
                <th style={thStyle}>
                  Keterangan
                </th>
              </tr>
            </thead>

            <tbody>
              {dataDitampilkan.length > 0 ? (
                dataDitampilkan.map(
                  (item, index) => (
                    <tr key={item.id}>
                      <td style={tdStyle}>
                        {index + 1}
                      </td>

                      <td style={tdStyle}>
                        <strong>
                          {item.nama}
                        </strong>
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            ...badgeStyle,
                            ...getJenisStyle(
                              item.jenis
                            ),
                          }}
                        >
                          {item.jenis}
                        </span>
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 700,
                          color: "#dc2626",
                        }}
                      >
                        {item.jumlah} kali
                      </td>

                      <td style={tdStyle}>
                        {item.keterangan}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={emptyStyle}
                  >
                    Tidak ada data pelanggaran.
                  </td>
                </tr>
              )}
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
  minWidth: "750px",
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

const badgeStyle = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: 700,
};

const emptyStyle = {
  padding: "50px",
  textAlign: "center",
  color: "#94a3b8",
};

export default Pelanggaran;