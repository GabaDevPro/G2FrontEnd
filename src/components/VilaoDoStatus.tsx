import { viloes } from '../viloes'
import type { Status } from '../tipos'
import { CabecasVerdes } from './Ghibli'

// O vilão do status de uma tarefa. Status fora dos quatro (db.json editado à
// mão) não tem vilão próprio: fica com as cabeças verdes da Yubaba
function VilaoDoStatus({ status }: { status: Status }) {
  const vilao = viloes.find((item) => item.status === status)

  return vilao ? <vilao.Personagem /> : <CabecasVerdes />
}

export default VilaoDoStatus
