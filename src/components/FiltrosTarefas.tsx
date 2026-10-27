
import { useState } from 'react'
import type { Prioridade, Status } from '../tipos'
import { ordemStatus, rotuloStatus, rotuloPrioridade } from '../rotulos'

interface FiltrosTarefasProps {
  aoFiltrar: (status: Status | '', prioridade: Prioridade | '') => void
}

function FiltrosTarefas({ aoFiltrar }: FiltrosTarefasProps) {
  const [status, setStatus] = useState<Status | ''>('')
  const [prioridade, setPrioridade] = useState<Prioridade | ''>('')

  function alterarStatus(valor: Status | '') {
    setStatus(valor)
    aoFiltrar(valor, prioridade)
  }

  function alterarPrioridade(valor: Prioridade | '') {
    setPrioridade(valor)
    aoFiltrar(status, valor)
  }

  return (
    <div className="campos-linha">
      <div className="campo">
        <label htmlFor="filtro-status">Filtrar por status</label>
        <select
          id="filtro-status"
          value={status}
          onChange={(evento) =>
            alterarStatus(evento.target.value as Status | '')
          }
        >
          <option value="">Todos os status</option>
          {ordemStatus.map((item) => (
            <option key={item} value={item}>
              {rotuloStatus[item]}
            </option>
          ))}
        </select>
      </div>

      <div className="campo">
        <label htmlFor="filtro-prioridade">Filtrar por prioridade</label>
        <select
          id="filtro-prioridade"
          value={prioridade}
          onChange={(evento) =>
            alterarPrioridade(evento.target.value as Prioridade | '')
          }
        >
          <option value="">Todas as prioridades</option>
          {(['baixa', 'media', 'alta'] as Prioridade[]).map((item) => (
            <option key={item} value={item}>
              {rotuloPrioridade[item]}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default FiltrosTarefas
