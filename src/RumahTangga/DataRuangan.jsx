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

  return (
    <div>

      {/* HEADER */}

      <div>
        <div>
          <h1>Data Ruangan</h1>

          <p>
            Informasi ruangan dan fasilitas yang tersedia.
          </p>
        </div>

        {/* Hanya Admin yang bisa menambah */}

        {role === "admin" && (
          <button onClick={() => setShowForm(true)}>
            + Tambah Ruangan
          </button>
        )}
      </div>


      {/* INFORMASI ROLE */}

      <div>
        <strong>
          {role === "admin"
            ? "Mode Admin Rumah Tangga"
            : "Mode Pegawai"}
        </strong>

        <p>
          {role === "admin"
            ? "Anda dapat mengelola data ruangan."
            : "Anda hanya dapat melihat data ruangan."}
        </p>
      </div>


      {/* SEARCH */}

      <div>

        <input
          type="text"
          placeholder="Cari ruangan, kode, atau lokasi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>


      {/* FORM TAMBAH */}

      {showForm && role === "admin" && (

        <div>

          <div>
            <h2>Tambah Ruangan</h2>

            <button onClick={() => setShowForm(false)}>
              ✕
            </button>
          </div>


          <form onSubmit={handleSubmit}>

            <div>
              <label>Nama Ruangan</label>

              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Contoh: Ruang Rapat 3"
                required
              />
            </div>


            <div>
              <label>Kode Ruangan</label>

              <input
                type="text"
                name="kode"
                value={formData.kode}
                onChange={handleChange}
                placeholder="Contoh: RR-04"
                required
              />
            </div>


            <div>
              <label>Kapasitas</label>

              <input
                type="number"
                name="kapasitas"
                value={formData.kapasitas}
                onChange={handleChange}
                placeholder="Jumlah orang"
                min="1"
                required
              />
            </div>


            <div>
              <label>Lokasi</label>

              <input
                type="text"
                name="lokasi"
                value={formData.lokasi}
                onChange={handleChange}
                placeholder="Contoh: Lantai 2"
                required
              />
            </div>


            <div>
              <label>Fasilitas</label>

              <input
                type="text"
                name="fasilitas"
                value={formData.fasilitas}
                onChange={handleChange}
                placeholder="Contoh: AC, Proyektor, Meja"
                required
              />
            </div>


            <div>
              <label>Status</label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Tersedia">Tersedia</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>


            <div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
              >
                Batal
              </button>

              <button type="submit">
                Simpan Ruangan
              </button>

            </div>

          </form>

        </div>
      )}


      {/* DATA RUANGAN */}

      <div>

        <table>

          <thead>

            <tr>
              <th>No</th>
              <th>Nama Ruangan</th>
              <th>Kode</th>
              <th>Kapasitas</th>
              <th>Lokasi</th>
              <th>Fasilitas</th>
              <th>Status</th>

              {role === "admin" && (
                <th>Aksi</th>
              )}
            </tr>

          </thead>


          <tbody>

            {filteredRuangan.length > 0 ? (

              filteredRuangan.map((item, index) => (

                <tr key={item.id}>

                  <td>{index + 1}</td>

                  <td>{item.nama}</td>

                  <td>{item.kode}</td>

                  <td>{item.kapasitas} orang</td>

                  <td>{item.lokasi}</td>

                  <td>{item.fasilitas}</td>

                  <td>{item.status}</td>


                  {/* AKSI ADMIN */}

                  {role === "admin" && (

                    <td>

                      <button>
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
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
                  colSpan={role === "admin" ? 8 : 7}
                >
                  Data ruangan tidak ditemukan.
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default DataRuangan;