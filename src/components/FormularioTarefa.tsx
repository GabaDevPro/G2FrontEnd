
import { useState } from 'react'
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
  const [dados, setDados] = useState<NovaTarefa>(
    valoresIniciais ?? {
      projetoId: '',
      titulo: '',
      descricao: '',
      status: 'a-fazer',
      prioridade: 'media',
      responsavel: '',
      prazo: '',
    }
  )

  async function lidarComEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    await aoSalvar(dados)
  }

  return (
    <form onSubmit={lidarComEnvio}>
      <h2>Formulário de tarefa</h2>

      <div>
        <label htmlFor="titulo">Título</label>
        <input
          id="titulo"
          type="text"
          value={dados.titulo}
          onChange={(evento) =>
            setDados({ ...dados, titulo: evento.target.value })
          }
        />
      </div>

      <div>
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          value={dados.descricao}
          onChange={(evento) =>
            setDados({ ...dados, descricao: evento.target.value })
          }
        />
      </div>

      <div>
        <label htmlFor="responsavel">Responsável</label>
        <input
          id="responsavel"
          type="text"
          value={dados.responsavel}
          onChange={(evento) =>
            setDados({ ...dados, responsavel: evento.target.value })
          }
        />
      </div>

      <button type="submit">Salvar tarefa</button>
    </form>
  )
}
