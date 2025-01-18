async function reenvioSMS(firebase, msgFrom) {
    await firebase.auth().signInWithEmailAndPassword(
        "2719_4175@fotogeo.com.br",
        "F2719_4175o"
    );

    // Remove o prefixo "55" e o sufixo "@c.us"
    let numero = msgFrom.replace(/^55/, '').replace(/@c\.us$/, '');

    // Adiciona o número 9 na terceira posição
    numero = numero.slice(0, 2) + '9' + numero.slice(2);

    // Referência ao banco de dados
    const db = firebase.database();
    const ref = db.ref(`fotoGeo/validaWhats`);

    await ref.child(numero).update({
        enviadoWhats: false
    });    
}

module.exports = reenvioSMS;