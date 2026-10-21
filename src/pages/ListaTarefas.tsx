import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarTarefasComProjeto, type TarefaComProjeto } from '../api'
import CartaoTarefa from '../components/CartaoTarefa'

function ListaTarefas() {
  const [tarefas, setTarefas] = useState<TarefaComProjeto[]>([])

  useEffect(() => {
    async function carregarTarefas() {
      const dados = await listarTarefasComProjeto()
      setTarefas(dados)
    }

    carregarTarefas()
  }, [])

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

      <ul className="lista-cartoes">
        {tarefas.map((tarefa) => (
          <li key={tarefa.id}>
            <CartaoTarefa tarefa={tarefa} />
          </li>
        ))}
      </ul>
    </>
  )
}

export default ListaTarefas
