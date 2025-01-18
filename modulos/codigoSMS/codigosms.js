async function codigoSMS(firebase, clientConectaWhatsApp, Buttons) {
    await consultaNo(firebase, clientConectaWhatsApp, Buttons); // Passe o `db` para a função

    // Gera um código SMS aleatório de 4 dígitos
    return Math.floor(1000 + Math.random() * 9000);
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
                const valor = snapshot.val(); // Novo valor do nó alterado

                const buttonMessage = new Buttons(
                    `*Código de Verificação do Aplicativo FotoGeo*:\n\n${valor.ultimoCodigoSMS}`, // Mensagem de texto
                    [
                        { body: 'Confirmar Código', id: 'confirm_code' }, // Botão 1
                        { body: 'Ajuda', id: 'help' }                    // Botão 2
                    ],
                    /* 'Verifique seu Código',
                    'Selecione uma opção abaixo:' */
                );

                // console.log('buttonMessage', buttonMessage);

                // Enviar mensagem usando o clientConectaWhatsApp
                await delay(3000);
                await clientConectaWhatsApp.sendMessage('556599835474@c.us', `*Segue o código de Verificação do Aplicativo FotoGeo:*`);
                await clientConectaWhatsApp.sendMessage('556599835474@c.us', `${Number(valor.ultimoCodigoSMS)}`);
                // await clientConectaWhatsApp.sendMessage('556599835474@c.us', buttonMessage);
                console.log('mensagem.ultimoCodigoSMS', valor.ultimoCodigoSMS);
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


module.exports = codigoSMS;
