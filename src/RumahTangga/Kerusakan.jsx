import { useSearchParams } from 'react-router-dom'
import KerusakanRuangan from './KerusakanRuangan'
import KerusakanMobil from './KerusakanMobil'

// Halaman "Kerusakan": Ruangan dan Mobil masing-masing punya submenu
// sendiri di sidebar (?tab=ruangan / ?tab=mobil), jadi di sini gak perlu
// tab button lagi -- tinggal render komponen sesuai query param.
function Kerusakan({ user }) {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'mobil' ? 'mobil' : 'ruangan'

  return (
    <div className="page">
      {tab === 'ruangan' ? (
        <KerusakanRuangan user={user} />
      ) : (
        <KerusakanMobil user={user} />
      )}
    </div>
  )
}

export default Kerusakan