import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarProjetosComTarefas, type ProjetoComTarefas } from '../api'
import { formatarData } from '../formatarData'

function ListaProjetos() {
  const [projetos, setProjetos] = useState<ProjetoComTarefas[]>([])

  useEffect(() => {
    async function carregarProjetos() {
      const dados = await listarProjetosComTarefas()
      setProjetos(dados)
    }

    carregarProjetos()
  }, [])

  return (
    <>
      <header className="cabecalho-pagina cabecalho-com-acao">
        <div>
          <h1>Projetos</h1>
          <p>Cada projeto reúne as tarefas de uma disciplina.</p>
        </div>

        <Link to="/projetos/novo" className="botao botao-primario">
          + Novo projeto
        </Link>
      </header>

      <ul className="lista-cartoes">
        {projetos.map((projeto) => {
          const totalTarefas = projeto.tarefas?.length ?? 0

          return (
            <li key={projeto.id}>
              <article className="cartao">
                <h2>
                  {/* O link cobre o cartão inteiro pelo CSS (.link-cartao::after) */}
                  <Link to={`/projetos/${projeto.id}`} className="link-cartao">
                    {projeto.nome}
                  </Link>
                </h2>

                <p className="cartao-subtitulo">{projeto.descricao}</p>

                <div className="etiquetas">
                  <span className="etiqueta">
                    {totalTarefas} {totalTarefas === 1 ? 'tarefa' : 'tarefas'}
                  </span>
                </div>

                <p className="cartao-info">Disciplina: {projeto.disciplina}</p>
                <p className="cartao-info">
                  Criado em{' '}
                  <time dateTime={projeto.criadoEm}>
                    {formatarData(projeto.criadoEm)}
                  </time>
                </p>

                <span className="cartao-acao" aria-hidden="true">
                  Ver projeto →
                </span>
              </article>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default ListaProjetos
