'use strict'

// Optionen für Knoten
let anzahlKnotenEbene = 50;
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

let tid;
window.addEventListener('resize', () => {
    canvasHintergrund.width = window.innerWidth;
    canvasHintergrund.height = window.innerHeight;
    // ---
    let summeVorher = 0;
    arrKnoten.forEach(kn => {summeVorher += kn.richtungsvektor.y;});
    console.log('Durchschnitt Vektor vorher:', summeVorher / arrKnoten.length);
    // ---
    initiiereHintergrund();
    // ---
    let summeNacher = 0;
    arrKnoten.forEach(kn => {summeNacher += kn.richtungsvektor.y;});
    console.log('Durchschnitt Vektor nachher:', summeNacher / arrKnoten.length);
    // ---
})

function initiiereHintergrund() {
    arrKnoten = [];
    for (let i=0; i < anzahlKnotenEbene; i++) {
        arrKnoten.push(new Knoten(1, 'titel'));
    }
    for (let i=0; i < anzahlKnotenEbene; i++) {
        arrKnoten.push(new Knoten(2, 'titel'));
    }
    for (let i=0; i < anzahlKnotenEbene; i++) {
        arrKnoten.push(new Knoten(3, 'titel'));
    }
}

function animationsschleife() {
    window.requestAnimationFrame(animationsschleife);
    contextHintergrund.clearRect(0, 0, canvasHintergrund.width, canvasHintergrund.height);
    for (let i = 0; i < arrKnoten.length; i++) {
        let knoten = arrKnoten[i];
        knoten.aktualisiere();
        knoten.zeichneKnoten();
        if (i > 0) {zeichneKante(knoten, arrKnoten[i-1]);}
        if (i > 1) {zeichneKante(knoten, arrKnoten[i-2]);}
        if (i < arrKnoten.length - 2) {zeichneKante(knoten, arrKnoten[i+1]);}
        if (i > arrKnoten.length - 1) {zeichneKante(knoten, arrKnoten[i+2]);}
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
        this.richtungsvektor = {
            // x: Math.cos(this.richtungswinkel) * this.geschwindigkeit,
            x: 0,
            y: Math.sin(this.richtungswinkel) * this.geschwindigkeit,
            // y: 0,
        }
        // Drehung um Längsachse
        if (canvasHintergrund.width > canvasHintergrund.height) {
            this.richtungsvektor.x = 0;
            this.richtungsvektor.y = Math.sin(this.richtungswinkel) * this.geschwindigkeit;
        } else {
            this.richtungsvektor.x = Math.cos(this.richtungswinkel) * this.geschwindigkeit;
            this.richtungsvektor.y = 0;
        }
        // Rand Innen
        this.idRandInnen = idRandInnen;
        
        // Funktionen
        this.aktualisiere = this.aktualisiere.bind(this);
        this.beachteRandAußen = this.beachteRandAußen.bind(this);
        this.beachteRandInnen = this.beachteRandInnen.bind(this);
        this.zeichneKnoten = this.zeichneKnoten.bind(this);
    }
    
    aktualisiere() {
        this.beachteRandAußen();
        this.beachteRandInnen();
        this.x += this.richtungsvektor.x * this.beschleunigungsFaktor;
        this.y += this.richtungsvektor.y * this.beschleunigungsFaktor;
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
            // Richtung umkehren
            if (naechsterRand == 'unten' || naechsterRand == 'oben') {
                this.richtungsvektor.y *= -1;
                this.y = this.sperrbereich[naechsterRand];
            }
            if (naechsterRand == 'links' || naechsterRand == 'rechts') {
                this.richtungsvektor.x *= -1;
                this.x = this.sperrbereich[naechsterRand];
            }
            // Beschleunigen
            this.beschleunigungsFaktor = 2;
        } else {
            this.beschleunigungsFaktor = 1;
        }
    }

    zeichneKnoten() {
        contextHintergrund.beginPath();
        contextHintergrund.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        contextHintergrund.closePath();
        contextHintergrund.fillStyle = this.farbe;
        contextHintergrund.fill();
    }
}

function zeichneKante(knoten1, knoten2) {
    contextHintergrund.lineWidth = 0.1;
    contextHintergrund.strokeStyle = knoten1.farbe;
    contextHintergrund.beginPath();
    contextHintergrund.moveTo(knoten1.x, knoten1.y);
    contextHintergrund.lineTo(knoten2.x, knoten2.y);
    contextHintergrund.closePath();
    contextHintergrund.stroke();
}

function anpasseGrösse() {
    canvasHintergrund.width = window.innerWidth;
    canvasHintergrund.height = window.innerHeight;
}

// TEST
anpasseGrösse();
initiiereHintergrund();
window.requestAnimationFrame(animationsschleife);
// let knoten = new Knoten(1);
// knoten.zeichne();
