import type { NovoProjeto, Projeto, Tarefa } from './tipos'

const API_URL = 'http://localhost:3000'

async function buscarJson<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`)

  if (!resposta.ok) {
    throw new Error(`Falha ao buscar ${caminho} (${resposta.status})`)
  }

  const dados: T = await resposta.json()

  return dados
}

async function enviarJson<T>(
  caminho: string,
  metodo: 'POST' | 'PUT',
  corpo: unknown,
): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  })

  if (!resposta.ok) {
    throw new Error(`Falha ao salvar ${caminho} (${resposta.status})`)
  }

  const dados: T = await resposta.json()

  return dados
}

export async function listarTarefas(): Promise<Tarefa[]> {
  return buscarJson<Tarefa[]>('/tarefas')
}

export async function buscarTarefa(id: string): Promise<Tarefa> {
  return buscarJson<Tarefa>(`/tarefas/${id}`)
}

export async function listarProjetos(): Promise<Projeto[]> {
  return buscarJson<Projeto[]>('/projetos')
}

export async function buscarProjeto(id: string): Promise<Projeto> {
  return buscarJson<Projeto>(`/projetos/${id}`)
}

export async function criarProjeto(projeto: NovoProjeto): Promise<Projeto> {
  return enviarJson<Projeto>('/projetos', 'POST', projeto)
}

export async function atualizarProjeto(
  id: string,
  projeto: NovoProjeto,
): Promise<Projeto> {
  return enviarJson<Projeto>(`/projetos/${id}`, 'PUT', projeto)
}

export type ProjetoComTarefas = Projeto & {
  tarefas: Tarefa[]
}

export async function listarProjetosComTarefas(): Promise<
  ProjetoComTarefas[]
> {
  return buscarJson<ProjetoComTarefas[]>('/projetos?_embed=tarefas')
}

export async function buscarProjetoComTarefas(
  id: string,
): Promise<ProjetoComTarefas> {
  return buscarJson<ProjetoComTarefas>(`/projetos/${id}?_embed=tarefas`)
}
