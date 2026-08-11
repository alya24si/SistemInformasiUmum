import { useState } from "react";

function KerusakanRuangan() {
  const [role] = useState("admin");

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

      // Nanti berasal dari akun Supabase
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

      // User → menunggu
      // Admin → langsung diproses
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
  // SELESAIKAN
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
  // HAPUS
  // =========================

  const handleHapus = (id) => {
    const konfirmasi = window.confirm(
      "Apakah kamu yakin ingin menghapus data kerusakan ini?"
    );

    if (!konfirmasi) return;

    setLaporan(
      laporan.filter((item) => item.id !== id)
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

  return (
    <div>

      {/* =========================
          HEADER
      ========================= */}

      <div>

        <div>

          <h1>Kerusakan Ruangan</h1>

          <p>
            Mencatat dan memantau kerusakan
            fasilitas ruangan.
          </p>

        </div>

        {/* USER DAN ADMIN SAMA-SAMA BISA TAMBAH */}

        <button
          onClick={() => setShowForm(true)}
        >
          + Tambah Kerusakan
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
            ? "Anda dapat menambahkan, memproses, dan mengelola seluruh data kerusakan."
            : "Anda dapat melaporkan kerusakan fasilitas dan melihat laporan Anda."}
        </p>

      </div>


      {/* =========================
          FORM
      ========================= */}

      {showForm && (

        <div>

          <div>

            <h2>
              {role === "admin"
                ? "Tambah Data Kerusakan"
                : "Laporkan Kerusakan"}
            </h2>

            <button
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            {/* RUANGAN */}

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


            {/* JENIS KERUSAKAN */}

            <div>

              <label>
                Jenis Kerusakan
              </label>

              <input
                type="text"
                name="kerusakan"
                value={formData.kerusakan}
                onChange={handleChange}
                placeholder="Contoh: AC tidak dingin"
                required
              />

            </div>


            {/* DESKRIPSI */}

            <div>

              <label>
                Deskripsi Kerusakan
              </label>

              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                placeholder="Jelaskan kondisi kerusakan..."
                rows="5"
                required
              />

            </div>


            {/* BUTTON */}

            <div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
              >
                Batal
              </button>

              <button type="submit">
                Simpan
              </button>

            </div>

          </form>

        </div>
      )}


      {/* =========================
          DAFTAR DATA
      ========================= */}

      <div>

        <h2>
          {role === "admin"
            ? "Seluruh Data Kerusakan"
            : "Laporan Saya"}
        </h2>


        <table>

          <thead>

            <tr>

              <th>Ruangan</th>

              <th>Pelapor</th>

              <th>Bagian</th>

              <th>Tanggal</th>

              <th>Kerusakan</th>

              <th>Deskripsi</th>

              <th>Sumber</th>

              <th>Status</th>

              {role === "admin" && (
                <th>Aksi</th>
              )}

            </tr>

          </thead>


          <tbody>

            {laporanDitampilkan.length > 0 ? (

              laporanDitampilkan.map((item) => (

                <tr key={item.id}>

                  <td>
                    {item.ruangan}
                  </td>

                  <td>
                    {item.pelapor}
                  </td>

                  <td>
                    {item.bagian}
                  </td>

                  <td>
                    {item.tanggal}
                  </td>

                  <td>
                    {item.kerusakan}
                  </td>

                  <td>
                    {item.deskripsi}
                  </td>

                  <td>
                    {item.sumber}
                  </td>

                  <td>
                    {item.status}
                  </td>


                  {/* =========================
                      AKSI ADMIN
                  ========================= */}

                  {role === "admin" && (

                    <td>

                      {item.status === "Menunggu" && (

                        <button
                          onClick={() =>
                            handleProses(item.id)
                          }
                        >
                          Proses
                        </button>

                      )}


                      {item.status === "Diproses" && (

                        <button
                          onClick={() =>
                            handleSelesai(item.id)
                          }
                        >
                          Selesai
                        </button>

                      )}


                      <button
                        onClick={() =>
                          handleHapus(item.id)
                        }
                      >
                        Hapus
                      </button>

                    </td>

                  )}

                </tr>

              ))

            ) : (

              <tr>

                <td
                  colSpan={
                    role === "admin"
                      ? 9
                      : 8
                  }
                >
                  Belum ada data kerusakan.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default KerusakanRuangan;