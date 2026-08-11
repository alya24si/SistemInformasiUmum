import { useState } from "react";

function KerusakanRuangan() {
  // SEMENTARA UNTUK TESTING
  // Nanti role berasal dari Supabase Auth
  const [role] = useState("admin");

  // =========================
  // DATA DUMMY
  // =========================

  const [laporan, setLaporan] = useState([
    {
      id: 1,
      ruangan: "Ruang Rapat Utama",
      pelapor: "Delita Br Tinambunan",
      bagian: "Bagian Keuangan",
      tanggal: "2026-08-10",
      kerusakan: "AC tidak dingin",
      deskripsi:
        "AC ruangan tidak menghasilkan udara dingin sejak pagi.",
      status: "Menunggu",
      sumber: "Laporan Pegawai",
    },
    {
      id: 2,
      ruangan: "Ruang Rapat 1",
      pelapor: "Alya Deka Danisha",
      bagian: "Bagian Kepegawaian",
      tanggal: "2026-08-09",
      kerusakan: "Proyektor tidak menyala",
      deskripsi:
        "Proyektor tidak dapat digunakan ketika akan dipakai untuk rapat.",
      status: "Diproses",
      sumber: "Laporan Pegawai",
    },
    {
      id: 3,
      ruangan: "Aula",
      pelapor: "Admin Rumah Tangga",
      bagian: "Rumah Tangga",
      tanggal: "2026-08-08",
      kerusakan: "Lampu mati",
      deskripsi:
        "Beberapa lampu di bagian depan aula tidak menyala.",
      status: "Selesai",
      sumber: "Pemeriksaan Admin",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    ruangan: "",
    kerusakan: "",
    deskripsi: "",
  });

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // TAMBAH KERUSAKAN
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    const laporanBaru = {
      id: Date.now(),
      ruangan: formData.ruangan,

      pelapor:
        role === "admin"
          ? "Admin Rumah Tangga"
          : "Delita Br Tinambunan",

      bagian:
        role === "admin"
          ? "Rumah Tangga"
          : "Bagian Keuangan",

      tanggal: new Date()
        .toISOString()
        .split("T")[0],

      kerusakan: formData.kerusakan,

      deskripsi: formData.deskripsi,

      status:
        role === "admin"
          ? "Diproses"
          : "Menunggu",

      sumber:
        role === "admin"
          ? "Pemeriksaan Admin"
          : "Laporan Pegawai",
    };

    setLaporan([
      ...laporan,
      laporanBaru,
    ]);

    setFormData({
      ruangan: "",
      kerusakan: "",
      deskripsi: "",
    });

    setShowForm(false);

    alert(
      role === "admin"
        ? "Data kerusakan berhasil ditambahkan."
        : "Laporan kerusakan berhasil dikirim."
    );
  };

  // =========================
  // PROSES LAPORAN
  // =========================

  const handleProses = (id) => {
    setLaporan(
      laporan.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Diproses",
            }
          : item
      )
    );
  };

  // =========================
  // SELESAIKAN LAPORAN
  // =========================

  const handleSelesai = (id) => {
    setLaporan(
      laporan.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Selesai",
            }
          : item
      )
    );
  };

  // =========================
  // HAPUS LAPORAN
  // =========================

  const handleHapus = (id) => {
    const konfirmasi = window.confirm(
      "Apakah kamu yakin ingin menghapus data kerusakan ini?"
    );

    if (!konfirmasi) return;

    setLaporan(
      laporan.filter(
        (item) => item.id !== id
      )
    );
  };

  // =========================
  // FILTER DATA
  // =========================

  const laporanDitampilkan =
    role === "admin"
      ? laporan
      : laporan.filter(
          (item) =>
            item.pelapor ===
            "Delita Br Tinambunan"
        );

  // =========================
  // STATUS BADGE
  // =========================

  const getStatusStyle = (status) => {
    if (status === "Menunggu") {
      return {
        backgroundColor: "#fef3c7",
        color: "#92400e",
      };
    }

    if (status === "Diproses") {
      return {
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    return {
      backgroundColor: "#dcfce7",
      color: "#166534",
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
      {/* =========================
          HEADER
      ========================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "24px",
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
            Kerusakan Ruangan
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Mencatat dan memantau kerusakan
            fasilitas ruangan.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          style={{
            border: "none",
            backgroundColor: "#0b72e7",
            color: "#ffffff",
            padding: "11px 18px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow:
              "0 3px 8px rgba(11, 114, 231, 0.18)",
          }}
        >
          + Tambah Kerusakan
        </button>
      </div>

      {/* =========================
          INFORMASI ROLE
      ========================= */}

      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "18px 20px",
          marginBottom: "22px",
          boxShadow:
            "0 2px 8px rgba(15, 23, 42, 0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              backgroundColor:
                role === "admin"
                  ? "#0b72e7"
                  : "#16a34a",
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
            margin:
              "8px 0 0 19px",
            color: "#64748b",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          {role === "admin"
            ? "Anda dapat menambahkan, memproses, dan mengelola seluruh data kerusakan."
            : "Anda dapat melaporkan kerusakan fasilitas dan melihat laporan Anda."}
        </p>
      </div>

      {/* =========================
          RINGKASAN
      ========================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginBottom: "22px",
        }}
      >
        <SummaryCard
          title="Total Laporan"
          value={laporanDitampilkan.length}
          icon="📋"
        />

        <SummaryCard
          title="Menunggu"
          value={
            laporanDitampilkan.filter(
              (item) =>
                item.status === "Menunggu"
            ).length
          }
          icon="⏳"
        />

        <SummaryCard
          title="Diproses"
          value={
            laporanDitampilkan.filter(
              (item) =>
                item.status === "Diproses"
            ).length
          }
          icon="🔧"
        />

        <SummaryCard
          title="Selesai"
          value={
            laporanDitampilkan.filter(
              (item) =>
                item.status === "Selesai"
            ).length
          }
          icon="✓"
        />
      </div>

      {/* =========================
          FORM MODAL
      ========================= */}

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor:
              "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
          onClick={() =>
            setShowForm(false)
          }
        >
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              boxShadow:
                "0 20px 50px rgba(15, 23, 42, 0.18)",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                padding: "20px 22px",
                borderBottom:
                  "1px solid #e2e8f0",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "19px",
                    fontWeight: 650,
                    color: "#172b4d",
                  }}
                >
                  {role === "admin"
                    ? "Tambah Data Kerusakan"
                    : "Laporkan Kerusakan"}
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    fontSize: "13px",
                    color: "#94a3b8",
                  }}
                >
                  Isi informasi kerusakan
                  fasilitas ruangan.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                style={{
                  width: "34px",
                  height: "34px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor:
                    "#f1f5f9",
                  color: "#64748b",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              style={{
                padding: "22px",
              }}
            >
              {/* RUANGAN */}

              <div
                style={{
                  marginBottom: "17px",
                }}
              >
                <label
                  style={labelStyle}
                >
                  Ruangan
                </label>

                <select
                  name="ruangan"
                  value={formData.ruangan}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                >
                  <option value="">
                    Pilih Ruangan
                  </option>

                  <option value="Ruang Rapat Utama">
                    Ruang Rapat Utama
                  </option>

                  <option value="Ruang Rapat 1">
                    Ruang Rapat 1
                  </option>

                  <option value="Ruang Rapat 2">
                    Ruang Rapat 2
                  </option>

                  <option value="Aula">
                    Aula
                  </option>
                </select>
              </div>

              {/* JENIS KERUSAKAN */}

              <div
                style={{
                  marginBottom: "17px",
                }}
              >
                <label
                  style={labelStyle}
                >
                  Jenis Kerusakan
                </label>

                <input
                  type="text"
                  name="kerusakan"
                  value={formData.kerusakan}
                  onChange={handleChange}
                  placeholder="Contoh: AC tidak dingin"
                  required
                  style={inputStyle}
                />
              </div>

              {/* DESKRIPSI */}

              <div
                style={{
                  marginBottom: "22px",
                }}
              >
                <label
                  style={labelStyle}
                >
                  Deskripsi Kerusakan
                </label>

                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  placeholder="Jelaskan kondisi kerusakan..."
                  rows="5"
                  required
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                    minHeight: "110px",
                  }}
                />
              </div>

              {/* BUTTON */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  paddingTop: "18px",
                  borderTop:
                    "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  style={{
                    border:
                      "1px solid #cbd5e1",
                    backgroundColor:
                      "#ffffff",
                    color: "#475569",
                    padding:
                      "10px 17px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  style={{
                    border: "none",
                    backgroundColor:
                      "#0b72e7",
                    color: "#ffffff",
                    padding:
                      "10px 17px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          DAFTAR DATA
      ========================= */}

      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          boxShadow:
            "0 2px 8px rgba(15, 23, 42, 0.04)",
          overflow: "hidden",
        }}
      >
        {/* TABLE HEADER */}

        <div
          style={{
            padding: "20px 22px",
            borderBottom:
              "1px solid #e2e8f0",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 650,
              color: "#172b4d",
            }}
          >
            {role === "admin"
              ? "Seluruh Data Kerusakan"
              : "Laporan Saya"}
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            {role === "admin"
              ? "Kelola seluruh laporan kerusakan fasilitas ruangan."
              : "Daftar laporan kerusakan yang Anda kirim."}
          </p>
        </div>

        {/* TABLE */}

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
              minWidth:
                role === "admin"
                  ? "1100px"
                  : "950px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor:
                    "#f8fafc",
                }}
              >
                <th
                  style={thStyle}
                >
                  Ruangan
                </th>

                <th
                  style={thStyle}
                >
                  Pelapor
                </th>

                <th
                  style={thStyle}
                >
                  Bagian
                </th>

                <th
                  style={thStyle}
                >
                  Tanggal
                </th>

                <th
                  style={thStyle}
                >
                  Kerusakan
                </th>

                <th
                  style={{
                    ...thStyle,
                    minWidth: "220px",
                  }}
                >
                  Deskripsi
                </th>

                <th
                  style={thStyle}
                >
                  Sumber
                </th>

                <th
                  style={thStyle}
                >
                  Status
                </th>

                {role === "admin" && (
                  <th
                    style={{
                      ...thStyle,
                      textAlign:
                        "center",
                    }}
                  >
                    Aksi
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {laporanDitampilkan.length >
              0 ? (
                laporanDitampilkan.map(
                  (item) => (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom:
                          "1px solid #edf2f7",
                      }}
                    >
                      {/* RUANGAN */}

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <div
                          style={{
                            fontWeight:
                              600,
                            color:
                              "#334155",
                          }}
                        >
                          {item.ruangan}
                        </div>
                      </td>

                      {/* PELAPOR */}

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <div
                          style={{
                            fontWeight:
                              500,
                            color:
                              "#475569",
                          }}
                        >
                          {item.pelapor}
                        </div>
                      </td>

                      {/* BAGIAN */}

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {item.bagian}
                      </td>

                      {/* TANGGAL */}

                      <td
                        style={{
                          ...tdStyle,
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {formatTanggal(
                          item.tanggal
                        )}
                      </td>

                      {/* KERUSAKAN */}

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <div
                          style={{
                            fontWeight:
                              600,
                            color:
                              "#334155",
                          }}
                        >
                          {item.kerusakan}
                        </div>
                      </td>

                      {/* DESKRIPSI */}

                      <td
                        style={{
                          ...tdStyle,
                          maxWidth:
                            "260px",
                        }}
                      >
                        <div
                          style={{
                            color:
                              "#64748b",
                            lineHeight:
                              1.5,
                          }}
                        >
                          {item.deskripsi}
                        </div>
                      </td>

                      {/* SUMBER */}

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <span
                          style={{
                            backgroundColor:
                              "#f1f5f9",
                            color:
                              "#475569",
                            padding:
                              "5px 9px",
                            borderRadius:
                              "6px",
                            fontSize:
                              "11px",
                            fontWeight:
                              600,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {item.sumber}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <span
                          style={{
                            ...getStatusStyle(
                              item.status
                            ),
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            padding:
                              "6px 10px",
                            borderRadius:
                              "20px",
                            fontSize:
                              "11px",
                            fontWeight:
                              700,
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          <span
                            style={{
                              width:
                                "6px",
                              height:
                                "6px",
                              borderRadius:
                                "50%",
                              backgroundColor:
                                "currentColor",
                              marginRight:
                                "6px",
                            }}
                          />

                          {item.status}
                        </span>
                      </td>

                      {/* AKSI */}

                      {role ===
                        "admin" && (
                        <td
                          style={{
                            ...tdStyle,
                            textAlign:
                              "center",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                "center",
                              alignItems:
                                "center",
                              gap: "6px",
                            }}
                          >
                            {item.status ===
                              "Menunggu" && (
                              <button
                                onClick={() =>
                                  handleProses(
                                    item.id
                                  )
                                }
                                style={{
                                  ...actionButtonStyle,
                                  backgroundColor:
                                    "#eff6ff",
                                  color:
                                    "#1d4ed8",
                                  border:
                                    "1px solid #bfdbfe",
                                }}
                              >
                                Proses
                              </button>
                            )}

                            {item.status ===
                              "Diproses" && (
                              <button
                                onClick={() =>
                                  handleSelesai(
                                    item.id
                                  )
                                }
                                style={{
                                  ...actionButtonStyle,
                                  backgroundColor:
                                    "#f0fdf4",
                                  color:
                                    "#15803d",
                                  border:
                                    "1px solid #bbf7d0",
                                }}
                              >
                                Selesai
                              </button>
                            )}

                            <button
                              onClick={() =>
                                handleHapus(
                                  item.id
                                )
                              }
                              style={{
                                ...actionButtonStyle,
                                backgroundColor:
                                  "#fef2f2",
                                color:
                                  "#dc2626",
                                border:
                                  "1px solid #fecaca",
                              }}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={
                      role ===
                      "admin"
                        ? 9
                        : 8
                    }
                    style={{
                      padding:
                        "55px 20px",
                      textAlign:
                        "center",
                    }}
                  >
                    <div
                      style={{
                        width:
                          "55px",
                        height:
                          "55px",
                        margin:
                          "0 auto 12px",
                        borderRadius:
                          "50%",
                        backgroundColor:
                          "#f1f5f9",
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        fontSize:
                          "24px",
                      }}
                    >
                      🔧
                    </div>

                    <div
                      style={{
                        fontWeight:
                          650,
                        color:
                          "#334155",
                        fontSize:
                          "15px",
                      }}
                    >
                      Belum ada data
                      kerusakan
                    </div>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        color:
                          "#94a3b8",
                        fontSize:
                          "13px",
                      }}
                    >
                      Belum ada laporan
                      kerusakan yang
                      tersedia.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================
          KETERANGAN
      ========================= */}

      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px 22px",
          marginTop: "22px",
          boxShadow:
            "0 2px 8px rgba(15, 23, 42, 0.04)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "17px",
            fontWeight: 650,
            color: "#172b4d",
          }}
        >
          Alur Penanganan
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginTop: "14px",
          }}
        >
          <InfoStep
            number="1"
            title="Menunggu"
            text="Laporan baru menunggu pemeriksaan Admin Rumah Tangga."
          />

          <InfoStep
            number="2"
            title="Diproses"
            text="Kerusakan sedang dalam proses penanganan."
          />

          <InfoStep
            number="3"
            title="Selesai"
            text="Kerusakan telah selesai ditangani."
          />
        </div>
      </div>
    </div>
  );
}

// =========================
// KOMPONEN RINGKASAN
// =========================

function SummaryCard({
  title,
  value,
  icon,
}) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "12px",
        padding: "17px",
        display: "flex",
        alignItems: "center",
        gap: "13px",
        boxShadow:
          "0 2px 8px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "9px",
          backgroundColor: "#eff6ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "19px",
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            color: "#94a3b8",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: "2px",
            color: "#172b4d",
            fontSize: "23px",
            fontWeight: 700,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// =========================
// KOMPONEN ALUR
// =========================

function InfoStep({
  number,
  title,
  text,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "11px",
        padding: "12px",
        backgroundColor: "#f8fafc",
        borderRadius: "9px",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          backgroundColor: "#dbeafe",
          color: "#1d4ed8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        {number}
      </div>

      <div>
        <div
          style={{
            color: "#334155",
            fontSize: "13px",
            fontWeight: 650,
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: "3px",
            color: "#64748b",
            fontSize: "12px",
            lineHeight: 1.5,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}

// =========================
// HELPER FORMAT TANGGAL
// =========================

function formatTanggal(tanggal) {
  const date = new Date(
    `${tanggal}T00:00:00`
  );

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

// =========================
// STYLE
// =========================

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
  backgroundColor: "#ffffff",
  color: "#334155",
  fontSize: "13px",
  fontFamily: "inherit",
};

const thStyle = {
  padding: "13px 15px",
  textAlign: "left",
  color: "#64748b",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "15px",
  color: "#64748b",
  fontSize: "12px",
  verticalAlign: "top",
};

const actionButtonStyle = {
  padding: "6px 9px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export default KerusakanRuangan;