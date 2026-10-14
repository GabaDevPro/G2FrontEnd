import { useEffect, useState } from 'react'
import { listarTarefas } from '../api'
import type { Tarefa } from '../tipos'
import TarefaCard from '../components/TarefaCard'

function ListaTarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])

  useEffect(() => {
    async function carregarTarefas() {
      const dados = await listarTarefas()
      setTarefas(dados)
    }

    carregarTarefas()
  }, [])

  return (
    <main>
      <h1>Lista de Tarefas</h1>

      <div>
        {tarefas.map((tarefa) => (
          <TarefaCard
            key={tarefa.id}
            tarefa={tarefa}
          />
        ))}
      </div>
    </main>
  )
}

export default ListaTarefas
