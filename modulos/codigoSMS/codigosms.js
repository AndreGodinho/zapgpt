// Função assíncrona para consultar o nó no Realtime Database
async function codigoSMS(firebase, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL, envioMensagens) {
    try {
		console.log('Antes de conectar')
        // Autenticação com email e senha
        const userCredential = await firebase.auth().signInWithEmailAndPassword(
            "2719_4175@fotogeo.com.br",
            "F2719_4175o"
        );
		const user123 = userCredential.user.uid;
		console.log('Após se conectar user=',user123)

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
                            // await enviarMensagens(clientConectaWhatsApp, telefone2, campo.ultimoCodigoSMS, campo.reenvio, envioMensagens, servidorUsado, SERVIDOR_LOCAL);
                        }
                        // await enviarMensagens(clientConectaWhatsApp, telefone1, campo.ultimoCodigoSMS, campo.reenvio, envioMensagens, servidorUsado, SERVIDOR_LOCAL);

                        //await ref.child(chave).update({
                        //    enviadoWhats: true,
                        //    reenvio: false
                        //});

                        await detectarTelefone(clientConectaWhatsApp, telefone1, envioMensagens, servidorUsado, SERVIDOR_LOCAL, firebase);
                    } else {
                        console.log(`${formatarData(Date.now())} - R E A T I V A R  S M S  U R G E N T E`);
                    }                    
                } else {
                    if (campo.enviadoWhats) {
                        console.log(`${formatarData(Date.now())} - O código já foi enviado para o WhatsApp: ${chave}`);                        
                    }
                }
				
				
				if (campo.numInteracoes===4 && campo.showInteracoes==true) {
					console.log('Enviar WhatsApp parabenizando pelo uso completo do aplicativo')
					await ref.child(chave).update({
                            showInteracoes: false,
                            numInteracoes: 9999
                        });
						
					if (chave.length == 11) {
                        // Remove o primeiro "9" após os dois primeiros dígitos do código de área
                        const chaveSemPrimeiro9 = chave.toString().replace(/^(\d{2})(9)/, '$1');

                        telefone2 = `55${chaveSemPrimeiro9}@c.us`; // Concatena com "55" e "@c.us"
						await enviarMensagens(clientConectaWhatsApp, telefone2, campo.ultimoCodigoSMS, campo.reenvio, envioMensagens, servidorUsado, SERVIDOR_LOCAL);
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
    // const mensagemInicial = `Agradecemos por ter baixado o Aplicativo FotoGeo \n\nSe precisar, temos vários tutoriais disponíveis em nosso site: \n\nhttps://www.relatoriofotogeo.com.br/tutoriais\n\n Ou pode retornar por este número`;
	
	let mensagemInicial = "Olá\n\n";
	mensagemInicial+= "Agradecemos por ter escolhido o aplicativo *Relatório FotoGeo*.\n\n"
	mensagemInicial+= "Você sabia que é possível personalizar os campos da foto?\n\n"
	mensagemInicial+= "Aprenda como em:\n\n"
	mensagemInicial+= "https://www.relatoriofotogeo.com.br/personalizar-descricao-das-fotos"
	
    // await clientConectaWhatsApp.sendMessage(telefone, mensagemInicial);

    if (!isReenvio) {
        console.log(`${formatarData(Date.now())} - Telefone envio: ${telefone} - ${mensagemInicial}`);
        // await client.sendMessage(telefone, mensagemInicial);
        // await envioMensagens(telefone, mensagemInicial, true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)
        // await delay(3000);
    }

    // Enviar mensagem com o código de verificação
    // await clientConectaWhatsApp.sendMessage(telefone, mensagemCodigo);
    // await envioMensagens(telefone, mensagemCodigo, true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)

    // Aguardar 3 segundos antes de enviar o código
    // await delay(3000);
    // await clientConectaWhatsApp.sendMessage(telefone, String(codigoVerificacao));
    // await envioMensagens(telefone, String(codigoVerificacao), true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)    
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

const listaTelefonesJCR = [
    '5515998560250@c.us', // Tamires
    '5514998570616@c.us', // Luciana
    '5515998581069@c.us', // Vanessa
    '5514997441099@c.us', // 945
    '5515998571189@c.us', // 490
    '5519983411710@c.us', // 670
    '5517981322280@c.us', // Maria
    '5514998432365@c.us', // 950
    '5515998562975@c.us', // Isilda
    '5515998593450@c.us', // 830
    '5514998994315@c.us', // Alana
    '5515998554498@c.us', // Elisete
    '5515997105144@c.us', // Dalva
    '5519981835357@c.us', // Suzy
    '5515998565414@c.us', // Ariane
    '5515997215902@c.us', // Marco
    '5515998556479@c.us', // 790
    '5511983826595@c.us', // Dayana
    '5514997937004@c.us', // Bruna
    '5515998547269@c.us', // Aline
    '5515998567613@c.us', // Patricia
    '5514997087812@c.us', // Lucileide
    '5514996178056@c.us', // Michele
    '5516992678404@c.us', // Flavia
    '5519991319182@c.us', // Sonia
    '5515998580789@c.us', // Priscila
	'5515997754606@c.us', // Edlane
	'5515998564937@c.us', // Vera
	'5515998567870@c.us', // Christoper
	'5515996038567@c.us', // Maricleia
	'5515998089781@c.us', // Jessia
	'5515997573988@c.us', // Rafaela
	'5515998547013@c.us'  // Acrescentado 27Fev2025 a pedido da Cristiane
];

const listaTelefonesRCS = [
    '5561996356207@c.us',
    '5561999724506@c.us',
    '5561992634078@c.us',
    '5561998376023@c.us',
];

const listaTelefoneCPFL = [
	'5519999728037@c.us',
	'5515998049649@c.us',	
	'5511963804766@c.us',	
	'5511950406636@c.us',	
	'5519971606870@c.us',	
];

const listaEnergisa = [
	'5516994477099@c.us',
	'5516994478717@c.us',
	'5516994477242@c.us',
	'5516994477344@c.us',
	'5563992297542@c.us',
	'5563992169304@c.us',
	'5563984682424@c.us',	
];
const listaKiralama = [
	'5511997050205@c.us',
	'5511998069375@c.us',
	'5511916120277@c.us',
	'5511975045726@c.us',
];

const listaSilva = [
	'551171993209560@c.us',
	'551171986647823@c.us',
];

const listaTeste = [
	'5565999835474@c.us',];
	

// pm2 restart zapgpt

async function detectarTelefone(clientConectaWhatsApp, telefone, envioMensagens, servidorUsado, SERVIDOR_LOCAL, firebase) {
	let isEncontrado=false;
	const telefoneAvisar='556599835474@c.us'
	
    if (listaTelefonesJCR.includes(telefone)) {        
        await delay(3000);
        await envioMensagens(telefoneAvisar, `Telefone ${telefone} detectado como da JCR`, true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)
		isEncontrado=true;
    }
    if (listaTelefonesRCS.includes(telefone)) {
        await delay(3000);
        await envioMensagens(telefoneAvisar, `Telefone ${telefone} detectado como da RCS`, true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)
		isEncontrado=true;
    }
	if (listaTelefoneCPFL.includes(telefone)) {
        await delay(3000);
        await envioMensagens(telefoneAvisar, `Telefone ${telefone} detectado como da CPFL`, true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)
		isEncontrado=true;
    }
	if (listaEnergisa.includes(telefone)) {
        await delay(3000);
        await envioMensagens(telefoneAvisar, `Telefone ${telefone} detectado como da Energisa`, true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)
		isEncontrado=true;
    }
	if (listaKiralama.includes(telefone)) {
        await delay(3000);
        await envioMensagens(telefoneAvisar, `Telefone ${telefone} detectado como da KIRALAMA ENGENHARIA`, true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)
		isEncontrado=true;
    }
	if (listaSilva.includes(telefone)) {
        await delay(3000);
        await envioMensagens(telefoneAvisar, `Telefone ${telefone} detectado como do SILVA 6909_7668`, true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)
		isEncontrado=true;
    }
	if (listaTeste.includes(telefone)) {
		//console.log('telefoneAvisar',telefoneAvisar)
		//console.log('telefone',telefone)
		//console.log('envioMensagens',envioMensagens)
		//console.log('firebase',firebase)
        await delay(3000);
        await envioMensagens(telefoneAvisar, `Telefone ${telefone} detectado como teste`, true, clientConectaWhatsApp, servidorUsado, SERVIDOR_LOCAL)
		isEncontrado=true;
    }
	
	if (isEncontrado) {	
		await firebase.auth().signInWithEmailAndPassword(
				"2719_4175@fotogeo.com.br",
				"F2719_4175o"
			);
			
		let numeroExtraido = extrairNumero(telefone);
		
		const db = firebase.database();
		const ref = db.ref(`fotoGeo/validaWhats/${numeroExtraido}`);
		ref.once('value', async function (data) {
			const campo2 = data.val();
			if (campo2!=null) {
				const zCntrMobile = campo2.zCntrMobile;
				
				const telefoneAvisar='556599835474@c.us'
				
				if (zCntrMobile) {
					await clientConectaWhatsApp.sendMessage(telefoneAvisar, `*${zCntrMobile}*`);
				} 
			} else {
				await clientConectaWhatsApp.sendMessage(msg.from, `*FotoGeoIA:*\n\n${'Não encontrei seu telefone cadastrado, por isto não consegui gerar o código, em breve um humano vai lhe atender'}`);
			}
		});
	}
}

function extrairNumero(str) {
    return str.replace(/^55/, '').replace(/@c\.us$/, '');
}


module.exports = codigoSMS;
