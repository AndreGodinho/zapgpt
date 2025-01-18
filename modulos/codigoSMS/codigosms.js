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
                    console.log('telefone1', telefone1);
                    console.log('telefone2', telefone2);

                    // if (chave === '65999835474' || chave === '14991888912' || chave === '65993026189') {
                    console.log(`Enviado WhatsApp para: ${chave} - ${campo.ultimoCodigoSMS}`);
                    await clientConectaWhatsApp.sendMessage(`${telefone1}`, `*Segue o código de Verificação do Aplicativo FotoGeo:*`);
                    await delay(3000);
                    await clientConectaWhatsApp.sendMessage(`${telefone1}`, `${Number(campo.ultimoCodigoSMS)}`);

                    await clientConectaWhatsApp.sendMessage(`${telefone2}`, `*Segue o código de Verificação do Aplicativo FotoGeo:*`);
                    await delay(3000);
                    await clientConectaWhatsApp.sendMessage(`${telefone2}`, `${Number(campo.ultimoCodigoSMS)}`);

                    await ref.child(chave).update({
                        enviadoWhats: true
                    });
                    //} else {
                    // console.log('R E A T I V A R  S M S  U R G E N T E');
                    // await delay(3000);
                    // await clientConectaWhatsApp.sendMessage(`5514991888912@c.us`, buttonMessage);
                    //}
                } else {
                    console.log(`O código já foi enviado para o WhatsApp: ${chave}`);
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
module.exports = codigoSMS;
