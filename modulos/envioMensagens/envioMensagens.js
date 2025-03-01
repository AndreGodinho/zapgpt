async function envioMensagens(msgFrom, mensagem, isMostra, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL) {

    if (isMostra) {
        console.log(`Enviando mensagem para ${msgFrom}\n${mensagem}\n########################################################################`);
    }

    let isEnviaMensagem = true;
    if (servidorUsado === SERVIDOR_LOCAL) {
        if (msgFrom !== '5565999835474@c.us' && msgFrom !== '5514991888912@c.us' && msgFrom !== '556593026189@c.us' && msgFrom !== '556599835474@c.us') {
            isEnviaMensagem = false;
        }
    }
	
	console.log('servidorUsado',servidorUsado)
	console.log('msgFrom',msgFrom)
	console.log('mensagem',mensagem)

    if (isEnviaMensagem) {
        await clientConectaWhatsApp.sendMessage(msgFrom, mensagem);
    }
}

module.exports = envioMensagens;