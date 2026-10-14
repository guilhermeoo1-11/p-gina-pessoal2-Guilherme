// Configuração do Canvas e Contexto 2D
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Estado Geral do Jogo
let pontuacao = 0;
let gameOver = false;

// Estado do Teclado
const teclas = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false
};

// Objeto do Jogador (Nave)
const jogador = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  largura: 40,
  altura: 30,
  velocidade: 6,
  cor: '#00ffcc'
};

// Listas para Projetéis e Inimigos
const tiros = [];
const inimigos = [];

// Temporizadores para controle de disparo e spawn
let tempoUltimoTiro = 0;
let tempoUltimoInimigo = 0;

// Captura de Eventos do Teclado
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') e.preventDefault(); // Impede a página de rolar ao pressionar Espaço
  if (teclas.hasOwnProperty(e.code)) teclas[e.code] = true;
  if (gameOver && e.code === 'KeyR') reiniciarJogo();
});

window.addEventListener('keyup', (e) => {
  if (teclas.hasOwnProperty(e.code)) teclas[e.code] = false;
});

// Função para Gerar Inimigos
function criarInimigo() {
  const tamanho = Math.random() * 20 + 20; // Tamanho entre 20px e 40px
  inimigos.push({
    x: Math.random() * (canvas.width - tamanho),
    y: -tamanho,
    largura: tamanho,
    altura: tamanho,
    velocidade: Math.random() * 2 + 2,
    cor: '#ff3366'
  });
}

// Função para Criar Tiros
function atirar() {
  tiros.push({
    x: jogador.x + jogador.largura / 2 - 3,
    y: jogador.y,
    largura: 6,
    altura: 15,
    velocidade: 8,
    cor: '#ffff00'
  });
}

// Algoritmo de Colisão de Caixa Limitadora (AABB)
function checarColisao(objetoA, objetoB) {
  return objetoA.x < objetoB.x + objetoB.largura &&
         objetoA.x + objetoA.largura > objetoB.x &&
         objetoA.y < objetoB.y + objetoB.altura &&
         objetoA.y + objetoA.altura > objetoB.y;
}

// Atualização da Lógica do Jogo
function atualizar(agora) {
  if (gameOver) return;

  // Movimentação da Nave
  if (teclas.ArrowLeft && jogador.x > 0) {
    jogador.x -= jogador.velocidade;
  }
  if (teclas.ArrowRight && jogador.x + jogador.largura < canvas.width) {
    jogador.x += jogador.velocidade;
  }

  // Intervalo de Disparo (200ms)
  if (teclas.Space && agora - tempoUltimoTiro > 200) {
    atirar();
    tempoUltimoTiro = agora;
  }

  // Intervalo de Spawn de Inimigos (800ms)
  if (agora - tempoUltimoInimigo > 800) {
    criarInimigo();
    tempoUltimoInimigo = agora;
  }

  // Atualiza Posição dos Tiros
  for (let i = tiros.length - 1; i >= 0; i--) {
    tiros[i].y -= tiros[i].velocidade;
    // Remove tiros que saíram da tela
    if (tiros[i].y < -tiros[i].altura) {
      tiros.splice(i, 1);
    }
  }

  // Atualiza Posição dos Inimigos e Colisões
  for (let i = inimigos.length - 1; i >= 0; i--) {
    const inimigo = inimigos[i];
    inimigo.y += inimigo.velocidade;

    // Remove inimigos que saíram da tela
    if (inimigo.y > canvas.height) {
      inimigos.splice(i, 1);
      continue;
    }

    // Checa Colisão entre Inimigo e Jogador
    if (checarColisao(jogador, inimigo)) {
      gameOver = true;
    }

    // Checa Colisão entre Tiros e Inimigos
    for (let j = tiros.length - 1; j >= 0; j--) {
      if (checarColisao(tiros[j], inimigo)) {
        inimigos.splice(i, 1);
        tiros.splice(j, 1);
        pontuacao += 10;
        break;
      }
    }
  }
}

// Renderização dos Elementos na Tela
function desenhar() {
  // Limpa o Canvas a cada quadro
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    // Desenha o Jogador (Triângulo)
    ctx.fillStyle = jogador.cor;
    ctx.beginPath();
    ctx.moveTo(jogador.x + jogador.largura / 2, jogador.y);
    ctx.lineTo(jogador.x, jogador.y + jogador.altura);
    ctx.lineTo(jogador.x + jogador.largura, jogador.y + jogador.altura);
    ctx.closePath();
    ctx.fill();

    // Desenha os Tiros
    tiros.forEach(tiro => {
      ctx.fillStyle = tiro.cor;
      ctx.fillRect(tiro.x, tiro.y, tiro.largura, tiro.altura);
    });

    // Desenha os Inimigos
    inimigos.forEach(inimigo => {
      ctx.fillStyle = inimigo.cor;
      ctx.fillRect(inimigo.x, inimigo.y, inimigo.largura, inimigo.altura);
    });

    // Desenha o Placar
    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Pontos: ${pontuacao}`, 15, 30);
  } else {
    // Tela de Game Over
    ctx.fillStyle = '#ff3366';
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#fff';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Pontuação Final: ${pontuacao}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('Pressione R para Reiniciar', canvas.width / 2, canvas.height / 2 + 60);
    ctx.textAlign = 'left';
  }
}

// Reinicia os parâmetros do jogo
function reiniciarJogo() {
  pontuacao = 0;
  inimigos.length = 0;
  tiros.length = 0;
  jogador.x = canvas.width / 2 - 20;
  gameOver = false;
  requestAnimationFrame(loopPrincipal);
}

// Loop Principal do Jogo
function loopPrincipal(agora) {
  atualizar(agora);
  desenhar();
  if (!gameOver) {
    requestAnimationFrame(loopPrincipal);
  }
}

// Inicia o loop
requestAnimationFrame(loopPrincipal);