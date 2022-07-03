let titel = document.querySelector('#titel');
// Öffnen
titel.addEventListener('click', evt => {
    let containerTitel = document.querySelector('#container-titel');
    if (!containerTitel.classList.contains('geoeffnet')) {
        containerTitel.classList.add('geoeffnet');
        for (let eintragTitel of document.querySelectorAll('.eintrag-titel')) {
            eintragTitel.classList.add('geoeffnet');
        }
        warte(1000)
        .then(() => tippeInhalt('eintrag-titel-wer', 'er'))
        .then(() => warte(50))
        .then(() => tippeInhalt('eintrag-titel-wie', 'ie'))
        .then(() => warte(50))
        .then(() => tippeInhalt	('eintrag-titel-was', 'as'));
    }
});

function warte(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function tippeInhalt(idElement, inhalt) {
    let element = document.querySelector(`#${idElement}`);
    for (let i = 0; i < inhalt.length; i++) {
        await warte(50);
        element.innerText += inhalt[i];
    }
}

for (let eintragTitel of document.querySelectorAll('.eintrag-titel')) {
    eintragTitel.addEventListener('click', evt => {
        // Hintegrund
        STRUKTUR = 'cluster';
        for (knoten of arrKnoten) {knoten.erzeugeRichtungsvektor({});}
        document.querySelector('#container-inhalt').classList.add('inhalt');
        // Inhalt
        document.querySelector('#titel').classList.remove('geoeffnet');
        document.querySelector('#toggle-titel').classList.add('geoeffnet');
        for (let eintragTitel of document.querySelectorAll('.eintrag-titel')) {
            if (eintragTitel.id != evt.currentTarget.id) {
                eintragTitel.classList.remove('geoeffnet');
                eintragTitel.classList.remove('aktuell');
            }
        }
        // Aktivieren
        evt.currentTarget.classList.add('aktuell');
    })
}

document.querySelector('#toggle-titel').addEventListener('click', evt => {
    for (let eintragTitel of document.querySelectorAll('.eintrag-titel')) {
        eintragTitel.classList.add('geoeffnet');
    }
})