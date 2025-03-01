// Invocamos o leitor de qr code
// https://platform.openai.com/playground/chat?models=gpt-4o

console.log('ZapGPT v1.0 - Inicializando...');
const qrcode = require('qrcode-terminal'); // OK
const { Client, Buttons, List, MessageMedia, LocalAuth } = require('whatsapp-web.js'); // OK
const fs = require('fs'); // OK
const path = require('path'); // OK
const OpenAI = require('openai'); // OK
const dotenv = require('dotenv'); // OK
const { spawn } = require('child_process');// OK
const { promisify } = require('util'); // OK
const setTimeoutPromise = promisify(setTimeout);
const writeFileAsync = promisify(fs.writeFile);
dotenv.config();

const firebase = require("firebase/compat/app");
require("firebase/compat/database");
require("firebase/compat/auth");

const firebaseAndreMT = {
  apiKey: process.env.MY_FOTOGEO_API_KEY,
  authDomain: process.env.MY_FOTOGEO_AUTH_DOMAIN,
  databaseURL: process.env.MY_FOTOGEO_DATA_BASE_URL,
  projectId: process.env.MY_FOTOGEO_PROJECT_ID,
  storageBucket: process.env.MY_FOTOGEO_STORAGE_BUCKET,
  messagingSenderId: process.env.MY_FOTOGEO_MESSAGING_SENDER_ID,
  appId: process.env.MY_FOTOGEO_APP_ID,
  measurementId: process.env.MY_FOTOGEO_MEASUREMENT_ID,
};

// Inicializar Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseAndreMT);
}


// Variáveis do seu modelo

// const modelo = "gpt-3.5-turbo-1106"; //Modelo escolhido para a sua IA
const modelo = "gpt-4-turbo-2024-04-09"; //Modelo escolhido para a sua IA
const temperatura = 1; //Temperatura da sua IA
const DATABASE_FILE = 'zapgptdb.json'; //Banco de dados da sua IA
const sessao = 'zapgpt';

// Final das variáveis do seu modelo https://github.com/wppconnect-team/wa-version/releases
// const wwebVersion = '2.3000.1019060436-alpha';
const wwebVersion = '2.3000.1019400774-alpha';

const SERVIDOR_LOCAL = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SERVIDOR_PRODUCAO = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
const servidorUsado = SERVIDOR_LOCAL

//Kit com os comandos otimizados para nuvem Ubuntu Linux (créditos Pedrinho da Nasa Comunidade ZDG)
const clientConectaWhatsApp = new Client({
  authStrategy: new LocalAuth({ clientId: sessao }),
  puppeteer: {
    headless: true,
    //CAMINHO DO CHROME PARA WINDOWS (REMOVER O COMENTÁRIO ABAIXO)
    executablePath: servidorUsado,
    // executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    //===================================================================================
    // CAMINHO DO CHROME PARA MAC (REMOVER O COMENTÁRIO ABAIXO)
    //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    //===================================================================================
    // CAMINHO DO CHROME PARA LINUX (REMOVER O COMENTÁRIO ABAIXO)
    // executablePath: '/usr/bin/google-chrome-stable',
    //===================================================================================
    args: [
      '--no-sandbox', //Necessário para sistemas Linux
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      // '--single-process', // <- Este não funciona no Windows, apague caso suba numa máquina Windows
      '--disable-gpu'
    ]
  },
  webVersionCache: {
    type: 'remote',
    remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
  },
  logLevel: 'debug' // Adicione isso para habilitar logs detalhados
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This is also the default, can be omitted
});


//Mecanismo para reconhecimento de audio

async function runAudio(arquivo) {
  const transcript = await openai.audio.transcriptions.create({
    model: 'whisper-1',
    file: fs.createReadStream(arquivo),
  });
  return { message: transcript.text };
}

// const ffmpeg = require('fluent-ffmpeg');

async function converterArquivoOGGparaMP3(caminhoArquivoEntrada, nomeArquivoSaida) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ['-y', '-i', caminhoArquivoEntrada, '-loglevel', '0', '-nostats', nomeArquivoSaida]);

    ffmpeg.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    ffmpeg.on('close', (code) => {
      if (code !== 0) {
        reject(`Erro ao executar o comando, código de saída: ${code}`);
      } else {
        resolve(`Arquivo convertido com sucesso para o formato MP3: ${nomeArquivoSaida}`);
      }
    });
  });
}

async function processMessage(msg) {
  if (msg.hasMedia) {
    /* const attachmentData = await msg.downloadMedia();

    if (attachmentData.mimetype === 'audio/ogg; codecs=opus') {
      const audioFilePath = `./audiobruto/${msg.from.split('@c.us')[0]}.ogg`;

      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }

      await writeFileAsync(audioFilePath, Buffer.from(attachmentData.data, 'base64'));

      while (true) {
        try {
          if (fs.existsSync(audioFilePath)) {
            await converterArquivoOGGparaMP3(audioFilePath, `./audioliquido/${msg.from.split('@c.us')[0]}.mp3`);
            fs.unlinkSync(audioFilePath);
            return await brokerMaster(runAudio, msg, `./audioliquido/${msg.from.split('@c.us')[0]}.mp3`);
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
          console.error(err);
        }
      }
    } */
    console.log('Mensagem de áudio recebida, mas não processada.', msg.hasMedia);
    return 'Desculpe, mas ainda não consigo processar mensagens de áudio/video/fotos.';
  } else {
    return msg.body;
  }
}

//Mecanismo para produção de audio

//Mecanismo para criar pasta

function createFolderIfNotExists(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Pasta criada: ${folderPath}`);
  } else {
    // console.log(`Pasta já existe: ${folderPath}`);
  }
}

// Caminhos das pastas
const audioBrutoPath = path.join(__dirname, 'audiobruto');
const audioLiquidoPath = path.join(__dirname, 'audioliquido');

// Criar as pastas
createFolderIfNotExists(audioBrutoPath);
createFolderIfNotExists(audioLiquidoPath);

//Fim do mecanismo para criar pasta

//Funções de processamento OpenAI

function brokerMaster(requestFunction, msg, ...args) {
  const backoffDelay = 1000;
  const maxRetries = 10;

  return new Promise((resolve, reject) => {
    const makeRequest = (retryCount, chatHistory) => {
      requestFunction(...args)
        .then((response) => {
          // Verifica se o finish_reason é 'length'
          if (response.finishReason === 'length' && requestFunction === runZAPGPT) {
            chatHistory = readChatHistory(msg.from); // args[0].from é um exemplo

            chatHistory.splice(1, 2); // Remove as primeiras interações

            updateChatHistory(msg.from, chatHistory);
          }

          resolve(response.message); // Agora resolve somente a mensagem
        })
        .catch((error) => {
          if (retryCount === maxRetries) {
            reject(error);
            return;
          }

          const delay = backoffDelay * Math.pow(2, retryCount);
          console.log(`Tentativa ${retryCount + 1} falhou. Tentando novamente em ${delay}ms...`);
          console.log(error);
          setTimeout(() => makeRequest(retryCount + 1, chatHistory), delay);
        });
    };

    makeRequest(0, []);
  });
}

async function runZAPGPT(chathistory) {
  const completion = await openai.chat.completions.create({
    model: modelo,
    messages: chathistory,
    temperature: temperatura,
  });

  // Retorna a mensagem e o finish_reason
  return {
    message: completion.choices[0].message,
    finishReason: completion.choices[0].finish_reason
  };
}

//Leitura do QRCode
clientConectaWhatsApp.on('qr', qr => {
  console.log('QRCode recebido, escaneie o código abaixo.');
  qrcode.generate(qr, { small: true });
});

//Resposta de sucesso
clientConectaWhatsApp.on('ready', () => {
  console.log('Tudo certo! ZapGPT conectado!!!');
});

//Inicializa o servidor
clientConectaWhatsApp.initialize();

const delay = async (ms) => {
  await setTimeoutPromise(ms);
};

// Funções de controle e gestão do JSON

// Função auxiliar para ler o arquivo JSON
function readJSONFile(nomeArquivo) {
  if (fs.existsSync(nomeArquivo)) {
    const dados = fs.readFileSync(nomeArquivo);
    return JSON.parse(dados);
  } else {
    return [];
  }
}

// Função auxiliar para escrever no arquivo JSON
function writeJSONFile(nomeArquivo, dados) {
  const dadosJSON = JSON.stringify(dados, null, 2);
  fs.writeFileSync(nomeArquivo, dadosJSON);
}

//Vamos criar a estrutura do banco de dados que agora ficará num arquivo JSON
function addObject(numeroId, flowState, id, interact, chathistory, zapgpt, cliente, maxObjects) {
  const dadosAtuais = readJSONFile(DATABASE_FILE);

  // Verificar a unicidade do numeroId
  const existeNumeroId = dadosAtuais.some(objeto => objeto.numeroId === numeroId);
  if (existeNumeroId) {
    throw new Error('O numeroId já existe no banco de dados.');
  }

  const objeto = { numeroId, flowState, id, interact, chathistory, zapgpt, cliente };

  if (dadosAtuais.length >= maxObjects) {
    // Excluir o objeto mais antigo
    dadosAtuais.shift();
  }

  dadosAtuais.push(objeto);
  writeJSONFile(DATABASE_FILE, dadosAtuais);
}

// Excluir um objeto
function deleteObject(numeroId) {
  const dadosAtuais = readJSONFile(DATABASE_FILE);
  const novosDados = dadosAtuais.filter(obj => obj.numeroId !== numeroId);
  writeJSONFile(DATABASE_FILE, novosDados);
}

// Verificar se o objeto existe no banco de dados
function existsDB(numeroId) {
  const dadosAtuais = readJSONFile(DATABASE_FILE);
  return dadosAtuais.some(obj => obj.numeroId === numeroId);
}

// Atualizar a propriedade "ZAPGPT"
function updateZAPGPT(numeroId, zapgpt) {
  const dadosAtuais = readJSONFile(DATABASE_FILE);
  const objeto = dadosAtuais.find(obj => obj.numeroId === numeroId);
  if (objeto) {
    objeto.zapgpt = zapgpt;
    writeJSONFile(DATABASE_FILE, dadosAtuais);
  }
}

// Ler a propriedade "ZAPGPT"
function readZAPGPT(numeroId) {
  const objeto = readMap(numeroId);
  return objeto ? objeto.zapgpt : undefined;
}

// Atualizar a propriedade "chathistory"
function updateChatHistory(numeroId, chathistory) {
  const dadosAtuais = readJSONFile(DATABASE_FILE);
  const objeto = dadosAtuais.find(obj => obj.numeroId === numeroId);
  if (objeto) {
    objeto.chathistory = chathistory;
    writeJSONFile(DATABASE_FILE, dadosAtuais);
  }
}

// Ler a propriedade "chathistory"
function readChatHistory(numeroId) {
  const objeto = readMap(numeroId);
  return objeto ? objeto.chathistory : undefined;
}

// Atualizar a propriedade "cliente"
function updateCliente(numeroId, cliente) {
  const dadosAtuais = readJSONFile(DATABASE_FILE);
  const objeto = dadosAtuais.find(obj => obj.numeroId === numeroId);
  if (objeto) {
    objeto.cliente = cliente;
    writeJSONFile(DATABASE_FILE, dadosAtuais);
  }
}

// Ler a propriedade "cliente"
function readCliente(numeroId) {
  const objeto = readMap(numeroId);
  return objeto ? objeto.cliente : undefined;
}

// Atualizar a propriedade "flowState"
function updateFlow(numeroId, flowState) {
  const dadosAtuais = readJSONFile(DATABASE_FILE);
  const objeto = dadosAtuais.find(obj => obj.numeroId === numeroId);
  if (objeto) {
    objeto.flowState = flowState;
    writeJSONFile(DATABASE_FILE, dadosAtuais);
  }
}

// Ler a propriedade "flowState"
function readFlow(numeroId) {
  const objeto = readMap(numeroId);
  return objeto ? objeto.flowState : undefined;
}

// Atualizar a propriedade "id"
function updateId(numeroId, id) {
  const dadosAtuais = readJSONFile(DATABASE_FILE);
  const objeto = dadosAtuais.find(obj => obj.numeroId === numeroId);
  if (objeto) {
    objeto.id = id;
    writeJSONFile(DATABASE_FILE, dadosAtuais);
  }
}

// Ler a propriedade "id"
function readId(numeroId) {
  const objeto = readMap(numeroId);
  return objeto ? objeto.id : undefined;
}

// Atualizar a propriedade "interact"
function updateInteract(numeroId, interact) {
  const dadosAtuais = readJSONFile(DATABASE_FILE);
  const objeto = dadosAtuais.find(obj => obj.numeroId === numeroId);
  if (objeto) {
    objeto.interact = interact;
    writeJSONFile(DATABASE_FILE, dadosAtuais);
  }
}

// Ler a propriedade "interact"
function readInteract(numeroId) {
  const objeto = readMap(numeroId);
  return objeto ? objeto.interact : undefined;
}

// Ler o objeto completo
function readMap(numeroId) {
  const dadosAtuais = readJSONFile(DATABASE_FILE);
  const objeto = dadosAtuais.find(obj => obj.numeroId === numeroId);
  return objeto;
}

function extrairNumero(str) {
    return str.replace(/^55/, '').replace(/@c\.us$/, '');
}

function adicionarNove(numero) {
    if (numero.length === 10) {
        // Insere o "9" na terceira posição
        return numero.slice(0, 2) + '9' + numero.slice(2);
    }
    return numero; // Retorna o número sem modificações se não tiver 10 caracteres
}

clientConectaWhatsApp.on('message', async msg => {
  const mensagemLivre = msg.body;

  let isResponde = true;

  if ((mensagemLivre.toLowerCase().includes('Não estou conseguindo receber o código via WhatsApp. Gostaria de ajuda:'.toLowerCase()) ||
    mensagemLivre.toLowerCase().includes('Estou na tela do envio de código de autenticação via WhatsApp e tenho uma dúvida'.toLowerCase()))) {

    isResponde = false;
	
	await firebase.auth().signInWithEmailAndPassword(
            "2719_4175@fotogeo.com.br",
            "F2719_4175o"
        );
    
    await clientConectaWhatsApp.sendMessage(msg.from, `*FotoGeoIA:*\n\n${'Um momento por favor'}`);
	await delay(3000);
	
	let numeroExtraido = extrairNumero(msg.from);
	console.log('msg.from',msg.from);
	console.log('numeroExtraido',numeroExtraido);
	numeroExtraido = adicionarNove(numeroExtraido);
	console.log('numeroExtraido depois',numeroExtraido);

    const db = firebase.database();
    const ref = db.ref(`fotoGeo/validaWhats/${numeroExtraido}`);
    ref.once('value', async function (data) {
        const campo2 = data.val();
		if (campo2!=null) {
			console.log('campo WhatsApp',campo2.ultimoCodigoSMS)
			
			const ultimoCodigoSMS = campo2.ultimoCodigoSMS;
			
			if (ultimoCodigoSMS) {
				await clientConectaWhatsApp.sendMessage(msg.from, `*FotoGeoIA:*\n\nO código de autenticação é:`);
				await delay(3000);
				
				await clientConectaWhatsApp.sendMessage(msg.from, `*${ultimoCodigoSMS}*`);
				
				await delay(3000);				
				await clientConectaWhatsApp.sendMessage(msg.from, `*FotoGeoIA:*\n\n${'Ajudo em algo mais?'}`);				
			} else {
				await clientConectaWhatsApp.sendMessage(msg.from, `*FotoGeoIA:*\n\n${'Não consegui gerar o código, em breve um humano vai lhe atender'}`);
			}
		} else {
			await clientConectaWhatsApp.sendMessage(msg.from, `*FotoGeoIA:*\n\n${'Não encontrei seu telefone cadastrado, por isto não consegui gerar o código, em breve um humano vai lhe atender'}`);
		}
    });

    
  }
  // msg.body !== null para ativar com qualquer coisa
  if (!existsDB(msg.from) &&

    (msg.body.toLowerCase() === "iniciar bot" ||
      msg.body.toLowerCase() == "Gostaria de tirar dúvidas a respeito do Aplicativo FotoGeo por este canal de atendimento".toLowerCase() ||
      msg.body.toLowerCase().includes("vim pelo site e gostaria de mais informações".toLowerCase()) ||
	  msg.body.toLowerCase().includes("Vim pelo site e gostaria de tirar uma dúvida".toLowerCase()) ||
      msg.body.toLowerCase().includes("Estou com dúvidas em relação as minhas compras do FotoGeo".toLowerCase()) ||
      msg.body.toLowerCase().includes("Estou com dúvidas referente ao Aplicativo FotoGeo".toLowerCase()) ||
      msg.body.toLowerCase().includes("Dúvidas a respeito do Aplicativo Relatório FotoGEO".toLowerCase()) ||
      msg.body.toLowerCase().includes("Gostaria de tirar uma dúvida, fazer uma reclamação ou dar uma sugestão referente ao Aplicativo FotoGeo".toLowerCase()) ||
      msg.body.toLowerCase().includes("Não estou conseguindo receber o código via WhatsApp. Gostaria de ajuda:".toLowerCase()) ||
      msg.body.toLowerCase().includes("Estou na tela do envio de código de autenticação via WhatsApp e tenho uma dúvida".toLowerCase()) ||
      msg.body.toLowerCase().includes("Estou gerando meu Relatório, mas estou tendo problemas".toLowerCase()) ||
      msg.body.toLowerCase().includes("Estou tentando adquirir módulos do Aplicativo FotoGeo via PIX e não estou conseguindo".toLowerCase()) ||      
	  msg.body.toLowerCase().includes("Estou na tela de tutoriais do site e tenho uma dúvida".toLowerCase()) ||	  
      msg.body.toLowerCase().includes("Recuperar Foto".toLowerCase()) ||
      msg.body.toLowerCase().includes("Foto Antiga".toLowerCase()) ||
      msg.body.toLowerCase().includes("Fotos Antigas".toLowerCase()) ||
      msg.body.toLowerCase().includes("#IA Atender#".toLowerCase()) ||
      msg.body.toLowerCase().includes("#FotoGeo Atender#".toLowerCase()) ||
      msg.body.toLowerCase().includes("expirou e gostaria de fazer a seguinte pergunta:".toLowerCase())) &&

    msg.from.endsWith('@c.us') && !msg.hasMedia) {

    addObject(msg.from, 'stepGPT', 'id_temp', 'done', [], null, null, 200);
  }

  //Bloco do Agente GPT
  if (existsDB(msg.from) &&
    msg.body !== null &&
    readFlow(msg.from) === 'stepGPT' &&
    readId(msg.from) !== JSON.stringify(msg.id.id) &&
    readInteract(msg.from) === 'done' &&
    msg.from.endsWith('@c.us')) {
    let mensagem = await processMessage(msg);

    console.log(`${formatarData(Date.now())} - ${msg.from} ###### ${mensagem} ######`);

    if (mensagem === 'Desculpe, mas ainda não consigo processar mensagens de áudio/video/fotos.') {
      mensagem += '\n\nEm breve um de nossos atendentes irá lhe responder.';
      await delay(3000);
      // await clientConectaWhatsApp.sendMessage(msg.from, `*FotoGeoIA:*\n\n${mensagem}`);
      await envioMensagens(msg.from, `*FotoGeoIA:*\n\n${mensagem}`, false, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)
    } else {
      // Atualizar o status de digitação e outros dados relevantes
      updateInteract(msg.from, 'typing');
      updateId(msg.from, JSON.stringify(msg.id.id));

      updateCliente(msg.from, mensagem);

      if (readChatHistory(msg.from).length === 0) {
        // Inserir uma mensagem inicial de sistema no histórico de chat            
        // updateChatHistory(msg.from, [{ role: 'system', content: `${fs.readFileSync('prompt.txt', 'utf8')}` }]);
        updateChatHistory(msg.from, [{ role: 'developer', content: `${fs.readFileSync('prompt.txt', 'utf8')}` }]);
      }

      updateChatHistory(msg.from, [...readChatHistory(msg.from), { role: 'user', content: `${readCliente(msg.from)}` }]);
      updateZAPGPT(msg.from, await brokerMaster(runZAPGPT, msg, readChatHistory(msg.from)));
      // Enviar a resposta para o usuário
      if (readZAPGPT(msg.from).content) {
        updateChatHistory(msg.from, readChatHistory(msg.from).slice(0, -1)); // Remove a ultima interação
        updateChatHistory(msg.from, [...readChatHistory(msg.from), { role: 'user', content: `${readCliente(msg.from)}` }]);
        updateChatHistory(msg.from, [...readChatHistory(msg.from), { role: 'assistant', content: `${readZAPGPT(msg.from).content}` }]);
        const chat = await msg.getChat();
        await chat.sendSeen();
        await chat.sendStateTyping();
        await delay(1000); // Mudado aqui 3000
        if (isResponde) {          
          await envioMensagens(msg.from, `*FotoGeoIA:*\n\n${readZAPGPT(msg.from).content}`, false, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)
        }
        updateFlow(msg.from, 'stepGPT');
        updateInteract(msg.from, 'done');
      }
    }
  }


});

function formatarContato(numero, prefixo) {
  const regex = new RegExp(`^${prefixo}(\\d+)`);
  const match = numero.match(regex);

  if (match && match[1]) {
    const digits = match[1];
    return `55${digits}@c.us`;
  }

  return numero;
}

function getRandomDelay(minDelay, maxDelay) {
  const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
  return Math.floor(randomDelay);
}

function extrairNomeArquivo(str, posicao) {
  const partes = str.split(' ');
  if (posicao >= 0 && posicao < partes.length) {
    return partes[posicao];
  }
  return null;
}

function extrairContatos(leadsTopo, leadsFundo, quantidade) {
  if (leadsFundo === null) {
    return leadsTopo.slice(0, quantidade).map(objeto => objeto.numeroId);
  }

  const contatos = leadsTopo
    .filter(contato => !leadsFundo.includes(contato))
    .slice(0, quantidade)
    .map(objeto => objeto.numeroId);
  return contatos;
}

async function obterUltimaMensagem(contato) {
  const chat = await clientConectaWhatsApp.getChatById(contato);
  const mensagens = await chat.fetchMessages({ limit: 1 });

  if (mensagens.length > 0) {
    const ultimaMensagem = mensagens[mensagens.length - 1];
    return ultimaMensagem.body;
  }

  return "Nenhuma mensagem encontrada";
}

clientConectaWhatsApp.on('message_create', async (msg) => {

  //Instruções da Central de Controle
  if (msg.fromMe && msg.body.startsWith('!help') && msg.to === msg.from) {
    await clientConectaWhatsApp.sendMessage(msg.from, `*Sistema de Controle ZAPGPT v1.0*\n\nFormato do *contato*: xxyyyyyyyyy\n\n*Atendimento Humano*\nMétodo Direto: "Ativar humano"\nMétodo Indireto: "!humano xxyyyyyyyyy"\n\n*Adicionar Lead a Base*\nMétodo Direto: "Olá, tudo bom?"\nMétodo Indireto: "!start xxyyyyyyyyy"`);
  }

  //Deletar um contato da Base de Dados (Atendimento Humano)
  if (msg.fromMe && msg.body.startsWith('!humano') && msg.to === msg.from) {
    let contato = formatarContato(msg.body, '!humano');
    if (existsDB(contato)) {
      deleteObject(contato);
    }
    await clientConectaWhatsApp.sendMessage(msg.from, `Deletei da Base de Dados o numero: ${contato}`);
  }

  //Deletar um contato da Base de Dados Método Direto (Atendimento Humano)
  if (msg.fromMe && msg.body === 'Ativar humano' && msg.to !== msg.from) {
    if (existsDB(msg.to)) {
      deleteObject(msg.to);
    }
    await clientConectaWhatsApp.sendMessage(msg.from, `Deletei da Base de Dados o numero: ${msg.to}`);
  }

  //Deletar um contato da Base de Dados Método Direto (Atendimento Humano)
  if (msg.fromMe && msg.body.toLowerCase().includes('Meu nome é André Godinho e vou assumir a conversa a partir de agora'.toLowerCase()) && msg.to !== msg.from) {
    if (existsDB(msg.to)) {
      deleteObject(msg.to);
    }
    await clientConectaWhatsApp.sendMessage(msg.from, `Deletei da Base de Dados o numero: ${msg.to}`);
  }

  //Adicionar um contato na base de dados (Método Indireto)
  if (msg.fromMe && msg.body.startsWith('!start ') && msg.to === msg.from) {
    let contato = formatarContato(msg.body, '!start ');
    if (existsDB(contato)) {
      deleteObject(contato);
    }
    addObject(contato, 'stepGPT', 'id_temp', 'done', [], null, null, 200);

    await clientConectaWhatsApp.sendMessage(msg.from, `Adiconei ao GPT: ${contato}`);
  }

  //Adicionar um contato na base de dados (Método Direto)
  if (msg.fromMe && msg.body === "Olá, tudo bom?" && msg.to !== msg.from) {
    if (!existsDB(msg.to)) {
      addObject(msg.to, 'stepGPT', 'id_temp', 'done', [], null, null, 200);
      await clientConectaWhatsApp.sendMessage(msg.from, `Adicionei ao GPT pelo método direto: ${msg.to}`);
    }
  }
});

const codigosms = require('./modulos/codigoSMS/codigosms.js')
const reenvioSMS = require('./modulos/codigoSMS/reenviosms.js');
const envioMensagens = require('./modulos/envioMensagens/envioMensagens.js');

codigosms(firebase, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL, envioMensagens);

function formatarData(dataTimestamp) {
  const data = new Date(dataTimestamp);

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês começa do zero
  const ano = data.getFullYear();

  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

// Teste
// reenvioSMS(firebase, '5531988598268@c\.us', SERVIDOR_PRODUCAO, SERVIDOR_LOCAL)


/* if (msg.hasMedia) {
  console.log('msg.from', msg.from);
  await clientConectaWhatsApp.sendMessage(msg.from, `*FotoGeoIA:*\n\nDesculpe, mas ainda não consigo processar mensagens de áudio.`);
  updateFlow(msg.from, 'stepGPT');
  updateInteract(msg.from, 'done');
} else { */