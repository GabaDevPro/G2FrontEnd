
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { NovaTarefa, Projeto } from '../tipos'
import { listarProjetos } from '../api'

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
    <form onSubmit={lidarComEnvio}>
      <h2>Formulário de tarefa</h2>

      <div>
        <label htmlFor="projetoId">Projeto</label>
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
        >
          <option value="">Selecione um projeto</option>

          {projetos.map((projeto) => (
            <option key={projeto.id} value={projeto.id}>
              {projeto.nome}
            </option>
          ))}
        </select>

        {carregandoProjetos && <p>Carregando projetos...</p>}

        {erroProjetos && <p role="alert">{erroProjetos}</p>}
      </div>

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

      <div>
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

      <div>
        <label htmlFor="prioridade">Prioridade</label>
        <select
          id="prioridade"
          value={dados.prioridade}
          onChange={(evento) =>
            setDados({
              ...dados,
              prioridade: evento.target.value as NovaTarefa['prioridade'],
            })
          }
        >
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
        </select>
      </div>

      <div>
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

      {erroSalvar && <p role="alert">{erroSalvar}</p>}

      <button
        type="submit"
        disabled={
          salvando ||
          carregandoProjetos ||
          !!erroProjetos ||
          !dados.projetoId
        }
      >
        {salvando ? 'Salvando...' : 'Salvar tarefa'}
      </button>
    </form>
  )
}
