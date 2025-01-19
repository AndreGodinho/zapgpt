async function reenvioSMS(firebase, msgFrom, servidorUsado, SERVIDOR_LOCAL) {
    if (servidorUsado !== SERVIDOR_LOCAL) {
        await firebase.auth().signInWithEmailAndPassword(
            "2719_4175@fotogeo.com.br",
            "F2719_4175o"
        );

        // Remove o prefixo "55" e o sufixo "@c.us"
        let numero = msgFrom.replace(/^55/, '').replace(/@c\.us$/, '');

        if (numero.length === 10) {
            // Adiciona o número 9 na terceira posição (após o DDD)
            numero = numero.slice(0, 2) + '9' + numero.slice(2);
        }

        // Referência ao banco de dados
        const db = firebase.database();
        const ref = db.ref(`fotoGeo/validaWhats`);

        console.log(`${formatarData(Date.now())} - Número Telefone Reenvio: ${numero}`);

        await ref.child(numero).update({
            enviadoWhats: false,
            reenvio: true
        });
    }
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

module.exports = reenvioSMS;

