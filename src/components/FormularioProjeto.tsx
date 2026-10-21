import { useState, type SubmitEvent } from 'react'
import type { NovoProjeto } from '../tipos'

interface FormularioProjetoProps {
  valoresIniciais: NovoProjeto
  textoBotao: string
  aoSalvar: (projeto: NovoProjeto) => Promise<void>
  aoCancelar?: () => void
}

function FormularioProjeto({
  valoresIniciais,
  textoBotao,
  aoSalvar,
  aoCancelar,
}: FormularioProjetoProps) {
  const [nome, setNome] = useState(valoresIniciais.nome)
  const [descricao, setDescricao] = useState(valoresIniciais.descricao)
  const [disciplina, setDisciplina] = useState(valoresIniciais.disciplina)
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState('')

  async function enviar(evento: SubmitEvent<HTMLFormElement>) {
    // Sem isso o navegador recarrega a página ao enviar o formulário
    evento.preventDefault()

    if (salvando) return

    setSalvando(true)
    setErroSalvar('')

    try {
      await aoSalvar({ ...valoresIniciais, nome, descricao, disciplina })
    } catch {
      setErroSalvar('Não foi possível salvar o projeto. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <div className="campo">
        <label htmlFor="nome">Nome</label>
        <input
          id="nome"
          placeholder="Ex.: Gerenciador de Tarefas"
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
        />
      </div>

      <div className="campo">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          placeholder="Sobre o que é o projeto?"
          value={descricao}
          onChange={(evento) => setDescricao(evento.target.value)}
        />
      </div>

      <div className="campo">
        <label htmlFor="disciplina">Disciplina</label>
        <input
          id="disciplina"
          placeholder="Ex.: Desenvolvimento Frontend"
          value={disciplina}
          onChange={(evento) => setDisciplina(evento.target.value)}
        />
      </div>

      {erroSalvar && (
        <p className="alerta" role="alert">
          {erroSalvar}
        </p>
      )}

      <div className="acoes-formulario">
        {aoCancelar && (
          <button
            type="button"
            className="botao botao-secundario"
            onClick={aoCancelar}
            disabled={salvando}
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          className="botao botao-primario"
          disabled={salvando}
        >
          {salvando ? 'Salvando...' : textoBotao}
        </button>
      </div>
    </form>
  )
}

export default FormularioProjeto
