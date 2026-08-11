import { useState } from "react";

function KalenderRuangan() {
  // SEMENTARA UNTUK TESTING
  // Nanti role berasal dari Supabase Auth
  const [role] = useState("user");

  // Data dummy
  // Nanti data ini berasal dari booking yang statusnya "Disetujui"
  const [booking] = useState([
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
      status: "Disetujui",
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
      status: "Disetujui",
    },
    {
      id: 4,
      ruangan: "Ruang Rapat 2",
      pemesan: "Siti Rahma",
      bagian: "Bagian Keuangan",
      kegiatan: "Evaluasi Anggaran",
      tanggal: "2026-08-15",
      mulai: "10:00",
      selesai: "12:00",
      status: "Disetujui",
    },
  ]);

  const [tanggalDipilih, setTanggalDipilih] =
    useState("2026-08-12");

  // =========================
  // FORMAT TANGGAL
  // =========================

  const formatTanggal = (tanggal) => {
    const date = new Date(`${tanggal}T00:00:00`);

    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // =========================
  // BOOKING YANG DISETUJUI
  // =========================

  const bookingDisetujui = booking.filter(
    (item) => item.status === "Disetujui"
  );

  // =========================
  // BOOKING PADA TANGGAL DIPILIH
  // =========================

  const bookingHariIni = bookingDisetujui
    .filter(
      (item) => item.tanggal === tanggalDipilih
    )
    .sort((a, b) =>
      a.mulai.localeCompare(b.mulai)
    );

  // =========================
  // DAFTAR TANGGAL
  // =========================

  const daftarTanggal = [
    "2026-08-10",
    "2026-08-11",
    "2026-08-12",
    "2026-08-13",
    "2026-08-14",
    "2026-08-15",
    "2026-08-16",
  ];

  return (
    <div>

      {/* =========================
          HEADER
      ========================= */}

      <div>

        <div>

          <h1>Kalender Ruangan</h1>

          <p>
            Lihat jadwal penggunaan ruangan yang
            telah disetujui.
          </p>

        </div>

      </div>


      {/* =========================
          INFORMASI
      ========================= */}

      <div>

        <strong>
          Kalender Otomatis
        </strong>

        <p>
          Jadwal pada kalender berasal dari booking
          yang telah disetujui oleh Admin Rumah Tangga.
        </p>

      </div>


      {/* =========================
          PILIH TANGGAL
      ========================= */}

      <div>

        <h2>
          Pilih Tanggal
        </h2>

        <div>

          {daftarTanggal.map((tanggal) => (

            <button
              key={tanggal}
              onClick={() =>
                setTanggalDipilih(tanggal)
              }
            >

              {new Date(
                `${tanggal}T00:00:00`
              ).toLocaleDateString("id-ID", {
                weekday: "short",
                day: "numeric",
                month: "short",
              })}

            </button>

          ))}

        </div>

      </div>


      {/* =========================
          TANGGAL DIPILIH
      ========================= */}

      <div>

        <h2>
          {formatTanggal(tanggalDipilih)}
        </h2>

        <p>
          {bookingHariIni.length} ruangan
          digunakan pada tanggal ini.
        </p>

      </div>


      {/* =========================
          JADWAL
      ========================= */}

      <div>

        {bookingHariIni.length > 0 ? (

          bookingHariIni.map((item) => (

            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "8px",
              }}
            >

              <div>

                <h3>
                  {item.ruangan}
                </h3>

                <p>
                  {item.mulai} - {item.selesai}
                </p>

              </div>


              <div>

                <p>
                  <strong>Kegiatan:</strong>{" "}
                  {item.kegiatan}
                </p>

                <p>
                  <strong>Pemesan:</strong>{" "}
                  {item.pemesan}
                </p>

                <p>
                  <strong>Bagian:</strong>{" "}
                  {item.bagian}
                </p>

              </div>

            </div>

          ))

        ) : (

          <div>

            <h3>
              Tidak ada booking
            </h3>

            <p>
              Tidak ada ruangan yang digunakan
              pada tanggal ini.
            </p>

          </div>

        )}

      </div>


      {/* =========================
          KETERANGAN
      ========================= */}

      <div>

        <h2>
          Keterangan
        </h2>

        <p>
          Jadwal yang tampil di kalender hanya
          merupakan booking dengan status
          <strong> Disetujui</strong>.
        </p>

        <p>
          Booking yang masih menunggu persetujuan
          atau ditolak tidak akan muncul di kalender.
        </p>

      </div>

    </div>
  );
}

export default KalenderRuangan;