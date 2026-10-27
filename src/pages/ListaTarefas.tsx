
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarTarefasComProjeto, type TarefaComProjeto } from '../api'
import CartaoTarefa from '../components/CartaoTarefa'
import FiltrosTarefas from '../components/FiltrosTarefas'
import type { Status, Prioridade } from '../tipos'

function ListaTarefas() {
  const [tarefas, setTarefas] = useState<TarefaComProjeto[]>([])
  const [statusFiltro, setStatusFiltro] = useState<Status | ''>('')
  const [prioridadeFiltro, setPrioridadeFiltro] = useState<Prioridade | ''>('')

  useEffect(() => {
    async function carregarTarefas() {
      const dados = await listarTarefasComProjeto()
      setTarefas(dados)
    }

    carregarTarefas()
  }, [])

  function aplicarFiltros(
    status: Status | '',
    prioridade: Prioridade | ''
  ) {
    setStatusFiltro(status)
    setPrioridadeFiltro(prioridade)
  }

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    const correspondeStatus =
      !statusFiltro || tarefa.status === statusFiltro

    const correspondePrioridade =
      !prioridadeFiltro || tarefa.prioridade === prioridadeFiltro

    return correspondeStatus && correspondePrioridade
  })

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

      <FiltrosTarefas aoFiltrar={aplicarFiltros} />

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
    </>
  )
}

export default ListaTarefas
