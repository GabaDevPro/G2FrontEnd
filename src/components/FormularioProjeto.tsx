import { useRef, useState, type SubmitEvent } from 'react'
import type { NovoProjeto } from '../tipos'
// As telas de cadastro têm o tema da cartomante: os campos viram cartas
import '@fontsource/corben/latin-400.css'
import '@fontsource/corben/latin-700.css'
import '../cartomante.css'

interface FormularioProjetoProps {
  valoresIniciais: NovoProjeto
  textoBotao: string
  aoSalvar: (projeto: NovoProjeto) => Promise<void>
  aoCancelar?: () => void
}

type ErrosProjeto = Partial<Record<'nome' | 'disciplina', string>>

function validarProjeto(nome: string, disciplina: string): ErrosProjeto {
  const erros: ErrosProjeto = {}

  // Só espaços não conta como preenchido
  if (!nome.trim()) {
    erros.nome = 'Informe o nome do projeto.'
  }

  if (!disciplina.trim()) {
    erros.disciplina = 'Informe a disciplina do projeto.'
  }

  return erros
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
  const [erros, setErros] = useState<ErrosProjeto>({})

  const refNome = useRef<HTMLInputElement>(null)
  const refDisciplina = useRef<HTMLInputElement>(null)

  async function enviar(evento: SubmitEvent<HTMLFormElement>) {
    // Sem isso o navegador recarrega a página ao enviar o formulário
    evento.preventDefault()

    if (salvando) return

    const novosErros = validarProjeto(nome, disciplina)
    setErros(novosErros)

    // Leva o foco ao primeiro campo com erro, na ordem da tela
    if (novosErros.nome) {
      refNome.current?.focus()
      return
    }
    if (novosErros.disciplina) {
      refDisciplina.current?.focus()
      return
    }

    setSalvando(true)
    setErroSalvar('')

    try {
      await aoSalvar({
        ...valoresIniciais,
        nome: nome.trim(),
        descricao,
        disciplina: disciplina.trim(),
      })
    } catch {
      // Os campos ficam como estão: o estado do formulário não é apagado
      // na falha, então basta clicar em salvar de novo
      setErroSalvar(
        'Não foi possível salvar o projeto. Verifique se a API está rodando e tente de novo. O que você digitou continua no formulário.'
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    // noValidate desliga o balão do navegador: as mensagens aparecem embaixo
    // de cada campo. O required continua para os leitores de tela.
    <form className="formulario" onSubmit={enviar} noValidate>
      <div className="campo">
        <label htmlFor="nome">
          Nome{' '}
          <span className="obrigatorio" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="nome"
          ref={refNome}
          placeholder="Ex.: Gerenciador de Tarefas"
          value={nome}
          onChange={(evento) => {
            setNome(evento.target.value)
            setErros({ ...erros, nome: undefined })
          }}
          required
          aria-invalid={!!erros.nome}
          aria-describedby={erros.nome ? 'nome-erro' : undefined}
        />

        {erros.nome && (
          <p id="nome-erro" className="erro-campo">
            {erros.nome}
          </p>
        )}
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
        <label htmlFor="disciplina">
          Disciplina{' '}
          <span className="obrigatorio" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="disciplina"
          ref={refDisciplina}
          placeholder="Ex.: Desenvolvimento Frontend"
          value={disciplina}
          onChange={(evento) => {
            setDisciplina(evento.target.value)
            setErros({ ...erros, disciplina: undefined })
          }}
          required
          aria-invalid={!!erros.disciplina}
          aria-describedby={erros.disciplina ? 'disciplina-erro' : undefined}
        />

        {erros.disciplina && (
          <p id="disciplina-erro" className="erro-campo">
            {erros.disciplina}
          </p>
        )}
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

        {/* Salvando, o botão usa aria-disabled em vez de disabled. Um botão
            desabilitado perde o foco: na falha, quem usa teclado voltava ao
            topo da página. Um segundo envio é barrado em enviar */}
        <button
          type="submit"
          className="botao botao-primario"
          aria-disabled={salvando}
        >
          {salvando ? 'Salvando...' : textoBotao}
        </button>
      </div>
    </form>
  )
}

export default FormularioProjeto
