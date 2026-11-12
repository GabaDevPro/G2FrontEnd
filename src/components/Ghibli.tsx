import { useEffect, useRef } from 'react'
import '@fontsource/corben/latin-400.css'
import '@fontsource/corben/latin-700.css'
import '../ghibli.css'

// Desenhos do tema do quadro, inspirados nos filmes do Studio Ghibli.
// Tudo é SVG escrito aqui, sem arquivo de imagem. São só enfeite: o leitor
// de tela pula todos
const enfeite = { 'aria-hidden': true, focusable: false } as const

interface CoresTotoro {
  corpo: string
  escuro: string
  barriga: string
  contorno?: string
  folha?: boolean
}

const CINZA: CoresTotoro = { corpo: '#7d7b77', escuro: '#62605d', barriga: '#f6edcb' }
const AZUL: CoresTotoro = { corpo: '#5f87ae', escuro: '#4a6f94', barriga: '#f6edcb' }
const BRANCO: CoresTotoro = {
  corpo: '#fbfaf4',
  escuro: '#dedbd0',
  barriga: '#fbfaf4',
  contorno: '#8c897e',
}

// O Totoro de frente, numa área de 200 x 210. O cinza grande, o azul médio e
// o branco pequeno são o mesmo desenho: quem usa escolhe as cores e a escala
function TotoroForma({ corpo, escuro, barriga, contorno, folha }: CoresTotoro) {
  return (
    <g>
      <path
        d="M66 50C60 34 62 14 70 6c10 8 16 24 16 36ZM134 50c6-16 4-36-4-44-10 8-16 24-16 36ZM100 36c28 0 50 16 60 48 10 16 22 46 22 74 0 34-32 48-82 48s-82-14-82-48c0-28 12-58 22-74 10-32 32-48 60-48Z"
        fill={corpo}
        stroke={contorno}
        strokeWidth={contorno ? 5 : undefined}
        strokeLinejoin="round"
      />
      <path
        d="M30 112c-14 20-16 48-4 64 10-8 12-36 12-58ZM170 112c14 20 16 48 4 64-10-8-12-36-12-58Z"
        fill={escuro}
      />
      <ellipse cx="66" cy="202" rx="22" ry="8" fill={escuro} />
      <ellipse cx="134" cy="202" rx="22" ry="8" fill={escuro} />
      <path
        d="M100 98c32 0 56 26 56 58 0 30-24 44-56 44s-56-14-56-44c0-32 24-58 56-58Z"
        fill={barriga}
      />
      <path
        d="M65 127q9-14 18 0M91 119q9-14 18 0M117 127q9-14 18 0M79 146q8-12 16 0M105 146q8-12 16 0"
        fill="none"
        stroke={corpo}
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <circle cx="70" cy="76" r="10.5" fill="#fff" stroke="#3b3a38" strokeWidth="1.5" />
      <circle cx="130" cy="76" r="10.5" fill="#fff" stroke="#3b3a38" strokeWidth="1.5" />
      <circle cx="72" cy="76" r="4.2" fill="#262524" />
      <circle cx="128" cy="76" r="4.2" fill="#262524" />
      <path d="M91 70q9-5 18 0-9 9-18 0Z" fill="#2b2a29" />
      <path
        d="M44 86 10 76M43 93 8 94M45 100l-33 10M156 86l34-10M157 93l35 1M155 100l33 10"
        stroke="#2f2d2b"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {folha && (
        <>
          <path d="M80 38c4-14 24-18 42-8-10 14-30 16-42 8Z" fill="#8fb651" />
          <path d="M84 37q18-7 34-6" fill="none" stroke="#6e9440" strokeWidth="1.5" />
        </>
      )}
    </g>
  )
}

// Bolinha de fuligem (susuwatari): o contorno tracejado faz os pelinhos
function Fuligem({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="#232021"
        stroke="#232021"
        strokeWidth={r * 0.5}
        strokeDasharray="1.6 3"
      />
      <circle cx={cx - r * 0.38} cy={cy - 1} r={r * 0.3} fill="#fff" />
      <circle cx={cx + r * 0.38} cy={cy - 1} r={r * 0.3} fill="#fff" />
      <circle cx={cx - r * 0.38} cy={cy - 1} r={r * 0.12} fill="#232021" />
      <circle cx={cx + r * 0.38} cy={cy - 1} r={r * 0.12} fill="#232021" />
    </g>
  )
}

// Meu Amigo Totoro: os três Totoros num morro, com as fuligens atrás
export function CenaTotoro() {
  return (
    <svg {...enfeite} className="ghibli-cena" viewBox="0 0 380 150">
      <path d="M0 150c50-28 130-22 210-26s130 2 170 14v12Z" fill="#b9c99a" />
      <g fill="#9db37a">
        <path d="M40 40q8-8 16-2-8 8-16 2Z" />
        <path d="M150 22q7-7 14-1-7 7-14 1Z" />
        <path d="M96 64q6-6 12-1-6 6-12 1Z" />
      </g>
      <Fuligem cx={34} cy={132} r={8} />
      <Fuligem cx={58} cy={137} r={6.5} />
      <Fuligem cx={82} cy={131} r={7.5} />
      <g transform="translate(112 106) scale(.15)">
        <TotoroForma {...BRANCO} />
      </g>
      <g transform="translate(152 84) scale(.26)">
        <TotoroForma {...AZUL} />
      </g>
      <g transform="translate(232 6) scale(.63)">
        <TotoroForma {...CINZA} folha />
      </g>
      <path
        d="M12 142l3-8 2 8M200 130l3-9 3 9M366 140l3-8 2 8"
        fill="none"
        stroke="#8ca66b"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Coluna "A fazer": o Totoro pequeno, uma bolota e um broto
export function Bolotas() {
  return (
    <svg {...enfeite} viewBox="0 0 80 80">
      <g transform="translate(0 33) scale(.225)">
        <TotoroForma {...BRANCO} />
      </g>
      <path d="M56 54v-5" stroke="#8a5a3a" strokeWidth="2" strokeLinecap="round" />
      <path d="M49 61c0 11 4 18 7 18s7-7 7-18Z" fill="#c9984f" />
      <path d="M47 61c0-10 18-10 18 0Z" fill="#8a5a3a" />
      <path d="M73 80V62" stroke="#6e9440" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M73 65c-8-2-10-10-8-12 6 0 9 6 8 12Z" fill="#8fb651" />
      <path d="M73 62c7-2 9-9 7-11-5 0-8 5-7 11Z" fill="#a3c465" />
    </svg>
  )
}

// Coluna "Em andamento": Calcifer, o fogo de O Castelo Animado
export function Calcifer() {
  return (
    <svg {...enfeite} viewBox="0 0 80 80">
      <path
        d="M40 2c4 12 16 16 18 30 4-4 5-10 4-14 12 10 16 28 8 42-6 10-16 14-30 14s-24-4-30-14c-8-14-4-30 6-38 0 8 2 12 6 14 0-14 10-22 18-34Z"
        fill="#ee6b3b"
      />
      <path
        d="M40 24c3 9 12 13 14 24 2 12-4 22-14 22s-16-10-14-22c2-9 10-14 14-24Z"
        fill="#fbc64a"
      />
      <circle cx="32.5" cy="50" r="5.5" fill="#fff" />
      <circle cx="47.5" cy="50" r="5.5" fill="#fff" />
      <circle cx="33.5" cy="50.5" r="2.2" fill="#3a1f14" />
      <circle cx="46.5" cy="50.5" r="2.2" fill="#3a1f14" />
      <path d="M33 60q7 8 14 0Z" fill="#b63d25" />
      <rect x="8" y="70" width="64" height="10" rx="5" fill="#8a5a3a" />
      <path d="M18 75h10M44 75h14" stroke="#6b4429" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// O rosto do Sem Rosto: a máscara com as marcas roxas, centrada em x = 40
function MascaraSemRosto() {
  return (
    <g>
      <path
        d="M40 10c12 0 17 14 17 28 0 16-7 28-17 28S23 54 23 38c0-14 5-28 17-28Z"
        fill="#f3eedd"
      />
      <path
        d="M31 18c-1 5-.5 10 1.5 13 1.5-4 1-9-1.5-13ZM49 18c1 5 .5 10-1.5 13-1.5-4-1-9 1.5-13ZM32 43c-1.5 4-1.5 9 0 13 2-4 2-9 0-13ZM48 43c1.5 4 1.5 9 0 13-2-4-2-9 0-13Z"
        fill="#a596b0"
      />
      <ellipse cx="32" cy="36" rx="4.6" ry="2.4" fill="#1d1b1c" />
      <ellipse cx="48" cy="36" rx="4.6" ry="2.4" fill="#1d1b1c" />
      <path d="M28 40.5h8M44 40.5h8" stroke="#1d1b1c" strokeLinecap="round" />
      <ellipse cx="40" cy="58.5" rx="4.6" ry="2" fill="#1d1b1c" />
      <path d="M36.5 62.5h7" stroke="#a596b0" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  )
}

// O busto do Sem Rosto, numa área de 80 x 80
function BustoSemRosto() {
  return (
    <>
      <path d="M40 2c18 0 28 20 30 44l4 34H6l4-34C12 22 22 2 40 2Z" fill="#232021" />
      <MascaraSemRosto />
    </>
  )
}

// Coluna "Em revisão": o Sem Rosto, de A Viagem de Chihiro
export function SemRosto() {
  return (
    <svg {...enfeite} viewBox="0 0 80 80">
      <BustoSemRosto />
    </svg>
  )
}

// Coluna "Concluída": a Ponyo com o balde verde
export function Ponyo() {
  return (
    <svg {...enfeite} viewBox="0 0 80 80">
      <path
        d="M14 40C4 30 12 12 24 14 24 4 38 2 42 10c8-8 22-2 20 8 12 2 14 18 4 24 2 8-8 12-14 8H28c-6 4-16 0-14-10ZM30 12l-3-9 8 6ZM46 9l4-8 3 9Z"
        fill="#e5613a"
      />
      <ellipse cx="40" cy="36" rx="20" ry="16.5" fill="#f8d2aa" />
      <path
        d="M21 30c5-10 15-12 19-6 6-6 16-2 19 6-7-4-13-3-19-1-6-2-13-3-19 1Z"
        fill="#e5613a"
      />
      <circle cx="30.5" cy="37" r="5" fill="#fff" stroke="#5a3a2a" />
      <circle cx="49.5" cy="37" r="5" fill="#fff" stroke="#5a3a2a" />
      <circle cx="31" cy="37.5" r="2" fill="#3a261c" />
      <circle cx="49" cy="37.5" r="2" fill="#3a261c" />
      <path d="M35 46q5 4 10 0" fill="none" stroke="#b5523f" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M24 55c6-4 26-4 32 0l8 25H16Z" fill="#d6434d" />
      <path d="M29 60h22l-2.5 20h-17Z" fill="#55a85f" />
      <rect x="27" y="57" width="26" height="5" rx="2.5" fill="#3f8c4a" />
      <circle cx="27.5" cy="67" r="4" fill="#f8d2aa" />
      <circle cx="52.5" cy="67" r="4" fill="#f8d2aa" />
    </svg>
  )
}

// Os espíritos da floresta de Princesa Mononoke
export function Kodamas() {
  return (
    <svg {...enfeite} viewBox="0 0 80 80">
      <g fill="#f8f6ec" stroke="#a9a796" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M22 48h16l4 32H18Z" />
        <path d="M30 12c14 0 22 10 20 24-1 10-8 14-20 14S11 46 10 36C8 22 16 12 30 12Z" />
        <path d="M57 60h10l2 20H55Z" />
        <path d="M62 40c8 0 13 6 12 14-1 6-5 8-12 8s-11-2-12-8c-1-8 4-14 12-14Z" />
      </g>
      <g fill="#3b3a34">
        <ellipse cx="21" cy="30" rx="4" ry="4.6" />
        <ellipse cx="38" cy="28" rx="3" ry="3.4" />
        <ellipse cx="30" cy="41" rx="3" ry="3.8" />
        <circle cx="57.5" cy="50" r="2.2" />
        <circle cx="66.5" cy="49" r="1.8" />
        <ellipse cx="62" cy="56.5" rx="1.8" ry="2.2" />
      </g>
    </svg>
  )
}

// Coluna vazia: só as bolinhas de fuligem ficaram
export function Fuligens() {
  return (
    <svg {...enfeite} viewBox="0 0 90 34">
      <Fuligem cx={16} cy={18} r={10} />
      <Fuligem cx={45} cy={21} r={8} />
      <Fuligem cx={72} cy={17} r={9} />
    </svg>
  )
}

// Jiji, o gato de O Serviço de Entregas da Kiki
export function Jiji() {
  return (
    <svg {...enfeite} viewBox="0 0 46 50">
      <path d="M34 46c10 0 10-12 4-14" fill="none" stroke="#232021" strokeWidth="4" strokeLinecap="round" />
      <path d="M10 50c-2-16 4-24 12-24s14 8 12 24ZM10 14 9 0l11 8ZM34 14 35 0 24 8Z" fill="#232021" />
      <ellipse cx="22" cy="18" rx="13" ry="11" fill="#232021" />
      <ellipse cx="16.5" cy="18" rx="4" ry="4.6" fill="#fff" />
      <ellipse cx="27.5" cy="18" rx="4" ry="4.6" fill="#fff" />
      <ellipse cx="17" cy="18" rx="1.5" ry="3.2" fill="#232021" />
      <ellipse cx="27" cy="18" rx="1.5" ry="3.2" fill="#232021" />
    </svg>
  )
}

// O Totoro em pixel art. Cada letra é um quadradinho; só a metade esquerda
// está escrita, a direita é o espelho dela
const PIXEL_METADE = [
  '......oo...',
  '.....oggo..',
  '.....oggo..',
  '.....oggo..',
  '.....oggooo',
  '....ogggggg',
  '...oggggggg',
  '..ogwwggggk',
  '..ogwkggggg',
  'ooggggggggg',
  '.oggggggggg',
  '.ogggggcccc',
  'ogggggccccg',
  'oggggccgcgc',
  'ogggccgcgcc',
  'ogggccccccc',
  'ogggccccccc',
  'oggdccccccc',
  'oggdccccccc',
  'oggdssccccc',
  'oggdsssssss',
  '.ogdsssssss',
  '.oggsssssss',
  '..oggssssss',
  '...ogggssss',
  '..ooddddooo',
  '..oooooo...',
]

const PIXEL_CORES: Record<string, string> = {
  o: '#3b2b2d',
  g: '#7d6662',
  d: '#5f4b4b',
  c: '#fff8c6',
  s: '#c1b499',
  w: '#ffffff',
  k: '#2a2020',
}

export function TotoroPixel() {
  return (
    <svg {...enfeite} className="totoro-pixel" viewBox="0 0 22 27" shapeRendering="crispEdges">
      {PIXEL_METADE.flatMap((metade, y) =>
        [...metade, ...[...metade].reverse()].map((letra, x) =>
          letra === '.' ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill={PIXEL_CORES[letra]} />
          )
        )
      )}
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Os vilões, que ficam na lista de tarefas

// Uma das cabeças verdes da Yubaba (Kashira), desenhada em volta do ponto 0,0
function CabecaVerde({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${r / 20})`}>
      <path d="M-18-6c0-10 8-16 18-16s18 6 18 16v8c0 12-8 18-18 18s-18-6-18-18Z" fill="#7c9a4e" />
      <path d="M-3-21c0-5 6-5 6 0Z" fill="#22301a" />
      <path d="M-13-9l9 4M13-9l-9 4" stroke="#22301a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="-7" cy="-1" r="2.8" fill="#fff" />
      <circle cx="7" cy="-1" r="2.8" fill="#fff" />
      <circle cx="-6.5" cy="-.5" r="1.2" fill="#1f1a1a" />
      <circle cx="6.5" cy="-.5" r="1.2" fill="#1f1a1a" />
      <path d="M-9 9q4-5 9-1 5-4 9 1" fill="none" stroke="#22301a" strokeWidth="3" strokeLinecap="round" />
      <path d="M-4 14h8" stroke="#22301a" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}

// As três cabeças verdes da Yubaba, de A Viagem de Chihiro
export function CabecasVerdes() {
  return (
    <svg {...enfeite} viewBox="0 0 80 80">
      <CabecaVerde cx={40} cy={25} r={19} />
      <CabecaVerde cx={21} cy={59} r={19} />
      <CabecaVerde cx={59} cy={59} r={19} />
    </svg>
  )
}

// A Viagem de Chihiro: o Sem Rosto na ponte vermelha da casa de banhos,
// oferecendo ouro, com as cabeças verdes ao lado
export function CenaSemRosto() {
  return (
    <svg {...enfeite} className="ghibli-cena" viewBox="0 0 380 150">
      <path d="M0 104h380M0 122h380" stroke="#c6453b" strokeWidth="5" />
      <path
        d="M22 94v46M112 94v46M202 94v46M292 94v46M368 94v46"
        stroke="#a8382f"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path d="M0 140h380v10H0Z" fill="#8a5a3a" />
      <CabecaVerde cx={56} cy={120} r={19} />
      <CabecaVerde cx={98} cy={121} r={18} />
      <CabecaVerde cx={77} cy={85} r={18} />
      <path d="M262 70c-12 2-24 9-32 18" fill="none" stroke="#232021" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="228" cy="90" rx="8" ry="4.5" fill="#232021" />
      <path d="M219 85l3-6 6-1 3 4-2 4ZM229 80l2-7 6-2 4 4-1 6Z" fill="#e8b84a" />
      <path d="M214 70l-4-4M228 64v-6M242 68l4-4" stroke="#e8b84a" strokeWidth="1.8" strokeLinecap="round" />
      <g transform="translate(246 6)">
        <path d="M45 0c18 0 27 22 29 48l8 86H8l8-86C18 22 27 0 45 0Z" fill="#232021" />
        <g transform="translate(5 -2)">
          <MascaraSemRosto />
        </g>
      </g>
    </svg>
  )
}

// Pepitas de ouro, as que o Sem Rosto oferece
export function Pepitas() {
  return (
    <svg {...enfeite} viewBox="0 0 62 30">
      <path d="M4 29l4-10 9-2 6 6-2 6ZM24 29l3-13 10-3 7 7-1 9ZM46 29l2-7 7-1 4 4-1 4Z" fill="#e8b84a" />
      <path d="M10 22l6-1M30 18l7-2M50 24l4-1" stroke="#f7dc8a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

// Status "Em revisão" na lista: Yubaba, de A Viagem de Chihiro
export function Yubaba() {
  return (
    <svg {...enfeite} viewBox="0 0 80 80">
      <circle cx="40" cy="8" r="8" fill="#c9c3d1" />
      <ellipse cx="40" cy="24" rx="29" ry="19" fill="#d6d1dc" />
      <path d="M10 80c2-13 14-18 30-18s28 5 30 18Z" fill="#3d5a99" />
      <path d="M30 64l10 8 10-8-10-4Z" fill="#f4efe2" />
      <circle cx="40" cy="73" r="3.2" fill="#c0392b" />
      <ellipse cx="40" cy="44" rx="23" ry="21" fill="#eccba8" />
      <circle cx="16" cy="52" r="3.5" fill="#e8b84a" />
      <circle cx="64" cy="52" r="3.5" fill="#e8b84a" />
      <circle cx="27" cy="40" r="7" fill="#fff" />
      <circle cx="53" cy="40" r="7" fill="#fff" />
      <path d="M20 40a7 7 0 0 1 14 0ZM46 40a7 7 0 0 1 14 0Z" fill="#7d8fc4" />
      <circle cx="27" cy="42.5" r="2.4" fill="#2b2320" />
      <circle cx="53" cy="42.5" r="2.4" fill="#2b2320" />
      <path d="M19 31q8-4 15 1M61 31q-8-4-15 1" fill="none" stroke="#8a8494" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="30" r="2.2" fill="#8a5a3a" />
      <path d="M40 36c6 2 9 11 6 17-3 4-9 4-12 0-3-6 0-15 6-17Z" fill="#dfb089" />
      <path d="M27 58q13 8 26 0-13 3-26 0Z" fill="#b8373a" />
    </svg>
  )
}

// Status "A fazer" na lista: a Bruxa das Terras Desoladas, de O Castelo Animado
export function BruxaDesolada() {
  return (
    <svg {...enfeite} viewBox="0 0 80 80">
      <path d="M50 9c6-8 14-8 18-4-6 0-10 4-13 9Z" fill="#b8373a" />
      <ellipse cx="40" cy="15" rx="20" ry="5" fill="#2b2530" />
      <path d="M28 15c0-10 24-10 24 0Z" fill="#2b2530" />
      <ellipse cx="40" cy="36" rx="25" ry="20" fill="#3a2f3d" />
      <ellipse cx="40" cy="41" rx="20" ry="19" fill="#f3ddc9" />
      <path d="M27 56q13 9 26 0" fill="none" stroke="#e2c3aa" strokeWidth="2" />
      <path d="M26 37q5-5 10 0M44 37q5-5 10 0" fill="none" stroke="#6f8cc2" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="31" cy="39.5" r="1.8" fill="#2b2320" />
      <circle cx="49" cy="39.5" r="1.8" fill="#2b2320" />
      <path d="M35 49q5 4 10 0-5 2-10 0Z" fill="#c0392b" stroke="#c0392b" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6 80c0-12 14-20 34-20s34 8 34 20Z" fill="#2b2530" />
      <path d="M8 72c8-10 20-13 32-13s24 3 32 13" fill="none" stroke="#2b2530" strokeWidth="9" strokeLinecap="round" strokeDasharray="2 5" />
      <circle cx="40" cy="67" r="3" fill="#e8b84a" />
    </svg>
  )
}

// Status "Em andamento" na lista: Nago, o javali amaldiçoado de Princesa Mononoke
export function JavaliAmaldicoado() {
  return (
    <svg {...enfeite} viewBox="0 0 80 80">
      <path
        d="M14 56c-8-8-4-18-11-22M24 42c-5-10 1-18-4-27M40 34c-1-10 5-15 2-25M56 42c5-10-1-17 6-25M66 56c8-8 4-16 11-20M32 38c-3-8 2-12 0-19M48 38c3-8-2-13 2-19"
        fill="none"
        stroke="#4a2b36"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M4 80c0-28 14-48 36-48s36 20 36 48Z" fill="#33232b" />
      <ellipse cx="40" cy="68" rx="13" ry="9" fill="#4a2b36" />
      <circle cx="35.5" cy="68" r="2" fill="#1f1418" />
      <circle cx="44.5" cy="68" r="2" fill="#1f1418" />
      <path d="M22 74c-2-8 2-13 6-14-1 5 0 10 3 14ZM58 74c2-8-2-13-6-14 1 5 0 10-3 14Z" fill="#f4efe2" />
      <circle cx="28" cy="52" r="4.5" fill="#e0443a" />
      <circle cx="52" cy="52" r="4.5" fill="#e0443a" />
      <circle cx="28" cy="52" r="1.6" fill="#ffd9a0" />
      <circle cx="52" cy="52" r="1.6" fill="#ffd9a0" />
    </svg>
  )
}

// Status "Concluída" na lista: o Rei dos Gatos, de O Reino dos Gatos
export function ReiDosGatos() {
  return (
    <svg {...enfeite} viewBox="0 0 80 80">
      <path d="M8 80c2-12 14-18 32-18s30 6 32 18Z" fill="#6b4a8a" />
      <circle cx="40" cy="70" r="3.4" fill="#e8b84a" />
      <path d="M14 30 12 8l16 10ZM66 30 68 8 52 18Z" fill="#9b93ab" />
      <path d="M17 24 16 14l8 5ZM63 24 64 14l-8 5Z" fill="#e7a9b4" />
      <path
        d="M40 14c16 0 26 10 26 24 0 4 6 6 8 10-4 2-8 2-10 6-4 10-12 14-24 14s-20-4-24-14c-2-4-6-4-10-6 2-4 8-6 8-10 0-14 10-24 26-24Z"
        fill="#9b93ab"
      />
      <path d="M30 14l2-9 4 5 4-7 4 7 4-5 2 9Z" fill="#e8b84a" />
      <circle cx="40" cy="11" r="1.8" fill="#c0392b" />
      <ellipse cx="29" cy="36" rx="6" ry="5" fill="#fff" />
      <ellipse cx="51" cy="36" rx="6" ry="5" fill="#fff" />
      <circle cx="30" cy="36.5" r="2.6" fill="#3f6fb5" />
      <circle cx="50" cy="36.5" r="2.6" fill="#c0392b" />
      <circle cx="30" cy="36.5" r="1" fill="#1f1a1a" />
      <circle cx="50" cy="36.5" r="1" fill="#1f1a1a" />
      <ellipse cx="40" cy="48" rx="10" ry="7" fill="#d9d3e3" />
      <path d="M37 44h6l-3 4Z" fill="#e58a9a" />
      <path d="M40 48v3M40 51q-4 3-7 0M40 51q4 3 7 0" fill="none" stroke="#5a4f66" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M30 47 14 43M30 50l-17 2M50 47l16-4M50 50l17 2" stroke="#f4efe2" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Quem segura o cartão durante o arraste

interface CarregadorProps {
  // O Totoro carrega no quadro; o Sem Rosto, na lista
  quem: 'totoro' | 'sem-rosto'
  titulo: string
  projeto?: string
  // Para onde o cartão vai se for solto agora, quando o alvo fica escondido
  // embaixo do próprio cartão
  destino?: string
  // Onde o ponteiro estava quando o arraste começou
  x: number
  y: number
  // Distância do ponteiro até o canto do cartão, para ele não pular ao ser pego
  dx: number
  dy: number
  largura: number
}

// O personagem que segura o cartão durante o arraste e acompanha o ponteiro
export function Carregador({
  quem,
  titulo,
  projeto,
  destino,
  x,
  y,
  dx,
  dy,
  largura,
}: CarregadorProps) {
  const caixa = useRef<HTMLDivElement>(null)

  // Durante o arraste o navegador não dispara mousemove, só eventos de drag.
  // O dragover no documento diz onde o ponteiro está. A posição vai direto no
  // estilo, sem estado: renderizar a tela a cada movimento travaria o arraste
  useEffect(() => {
    function seguir(evento: DragEvent) {
      if (caixa.current) {
        caixa.current.style.transform = `translate(${evento.clientX - dx}px, ${evento.clientY - dy}px)`
      }
    }

    document.addEventListener('dragover', seguir)

    return () => document.removeEventListener('dragover', seguir)
  }, [dx, dy])

  return (
    <div
      ref={caixa}
      className={`carregador carregador-${quem}`}
      style={{ width: largura, transform: `translate(${x - dx}px, ${y - dy}px)` }}
      aria-hidden="true"
    >
      <div className="carregador-balanco">
        {quem === 'totoro' ? (
          <svg {...enfeite} className="carregador-atras" viewBox="0 0 200 210">
            <TotoroForma {...CINZA} folha />
          </svg>
        ) : (
          <svg {...enfeite} className="carregador-atras" viewBox="0 0 80 80">
            <BustoSemRosto />
          </svg>
        )}

        <div className="carregador-carta">
          <strong>{titulo}</strong>
          {projeto && <span>{projeto}</span>}
          {destino && <em className="carregador-destino">→ {destino}</em>}
        </div>

        <svg {...enfeite} className="carregador-maos" viewBox="0 0 150 34">
          {quem === 'totoro' ? (
            <>
              <path
                d="M22 4C12 4 8 14 10 22c2 8 24 8 26 0 2-8-4-18-14-18ZM128 4c10 0 14 10 12 18-2 8-24 8-26 0-2-8 4-18 14-18Z"
                fill={CINZA.escuro}
              />
              <path
                d="M15 24v6M23 26v6M31 24v6M135 24v6M127 26v6M119 24v6"
                stroke="#efe7cf"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </>
          ) : (
            // As mãos pretas do Sem Rosto, com os quatro dedos por cima do cartão
            <path
              d="M8 10c0-8 28-8 28 0v10c0 6-7 6-7 0 0 6-7 6-7 0 0 6-7 6-7 0 0 6-7 6-7 0ZM114 10c0-8 28-8 28 0v10c0 6-7 6-7 0 0 6-7 6-7 0 0 6-7 6-7 0 0 6-7 6-7 0Z"
              fill="#232021"
            />
          )}
        </svg>
      </div>
    </div>
  )
}
