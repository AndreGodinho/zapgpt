// Função assíncrona para consultar o nó no Realtime Database
async function codigoSMS(firebase, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL, envioMensagens) {
    try {
        // Autenticação com email e senha
        await firebase.auth().signInWithEmailAndPassword(
            "2719_4175@fotogeo.com.br",
            "F2719_4175o"
        );

        // Referência ao banco de dados
        const db = firebase.database();
        const ref = db.ref("fotoGeo/validaWhats");

        // Adicionar listener para alterações no nó
        ref.on("child_changed", async (snapshot) => {
            if (snapshot.exists()) {
                const chave = snapshot.key; // Nome do nó alterado
                const campo = snapshot.val(); // Novo valor do nó alterado
                const telefone1 = `55${chave}@c.us`;

                if ((!campo.enviadoWhats && campo.onlyDataPrimeiraValidacao >= 1737158400000 && campo.ultimoCodigoSMS) || campo.reenvio) { // A partir do dia 18Jan2025
                    // Enviar mensagem usando o clientConectaWhatsApp                    
                    let telefone2 = '';

                    if (chave.length == 11) {
                        // Remove o primeiro "9" após os dois primeiros dígitos do código de área
                        const chaveSemPrimeiro9 = chave.toString().replace(/^(\d{2})(9)/, '$1');

                        telefone2 = `55${chaveSemPrimeiro9}@c.us`; // Concatena com "55" e "@c.us"
                    }

                    let isEnviaMensagem = true;
                    if (servidorUsado === SERVIDOR_LOCAL) {
                        if (chave !== '65999835474' && chave !== '14991888912' && chave !== '65993026189' && chave !== '6593026189') {
                            isEnviaMensagem = false;
                        }
                    }

                    if (isEnviaMensagem) {
                        console.log(`${formatarData(Date.now())} - Enviado WhatsApp para: ${chave} - ${campo.ultimoCodigoSMS}`);

                        if (telefone2) {
                            await enviarMensagens(clientConectaWhatsApp, telefone2, campo.ultimoCodigoSMS, campo.reenvio, envioMensagens, servidorUsado, SERVIDOR_LOCAL);
                        }
                        await enviarMensagens(clientConectaWhatsApp, telefone1, campo.ultimoCodigoSMS, campo.reenvio, envioMensagens, servidorUsado, SERVIDOR_LOCAL);

                        await ref.child(chave).update({
                            enviadoWhats: true,
                            reenvio: false
                        });

                        await detectarTelefone(clientConectaWhatsApp, telefone1, envioMensagens, servidorUsado, SERVIDOR_LOCAL);
                    } else {
                        console.log(`${formatarData(Date.now())} - R E A T I V A R  S M S  U R G E N T E`);
                    }                    
                } else {
                    if (campo.enviadoWhats) {
                        console.log(`${formatarData(Date.now())} - O código já foi enviado para o WhatsApp: ${chave}`);                        
                    }
                }
            } else {
                console.log("Nó foi removido ou está vazio.");
            }
        });

    } catch (error) {
        console.error("Erro ao consultar:", error.message);
    }
}
// Função auxiliar para delay
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function enviarMensagens(clientConectaWhatsApp, telefone, codigoVerificacao, isReenvio, envioMensagens, servidorUsado, SERVIDOR_LOCAL) {
    const mensagemInicial = `Obrigado por ter baixado o Aplicativo FotoGeo \n\nSe precisar, temos vários tutoriais disponíveis em nosso site: \n\nhttps://www.relatoriofotogeo.com.br/`;
    const mensagemCodigo = `*Segue o código de Verificação:*`;


    if (!isReenvio) {
        console.log(`${formatarData(Date.now())} - Telefone envio: ${telefone} - ${mensagemInicial}`);
        // await client.sendMessage(telefone, mensagemInicial);
        await envioMensagens(telefone, mensagemInicial, true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)
        await delay(3000);
    }

    // Enviar mensagem com o código de verificação
    // await clientConectaWhatsApp.sendMessage(telefone, mensagemCodigo);
    await envioMensagens(telefone, mensagemCodigo, true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)

    // Aguardar 3 segundos antes de enviar o código
    await delay(3000);
    // await clientConectaWhatsApp.sendMessage(telefone, String(codigoVerificacao));
    await envioMensagens(telefone, String(codigoVerificacao), true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)    
}

function formatarData(dataTimestamp) {
    const data = new Date(dataTimestamp);

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Mês começa do zero
    const ano = data.getFullYear();

    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

const listaTelefones = [
    '5515998560250@c.us',
    '5514998570616@c.us',
    '5515998580789@c.us',
    '5515998581069@c.us',
    '5514997441099@c.us',
    '5515998571189@c.us',
    '551998341710@c.us',
    '5517981322280@c.us',
    '5514998432365@c.us',
    '5515998562975@c.us',
    '5515998593450@c.us',
    '5515997573988@c.us',
    '5514998994315@c.us',
    '5515998554498@c.us',
    '5515997754606@c.us',
    '5515998564937@c.us',
    '5515997105144@c.us',
    '5519981835357@c.us',
    '5515998565414@c.us',
    '5515997215902@c.us',
    '5515998556479@c.us',
    '5511983826595@c.us',
    '5514997937004@c.us',
    '5515998547269@c.us',
    '5515998567613@c.us',
    '5514997087812@c.us',
    '5514996178056@c.us',
    '5516992678404@c.us',
    '5515996038567@c.us',
    '5519991319182@c.us',
    '5515998089781@c.us',
    '5565993026189@c.us'
];

async function detectarTelefone(clientConectaWhatsApp, telefone, envioMensagens, servidorUsado, SERVIDOR_LOCAL) {
    if (listaTelefones.includes(telefone)) {
        const telefoneAvisar='556599835474@c.us'
        await delay(3000);
        await envioMensagens(telefoneAvisar, `Telefone ${telefone} detectado como da JCR`, true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)
    }
}


module.exports = codigoSMS;
