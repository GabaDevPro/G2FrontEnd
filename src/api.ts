import type { Projeto, Tarefa } from './tipos'

const API_URL = 'http://localhost:3000'

export async function listarTarefas(): Promise<Tarefa[]> {
  const resposta = await fetch(`${API_URL}/tarefas`)
  const tarefas: Tarefa[] = await resposta.json()

  return tarefas
}

export async function buscarTarefa(id: string): Promise<Tarefa> {
  const resposta = await fetch(`${API_URL}/tarefas/${id}`)
  const tarefa: Tarefa = await resposta.json()

  return tarefa
}

export async function listarProjetos(): Promise<Projeto[]> {
  const resposta = await fetch(`${API_URL}/projetos`)
  const projetos: Projeto[] = await resposta.json()

  return projetos
}

export async function buscarProjeto(id: string): Promise<Projeto> {
  const resposta = await fetch(`${API_URL}/projetos/${id}`)
  const projeto: Projeto = await resposta.json()

  return projeto
}

export type ProjetoComTarefas = Projeto & {
  tarefas: Tarefa[]
}

export async function buscarProjetoComTarefas(
  id: string,
): Promise<ProjetoComTarefas> {
  const resposta = await fetch(`${API_URL}/projetos/${id}?_embed=tarefas`)
  const projeto: ProjetoComTarefas = await resposta.json()

  return projeto
}