
import { useFiltros } from '../context/FiltrosContext'
import type { Prioridade, Status } from '../tipos'
import { ordemStatus, rotuloStatus, rotuloPrioridade } from '../rotulos'

function FiltrosTarefas() {
  const { status, prioridade, setStatus, setPrioridade } = useFiltros()

  return (
    <div className="campos-linha">
      <div className="campo">
        <label htmlFor="filtro-status">Filtrar por status</label>
        <select
          id="filtro-status"
          value={status}
          onChange={(evento) =>
            setStatus(evento.target.value as Status | '')
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
            setPrioridade(evento.target.value as Prioridade | '')
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
