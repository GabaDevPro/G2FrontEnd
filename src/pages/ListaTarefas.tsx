
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarTarefasComProjeto, type TarefaComProjeto } from '../api'
import CartaoTarefa from '../components/CartaoTarefa'
import FiltrosTarefas from '../components/FiltrosTarefas'
import { useFiltros } from '../context/FiltrosContext'

function ListaTarefas() {
  const [tarefas, setTarefas] = useState<TarefaComProjeto[]>([])
  const { busca, setBusca, status, prioridade } = useFiltros()
  useEffect(() => {
    async function carregarTarefas() {
      const dados = await listarTarefasComProjeto()
      setTarefas(dados)
    }

    carregarTarefas()
  }, [])

  // Busca e filtros combinados
  const termo = busca.trim().toLowerCase()

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const correspondeBusca = tarefa.titulo
      .toLowerCase()
      .includes(termo)

    const correspondeStatus = !status || tarefa.status === status

    const correspondePrioridade =
      !prioridade || tarefa.prioridade === prioridade

    return correspondeBusca && correspondeStatus && correspondePrioridade
})


  const total = tarefasFiltradas.length

  let resultadoBusca = ''

  if (termo && total === 0) {
    resultadoBusca = `Nenhuma tarefa com "${busca.trim()}" no título que corresponda aos filtros.`
  } else if (termo) {
    resultadoBusca = `${total} ${total === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}`
  }

  return (
    <>
      <header className="cabecalho-pagina cabecalho-com-acao">
        <div>
          <h1>Tarefas</h1>
          <p>Todas as tarefas de todos os projetos.</p>
        </div>

        <Link to="/tarefas/nova" className="botao botao-primario">
          + Nova tarefa
        </Link>
      </header>

      <div className="campo busca">
        <label htmlFor="busca">Buscar por título</label>
        <input
          id="busca"
          type="search"
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
        />
      </div>

      <FiltrosTarefas />

      <p role="status" className="resultado-busca">
        {resultadoBusca}
      </p>

      {total > 0 && (
        <ul className="lista-cartoes">
          {tarefasFiltradas.map((tarefa) => (
            <li key={tarefa.id}>
              <CartaoTarefa
                tarefa={tarefa}
                aoMudarStatus={(status) =>
                  setTarefas((atuais) =>
                    atuais.map((atual) =>
                      atual.id === tarefa.id
                        ? { ...atual, status }
                        : atual
                    )
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default ListaTarefas
