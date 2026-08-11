import { useState } from "react";

import DataRuangan from "./RumahTangga/DataRuangan";
import BookingRuangan from "./RumahTangga/BookingRuangan";
import KalenderRuangan from "./RumahTangga/KalenderRuangan";
import KerusakanRuangan from "./RumahTangga/KerusakanRuangan";
import PerbaikanRuangan from "./RumahTangga/PerbaikanRuangan";

function App() {
  const [halaman, setHalaman] = useState("ruangan");

  const renderHalaman = () => {
    switch (halaman) {
      case "ruangan":
        return <DataRuangan />;

      case "booking":
        return <BookingRuangan />;

      case "kalender":
        return <KalenderRuangan />;

      case "kerusakan":
        return <KerusakanRuangan />;

      case "perbaikan":
        return <PerbaikanRuangan />;

      default:
        return <DataRuangan />;
    }
  };

  return (
    <div>

      {/* NAVIGASI SEMENTARA */}
      <nav
        style={{
          display: "flex",
          gap: "10px",
          padding: "15px",
          borderBottom: "1px solid #ddd",
          background: "#f5f5f5",
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => setHalaman("ruangan")}>
          Data Ruangan
        </button>

        <button onClick={() => setHalaman("booking")}>
          Booking Ruangan
        </button>

        <button onClick={() => setHalaman("kalender")}>
          Kalender
        </button>

        <button onClick={() => setHalaman("kerusakan")}>
          Kerusakan
        </button>

        <button onClick={() => setHalaman("perbaikan")}>
          Perbaikan
        </button>
      </nav>

      {/* KONTEN */}
      <main style={{ padding: "30px" }}>
        {renderHalaman()}
      </main>

    </div>
  );
}

export default App;