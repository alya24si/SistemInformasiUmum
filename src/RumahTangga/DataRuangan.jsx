import { useState } from "react";

function DataRuangan() {
  const [role] = useState("admin");

  const [ruangan, setRuangan] = useState([
    {
      id: 1,
      nama: "Ruang Rapat Utama",
      kode: "RR-01",
      kapasitas: 30,
      lokasi: "Lantai 1",
      fasilitas: "AC, Proyektor, Meja, Kursi",
      status: "Tersedia",
    },
    {
      id: 2,
      nama: "Ruang Rapat 1",
      kode: "RR-02",
      kapasitas: 15,
      lokasi: "Lantai 1",
      fasilitas: "AC, TV, Meja, Kursi",
      status: "Tersedia",
    },
    {
      id: 3,
      nama: "Ruang Rapat 2",
      kode: "RR-03",
      kapasitas: 15,
      lokasi: "Lantai 2",
      fasilitas: "AC, Proyektor, Meja, Kursi",
      status: "Digunakan",
    },
    {
      id: 4,
      nama: "Aula",
      kode: "AU-01",
      kapasitas: 100,
      lokasi: "Lantai 1",
      fasilitas: "AC, Sound System, Proyektor",
      status: "Tersedia",
    },
    {
      id: 5,
      nama: "Ruang Arsip",
      kode: "RA-01",
      kapasitas: 10,
      lokasi: "Lantai 2",
      fasilitas: "Rak Arsip, AC",
      status: "Maintenance",
    },
  ]);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    nama: "",
    kode: "",
    kapasitas: "",
    lokasi: "",
    fasilitas: "",
    status: "Tersedia",
  });

  // SEARCH
  const filteredRuangan = ruangan.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.nama.toLowerCase().includes(keyword) ||
      item.kode.toLowerCase().includes(keyword) ||
      item.lokasi.toLowerCase().includes(keyword)
    );
  });

  // FORM
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // TAMBAH RUANGAN
  const handleSubmit = (e) => {
    e.preventDefault();

    const dataBaru = {
      id: Date.now(),
      ...formData,
      kapasitas: Number(formData.kapasitas),
    };

    setRuangan([...ruangan, dataBaru]);

    setFormData({
      nama: "",
      kode: "",
      kapasitas: "",
      lokasi: "",
      fasilitas: "",
      status: "Tersedia",
    });

    setShowForm(false);
  };

  // HAPUS RUANGAN
  const handleDelete = (id) => {
    const konfirmasi = window.confirm(
      "Apakah kamu yakin ingin menghapus ruangan ini?"
    );

    if (!konfirmasi) return;

    setRuangan(ruangan.filter((item) => item.id !== id));
  };

  // STATUS BADGE
  const getStatusStyle = (status) => {
    if (status === "Tersedia") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "Digunakan") {
      return {
        backgroundColor: "#fef3c7",
        color: "#92400e",
      };
    }

    return {
      backgroundColor: "#fee2e2",
      color: "#991b1b",
    };
  };

  return (
    <div
      style={{
        padding: "32px",
        minHeight: "100%",
        backgroundColor: "#f5f8fc",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 700,
              color: "#102a43",
            }}
          >
            Data Ruangan
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Informasi ruangan dan fasilitas yang tersedia.
          </p>
        </div>

        {role === "admin" && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              border: "none",
              backgroundColor: "#0b72e7",
              color: "#ffffff",
              padding: "11px 18px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 3px 8px rgba(11, 114, 231, 0.2)",
            }}
          >
            + Tambah Ruangan
          </button>
        )}
      </div>

      {/* ROLE INFORMATION */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "18px 20px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              width: "9px",
              height: "9px",
              backgroundColor: "#16a34a",
              borderRadius: "50%",
              display: "inline-block",
            }}
          />

          <strong
            style={{
              color: "#1e293b",
              fontSize: "15px",
            }}
          >
            {role === "admin"
              ? "Mode Admin Rumah Tangga"
              : "Mode Pegawai"}
          </strong>
        </div>

        <p
          style={{
            margin: "7px 0 0 19px",
            color: "#64748b",
            fontSize: "14px",
          }}
        >
          {role === "admin"
            ? "Anda dapat mengelola data ruangan."
            : "Anda hanya dapat melihat data ruangan."}
        </p>
      </div>

      {/* MAIN CARD */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
        }}
      >
        {/* CARD HEADER */}
        <div
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 650,
                color: "#172b4d",
              }}
            >
              Daftar Ruangan
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              Total {filteredRuangan.length} ruangan
            </p>
          </div>

          {/* SEARCH */}
          <div
            style={{
              position: "relative",
              width: "320px",
              maxWidth: "100%",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "13px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: "16px",
              }}
            >
              🔍
            </span>

            <input
              type="text"
              placeholder="Cari nama, kode, atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "11px 14px 11px 38px",
                border: "1px solid #dbe2ea",
                borderRadius: "8px",
                outline: "none",
                fontSize: "14px",
                color: "#334155",
                backgroundColor: "#ffffff",
              }}
            />
          </div>
        </div>

        {/* TABLE */}
        <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: "1000px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8fafc",
                }}
              >
                <th style={thStyle}>No</th>
                <th style={{ ...thStyle, textAlign: "left" }}>
                  Nama Ruangan
                </th>
                <th style={thStyle}>Kode</th>
                <th style={thStyle}>Kapasitas</th>
                <th style={thStyle}>Lokasi</th>
                <th style={{ ...thStyle, textAlign: "left" }}>
                  Fasilitas
                </th>
                <th style={thStyle}>Status</th>

                {role === "admin" && (
                  <th style={thStyle}>Aksi</th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredRuangan.length > 0 ? (
                filteredRuangan.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{
                      borderTop: "1px solid #edf2f7",
                    }}
                  >
                    <td style={tdCenterStyle}>{index + 1}</td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        {item.nama}
                      </div>
                    </td>

                    <td style={tdCenterStyle}>
                      <span
                        style={{
                          backgroundColor: "#eff6ff",
                          color: "#1d4ed8",
                          padding: "5px 9px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {item.kode}
                      </span>
                    </td>

                    <td style={tdCenterStyle}>
                      {item.kapasitas} orang
                    </td>

                    <td style={tdCenterStyle}>{item.lokasi}</td>

                    <td
                      style={{
                        ...tdStyle,
                        color: "#64748b",
                        maxWidth: "260px",
                      }}
                    >
                      {item.fasilitas}
                    </td>

                    <td style={tdCenterStyle}>
                      <span
                        style={{
                          ...getStatusStyle(item.status),
                          padding: "6px 11px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>

                    {role === "admin" && (
                      <td style={tdCenterStyle}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "7px",
                          }}
                        >
                          <button
                            style={{
                              border: "1px solid #bfdbfe",
                              backgroundColor: "#eff6ff",
                              color: "#2563eb",
                              padding: "7px 11px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            style={{
                              border: "1px solid #fecaca",
                              backgroundColor: "#fef2f2",
                              color: "#dc2626",
                              padding: "7px 11px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={role === "admin" ? 8 : 7}
                    style={{
                      padding: "40px 20px",
                      textAlign: "center",
                      color: "#94a3b8",
                    }}
                  >
                    Data ruangan tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH RUANGAN */}
      {showForm && role === "admin" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              boxShadow: "0 20px 50px rgba(15, 23, 42, 0.25)",
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#172b4d",
                    fontSize: "20px",
                  }}
                >
                  Tambah Ruangan
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#94a3b8",
                    fontSize: "13px",
                  }}
                >
                  Tambahkan data ruangan baru.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                style={{
                  border: "none",
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  padding: "24px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "18px",
                }}
              >
                <FormField
                  label="Nama Ruangan"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Contoh: Ruang Rapat 3"
                  required
                />

                <FormField
                  label="Kode Ruangan"
                  name="kode"
                  value={formData.kode}
                  onChange={handleChange}
                  placeholder="Contoh: RR-04"
                  required
                />

                <FormField
                  label="Kapasitas"
                  name="kapasitas"
                  type="number"
                  value={formData.kapasitas}
                  onChange={handleChange}
                  placeholder="Jumlah orang"
                  min="1"
                  required
                />

                <FormField
                  label="Lokasi"
                  name="lokasi"
                  value={formData.lokasi}
                  onChange={handleChange}
                  placeholder="Contoh: Lantai 2"
                  required
                />

                <div style={{ gridColumn: "1 / -1" }}>
                  <FormField
                    label="Fasilitas"
                    name="fasilitas"
                    value={formData.fasilitas}
                    onChange={handleChange}
                    placeholder="Contoh: AC, Proyektor, Meja"
                    required
                  />
                </div>

                <div>
                  <label style={labelStyle}>Status</label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid #e5e7eb",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: "10px 17px",
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#475569",
                    borderRadius: "7px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    backgroundColor: "#0b72e7",
                    color: "#ffffff",
                    borderRadius: "7px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Simpan Ruangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLE TABLE
const thStyle = {
  padding: "14px 16px",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  textAlign: "center",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "15px 16px",
  color: "#475569",
  fontSize: "13px",
  verticalAlign: "middle",
};

const tdCenterStyle = {
  ...tdStyle,
  textAlign: "center",
  whiteSpace: "nowrap",
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
  borderRadius: "7px",
  outline: "none",
  fontSize: "14px",
  color: "#334155",
  backgroundColor: "#ffffff",
};

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  min,
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        style={inputStyle}
      />
    </div>
  );
}

export default DataRuangan;