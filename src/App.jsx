import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ProgramKerja from './pages/ProgramKerja'
import Anggaran from './pages/Anggaran'

function App() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-area">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/program-kerja" />} />
            <Route path="/program-kerja" element={<ProgramKerja />} />
            <Route path="/anggaran" element={<Anggaran />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App