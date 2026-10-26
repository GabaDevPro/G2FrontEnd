import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { NovaTarefa, Prioridade, Projeto } from '../tipos'
import { listarProjetos } from '../api'

interface FormularioTarefaProps {
  valoresIniciais?: NovaTarefa
  aoSalvar: (dados: NovaTarefa) => Promise<void>
  aoCancelar?: () => void
  textoBotao?: string
}

const opcoesPrioridade: { valor: Prioridade; rotulo: string }[] = [
  { valor: 'baixa', rotulo: 'Baixa' },
  { valor: 'media', rotulo: 'Média' },
  { valor: 'alta', rotulo: 'Alta' },
]

type ErrosTarefa = Partial<Record<'projetoId' | 'titulo', string>>

function validarTarefa(dados: NovaTarefa): ErrosTarefa {
  const erros: ErrosTarefa = {}

  if (!dados.projetoId) {
    erros.projetoId = 'Selecione o projeto da tarefa.'
  }

  // Só espaços não conta como título
  if (!dados.titulo.trim()) {
    erros.titulo = 'Informe o título da tarefa.'
  }

  return erros
}

function FormularioTarefa({
  valoresIniciais,
  aoSalvar,
  aoCancelar,
  textoBotao = 'Salvar tarefa',
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

  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [carregandoProjetos, setCarregandoProjetos] = useState(true)
  const [erroProjetos, setErroProjetos] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erroSalvar, setErroSalvar] = useState('')
  const [erros, setErros] = useState<ErrosTarefa>({})

  const refProjeto = useRef<HTMLSelectElement>(null)
  const refTitulo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let ativo = true

    async function carregarProjetos() {
      try {
        const resultado = await listarProjetos()

        if (ativo) {
          setProjetos(resultado)

          // Um projeto que não existe (ex.: /tarefas/nova?projeto=999) é limpo.
          // Sem isso o seletor mostraria "Selecione um projeto", mas a tarefa
          // seria gravada nesse projeto inexistente.
          setDados((atuais) =>
            resultado.some((projeto) => projeto.id === atuais.projetoId)
              ? atuais
              : { ...atuais, projetoId: '' }
          )
        }
      } catch {
        if (ativo) {
          setErroProjetos('Não foi possível carregar os projetos.')
        }
      } finally {
        if (ativo) {
          setCarregandoProjetos(false)
        }
      }
    }

    carregarProjetos()

    return () => {
      ativo = false
    }
  }, [])

  async function lidarComEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (salvando || carregandoProjetos || erroProjetos) {
      return
    }

    const novosErros = validarTarefa(dados)
    setErros(novosErros)

    // Leva o foco ao primeiro campo com erro, na ordem da tela
    if (novosErros.projetoId) {
      refProjeto.current?.focus()
      return
    }
    if (novosErros.titulo) {
      refTitulo.current?.focus()
      return
    }

    setSalvando(true)
    setErroSalvar('')

    try {
      await aoSalvar({ ...dados, titulo: dados.titulo.trim() })
    } catch {
      setErroSalvar('Não foi possível salvar a tarefa. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    // noValidate desliga o balão do navegador: as mensagens aparecem embaixo
    // de cada campo. O required continua para os leitores de tela.
    <form className="formulario" onSubmit={lidarComEnvio} noValidate>
      <div className="campo">
        <label htmlFor="projetoId">
          Projeto{' '}
          <span className="obrigatorio" aria-hidden="true">
            *
          </span>
        </label>
        <select
          id="projetoId"
          ref={refProjeto}
          value={dados.projetoId}
          onChange={(evento) => {
            setDados({
              ...dados,
              projetoId: evento.target.value,
            })
            setErros({ ...erros, projetoId: undefined })
          }}
          disabled={carregandoProjetos || !!erroProjetos}
          required
          aria-invalid={!!erros.projetoId}
          aria-describedby={erros.projetoId ? 'projetoId-erro' : undefined}
        >
          <option value="">
            {carregandoProjetos ? 'Carregando projetos...' : 'Selecione um projeto'}
          </option>

          {projetos.map((projeto) => (
            <option key={projeto.id} value={projeto.id}>
              {projeto.nome}
            </option>
          ))}
        </select>

        {erros.projetoId && (
          <p id="projetoId-erro" className="erro-campo">
            {erros.projetoId}
          </p>
        )}

        {erroProjetos && (
          <p className="alerta" role="alert">
            {erroProjetos}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="titulo">
          Título{' '}
          <span className="obrigatorio" aria-hidden="true">
            *
          </span>
        </label>
        <input
          id="titulo"
          type="text"
          ref={refTitulo}
          placeholder="Ex.: Montar a tela de login"
          value={dados.titulo}
          onChange={(evento) => {
            setDados({ ...dados, titulo: evento.target.value })
            setErros({ ...erros, titulo: undefined })
          }}
          required
          aria-invalid={!!erros.titulo}
          aria-describedby={erros.titulo ? 'titulo-erro' : undefined}
        />

        {erros.titulo && (
          <p id="titulo-erro" className="erro-campo">
            {erros.titulo}
          </p>
        )}
      </div>

      <div className="campo">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          placeholder="O que precisa ser feito?"
          value={dados.descricao}
          onChange={(evento) =>
            setDados({ ...dados, descricao: evento.target.value })
          }
        />
      </div>

      <div className="campos-linha">
        <div className="campo">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={dados.status}
            onChange={(evento) =>
              setDados({
                ...dados,
                status: evento.target.value as NovaTarefa['status'],
              })
            }
          >
            <option value="a-fazer">A fazer</option>
            <option value="em-andamento">Em andamento</option>
            <option value="em-revisao">Em revisão</option>
            <option value="concluida">Concluída</option>
          </select>
        </div>

        <fieldset className="campo">
          <legend>Prioridade</legend>
          <div className="opcoes-prioridade">
            {opcoesPrioridade.map((opcao) => (
              <label
                key={opcao.valor}
                className={`pilula prioridade-${opcao.valor}`}
              >
                <input
                  type="radio"
                  name="prioridade"
                  value={opcao.valor}
                  checked={dados.prioridade === opcao.valor}
                  onChange={() =>
                    setDados({ ...dados, prioridade: opcao.valor })
                  }
                />
                <span>{opcao.rotulo}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="campos-linha">
        <div className="campo">
          <label htmlFor="responsavel">Responsável</label>
          <input
            id="responsavel"
            type="text"
            placeholder="Quem vai fazer?"
            value={dados.responsavel}
            onChange={(evento) =>
              setDados({ ...dados, responsavel: evento.target.value })
            }
          />
        </div>

        <div className="campo">
          <label htmlFor="prazo">Prazo</label>
          <input
            id="prazo"
            type="date"
            value={dados.prazo}
            onChange={(evento) =>
              setDados({ ...dados, prazo: evento.target.value })
            }
          />
        </div>
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
          disabled={salvando || carregandoProjetos || !!erroProjetos}
        >
          {salvando ? 'Salvando...' : textoBotao}
        </button>
      </div>
    </form>
  )
}

export default FormularioTarefa
