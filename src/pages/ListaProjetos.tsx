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
      <h1>Projetos</h1>

      <ul className="lista-projetos">
        {projetos.map((projeto) => {
          const totalTarefas = projeto.tarefas?.length ?? 0

          return (
            <li key={projeto.id}>
              <article className="cartao-projeto">
                <h2>
                  <Link to={`/projetos/${projeto.id}`}>{projeto.nome}</Link>
                </h2>

                <p>{projeto.descricao}</p>
                <p>Disciplina: {projeto.disciplina}</p>
                <p>
                  Criado em{' '}
                  <time dateTime={projeto.criadoEm}>
                    {formatarData(projeto.criadoEm)}
                  </time>
                </p>
                <p>
                  {totalTarefas} {totalTarefas === 1 ? 'tarefa' : 'tarefas'}
                </p>
              </article>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default ListaProjetos
