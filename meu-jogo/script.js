
const player = document.getElementById("player");
const game = document.getElementById("game");
const pontuacaoElemento = document.getElementById("pontuacao");
const vidasElemento = document.getElementById("vidas");
const gameOverElemento = document.getElementById("gameOver");
const botaoReiniciar = document.getElementById("botaoReiniciar");

//variáveis do eixo X e Y no plano cartesiano de um jogo 2D
let playerX = 380;
let playerY = 500;

const velocidade = 5;

let tiros = [];
let meteoros = [];

let pontuacao = 0;
let vidas = 3;
let jogoRodando = true;

const teclas = {};

//se eu pressionar uma tecla consigo saber qual tecla foi
//assim posso verificar se a tecla que foi apertada corresponde à uma das teclas do jogo e dar uma ação de acordo com a gameplay
//se eu apertar setinha para cima o personagem irá andar para cima

document.addEventListener("keydown", function(event){
    teclas[event.key] = true;

});

document.addEventListener("keydown", function(event){

    /*Criando os tiro da nave */
    if(event.key === " "){
        criarTiro();
    }
});



//Aqui a ideia é a mesma da de cima, só que aqui quando eu soltar a tecla, a ação correspondente cessa
//se quando eu aperto setinha para cima o personagem se move para cima, quando eu soltar a tecla ou trocar de tecla, ele deve parar se subir
document.addEventListener("keyup", function(event){
    teclas[event.key] = false;

});

/*Cria o tiro, mas ele ainda fica parado */
function criarTiro(){
    const tiro = document.createElement("div");

    tiro.classList.add("tiro");

    tiro.style.left = (playerX + 23) + "px";//se não o tiro nasce de lado e fica estranho, preciso "empurrar" pra que fique centralizado com a nave
    tiro.style.top = playerY + "px";

    game.appendChild(tiro);//depois de criar o tiro, coloco o tiro dentro do frame do jogo


    tiros.push(tiro);//colocando mais um tiro no array de tiros
}

/*Movimentando os tiros*/
function atualizarTiros(){
    for (let i = tiros.length - 1; i >= 0; i--) {//É um contador que pega o tamanho do array de tiros e vai decrescendo até zerar
        const tiro = tiros[i];

        let posicaoAtual = parseInt(tiro.style.top);//pegando a posição do tiro pela distancia dele do topo do frame da tela do jogo

        posicaoAtual -=8;//vai diminuindo em 8px a posição do tiro assim ele vai subindo de 8 em 8px
        //Iss pq o eixo Y vai aumentando para baixo, ou seja diminuir o y significa subir
        /*
        500
        ↓
        492
        ↓
        484
        ↓
        476
        ↓
        468
        ↓
        ...
        */ 
        tiro.style.top = posicaoAtual + "px";

        let acertou = false;

        //Verificando o tiro contra todos os meteoros
        for(let j = meteoros.length - 1; j >= 0; j--){
            const meteoro = meteoros[j];

            if(verificarColisao(tiro, meteoro)){
                tiro.remove();
                tiros.splice(i, 1);

                meteoro.remove();
                meteoros.splice(j, 1);

                pontuacao += 10;

                pontuacaoElemento.textContent = "Pontos: " + pontuacao;

                acertou = true;
                break;//o break é usado pq se um tiro já atingiu um meteoro eu devo parar de fazer essa verificação
            }
        }

        if(acertou){
            continue;
        }
        
        if(posicaoAtual < 0){
            tiro.remove();//quando o tiro bater na parede da tela ele tem que sumir

            tiros.splice(i, 1);//tirando um tiro do array de tiros, parta não ficar ocupando espaços na memória
        }
    
    }
}

//Criando os meteoros
function criarMeteoro(){
    const meteoro = document.createElement("div");

    meteoro.classList.add("meteoro");

    const posicaoX = Math.random() * (game.clientWidth - 40);

    meteoro.style.left = posicaoX + "px";
    meteoro.style.top = "-40px";//sempre vai sair da mesma altura, porém a largura vai ser aleatória pra não sair sempre do mesmo local

    game.appendChild(meteoro);

    meteoros.push(meteoro);
}

//Movimentando os meteoros
function atualizarMeteoros(){
    for(let i = meteoros.length - 1; i >= 0; i--){
        const meteoro = meteoros[i];

        let posicaoAtual = parseInt(meteoro.style.top);

        posicaoAtual += 3;

        meteoro.style.top = posicaoAtual + "px";

        //verificando se algum meteoro bateu na nave
        if(verificarColisao(player, meteoro)){
            meteoro.remove();
            meteoros.splice(i, 1);

            vidas--;

            vidasElemento.textContent = "Vidas: " + "❤️ ".repeat(vidas);

            if(vidas <= 0){
                jogoRodando = false;

                gameOverElemento.textContent = "GAME OVER";
                gameOverElemento.style.display = "block";

                botaoReiniciar.style.display = "block";

                clearInterval(intervaloMeteoros);//quando o jogo terminar os meteoros param de serem criados, na tela eles não aparecem, mas internamente sim o que faz consumir memória
                
            }
            continue;
        }

        if(posicaoAtual > game.clientHeight){
            meteoro.remove();

            meteoros.splice(i, 1);
        }
    }
}

//Reiniciar Jogo
function reiniciarJogo(){
    vidas = 3;
    pontuacao = 0;

    playerX = 380;
    playerY = 500;

    jogoRodando = true;

    vidasElemento.textContent = "Vidas: ❤️ ❤️ ❤️";
    pontuacaoElemento.textContent = "Pontos: 0";

    gameOverElemento.style.display = "none";
    botaoReiniciar.style.display = "none";

    tiros.forEach(function(tiro){
        tiro.remove();
    });

    meteoros.forEach(function(meteoro){
        meteoro.remove();
    });

    tiros = [];
    meteoros = [];

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";

    iniciarMeteoros();
    loop();//se não os meteoros não aparecem de novoa
}

botaoReiniciar.addEventListener("click", function(){
    reiniciarJogo();
});

//Criar os meteoros automaticamente
let intervaloMeteoros;

function iniciarMeteoros(){
    intervaloMeteoros = setInterval(function(){
        criarMeteoro();
    }, 1000);//a cada 1000ms ou 1s, novos meteoros serão criados
}

iniciarMeteoros();

//verifico se o tiro e o meteoro estão se sobrepondo
function verificarColisao(tiro, meteoro){
    //Vamos pega ro retangulo que ocupa cada elemento
    const tiroRect = tiro.getBoundingClientRect();//serve para pegar o top, bottom, left e right de um objeto, assim posso verificar a colisão do meteoro com o tiro
    const meteoroRect = meteoro.getBoundingClientRect();

    //Verifico as colisões e se todas derem verdadeiras retorno true pra confirmar que houve uma colisão do tiro com o meteoro
    return(
        tiroRect.left < meteoroRect.right &&
        tiroRect.right > meteoroRect.left &&
        tiroRect.top < meteoroRect.bottom &&
        tiroRect.bottom > meteoroRect.top
    );
}

function atualizar(){
    //cada vez que eu pressionar uma tecla ele adiciona a velocidade atual um novo valor
    if(teclas["ArrowLeft"]  || teclas["a"] || teclas["A"]){
        playerX -= velocidade;
    }

    if(teclas["ArrowRight"] || teclas["d"] || teclas["D"]){
        playerX += velocidade;
    }

    if (teclas["ArrowUp"] || teclas["w"] || teclas["W"]) {
        playerY -= velocidade;
    }

    if(teclas["ArrowDown"] || teclas["s"] || teclas["S"]) {
        playerY += velocidade;
    }

    /*Limites da tela do jogo, se não forem feitos o personagem, sairá da tela */
    /*Limite esquerdo */
    /*Do lado esquerdo é bem simples verificar se bateu na tela
    Isso porque se pernsar em um plano cartesiano, o eixo x sempre vai zerar do lado esquerdo
    e a ideia é a mesma pro eixo Y onde ele tbm zera na parte de baixo,
    agora se utlizasse right e bottom, seria ao contrário
    */
    if(playerX <0){
        playerX = 0;
    }

    /*Limite direito*/
    /*No caso do lado direito pra verificar se "bateu" desse lado da tela
    tem que ver se a coordenada x for maior que a largura do frame da tela
    e da largura do personagem
     */
    if(playerX > game.clientWidth - player.clientWidth){
        playerX = game.clientWidth - player.clientWidth;
    }

    /*Limite superior */
    if (playerY < 0) {
        playerY = 0
    }

    if (playerY > game.clientHeight - player.clientHeight) {
        playerY = game.clientHeight - player.clientHeight;
    }

    player.style.left = playerX + "px";
    player.style.top = playerY + "px";
}

function loop(){

    if(!jogoRodando){
        return; //Pare de executar essa função agora
    }

    atualizar();

    atualizarTiros();

    atualizarMeteoros();

    requestAnimationFrame(loop);
}

loop();

/*
loop()
  ↓
atualizar()
  ↓
loop()
  ↓
atualizar()
  ↓
loop()
  ↓
...
*/
//Ou seja, ele fica chamando continuamente a função atualizar, dessa forma cria-se o movimento do personagem
//Isso se chama gameLoop, um dos conceitos mais importantes em programação de jogos
