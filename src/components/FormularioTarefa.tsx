import type { FormEvent } from 'react'
import type { NovaTarefa } from '../tipos'

interface FormularioTarefaProps {
  valoresIniciais?: NovaTarefa
  aoSalvar: (dados: NovaTarefa) => Promise<void>
}

export default function FormularioTarefa({
  valoresIniciais,
  aoSalvar,
}: FormularioTarefaProps) {
  async function lidarComEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (valoresIniciais) {
      await aoSalvar(valoresIniciais)
    }
  }

  return (
    <form onSubmit={lidarComEnvio}>
      <h2>Formulário de tarefa</h2>
      <button type="submit" disabled={!valoresIniciais}>
        Salvar tarefa
      </button>
    </form>
  )
}