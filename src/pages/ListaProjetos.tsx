import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarProjetos } from '../api'
import type { Projeto } from '../tipos'

function ListaProjetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([])

  useEffect(() => {
    async function carregarProjetos() {
      const dados = await listarProjetos()
      setProjetos(dados)
    }

    carregarProjetos()
  }, [])

  return (
    <main>
      <h1>Projetos</h1>

      <div>
        {projetos.map((projeto) => (
          <article key={projeto.id}>
            <h2>
              <Link to={`/projetos/${projeto.id}`}>{projeto.nome}</Link>
            </h2>

            <p>{projeto.descricao}</p>
            <p>Disciplina: {projeto.disciplina}</p>
          </article>
        ))}
      </div>
    </main>
  )
}

export default ListaProjetos
