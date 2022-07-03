'use strict'

// Optionen für Knoten
let anzahlKnotenEbene;
let optionenKnoten = {
    // Ebene 1
    1:  {
            radius: 0.5,
            geschwindigkeit: 0.3,
            farbe: 'rgb(200, 200, 200, 0.5)',
        },
    2: {
            radius: 1,
            geschwindigkeit: 0.7,
            farbe: 'rgb(200, 200, 200, 0.75)',
        },
    3:  {
            radius: 1.5,
            geschwindigkeit: 1.0,
            farbe: 'rgb(200, 200, 200, 1)',
        },
};

let canvasHintergrund = document.querySelector('#canvas-hintergrund');
let contextHintergrund = canvasHintergrund.getContext('2d');
let arrKnoten = [];
let maxEntfernung = 50;

window.addEventListener('resize', () => {
    anpasseGrösse();
    initiiereHintergrund();
})

function initiiereHintergrund() {
    arrKnoten = [];
    for (let i=0; i < anzahlKnotenEbene; i++) {
        arrKnoten.push(new Knoten(1, 'container-inhalt'));
    }
    for (let i=0; i < anzahlKnotenEbene; i++) {
        arrKnoten.push(new Knoten(2, 'container-inhalt'));
    }
    for (let i=0; i < anzahlKnotenEbene; i++) {
        arrKnoten.push(new Knoten(3, 'container-inhalt'));
    }
}

let animationGestoppt = false;
let STRUKTUR = 'netz';
function animationsschleife() {
    contextHintergrund.clearRect(0, 0, canvasHintergrund.width, canvasHintergrund.height);
    for (let i = 0; i < arrKnoten.length; i++) {
        let knoten = arrKnoten[i];
        knoten.aktualisiere();
        knoten.zeichneKnoten();
        if (STRUKTUR == 'netz') {
            if (i > 0) {zeichneKanteNetz(knoten, arrKnoten[i-1]);}
            if (i > 1) {zeichneKanteNetz(knoten, arrKnoten[i-2]);}
            if (i < arrKnoten.length - 2) {zeichneKanteNetz(knoten, arrKnoten[i+1]);}
            if (i > arrKnoten.length - 1) {zeichneKanteNetz(knoten, arrKnoten[i+2]);}
        }
        if (STRUKTUR == 'cluster') {
            zeichneKanteCluster(knoten, arrKnoten);
        }
    }
    if (!animationGestoppt) {
        setTimeout(() => {window.requestAnimationFrame(animationsschleife);}, 0); // asynchron zwecks Performance
    }
}

class Knoten {
    constructor(ebene, idRandInnen) {
        // Optionen übernehmen
        Object.assign(this, optionenKnoten[ebene]);
        this.ebene = ebene;
        this.x = this.xDefault = Math.random() * canvasHintergrund.width;
        this.y = this.yDefault = Math.random() * canvasHintergrund.height;
        this.richtungswinkel = Math.floor(Math.random() * 360);
        // Richtungsvektor mit Drehung um Längsachse
        this.richtungsvektor = {};
        if (STRUKTUR == 'netz') {
            if (canvasHintergrund.width > canvasHintergrund.height) {
                this.erzeugeRichtungsvektor({x: 0});
            } else {
                this.erzeugeRichtungsvektor({y: 0});
            }
        }
        if (STRUKTUR == 'cluster') {
            this.erzeugeRichtungsvektor({});
        }
        // Rand Innen
        this.idRandInnen = idRandInnen;
        
        // Funktionen
        this.aktualisiere = this.aktualisiere.bind(this);
        this.beachteRandAußen = this.beachteRandAußen.bind(this);
        this.beachteRandInnen = this.beachteRandInnen.bind(this);
        this.zeichneKnoten = this.zeichneKnoten.bind(this);
        this.erzeugeRichtungsvektor = this.erzeugeRichtungsvektor.bind(this);
    }
    
    aktualisiere() {
        this.beachteRandAußen();
        this.beachteRandInnen();
        this.x += this.richtungsvektor.x;
        this.y += this.richtungsvektor.y;
    }

    beachteRandAußen() {
        // Bande X-Richtung
        if (this.x >= canvasHintergrund.width || this.x <= 0) {
            this.richtungsvektor.x *= -1;
        }
        // Bande Y-Richtung
        if (this.y > canvasHintergrund.height || this.y <= 0) {
            this.richtungsvektor.y *= -1;
        }
    }

    beachteRandInnen() {
        let domRectRandInnen = document.querySelector(`#${this.idRandInnen}`).getBoundingClientRect();
        this.sperrbereich = {
            unten: canvasHintergrund.height - domRectRandInnen.bottom,
            oben: canvasHintergrund.height - domRectRandInnen.top,
            links: domRectRandInnen.left,
            rechts: domRectRandInnen.right,
        }
        // Ist Punkt im Sperrbereich?
        let knotenIstImSperrbereich = (
            this.y > this.sperrbereich.unten &&
            this.y < this.sperrbereich.oben &&
            this.x > this.sperrbereich.links &&
            this.x < this.sperrbereich.rechts
        );
        if (knotenIstImSperrbereich) {
            // Nächsten Rand suchen
            let abstandRand = Math.abs(this.y - this.sperrbereich.unten);
            let naechsterRand = 'unten';
            if (Math.abs(this.y - this.sperrbereich.oben) < abstandRand) {
                abstandRand = Math.abs(this.y - this.sperrbereich.oben);
                naechsterRand = 'oben';
            };
            if (Math.abs(this.x - this.sperrbereich.links) < abstandRand) {
                abstandRand = Math.abs(this.x - this.sperrbereich.links);
                naechsterRand = 'links';
            };
            if (Math.abs(this.x - this.sperrbereich.rechts) < abstandRand) {
                abstandRand = Math.abs(this.x - this.sperrbereich.links);
                naechsterRand = 'rechts';
            };
            // Richtung umkehren und Schub geben
            if (naechsterRand == 'unten' || naechsterRand == 'oben') {
                this.y = this.sperrbereich[naechsterRand];
                this.richtungsvektor.y *= -1;
                // Schub
                // if (naechsterRand == 'oben' && this.richtungsvektor.y == 0) {this.richtungsvektor.y = Math.random() * this.geschwindigkeit;}
                // else if (naechsterRand == 'unten' && this.richtungsvektor.y == 0) {this.richtungsvektor.y = Math.random() * this.geschwindigkeit * -1; console.log(this.richtungsvektor.y)}
                // else {this.richtungsvektor.y *= -1;} // Richtung umkehren
            }
            if (naechsterRand == 'links' || naechsterRand == 'rechts') {
                this.richtungsvektor.x *= -1;
                this.x = this.sperrbereich[naechsterRand];
            }
            
        }
    }

    zeichneKnoten() {
        contextHintergrund.beginPath();
        contextHintergrund.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        contextHintergrund.closePath();
        contextHintergrund.fillStyle = this.farbe;
        contextHintergrund.fill();
    }

    erzeugeRichtungsvektor(vorgabe) {
        // X
        if (vorgabe.x != undefined) {
            this.richtungsvektor.x = vorgabe.x;
        } else {
            this.richtungsvektor.x = Math.cos(this.richtungswinkel) * this.geschwindigkeit;
        }
        // Y
        if (vorgabe.y != undefined) {
            this.richtungsvektor.y = vorgabe.y;
        } else {
            this.richtungsvektor.y = Math.sin(this.richtungswinkel) * this.geschwindigkeit;
        }
    }
}

function zeichneKanteNetz(knoten1, knoten2) {
    contextHintergrund.lineWidth = 0.1;
    contextHintergrund.strokeStyle = knoten1.farbe;
    contextHintergrund.beginPath();
    contextHintergrund.moveTo(knoten1.x, knoten1.y);
    contextHintergrund.lineTo(knoten2.x, knoten2.y);
    contextHintergrund.closePath();
    contextHintergrund.stroke();
}

let entfernungMaximal = 200;
function zeichneKanteCluster(knoten, arrKnoten) {
    for (let i = 0; i < arrKnoten.length; i++) {
        let entfernung = Math.sqrt(Math.pow(knoten.x - arrKnoten[i].x, 2) + Math.pow(knoten.y - arrKnoten[i].y, 2));
        let opacity = 1 - entfernung / entfernungMaximal;
        if (opacity > 0) {
            contextHintergrund.lineWidth = 0.1;
            contextHintergrund.strokeStyle = `rgb(200, 200, 200, ${opacity})`;
            contextHintergrund.beginPath();
            contextHintergrund.moveTo(knoten.x, knoten.y);
            contextHintergrund.lineTo(arrKnoten[i].x, arrKnoten[i].y);
            contextHintergrund.closePath();
            contextHintergrund.stroke();
        }
    }
}

function anpasseGrösse() {
    anzahlKnotenEbene = Math.floor(window.innerWidth/ 30);
    canvasHintergrund.width = window.innerWidth;
    canvasHintergrund.height = window.innerHeight;
}

// TEST
anpasseGrösse();
initiiereHintergrund();
window.requestAnimationFrame(animationsschleife);
// let knoten = new Knoten(1);
// knoten.zeichne();
