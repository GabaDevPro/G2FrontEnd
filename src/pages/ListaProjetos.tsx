import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarProjetosComTarefas, type ProjetoComTarefas } from '../api'

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

      <div>
        {projetos.map((projeto) => {
          const totalTarefas = projeto.tarefas?.length ?? 0

          return (
            <article key={projeto.id}>
              <h2>
                <Link to={`/projetos/${projeto.id}`}>{projeto.nome}</Link>
              </h2>

              <p>{projeto.descricao}</p>
              <p>Disciplina: {projeto.disciplina}</p>
              <p>
                {totalTarefas} {totalTarefas === 1 ? 'tarefa' : 'tarefas'}
              </p>
            </article>
          )
        })}
      </div>
    </>
  )
}

export default ListaProjetos
