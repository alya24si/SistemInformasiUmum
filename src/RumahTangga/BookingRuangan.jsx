import { useState } from "react";

function BookingRuangan() {
  // SEMENTARA UNTUK TESTING
  // Nanti role berasal dari Supabase Auth
  const [role] = useState("admin");

  // Data dummy booking
  const [booking, setBooking] = useState([
    {
      id: 1,
      ruangan: "Ruang Rapat Utama",
      pemesan: "Delita Br Tinambunan",
      bagian: "Bagian Keuangan",
      kegiatan: "Rapat Koordinasi",
      tanggal: "2026-08-12",
      mulai: "08:00",
      selesai: "10:00",
      status: "Disetujui",
    },
    {
      id: 2,
      ruangan: "Aula",
      pemesan: "Alya Deka Danisha",
      bagian: "Bagian Kepegawaian",
      kegiatan: "Kegiatan Internal",
      tanggal: "2026-08-12",
      mulai: "13:00",
      selesai: "16:00",
      status: "Menunggu",
    },
    {
      id: 3,
      ruangan: "Ruang Rapat 1",
      pemesan: "Budi Santoso",
      bagian: "Bagian Umum",
      kegiatan: "Rapat Tim",
      tanggal: "2026-08-13",
      mulai: "09:00",
      selesai: "11:00",
      status: "Ditolak",
      alasanTolak: "Jadwal ruangan tidak tersedia.",
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    ruangan: "",
    pemesan: "",
    bagian: "",
    kegiatan: "",
    tanggal: "",
    mulai: "",
    selesai: "",
  });

  // =========================
  // FORM
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // CEK BENTROK BOOKING
  // =========================

  const cekBentrok = () => {
    return booking.some((item) => {
      if (item.ruangan !== formData.ruangan) {
        return false;
      }

      if (item.tanggal !== formData.tanggal) {
        return false;
      }

      // Booking yang ditolak tidak dianggap memakai ruangan
      if (item.status === "Ditolak") {
        return false;
      }

      const mulaiBaru = formData.mulai;
      const selesaiBaru = formData.selesai;

      const mulaiLama = item.mulai;
      const selesaiLama = item.selesai;

      return (
        mulaiBaru < selesaiLama &&
        selesaiBaru > mulaiLama
      );
    });
  };

  // =========================
  // TAMBAH BOOKING
  // =========================

  const handleSubmit = (e) => {
    e.preventDefault();

    // Pastikan jam selesai setelah jam mulai
    if (formData.selesai <= formData.mulai) {
      alert("Jam selesai harus lebih besar dari jam mulai.");
      return;
    }

    // Cek bentrok
    if (cekBentrok()) {
      alert(
        "Ruangan sudah memiliki booking pada waktu tersebut."
      );
      return;
    }

    const bookingBaru = {
      id: Date.now(),
      ...formData,
      status: "Menunggu",
    };

    setBooking([...booking, bookingBaru]);

    setFormData({
      ruangan: "",
      pemesan: "",
      bagian: "",
      kegiatan: "",
      tanggal: "",
      mulai: "",
      selesai: "",
    });

    setShowForm(false);

    alert("Pengajuan booking berhasil dikirim.");
  };

  // =========================
  // SETUJUI BOOKING
  // =========================

  const handleSetujui = (id) => {
    const bookingDipilih = booking.find(
      (item) => item.id === id
    );

    if (!bookingDipilih) return;

    // Cek apakah setelah disetujui ada bentrok
    const bentrok = booking.some((item) => {
      if (item.id === id) return false;

      if (item.ruangan !== bookingDipilih.ruangan) {
        return false;
      }

      if (item.tanggal !== bookingDipilih.tanggal) {
        return false;
      }

      if (item.status !== "Disetujui") {
        return false;
      }

      return (
        bookingDipilih.mulai < item.selesai &&
        bookingDipilih.selesai > item.mulai
      );
    });

    if (bentrok) {
      alert(
        "Booking tidak dapat disetujui karena jadwal bentrok."
      );
      return;
    }

    setBooking(
      booking.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Disetujui",
            }
          : item
      )
    );
  };

  // =========================
  // TOLAK BOOKING
  // =========================

  const handleTolak = (id) => {
    const alasan = window.prompt(
      "Masukkan alasan penolakan:"
    );

    if (alasan === null) return;

    setBooking(
      booking.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Ditolak",
              alasanTolak: alasan,
            }
          : item
      )
    );
  };

  // =========================
  // BATALKAN BOOKING
  // =========================

  const handleBatal = (id) => {
    const konfirmasi = window.confirm(
      "Apakah kamu yakin ingin membatalkan booking ini?"
    );

    if (!konfirmasi) return;

    setBooking(
      booking.filter((item) => item.id !== id)
    );
  };

  // =========================
  // FILTER BERDASARKAN ROLE
  // =========================

  const bookingDitampilkan =
    role === "admin"
      ? booking
      : booking.filter(
          (item) =>
            item.pemesan === "Delita Br Tinambunan"
        );

  // =========================
  // STATUS BADGE
  // =========================

  const getStatusStyle = (status) => {
    if (status === "Disetujui") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "Menunggu") {
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

  // =========================
  // FORMAT TANGGAL
  // =========================

  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";

    const date = new Date(`${tanggal}T00:00:00`);

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
            Booking Ruangan
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#64748b",
              fontSize: "15px",
            }}
          >
            Kelola pemesanan dan penggunaan ruangan.
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
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow:
              "0 3px 8px rgba(11, 114, 231, 0.2)",
          }}
        >
          + Booking Ruangan
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
          marginBottom: "20px",
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
            ? "Anda dapat melihat dan memproses seluruh pengajuan booking."
            : "Anda dapat mengajukan booking ruangan."}
        </p>
      </div>

      {/* =========================
          DAFTAR BOOKING
      ========================= */}

      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow:
            "0 2px 10px rgba(15, 23, 42, 0.05)",
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
              {role === "admin"
                ? "Seluruh Booking"
                : "Booking Saya"}
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                color: "#94a3b8",
                fontSize: "13px",
              }}
            >
              Total {bookingDitampilkan.length} booking
            </p>
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
              minWidth:
                role === "admin" ? "1100px" : "950px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8fafc",
                }}
              >
                <th style={thStyle}>
                  Ruangan
                </th>

                <th style={thStyle}>
                  Pemesan
                </th>

                <th style={thStyle}>
                  Bagian
                </th>

                <th style={thStyle}>
                  Kegiatan
                </th>

                <th style={thStyle}>
                  Tanggal
                </th>

                <th style={thStyle}>
                  Waktu
                </th>

                <th style={thStyle}>
                  Status
                </th>

                {role === "admin" && (
                  <th style={thStyle}>
                    Aksi
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {bookingDitampilkan.length > 0 ? (
                bookingDitampilkan.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderTop:
                        "1px solid #edf2f7",
                    }}
                  >
                    {/* RUANGAN */}

                    <td style={tdStyle}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#1e293b",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.ruangan}
                      </div>
                    </td>

                    {/* PEMESAN */}

                    <td style={tdStyle}>
                      <div
                        style={{
                          fontWeight: 500,
                          color: "#334155",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.pemesan}
                      </div>
                    </td>

                    {/* BAGIAN */}

                    <td
                      style={{
                        ...tdStyle,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.bagian}
                    </td>

                    {/* KEGIATAN */}

                    <td
                      style={{
                        ...tdStyle,
                        maxWidth: "220px",
                      }}
                    >
                      {item.kegiatan}
                    </td>

                    {/* TANGGAL */}

                    <td
                      style={{
                        ...tdStyle,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatTanggal(item.tanggal)}
                    </td>

                    {/* WAKTU */}

                    <td
                      style={{
                        ...tdStyle,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#f1f5f9",
                          color: "#475569",
                          padding:
                            "6px 9px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {item.mulai} -{" "}
                        {item.selesai}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          ...getStatusStyle(
                            item.status
                          ),
                          display:
                            "inline-block",
                          padding:
                            "6px 11px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {item.status}
                      </span>

                      {/* ALASAN DITOLAK */}

                      {item.status ===
                        "Ditolak" &&
                        item.alasanTolak && (
                          <div
                            style={{
                              marginTop:
                                "6px",
                              color:
                                "#991b1b",
                              fontSize:
                                "11px",
                              maxWidth:
                                "180px",
                            }}
                          >
                            {item.alasanTolak}
                          </div>
                        )}
                    </td>

                    {/* AKSI ADMIN */}

                    {role === "admin" && (
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
                            gap: "7px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          {item.status ===
                            "Menunggu" && (
                            <>
                              <button
                                onClick={() =>
                                  handleSetujui(
                                    item.id
                                  )
                                }
                                style={{
                                  border:
                                    "1px solid #bbf7d0",
                                  backgroundColor:
                                    "#f0fdf4",
                                  color:
                                    "#15803d",
                                  padding:
                                    "7px 11px",
                                  borderRadius:
                                    "6px",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    600,
                                  cursor:
                                    "pointer",
                                }}
                              >
                                Setujui
                              </button>

                              <button
                                onClick={() =>
                                  handleTolak(
                                    item.id
                                  )
                                }
                                style={{
                                  border:
                                    "1px solid #fecaca",
                                  backgroundColor:
                                    "#fef2f2",
                                  color:
                                    "#dc2626",
                                  padding:
                                    "7px 11px",
                                  borderRadius:
                                    "6px",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    600,
                                  cursor:
                                    "pointer",
                                }}
                              >
                                Tolak
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      role === "admin"
                        ? 8
                        : 7
                    }
                    style={{
                      padding:
                        "45px 20px",
                      textAlign:
                        "center",
                      color:
                        "#94a3b8",
                      fontSize:
                        "14px",
                    }}
                  >
                    Belum ada data
                    booking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================
          MODAL FORM BOOKING
      ========================= */}

      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor:
              "rgba(15, 23, 42, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor:
                "#ffffff",
              borderRadius: "14px",
              boxShadow:
                "0 20px 50px rgba(15, 23, 42, 0.25)",
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                padding:
                  "20px 24px",
                borderBottom:
                  "1px solid #e5e7eb",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color:
                      "#172b4d",
                    fontSize:
                      "20px",
                  }}
                >
                  Ajukan Booking
                  Ruangan
                </h2>

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
                  Lengkapi data
                  pemesanan ruangan.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                style={{
                  border: "none",
                  backgroundColor:
                    "#f1f5f9",
                  color:
                    "#64748b",
                  width: "34px",
                  height: "34px",
                  borderRadius:
                    "50%",
                  cursor:
                    "pointer",
                  fontSize:
                    "18px",
                }}
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
            >
              <div
                style={{
                  padding:
                    "24px",
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "18px",
                }}
              >
                {/* RUANGAN */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Ruangan
                  </label>

                  <select
                    name="ruangan"
                    value={
                      formData.ruangan
                    }
                    onChange={
                      handleChange
                    }
                    required
                    style={
                      inputStyle
                    }
                  >
                    <option value="">
                      Pilih Ruangan
                    </option>

                    <option value="Ruang Rapat Utama">
                      Ruang Rapat
                      Utama
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

                {/* NAMA PEMESAN */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Nama Pemesan
                  </label>

                  <input
                    type="text"
                    name="pemesan"
                    value={
                      formData.pemesan
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Nama pegawai"
                    required
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* BAGIAN */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Bagian
                  </label>

                  <input
                    type="text"
                    name="bagian"
                    value={
                      formData.bagian
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Contoh: Bagian Keuangan"
                    required
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* KEGIATAN */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Kegiatan
                  </label>

                  <input
                    type="text"
                    name="kegiatan"
                    value={
                      formData.kegiatan
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Tujuan penggunaan ruangan"
                    required
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* TANGGAL */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Tanggal
                  </label>

                  <input
                    type="date"
                    name="tanggal"
                    value={
                      formData.tanggal
                    }
                    onChange={
                      handleChange
                    }
                    required
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* JAM MULAI */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Jam Mulai
                  </label>

                  <input
                    type="time"
                    name="mulai"
                    value={
                      formData.mulai
                    }
                    onChange={
                      handleChange
                    }
                    required
                    style={
                      inputStyle
                    }
                  />
                </div>

                {/* JAM SELESAI */}

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Jam Selesai
                  </label>

                  <input
                    type="time"
                    name="selesai"
                    value={
                      formData.selesai
                    }
                    onChange={
                      handleChange
                    }
                    required
                    style={
                      inputStyle
                    }
                  />
                </div>
              </div>

              {/* MODAL FOOTER */}

              <div
                style={{
                  padding:
                    "16px 24px",
                  borderTop:
                    "1px solid #e5e7eb",
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  style={{
                    padding:
                      "10px 17px",
                    border:
                      "1px solid #cbd5e1",
                    backgroundColor:
                      "#ffffff",
                    color:
                      "#475569",
                    borderRadius:
                      "7px",
                    fontWeight:
                      600,
                    cursor:
                      "pointer",
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  style={{
                    padding:
                      "10px 18px",
                    border: "none",
                    backgroundColor:
                      "#0b72e7",
                    color:
                      "#ffffff",
                    borderRadius:
                      "7px",
                    fontWeight:
                      600,
                    cursor:
                      "pointer",
                  }}
                >
                  Ajukan Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================
// STYLE
// =========================

const thStyle = {
  padding: "14px 16px",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  textAlign: "left",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "15px 16px",
  color: "#475569",
  fontSize: "13px",
  verticalAlign: "middle",
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

export default BookingRuangan;