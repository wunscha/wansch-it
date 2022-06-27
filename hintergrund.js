'use strict'

// Optionen für Knoten
let anzahlKnotenEbene = 50;
let optionenKnoten = {
    // Ebene 1
    1:  {
            radius: 0.5,
            bewegungsradius: 100,
            geschwindigkeit: 0.3,
            farbe: 'rgb(200, 200, 200, 0.5)',
        },
    2: {
            radius: 1,
            bewegungsradius: 200,
            geschwindigkeit: 0.7,
            farbe: 'rgb(200, 200, 200, 0.75)',
        },
    3:  {
            radius: 1.5,
            bewegungsradius: 300,
            geschwindigkeit: 1.0,
            farbe: 'rgb(200, 200, 200, 1)',
        },
};

let canvasHintergrund = document.querySelector('#canvas-hintergrund');
let contextHintergrund = canvasHintergrund.getContext('2d');
let arrKnoten = [];
let maxEntfernung = 50;

function initiiereHintergrund() {
    for (let i=0; i < anzahlKnotenEbene; i++) {
        arrKnoten.push(new Knoten(1));
    }
    for (let i=0; i < anzahlKnotenEbene; i++) {
        arrKnoten.push(new Knoten(2));
    }
    for (let i=0; i < anzahlKnotenEbene; i++) {
        arrKnoten.push(new Knoten(3));
    }
    window.requestAnimationFrame(animationsschleife);
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
    constructor(ebene) {
        // Optionen übernehmen
        Object.assign(this, optionenKnoten[ebene]);
        this.ebene = ebene;
        this.x = this.xDefault = Math.random() * canvasHintergrund.width;
        this.y = this.yDefault = Math.random() * canvasHintergrund.height;
        this.richtungswinkel = Math.floor(Math.random() * 360);
        this.richtungsvektor = {
            x: Math.cos(this.richtungswinkel) * this.geschwindigkeit,
            y: Math.sin(this.richtungswinkel) * this.geschwindigkeit,
        }
        this.inkrimentGeschwindigkeit = 0.1;
        // Funktionen
        this.aktualisiere = this.aktualisiere.bind(this);
        this.beachteBewegungsradius = this.beachteBewegungsradius.bind(this);
        this.zeichneKnoten = this.zeichneKnoten.bind(this);
    }
    
    aktualisiere() {
        this.beachteBewegungsradius();
        if (this.geschwindigkeit == 100) {this.inkrementGeschwindigkeit = -0.1}
        if (this.geschwindigkeit == 0.1) {this.inkrementGeschwindigkeit = 0.1;}
        this.geschwindigkeit += this.inkrementGeschwindigkeit;
        this.x += this.richtungsvektor.x;
        this.y += this.richtungsvektor.y;
    }

    beachteBewegungsradius() {
        // Bande X-Richtung
        if (this.x >= canvasHintergrund.width || this.x <= 0) {
            this.richtungsvektor.x *= -1;
        }
        // Bande Y-Richtung
        if (this.y > canvasHintergrund.height || this.y <= 0) {
            this.richtungsvektor.y *= -1;
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
// let knoten = new Knoten(1);
// knoten.zeichne();
