import type { Projeto, Tarefa } from './tipos'

const API_URL = 'http://localhost:3000'

async function buscarJson<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`)

  if (!resposta.ok) {
    throw new Error(`Falha ao buscar ${caminho} (${resposta.status})`)
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

export type ProjetoComTarefas = Projeto & {
  tarefas: Tarefa[]
}

export async function buscarProjetoComTarefas(
  id: string,
): Promise<ProjetoComTarefas> {
  return buscarJson<ProjetoComTarefas>(`/projetos/${id}?_embed=tarefas`)
}
