// Sobe o json-server normalmente, mas com ids numéricos em sequência.
// O json-server 1.0 sempre gera um id aleatório no POST (ex.: "xK3f9aQ2bWc"),
// então aqui o cadastro é trocado para usar o maior id da coleção + 1.
import { Service } from 'json-server/lib/service.js'

const criarOriginal = Service.prototype.create

Service.prototype.create = async function (nome, dados = {}) {
  const item = await criarOriginal.call(this, nome, dados)

  if (!item) return item

  const ids = this.find(nome, { where: {} })
    .filter((outro) => outro !== item)
    .map((outro) => Number(outro.id))
    .filter((id) => Number.isInteger(id))

  // Os ids do db.json são texto ("1", "2"...), então o novo também é
  const proximoId = String(Math.max(0, ...ids) + 1)

  item.id = proximoId

  // Grava de novo no db.json, agora com o id em sequência
  return this.patchById(nome, proximoId, {})
}

await import('json-server/lib/bin.js')
