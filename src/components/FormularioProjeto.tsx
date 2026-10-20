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

  async function enviar(evento: SubmitEvent<HTMLFormElement>) {
    // Sem isso o navegador recarrega a página ao enviar o formulário
    evento.preventDefault()

    await aoSalvar({ ...valoresIniciais, nome, descricao, disciplina })
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <label htmlFor="nome">Nome</label>
      <input
        id="nome"
        value={nome}
        onChange={(evento) => setNome(evento.target.value)}
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

      <button type="submit">{textoBotao}</button>
    </form>
  )
}

export default FormularioProjeto
