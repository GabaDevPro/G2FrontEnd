import { useFiltros } from '../context/FiltrosContext'

function BuscaTarefas() {
  const { busca, setBusca } = useFiltros()

  return (
    <div className="campo busca">
      <label htmlFor="busca">Buscar por título</label>
      <input
        id="busca"
        type="search"
        value={busca}
        onChange={(evento) => setBusca(evento.target.value)}
      />
    </div>
  )
}

export default BuscaTarefas
