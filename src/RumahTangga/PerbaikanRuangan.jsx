import { useState } from "react";

function PerbaikanRuangan() {
  const [perbaikan, setPerbaikan] = useState([
    {
      id: 1,
      ruangan: "Ruang Rapat 2",
      kerusakan: "AC tidak dingin",
      jenisPerbaikan: "Service AC",
      penanggungJawab: "Teknisi AC",
      tanggalMulai: "2026-08-10",
      status: "Diproses",
    },
    {
      id: 2,
      ruangan: "Aula",
      kerusakan: "Lampu mati",
      jenisPerbaikan: "Ganti lampu",
      penanggungJawab: "Bagian Rumah Tangga",
      tanggalMulai: "2026-08-09",
      status: "Selesai",
    },
  ]);

  const [formData, setFormData] = useState({
    ruangan: "",
    kerusakan: "",
    jenisPerbaikan: "",
    penanggungJawab: "",
    tanggalMulai: "",
    status: "Diproses",
  });

  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataBaru = {
      id: perbaikan.length + 1,
      ...formData,
    };

    setPerbaikan([...perbaikan, dataBaru]);

    setFormData({
      ruangan: "",
      kerusakan: "",
      jenisPerbaikan: "",
      penanggungJawab: "",
      tanggalMulai: "",
      status: "Diproses",
    });

    setShowForm(false);
  };

  return (
    <div>

      <div>

        <div>
          <h1>Perbaikan Ruangan</h1>

          <p>
            Kelola tindak lanjut dan proses perbaikan fasilitas.
          </p>
        </div>

        <button onClick={() => setShowForm(true)}>
          + Tambah Perbaikan
        </button>

      </div>


      {showForm && (

        <form onSubmit={handleSubmit}>

          <h2>Tambah Data Perbaikan</h2>


          <div>
            <label>Ruangan</label>

            <input
              type="text"
              name="ruangan"
              value={formData.ruangan}
              onChange={handleChange}
              required
            />
          </div>


          <div>
            <label>Kerusakan</label>

            <input
              type="text"
              name="kerusakan"
              value={formData.kerusakan}
              onChange={handleChange}
              required
            />
          </div>


          <div>
            <label>Jenis Perbaikan</label>

            <input
              type="text"
              name="jenisPerbaikan"
              value={formData.jenisPerbaikan}
              onChange={handleChange}
              placeholder="Contoh: Service AC"
              required
            />
          </div>


          <div>
            <label>Penanggung Jawab</label>

            <input
              type="text"
              name="penanggungJawab"
              value={formData.penanggungJawab}
              onChange={handleChange}
              required
            />
          </div>


          <div>
            <label>Tanggal Mulai</label>

            <input
              type="date"
              name="tanggalMulai"
              value={formData.tanggalMulai}
              onChange={handleChange}
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
              <option value="Diproses">Diproses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>


          <button
            type="button"
            onClick={() => setShowForm(false)}
          >
            Batal
          </button>

          <button type="submit">
            Simpan
          </button>

        </form>

      )}


      <table>

        <thead>

          <tr>
            <th>Ruangan</th>
            <th>Kerusakan</th>
            <th>Jenis Perbaikan</th>
            <th>Penanggung Jawab</th>
            <th>Tanggal Mulai</th>
            <th>Status</th>
          </tr>

        </thead>


        <tbody>

          {perbaikan.map((item) => (

            <tr key={item.id}>

              <td>{item.ruangan}</td>

              <td>{item.kerusakan}</td>

              <td>{item.jenisPerbaikan}</td>

              <td>{item.penanggungJawab}</td>

              <td>{item.tanggalMulai}</td>

              <td>{item.status}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default PerbaikanRuangan;