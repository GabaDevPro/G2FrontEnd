import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarTarefasComProjeto, type TarefaComProjeto } from '../api'
import CartaoTarefa from '../components/CartaoTarefa'

function ListaTarefas() {
  const [tarefas, setTarefas] = useState<TarefaComProjeto[]>([])
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function carregarTarefas() {
      const dados = await listarTarefasComProjeto()
      setTarefas(dados)
    }

    carregarTarefas()
  }, [])

  // Espaços nas pontas não contam, e maiúsculas e minúsculas são iguais
  const termo = busca.trim().toLowerCase()
  const tarefasFiltradas = tarefas.filter((tarefa) =>
    tarefa.titulo.toLowerCase().includes(termo)
  )
  const total = tarefasFiltradas.length

  // Só fala do resultado enquanto há algo buscado
  let resultadoBusca = ''
  if (termo && total === 0) {
    resultadoBusca = `Nenhuma tarefa com "${busca.trim()}" no título.`
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
          onChange={(event) => setBusca(event.target.value)}
        />
      </div>

      {/* O role="status" fica sempre na página, para o leitor de tela
          anunciar quando o texto dentro dele muda */}
      <p role="status" className="resultado-busca">
        {resultadoBusca}
      </p>

      {total > 0 && (
        <ul className="lista-cartoes">
          {tarefasFiltradas.map((tarefa) => (
            <li key={tarefa.id}>
              <CartaoTarefa tarefa={tarefa} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default ListaTarefas
