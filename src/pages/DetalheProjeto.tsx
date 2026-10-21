import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { buscarProjetoComTarefas, type ProjetoComTarefas } from '../api'
import CartaoTarefa from '../components/CartaoTarefa'
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
        <Link to="/projetos" className="link-voltar">
          ← Voltar para a lista de projetos
        </Link>
      </>
    )
  }

  const tarefas = projeto.tarefas ?? []

  return (
    <>
      <Link to="/projetos" className="link-voltar">
        ← Voltar para a lista de projetos
      </Link>

      <header className="cabecalho-pagina cabecalho-com-acao">
        <div>
          <h1>{projeto.nome}</h1>
          <p>{projeto.descricao}</p>
        </div>

        <Link
          to={`/projetos/${projeto.id}/editar`}
          className="botao botao-secundario"
        >
          ✎ Editar projeto
        </Link>
      </header>

      <dl className="painel-dados">
        <dt>Disciplina</dt>
        <dd>{projeto.disciplina}</dd>

        <dt>Criado em</dt>
        <dd>
          <time dateTime={projeto.criadoEm}>
            {formatarData(projeto.criadoEm)}
          </time>
        </dd>
      </dl>

      <div className="cabecalho-secao">
        <h2>Tarefas do projeto</h2>

        <Link
          to={`/tarefas/nova?projeto=${projeto.id}`}
          className="botao botao-primario"
        >
          + Nova tarefa
        </Link>
      </div>

      {tarefas.length === 0 ? (
        <p>Este projeto ainda não tem tarefas.</p>
      ) : (
        <ul className="lista-cartoes">
          {tarefas.map((tarefa) => (
            <li key={tarefa.id}>
              <CartaoTarefa tarefa={tarefa} nivelTitulo={3} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default DetalheProjeto
