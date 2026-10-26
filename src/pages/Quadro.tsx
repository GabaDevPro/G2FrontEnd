import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarTarefasComProjeto, type TarefaComProjeto } from '../api'
import CartaoTarefa from '../components/CartaoTarefa'
import { ordemStatus, rotuloStatus } from '../rotulos'

function Quadro() {
  const [tarefas, setTarefas] = useState<TarefaComProjeto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    let ativo = true

    async function carregarTarefas() {
      try {
        const dados = await listarTarefasComProjeto()

        if (ativo) {
          setTarefas(dados)
        }
      } catch {
        if (ativo) {
          setErro(true)
        }
      } finally {
        if (ativo) {
          setCarregando(false)
        }
      }
    }

    carregarTarefas()

    return () => {
      ativo = false
    }
  }, [])

  return (
    <>
      <header className="cabecalho-pagina cabecalho-com-acao">
        <div>
          <h1>Quadro</h1>
          <p>As tarefas de todos os projetos, separadas por status.</p>
        </div>

        <Link to="/tarefas/nova" className="botao botao-primario">
          + Nova tarefa
        </Link>
      </header>

      {carregando && <p>Carregando quadro...</p>}

      {erro && (
        <p className="alerta" role="alert">
          Não foi possível carregar as tarefas.
        </p>
      )}

      {!carregando && !erro && (
        <div className="quadro">
          {ordemStatus.map((status) => {
            const tarefasDaColuna = tarefas.filter(
              (tarefa) => tarefa.status === status
            )
            const idTitulo = `coluna-${status}`

            return (
              <section
                key={status}
                className={`quadro-coluna status-${status}`}
                aria-labelledby={idTitulo}
              >
                <h2 id={idTitulo} className="quadro-coluna-titulo">
                  {rotuloStatus[status]}
                  <span className="quadro-contagem">
                    {tarefasDaColuna.length}
                    <span className="visualmente-oculto">
                      {tarefasDaColuna.length === 1 ? ' tarefa' : ' tarefas'}
                    </span>
                  </span>
                </h2>

                {tarefasDaColuna.length === 0 ? (
                  <p className="quadro-vazio">Nenhuma tarefa</p>
                ) : (
                  <ul className="quadro-cartoes">
                    {tarefasDaColuna.map((tarefa) => (
                      <li key={tarefa.id}>
                        {/* A coluna já diz o status, então o cartão não repete */}
                        <CartaoTarefa
                          tarefa={tarefa}
                          nivelTitulo={3}
                          mostrarStatus={false}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}

export default Quadro
