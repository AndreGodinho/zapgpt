async function codigoSMS(firebase, clientConectaWhatsApp, Buttons) {
    await consultaNo(firebase, clientConectaWhatsApp, Buttons); // Passe o `db` para a função
}

// Função assíncrona para consultar o nó no Realtime Database
async function consultaNo(firebase, clientConectaWhatsApp, Buttons) {
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

                if (!campo.enviadoWhats && campo.onlyDataPrimeiraValidacao >= 1737158400000 && campo.ultimoCodigoSMS) { // A partir do dia 18Jan2025
                    // Enviar mensagem usando o clientConectaWhatsApp
                    const telefone1 = `55${chave}@c.us`;

                    // Remove o primeiro "9" após os dois primeiros dígitos do código de área
                    const chaveSemPrimeiro9 = chave.toString().replace(/^(\d{2})(9)/, '$1');

                    const telefone2 = `55${chaveSemPrimeiro9}@c.us`; // Concatena com "55" e "@c.us"

                    // if (chave === '65999835474' || chave === '14991888912' || chave === '65993026189') {
                    console.log(`${formatarData(Date.now())} - Enviado WhatsApp para: ${chave} - ${campo.ultimoCodigoSMS}`);

                    await enviarMensagens(clientConectaWhatsApp, telefone2, campo.ultimoCodigoSMS);
                    await enviarMensagens(clientConectaWhatsApp, telefone1, campo.ultimoCodigoSMS);

                    await ref.child(chave).update({
                        enviadoWhats: true
                    });
                    //} else {
                    // console.log('R E A T I V A R  S M S  U R G E N T E');
                    // await delay(3000);
                    // await clientConectaWhatsApp.sendMessage(`5514991888912@c.us`, buttonMessage);
                    //}
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

async function enviarMensagens(client, telefone, codigoVerificacao) {
    const mensagemInicial = `Obrigado por ter baixado o Aplicativo FotoGeo \n\nSe precisar, temos vários tutoriais disponíveis em nosso site: \n\nhttps://www.relatoriofotogeo.com.br/`;
    const mensagemCodigo = `*Segue o código de Verificação:*`;

    // Enviar mensagem de agradecimento e link para tutoriais
    await client.sendMessage(telefone, mensagemInicial);
    await delay(3000);

    // Enviar mensagem com o código de verificação
    await client.sendMessage(telefone, mensagemCodigo);

    // Aguardar 3 segundos antes de enviar o código
    await delay(3000);
    await client.sendMessage(telefone, String(codigoVerificacao));
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

module.exports = codigoSMS;
