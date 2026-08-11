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

      if (
        item.status !== "Disetujui"
      ) {
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

  return (
    <div>

      {/* =========================
          HEADER
      ========================= */}

      <div>

        <div>
          <h1>Booking Ruangan</h1>

          <p>
            Kelola pemesanan dan penggunaan ruangan.
          </p>
        </div>

        {/* USER DAN ADMIN SAMA-SAMA BISA MEMBUKA FORM,
            TAPI FUNGSI ADMIN NANTINYA BISA DIATUR LAGI */}

        <button
          onClick={() => setShowForm(true)}
        >
          + Booking Ruangan
        </button>

      </div>


      {/* =========================
          INFORMASI ROLE
      ========================= */}

      <div>

        <strong>
          {role === "admin"
            ? "Mode Admin Rumah Tangga"
            : "Mode Pegawai"}
        </strong>

        <p>
          {role === "admin"
            ? "Anda dapat melihat dan memproses seluruh pengajuan booking."
            : "Anda dapat mengajukan booking ruangan."}
        </p>

      </div>


      {/* =========================
          FORM BOOKING
      ========================= */}

      {showForm && (

        <div>

          <div>

            <h2>Ajukan Booking Ruangan</h2>

            <button
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            <div>

              <label>
                Ruangan
              </label>

              <select
                name="ruangan"
                value={formData.ruangan}
                onChange={handleChange}
                required
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


            <div>

              <label>
                Nama Pemesan
              </label>

              <input
                type="text"
                name="pemesan"
                value={formData.pemesan}
                onChange={handleChange}
                placeholder="Nama pegawai"
                required
              />

            </div>


            <div>

              <label>
                Bagian
              </label>

              <input
                type="text"
                name="bagian"
                value={formData.bagian}
                onChange={handleChange}
                placeholder="Contoh: Bagian Keuangan"
                required
              />

            </div>


            <div>

              <label>
                Kegiatan
              </label>

              <input
                type="text"
                name="kegiatan"
                value={formData.kegiatan}
                onChange={handleChange}
                placeholder="Tujuan penggunaan ruangan"
                required
              />

            </div>


            <div>

              <label>
                Tanggal
              </label>

              <input
                type="date"
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                required
              />

            </div>


            <div>

              <label>
                Jam Mulai
              </label>

              <input
                type="time"
                name="mulai"
                value={formData.mulai}
                onChange={handleChange}
                required
              />

            </div>


            <div>

              <label>
                Jam Selesai
              </label>

              <input
                type="time"
                name="selesai"
                value={formData.selesai}
                onChange={handleChange}
                required
              />

            </div>


            <div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
              >
                Batal
              </button>

              <button type="submit">
                Ajukan Booking
              </button>

            </div>

          </form>

        </div>

      )}


      {/* =========================
          DAFTAR BOOKING
      ========================= */}

      <div>

        <h2>
          {role === "admin"
            ? "Seluruh Booking"
            : "Booking Saya"}
        </h2>


        <table>

          <thead>

            <tr>

              <th>Ruangan</th>

              <th>Pemesan</th>

              <th>Bagian</th>

              <th>Kegiatan</th>

              <th>Tanggal</th>

              <th>Waktu</th>

              <th>Status</th>

              {role === "admin" && (
                <th>Aksi</th>
              )}

            </tr>

          </thead>


          <tbody>

            {bookingDitampilkan.length > 0 ? (

              bookingDitampilkan.map((item) => (

                <tr key={item.id}>

                  <td>
                    {item.ruangan}
                  </td>

                  <td>
                    {item.pemesan}
                  </td>

                  <td>
                    {item.bagian}
                  </td>

                  <td>
                    {item.kegiatan}
                  </td>

                  <td>
                    {item.tanggal}
                  </td>

                  <td>
                    {item.mulai} - {item.selesai}
                  </td>

                  <td>
                    {item.status}
                  </td>


                  {/* AKSI ADMIN */}

                  {role === "admin" && (

                    <td>

                      {item.status === "Menunggu" && (

                        <>
                          <button
                            onClick={() =>
                              handleSetujui(item.id)
                            }
                          >
                            Setujui
                          </button>

                          <button
                            onClick={() =>
                              handleTolak(item.id)
                            }
                          >
                            Tolak
                          </button>
                        </>

                      )}

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
                >
                  Belum ada data booking.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default BookingRuangan;