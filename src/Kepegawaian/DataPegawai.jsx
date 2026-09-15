import { useSearchParams } from 'react-router-dom'
import MasaKerja from './MasaKerja'
import KenaikanGajiBerkala from './KenaikanGajiBerkala'

function DataPegawai({ user }) {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'kgb' ? 'kgb' : 'masa-kerja'

  return (
    <div className="page">
      {tab === 'masa-kerja' ? (
        <MasaKerja user={user} />
      ) : (
        <KenaikanGajiBerkala user={user} />
      )}
    </div>
  )
}

export default DataPegawai