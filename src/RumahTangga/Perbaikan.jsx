import { useSearchParams } from 'react-router-dom'
import PerbaikanRuangan from './PerbaikanRuangan'
import PerbaikanMobil from './PerbaikanMobil'

// Halaman "Perbaikan": Ruangan dan Mobil masing-masing punya submenu
// sendiri di sidebar (?tab=ruangan / ?tab=mobil), jadi di sini gak perlu
// tab button lagi -- tinggal render komponen sesuai query param.
function Perbaikan({ user }) {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'mobil' ? 'mobil' : 'ruangan'

  return (
    <div className="page">
      {tab === 'ruangan' ? (
        <PerbaikanRuangan user={user} />
      ) : (
        <PerbaikanMobil user={user} />
      )}
    </div>
  )
}

export default Perbaikan