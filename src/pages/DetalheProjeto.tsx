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
      <p>Disciplina: {projeto.disciplina}</p>
      <p>
        Criado em:{' '}
        <time dateTime={projeto.criadoEm}>
          {formatarData(projeto.criadoEm)}
        </time>
      </p>

      <h2>Tarefas do projeto</h2>

      {tarefas.length === 0 ? (
        <p>Este projeto ainda não tem tarefas.</p>
      ) : (
        <div>
          {tarefas.map((tarefa) => (
            <TarefaCard key={tarefa.id} tarefa={tarefa} />
          ))}
        </div>
      )}

      <Link to="/projetos">Voltar para a lista de projetos</Link>
    </>
  )
}

export default DetalheProjeto
