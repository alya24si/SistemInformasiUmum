import { useState } from "react";

function PerbaikanRuangan() {
  // Data kerusakan yang nantinya berasal dari halaman KerusakanRuangan
  // Untuk sementara masih menggunakan data lokal.
  const [kerusakan, setKerusakan] = useState([
    {
      id: 1,
      ruangan: "Ruang Rapat 2",
      kerusakan: "AC tidak dingin",
      tanggalLapor: "2026-08-10",
      status: "Menunggu",
    },
    {
      id: 2,
      ruangan: "Aula",
      kerusakan: "Lampu mati",
      tanggalLapor: "2026-08-09",
      status: "Menunggu",
    },
    {
      id: 3,
      ruangan: "Ruang Arsip",
      kerusakan: "Pintu sulit ditutup",
      tanggalLapor: "2026-08-08",
      status: "Selesai",
    },
  ]);

  // Data perbaikan
  const [perbaikan, setPerbaikan] = useState([
    {
      id: 1,
      kerusakanId: 3,
      ruangan: "Ruang Arsip",
      kerusakan: "Pintu sulit ditutup",
      jenisPerbaikan: "Perbaikan engsel pintu",
      penanggungJawab: "Bagian Rumah Tangga",
      tanggalMulai: "2026-08-08",
      status: "Selesai",
    },
  ]);

  const [formData, setFormData] = useState({
    kerusakanId: "",
    jenisPerbaikan: "",
    penanggungJawab: "",
    tanggalMulai: "",
    status: "Diproses",
  });

  const [showForm, setShowForm] = useState(false);

  // =========================
  // DATA KERUSAKAN YANG BELUM DIPERBAIKI
  // =========================

  const kerusakanBelumDiperbaiki = kerusakan.filter((item) => {
    const sudahAda = perbaikan.some(
      (perbaikanItem) => perbaikanItem.kerusakanId === item.id
    );

    return !sudahAda && item.status !== "Selesai";
  });

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================
  // PILIH KERUSAKAN
  // =========================

  const handleKerusakanChange = (e) => {
    setFormData({
      ...formData,
      kerusakanId: e.target.value,
    });
  };

  // =========================
  // TAMBAH PERBAIKAN
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataKerusakan = kerusakan.find(
      (item) => item.id === Number(formData.kerusakanId)
    );

    if (!dataKerusakan) {
      alert("Silakan pilih data kerusakan terlebih dahulu.");
      return;
    }

    const dataBaru = {
      id: Date.now(),
      kerusakanId: dataKerusakan.id,
      ruangan: dataKerusakan.ruangan,
      kerusakan: dataKerusakan.kerusakan,
      jenisPerbaikan: formData.jenisPerbaikan,
      penanggungJawab: formData.penanggungJawab,
      tanggalMulai: formData.tanggalMulai,
      status: formData.status,
    };

    setPerbaikan([...perbaikan, dataBaru]);

    // Setelah dibuat sebagai perbaikan,
    // status kerusakan berubah menjadi Diproses.
    setKerusakan(
      kerusakan.map((item) =>
        item.id === dataKerusakan.id
          ? {
              ...item,
              status: "Diproses",
            }
          : item
      )
    );

    resetForm();
    setShowForm(false);
  };

  // =========================
  // RESET FORM
  // =========================

  const resetForm = () => {
    setFormData({
      kerusakanId: "",
      jenisPerbaikan: "",
      penanggungJawab: "",
      tanggalMulai: "",
      status: "Diproses",
    });
  };

  // =========================
  // HAPUS PERBAIKAN
  // =========================

  const handleDelete = (id) => {
    const konfirmasi = window.confirm(
      "Apakah kamu yakin ingin menghapus data perbaikan ini?"
    );

    if (!konfirmasi) return;

    const dataPerbaikan = perbaikan.find((item) => item.id === id);

    setPerbaikan(
      perbaikan.filter((item) => item.id !== id)
    );

    // Jika data perbaikan dihapus dan sebelumnya berstatus Diproses,
    // laporan kerusakan dikembalikan menjadi Menunggu.
    if (dataPerbaikan && dataPerbaikan.status === "Diproses") {
      setKerusakan(
        kerusakan.map((item) =>
          item.id === dataPerbaikan.kerusakanId
            ? {
                ...item,
                status: "Menunggu",
              }
            : item
        )
      );
    }
  };

  // =========================
  // SELESAIKAN PERBAIKAN
  // =========================

  const handleSelesai = (id) => {
    const dataPerbaikan = perbaikan.find(
      (item) => item.id === id
    );

    if (!dataPerbaikan) return;

    const konfirmasi = window.confirm(
      "Apakah perbaikan ini sudah selesai dilakukan?"
    );

    if (!konfirmasi) return;

    setPerbaikan(
      perbaikan.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Selesai",
            }
          : item
      )
    );

    setKerusakan(
      kerusakan.map((item) =>
        item.id === dataPerbaikan.kerusakanId
          ? {
              ...item,
              status: "Selesai",
            }
          : item
      )
    );
  };

  // =========================
  // STATUS STYLE
  // =========================

  const getStatusStyle = (status) => {
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
            Perbaikan Ruangan
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Kelola tindak lanjut perbaikan fasilitas
            ruangan.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          disabled={kerusakanBelumDiperbaiki.length === 0}
          style={{
            border: "none",
            backgroundColor:
              kerusakanBelumDiperbaiki.length === 0
                ? "#cbd5e1"
                : "#0b72e7",
            color: "#ffffff",
            padding: "11px 18px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor:
              kerusakanBelumDiperbaiki.length === 0
                ? "not-allowed"
                : "pointer",
            boxShadow:
              kerusakanBelumDiperbaiki.length === 0
                ? "none"
                : "0 3px 8px rgba(11, 114, 231, 0.18)",
          }}
        >
          + Tambah Perbaikan
        </button>
      </div>

      {/* =========================
          INFORMASI
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
              backgroundColor: "#0b72e7",
            }}
          />

          <strong
            style={{
              color: "#1e293b",
              fontSize: "15px",
            }}
          >
            Monitoring Perbaikan
          </strong>
        </div>

        <p
          style={{
            margin: "8px 0 0 19px",
            color: "#64748b",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          Data perbaikan dibuat berdasarkan laporan
          kerusakan yang masuk dan dipantau sampai
          proses perbaikan selesai.
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
          title="Total Perbaikan"
          value={perbaikan.length}
          icon="🔧"
        />

        <SummaryCard
          title="Diproses"
          value={
            perbaikan.filter(
              (item) => item.status === "Diproses"
            ).length
          }
          icon="⚙"
        />

        <SummaryCard
          title="Selesai"
          value={
            perbaikan.filter(
              (item) => item.status === "Selesai"
            ).length
          }
          icon="✓"
        />
      </div>

      {/* =========================
          MODAL FORM
      ========================= */}

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
          onClick={() => {
            resetForm();
            setShowForm(false);
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#ffffff",
              borderRadius: "14px",
              boxShadow:
                "0 20px 50px rgba(15, 23, 42, 0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 22px",
                borderBottom: "1px solid #e2e8f0",
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
                  Tambah Data Perbaikan
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "13px",
                    color: "#94a3b8",
                  }}
                >
                  Pilih laporan kerusakan yang akan
                  ditindaklanjuti.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                style={{
                  width: "34px",
                  height: "34px",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#f1f5f9",
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
              {/* KERUSAKAN */}

              <div style={{ marginBottom: "17px" }}>
                <label style={labelStyle}>
                  Laporan Kerusakan
                </label>

                <select
                  name="kerusakanId"
                  value={formData.kerusakanId}
                  onChange={handleKerusakanChange}
                  required
                  style={inputStyle}
                >
                  <option value="">
                    Pilih Laporan Kerusakan
                  </option>

                  {kerusakanBelumDiperbaiki.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.ruangan} - {item.kerusakan}
                    </option>
                  ))}
                </select>
              </div>

              {/* DETAIL KERUSAKAN */}

              {formData.kerusakanId && (
                <div
                  style={{
                    marginBottom: "17px",
                    padding: "12px 14px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                >
                  {(() => {
                    const dataKerusakan =
                      kerusakan.find(
                        (item) =>
                          item.id ===
                          Number(formData.kerusakanId)
                      );

                    if (!dataKerusakan) return null;

                    return (
                      <>
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: "12px",
                            marginBottom: "4px",
                          }}
                        >
                          Ruangan
                        </div>

                        <div
                          style={{
                            color: "#334155",
                            fontSize: "13px",
                            fontWeight: 600,
                            marginBottom: "10px",
                          }}
                        >
                          {dataKerusakan.ruangan}
                        </div>

                        <div
                          style={{
                            color: "#64748b",
                            fontSize: "12px",
                            marginBottom: "4px",
                          }}
                        >
                          Kerusakan
                        </div>

                        <div
                          style={{
                            color: "#334155",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          {dataKerusakan.kerusakan}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* JENIS PERBAIKAN */}

              <div style={{ marginBottom: "17px" }}>
                <label style={labelStyle}>
                  Jenis Perbaikan
                </label>

                <input
                  type="text"
                  name="jenisPerbaikan"
                  value={formData.jenisPerbaikan}
                  onChange={handleChange}
                  placeholder="Contoh: Service AC"
                  required
                  style={inputStyle}
                />
              </div>

              {/* PENANGGUNG JAWAB */}

              <div style={{ marginBottom: "17px" }}>
                <label style={labelStyle}>
                  Penanggung Jawab
                </label>

                <input
                  type="text"
                  name="penanggungJawab"
                  value={formData.penanggungJawab}
                  onChange={handleChange}
                  placeholder="Contoh: Teknisi AC"
                  required
                  style={inputStyle}
                />
              </div>

              {/* TANGGAL */}

              <div style={{ marginBottom: "17px" }}>
                <label style={labelStyle}>
                  Tanggal Mulai
                </label>

                <input
                  type="date"
                  name="tanggalMulai"
                  value={formData.tanggalMulai}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              {/* STATUS */}

              <div style={{ marginBottom: "22px" }}>
                <label style={labelStyle}>
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="Diproses">
                    Diproses
                  </option>

                  <option value="Selesai">
                    Selesai
                  </option>
                </select>
              </div>

              {/* BUTTON */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  paddingTop: "18px",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  style={{
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#475569",
                    padding: "10px 17px",
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
                    backgroundColor: "#0b72e7",
                    color: "#ffffff",
                    padding: "10px 17px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Simpan Perbaikan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          DATA PERBAIKAN
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
        <div
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid #e2e8f0",
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
            Daftar Perbaikan
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#94a3b8",
              fontSize: "13px",
            }}
          >
            Daftar tindak lanjut perbaikan fasilitas
            ruangan.
          </p>
        </div>

        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "950px",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8fafc",
                }}
              >
                <th style={thStyle}>Ruangan</th>

                <th style={thStyle}>Kerusakan</th>

                <th style={thStyle}>
                  Jenis Perbaikan
                </th>

                <th style={thStyle}>
                  Penanggung Jawab
                </th>

                <th style={thStyle}>
                  Tanggal Mulai
                </th>

                <th style={thStyle}>Status</th>

                <th
                  style={{
                    ...thStyle,
                    textAlign: "center",
                  }}
                >
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {perbaikan.length > 0 ? (
                perbaikan.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom:
                        "1px solid #edf2f7",
                    }}
                  >
                    <td style={tdStyle}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#334155",
                        }}
                      >
                        {item.ruangan}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "#475569",
                        }}
                      >
                        {item.kerusakan}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {item.jenisPerbaikan}
                    </td>

                    <td style={tdStyle}>
                      {item.penanggungJawab}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatTanggal(
                        item.tanggalMulai
                      )}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          ...getStatusStyle(
                            item.status
                          ),
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "6px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor:
                              "currentColor",
                            marginRight: "6px",
                          }}
                        />

                        {item.status}
                      </span>
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        {item.status === "Diproses" && (
                          <button
                            onClick={() =>
                              handleSelesai(item.id)
                            }
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                              backgroundColor:
                                "#f0fdf4",
                              color: "#15803d",
                              border:
                                "1px solid #bbf7d0",
                            }}
                          >
                            Selesai
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                            backgroundColor: "#fef2f2",
                            color: "#dc2626",
                            border:
                              "1px solid #fecaca",
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      padding: "55px 20px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "55px",
                        height: "55px",
                        margin: "0 auto 12px",
                        borderRadius: "50%",
                        backgroundColor: "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                      }}
                    >
                      🔧
                    </div>

                    <div
                      style={{
                        fontWeight: 650,
                        color: "#334155",
                        fontSize: "15px",
                      }}
                    >
                      Belum ada data perbaikan
                    </div>

                    <p
                      style={{
                        margin: "5px 0 0",
                        color: "#94a3b8",
                        fontSize: "13px",
                      }}
                    >
                      Belum ada tindak lanjut
                      perbaikan yang tersedia.
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
          Status Perbaikan
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
            marginTop: "14px",
          }}
        >
          <InfoCard
            title="Diproses"
            text="Perbaikan sedang dalam proses penanganan."
            status="Diproses"
          />

          <InfoCard
            title="Selesai"
            text="Perbaikan telah selesai dilakukan."
            status="Selesai"
          />
        </div>
      </div>
    </div>
  );
}

// =========================
// SUMMARY CARD
// =========================

function SummaryCard({ title, value, icon }) {
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
// INFO CARD
// =========================

function InfoCard({ title, text, status }) {
  const statusStyle =
    status === "Diproses"
      ? {
          backgroundColor: "#dbeafe",
          color: "#1d4ed8",
        }
      : {
          backgroundColor: "#dcfce7",
          color: "#166534",
        };

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
      <span
        style={{
          ...statusStyle,
          padding: "5px 9px",
          height: "fit-content",
          borderRadius: "20px",
          fontSize: "10px",
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {status}
      </span>

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
// FORMAT TANGGAL
// =========================

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(`${tanggal}T00:00:00`);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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

export default PerbaikanRuangan;