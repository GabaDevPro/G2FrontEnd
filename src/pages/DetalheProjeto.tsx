import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  buscarProjetoComTarefas,
  ErroNaoEncontrado,
  type ProjetoComTarefas,
} from '../api'
import CartaoTarefa from '../components/CartaoTarefa'
import { formatarData } from '../formatarData'
import Carregando from '../components/Carregando'
import MensagemErro from '../components/MensagemErro'
import TituloPagina from '../components/TituloPagina'
import { CenaSemRosto, Pepitas } from '../components/Ghibli'
import VilaoDoStatus from '../components/VilaoDoStatus'

// Padrão noturno, o mesmo da lista de tarefas. Todos os estados da tela
// (carregando, erro e o projeto) ficam dentro dele, para as cores não piscarem
// entre o tema padrão e a noite enquanto a API responde
const tema = 'ghibli ghibli-noite ghibli-detalhe'

function DetalheProjeto() {
  const { id } = useParams<{ id: string }>()
  const [projeto, setProjeto] = useState<ProjetoComTarefas | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<'nao-encontrado' | 'falha' | null>(null)
  // Cada clique em "Tentar de novo" soma 1 e faz o useEffect buscar de novo
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    // Se o id da URL mudar antes da resposta chegar, a resposta antiga é
    // ignorada, como na edição. Sem isso a tela podia mostrar outro projeto.
    let ativo = true

    async function carregarProjeto() {
      if (!id) return

      setCarregando(true)
      setErro(null)

      try {
        const dados = await buscarProjetoComTarefas(id)

        if (ativo) {
          setProjeto(dados)
        }
      } catch (falha) {
        if (ativo) {
          setErro(
            falha instanceof ErroNaoEncontrado ? 'nao-encontrado' : 'falha',
          )
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarProjeto()

    return () => {
      ativo = false
    }
  }, [id, tentativa])

  if (carregando) {
    return (
      <div className={tema}>
        <TituloPagina texto="Carregando projeto" />
        <Carregando mensagem="Carregando projeto..." />
      </div>
    )
  }

  if (erro === 'falha') {
    return (
      <div className={tema}>
        <TituloPagina texto="Não foi possível carregar o projeto" />
        <h1>Não foi possível carregar o projeto</h1>
        <MensagemErro
          mensagem="A API não respondeu. Verifique se ela está rodando."
          aoTentarDeNovo={() => setTentativa((atual) => atual + 1)}
        />
        <Link to="/projetos" className="link-voltar">
          <span aria-hidden="true">←</span> Voltar para a lista de projetos
        </Link>
      </div>
    )
  }

  if (erro || !projeto) {
    return (
      <div className={tema}>
        <TituloPagina texto="Projeto não encontrado" />
        <h1>Projeto não encontrado</h1>
        <p>Não existe projeto com o id {id}.</p>
        <Link to="/projetos" className="link-voltar">
          <span aria-hidden="true">←</span> Voltar para a lista de projetos
        </Link>
      </div>
    )
  }

  const tarefas = projeto.tarefas ?? []

  return (
    <div className={tema}>
      <TituloPagina texto={projeto.nome || 'Projeto sem nome'} />

      <Link to="/projetos" className="link-voltar">
        <span aria-hidden="true">←</span> Voltar para a lista de projetos
      </Link>

      <header className="cabecalho-pagina cabecalho-com-acao">
        <div>
          <h1>{projeto.nome}</h1>
          <p>{projeto.descricao}</p>
        </div>

        <Link
          to={`/projetos/${projeto.id}/editar`}
          className="botao botao-secundario"
        >
          <span aria-hidden="true">✎</span> Editar projeto
        </Link>
      </header>

      <div className="ghibli-topo">
        <dl className="painel-dados">
          <dt>Disciplina</dt>
          <dd>{projeto.disciplina}</dd>

          <dt>Criado em</dt>
          <dd>
            <time dateTime={projeto.criadoEm}>
              {formatarData(projeto.criadoEm)}
            </time>
          </dd>
        </dl>

        <CenaSemRosto />
      </div>

      <div className="cabecalho-secao">
        <div className="titulo-com-contagem">
          <h2>Tarefas do projeto</h2>
          <span className="etiqueta contagem">
            {tarefas.length} {tarefas.length === 1 ? 'tarefa' : 'tarefas'}
          </span>
        </div>

        <Link
          to={`/tarefas/nova?projeto=${projeto.id}`}
          className="botao botao-primario"
        >
          <span aria-hidden="true">+</span> Nova tarefa
        </Link>
      </div>

      {tarefas.length === 0 ? (
        <div className="ghibli-vazio">
          <Pepitas />
          <p>Este projeto ainda não tem tarefas.</p>
        </div>
      ) : (
        <ul className="lista-cartoes">
          {tarefas.map((tarefa) => (
            <li key={tarefa.id}>
              <CartaoTarefa
                tarefa={tarefa}
                nivelTitulo={3}
                aoMudarStatus={(status) =>
                  setProjeto((atual) =>
                    atual && {
                      ...atual,
                      tarefas: atual.tarefas.map((item) =>
                        item.id === tarefa.id ? { ...item, status } : item
                      ),
                    }
                  )
                }
              />

              {/* O vilão do status, no canto do cartão, como na lista de tarefas */}
              <span className="cartao-vilao" aria-hidden="true">
                <VilaoDoStatus status={tarefa.status} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DetalheProjeto
