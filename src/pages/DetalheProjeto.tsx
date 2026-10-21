import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { buscarProjetoComTarefas, type ProjetoComTarefas } from '../api'
import TarefaCard from '../components/TarefaCard'
import { formatarData } from '../formatarData'

function DetalheProjeto() {
  const { id } = useParams<{ id: string }>()
  const [projeto, setProjeto] = useState<ProjetoComTarefas | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    async function carregarProjeto() {
      if (!id) return

      setCarregando(true)
      setErro(false)

      try {
        const dados = await buscarProjetoComTarefas(id)
        setProjeto(dados)
      } catch {
        setErro(true)
      } finally {
        setCarregando(false)
      }
    }

    carregarProjeto()
  }, [id])

  if (carregando) {
    return <p>Carregando projeto...</p>
  }

  if (erro || !projeto) {
    return (
      <>
        <h1>Projeto não encontrado</h1>
        <p>Não existe projeto com o id {id}.</p>
        <Link to="/projetos">Voltar para a lista de projetos</Link>
      </>
    )
  }

  const tarefas = projeto.tarefas ?? []

  return (
    <>
      <h1>{projeto.nome}</h1>

      <p>{projeto.descricao}</p>

      <dl>
        <dt>Disciplina</dt>
        <dd>{projeto.disciplina}</dd>

        <dt>Criado em</dt>
        <dd>
          <time dateTime={projeto.criadoEm}>
            {formatarData(projeto.criadoEm)}
          </time>
        </dd>
      </dl>

      <h2>Tarefas do projeto</h2>

      <Link to={`/tarefas/nova?projeto=${projeto.id}`}>Nova tarefa</Link>

      {tarefas.length === 0 ? (
        <p>Este projeto ainda não tem tarefas.</p>
      ) : (
        <ul className="lista-tarefas">
          {tarefas.map((tarefa) => (
            <li key={tarefa.id}>
              <TarefaCard tarefa={tarefa} nivelTitulo={3} />
            </li>
          ))}
        </ul>
      )}

      <Link to="/projetos">Voltar para a lista de projetos</Link>
    </>
  )
}

export default DetalheProjeto
