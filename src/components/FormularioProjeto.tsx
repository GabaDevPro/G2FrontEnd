import { useState, type SubmitEvent } from 'react'
import type { NovoProjeto } from '../tipos'

interface FormularioProjetoProps {
  valoresIniciais: NovoProjeto
  textoBotao: string
  aoSalvar: (projeto: NovoProjeto) => Promise<void>
}

function FormularioProjeto({
  valoresIniciais,
  textoBotao,
  aoSalvar,
}: FormularioProjetoProps) {
  const [nome, setNome] = useState(valoresIniciais.nome)
  const [descricao, setDescricao] = useState(valoresIniciais.descricao)
  const [disciplina, setDisciplina] = useState(valoresIniciais.disciplina)
  const [salvando, setSalvando] = useState(false)

  async function enviar(evento: SubmitEvent<HTMLFormElement>) {
    // Sem isso o navegador recarrega a página ao enviar o formulário
    evento.preventDefault()

    setSalvando(true)

    try {
      await aoSalvar({ ...valoresIniciais, nome, descricao, disciplina })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <label htmlFor="nome">Nome</label>
      <input
        id="nome"
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
        required
      />

      <label htmlFor="descricao">Descrição</label>
      <textarea
        id="descricao"
        value={descricao}
        onChange={(evento) => setDescricao(evento.target.value)}
      />

      <label htmlFor="disciplina">Disciplina</label>
      <input
        id="disciplina"
        value={disciplina}
        onChange={(evento) => setDisciplina(evento.target.value)}
      />

      <button type="submit" disabled={salvando}>
        {salvando ? 'Salvando...' : textoBotao}
      </button>
    </form>
  )
}

export default FormularioProjeto
