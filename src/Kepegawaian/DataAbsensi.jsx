import { useState } from "react";

function DataAbsensi() {
  const [showForm, setShowForm] = useState(false);

  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("2026");
  const [search, setSearch] = useState("");

  const [absensi, setAbsensi] = useState([
    {
      id: 1,
      nama: "Delita Br Tinambunan",
      tanggal: "2026-08-01",
      jamMasuk: "07:45",
      jamPulang: "16:00",
      status: "Hadir",
    },
    {
      id: 2,
      nama: "Alya Deka Danisha",
      tanggal: "2026-08-01",
      jamMasuk: "-",
      jamPulang: "-",
      status: "Izin",
    },
    {
      id: 3,
      nama: "Budi Santoso",
      tanggal: "2026-08-02",
      jamMasuk: "-",
      jamPulang: "-",
      status: "Alpa",
    },
    {
      id: 4,
      nama: "Delita Br Tinambunan",
      tanggal: "2026-08-02",
      jamMasuk: "07:50",
      jamPulang: "16:05",
      status: "Hadir",
    },
  ]);

  const [formData, setFormData] = useState({
    nama: "",
    tanggal: "",
    jamMasuk: "",
    jamPulang: "",
    status: "Hadir",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataBaru = {
      id: Date.now(),
      ...formData,
      jamMasuk: formData.jamMasuk || "-",
      jamPulang: formData.jamPulang || "-",
    };

    setAbsensi([...absensi, dataBaru]);

    setFormData({
      nama: "",
      tanggal: "",
      jamMasuk: "",
      jamPulang: "",
      status: "Hadir",
    });

    setShowForm(false);
  };

  const getStatusStyle = (status) => {
    if (status === "Hadir") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "Izin") {
      return {
        backgroundColor: "#fef3c7",
        color: "#92400e",
      };
    }

    if (status === "Sakit") {
      return {
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    return {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    };
  };

  const dataDitampilkan = absensi.filter((item) => {
    const date = new Date(`${item.tanggal}T00:00:00`);

    const bulan = String(date.getMonth() + 1).padStart(2, "0");
    const tahun = String(date.getFullYear());

    const cocokBulan =
      filterBulan === "" || bulan === filterBulan;

    const cocokTahun =
      filterTahun === "" || tahun === filterTahun;

    const cocokNama = item.nama
      .toLowerCase()
      .includes(search.toLowerCase());

    return cocokBulan && cocokTahun && cocokNama;
  });

  const formatTanggal = (tanggal) => {
    return new Date(
      `${tanggal}T00:00:00`
    ).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div style={pageStyle}>
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Data Absensi</h1>

          <p style={subtitleStyle}>
            Mengelola dan memantau data kehadiran pegawai.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            style={secondaryButton}
            onClick={() =>
              alert("Fitur import Excel akan dihubungkan nanti.")
            }
          >
            ↑ Import Excel
          </button>

          <button
            style={primaryButton}
            onClick={() => setShowForm(true)}
          >
            + Tambah Absensi
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div style={cardStyle}>
        <div style={filterGrid}>
          <div>
            <label style={labelStyle}>Cari Pegawai</label>

            <input
              type="text"
              placeholder="Cari nama pegawai..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Bulan</label>

            <select
              value={filterBulan}
              onChange={(e) =>
                setFilterBulan(e.target.value)
              }
              style={inputStyle}
            >
              <option value="">Semua Bulan</option>
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

          <div>
            <label style={labelStyle}>Tahun</label>

            <select
              value={filterTahun}
              onChange={(e) =>
                setFilterTahun(e.target.value)
              }
              style={inputStyle}
            >
              <option value="">Semua Tahun</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitle}>
              Daftar Absensi
            </h2>

            <p style={sectionSubtitle}>
              Data absensi yang telah dimasukkan oleh admin.
            </p>
          </div>

          <span style={countBadge}>
            {dataDitampilkan.length} Data
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>No</th>
                <th style={thStyle}>Nama Pegawai</th>
                <th style={thStyle}>Tanggal</th>
                <th style={thStyle}>Jam Masuk</th>
                <th style={thStyle}>Jam Pulang</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>

            <tbody>
              {dataDitampilkan.length > 0 ? (
                dataDitampilkan.map((item, index) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>{index + 1}</td>

                    <td style={tdStyle}>
                      <strong>{item.nama}</strong>
                    </td>

                    <td style={tdStyle}>
                      {formatTanggal(item.tanggal)}
                    </td>

                    <td style={tdStyle}>
                      {item.jamMasuk}
                    </td>

                    <td style={tdStyle}>
                      {item.jamPulang}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          ...statusStyle,
                          ...getStatusStyle(item.status),
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={emptyStyle}>
                    Tidak ada data absensi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showForm && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h2 style={sectionTitle}>
                  Tambah Data Absensi
                </h2>

                <p style={sectionSubtitle}>
                  Masukkan data absensi pegawai.
                </p>
              </div>

              <button
                style={closeButton}
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={formGroup}>
                <label style={labelStyle}>
                  Nama Pegawai
                </label>

                <input
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  placeholder="Nama pegawai"
                  style={inputStyle}
                />
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>
                  Tanggal
                </label>

                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              <div style={twoColumn}>
                <div>
                  <label style={labelStyle}>
                    Jam Masuk
                  </label>

                  <input
                    type="time"
                    name="jamMasuk"
                    value={formData.jamMasuk}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    Jam Pulang
                  </label>

                  <input
                    type="time"
                    name="jamPulang"
                    value={formData.jamPulang}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={formGroup}>
                <label style={labelStyle}>
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option>Hadir</option>
                  <option>Izin</option>
                  <option>Sakit</option>
                  <option>Alpa</option>
                </select>
              </div>

              <div style={modalFooter}>
                <button
                  type="button"
                  style={cancelButton}
                  onClick={() => setShowForm(false)}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  style={primaryButton}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "24px",
  gap: "20px",
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
    "repeat(auto-fit, minmax(200px, 1fr))",
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
  outline: "none",
  backgroundColor: "#fff",
  color: "#334155",
  fontSize: "13px",
};

const primaryButton = {
  border: "none",
  backgroundColor: "#0b72e7",
  color: "#fff",
  padding: "11px 17px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const secondaryButton = {
  border: "1px solid #cbd5e1",
  backgroundColor: "#fff",
  color: "#475569",
  padding: "10px 16px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const sectionHeaderStyle = {
  padding: "20px 22px",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
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

const countBadge = {
  padding: "6px 10px",
  borderRadius: "20px",
  backgroundColor: "#eff6ff",
  color: "#1d4ed8",
  fontSize: "12px",
  fontWeight: 700,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "800px",
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

const statusStyle = {
  display: "inline-flex",
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

const overlayStyle = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(15,23,42,.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 1000,
};

const modalStyle = {
  width: "100%",
  maxWidth: "520px",
  backgroundColor: "#fff",
  borderRadius: "14px",
  padding: "22px",
  boxSizing: "border-box",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "22px",
};

const closeButton = {
  width: "34px",
  height: "34px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#f1f5f9",
  fontSize: "20px",
  cursor: "pointer",
};

const formGroup = {
  marginBottom: "17px",
};

const twoColumn = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginBottom: "17px",
};

const modalFooter = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "22px",
  paddingTop: "18px",
  borderTop: "1px solid #e2e8f0",
};

const cancelButton = {
  border: "1px solid #cbd5e1",
  backgroundColor: "#fff",
  color: "#475569",
  padding: "10px 17px",
  borderRadius: "8px",
  cursor: "pointer",
};

export default DataAbsensi;