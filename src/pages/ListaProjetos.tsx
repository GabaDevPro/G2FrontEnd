import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarProjetosComTarefas, type ProjetoComTarefas } from '../api'
import { formatarData } from '../formatarData'
import Carregando from '../components/Carregando'
import MensagemErro from '../components/MensagemErro'
import TituloPagina from '../components/TituloPagina'

function ListaProjetos() {
  const [projetos, setProjetos] = useState<ProjetoComTarefas[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  // Cada clique em "Tentar de novo" soma 1 e faz o useEffect buscar de novo
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true

    async function carregarProjetos() {
      setCarregando(true)
      setErro(false)

      try {
        const dados = await listarProjetosComTarefas()

        if (ativo) {
          setProjetos(dados)
        }
      } catch {
        // Sem isso, com a API fora do ar a página ficava em branco
        if (ativo) {
          setErro(true)
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarProjetos()

    return () => {
      ativo = false
    }
  }, [tentativa])

  return (
    <>
      <header className="cabecalho-pagina cabecalho-com-acao">
        <div>
          <TituloPagina texto="Projetos" />
          <h1>Projetos</h1>
          <p>Cada projeto reúne as tarefas de uma disciplina.</p>
        </div>

        <Link to="/projetos/novo" className="botao botao-primario">
          <span aria-hidden="true">+</span> Novo projeto
        </Link>
      </header>

      {carregando && <Carregando mensagem="Carregando projetos..." />}

      {erro && (
        <MensagemErro
          mensagem="Não foi possível carregar os projetos. Verifique se a API está rodando."
          aoTentarDeNovo={() => setTentativa((atual) => atual + 1)}
        />
      )}

      {!carregando && !erro && projetos.length === 0 && (
        <p>Nenhum projeto cadastrado.</p>
      )}

      <ul className="lista-cartoes">
        {projetos.map((projeto) => {
          const totalTarefas = projeto.tarefas?.length ?? 0

          return (
            <li key={projeto.id}>
              <article className="cartao">
                <h2>
                  {/* O link cobre o cartão inteiro pelo CSS (.link-cartao::after) */}
                  <Link to={`/projetos/${projeto.id}`} className="link-cartao">
                    {projeto.nome}
                  </Link>
                </h2>

                <p className="cartao-subtitulo">{projeto.descricao}</p>

                <div className="etiquetas">
                  <span className="etiqueta">
                    {totalTarefas} {totalTarefas === 1 ? 'tarefa' : 'tarefas'}
                  </span>
                </div>

                <p className="cartao-info">Disciplina: {projeto.disciplina}</p>
                <p className="cartao-info">
                  Criado em{' '}
                  <time dateTime={projeto.criadoEm}>
                    {formatarData(projeto.criadoEm)}
                  </time>
                </p>

                <span className="cartao-acao" aria-hidden="true">
                  Ver projeto →
                </span>
              </article>
            </li>
          )
        })}
      </ul>
    </>
  )
}

export default ListaProjetos
