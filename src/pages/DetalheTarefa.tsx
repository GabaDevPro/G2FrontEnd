import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { buscarTarefa } from '../api'
import type { Tarefa } from '../tipos'

function DetalheTarefa() {
  const { id } = useParams<{ id: string }>()
  const [tarefa, setTarefa] = useState<Tarefa | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    async function carregarTarefa() {
      if (!id) return

      setCarregando(true)
      setErro(false)

      try {
        const dados = await buscarTarefa(id)
        setTarefa(dados)
      } catch {
        setErro(true)
      } finally {
        setCarregando(false)
      }
    }

    carregarTarefa()
  }, [id])

  if (carregando) {
    return <p>Carregando tarefa...</p>
  }

  if (erro || !tarefa) {
    return (
      <>
        <h1>Tarefa não encontrada</h1>
        <p>Não existe tarefa com o id {id}.</p>
        <Link to="/">Voltar para a lista de tarefas</Link>
      </>
    )
  }

  return (
    <>
      <h1>{tarefa.titulo}</h1>

      <p>{tarefa.descricao}</p>

      <dl>
        <dt>Id</dt>
        <dd>{tarefa.id}</dd>

        <dt>Projeto</dt>
        <dd>
          <Link to={`/projetos/${tarefa.projetoId}`}>
            {tarefa.projetoId}
          </Link>
        </dd>

        <dt>Status</dt>
        <dd>{tarefa.status}</dd>

        <dt>Prioridade</dt>
        <dd>{tarefa.prioridade}</dd>

        <dt>Responsável</dt>
        <dd>{tarefa.responsavel}</dd>

        <dt>Prazo</dt>
        <dd>{tarefa.prazo}</dd>
      </dl>

      <Link to="/">Voltar para a lista de tarefas</Link>
    </>
  )
}

export default DetalheTarefa
