import { useEffect, useState } from 'react'
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

    if (
      salvando ||
      carregandoProjetos ||
      erroProjetos ||
      !dados.projetoId
    ) {
      return
    }

    setSalvando(true)
    setErroSalvar('')

    try {
      await aoSalvar(dados)
    } catch {
      setErroSalvar('Não foi possível salvar a tarefa. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form className="formulario" onSubmit={lidarComEnvio}>
      <div className="campo">
        <label htmlFor="projetoId">
          Projeto{' '}
          <span className="obrigatorio" aria-hidden="true">
            *
          </span>
        </label>
        <select
          id="projetoId"
          value={dados.projetoId}
          onChange={(evento) =>
            setDados({
              ...dados,
              projetoId: evento.target.value,
            })
          }
          disabled={carregandoProjetos || !!erroProjetos}
          required
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
          placeholder="Ex.: Montar a tela de login"
          value={dados.titulo}
          onChange={(evento) =>
            setDados({ ...dados, titulo: evento.target.value })
          }
          required
        />
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
