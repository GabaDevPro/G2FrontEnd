import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarTarefas } from '../api'
import type { Tarefa } from '../tipos'
import CartaoTarefa from '../components/CartaoTarefa'

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
    <>
      <h1>Lista de Tarefas</h1>

      <Link to="/tarefas/nova">Nova tarefa</Link>

      <div>
        {tarefas.map((tarefa) => (
          <CartaoTarefa
            key={tarefa.id}
            tarefa={tarefa}
          />
        ))}
      </div>
    </>
  )
}

export default ListaTarefas
