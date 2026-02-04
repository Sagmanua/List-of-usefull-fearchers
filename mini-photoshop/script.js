const lienzo = document.getElementById("canvas");
const contexto = lienzo.getContext("2d");

lienzo.width = 512;
lienzo.height = 512;

contexto.lineCap = "round";

let dibujando = false;
let modo = "brush";
let startX = 0;
let startY = 0;
let canvasHistory = [];
let historyStep = -1;

// Save history for undo/redo
function guardarHistoria() {
    historyStep++;
    canvasHistory = canvasHistory.slice(0, historyStep);
    canvasHistory.push(lienzo.toDataURL());
}

// Load history step
function restaurarHistoria(step) {
    const img = new Image();
    img.src = canvasHistory[step];
    img.onload = () => {
        contexto.clearRect(0, 0, lienzo.width, lienzo.height);
        contexto.drawImage(img, 0, 0, lienzo.width, lienzo.height);
    };
}

// Upload image
document.getElementById("upload").addEventListener("change", function(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        cargarImagen(event.target.result);
    };
    reader.readAsDataURL(archivo);
});

function cargarImagen(src) {
    const imagen = new Image();
    imagen.onload = () => {
        contexto.clearRect(0, 0, lienzo.width, lienzo.height);
        contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
        guardarHistoria();
    };
    imagen.src = src;
}

// Mouse events
lienzo.addEventListener("mousedown", e => {
    dibujando = true;
    startX = e.offsetX;
    startY = e.offsetY;
    if (modo === "text") {
        const texto = prompt("Enter text:");
        if (texto) {
            contexto.fillStyle = document.getElementById("color").value;
            contexto.font = "20px Arial";
            contexto.fillText(texto, startX, startY);
            guardarHistoria();
        }
        dibujando = false;
    }
});
lienzo.addEventListener("mouseup", e => {
    if (dibujando) {
        if (modo === "rect") {
            const width = e.offsetX - startX;
            const height = e.offsetY - startY;
            contexto.strokeStyle = document.getElementById("color").value;
            contexto.lineWidth = document.getElementById("size").value;
            contexto.strokeRect(startX, startY, width, height);
        }
        if (modo === "circle") {
            const radius = Math.hypot(e.offsetX - startX, e.offsetY - startY);
            contexto.strokeStyle = document.getElementById("color").value;
            contexto.lineWidth = document.getElementById("size").value;
            contexto.beginPath();
            contexto.arc(startX, startY, radius, 0, Math.PI * 2);
            contexto.stroke();
        }
        guardarHistoria();
    }
    dibujando = false;
    contexto.beginPath();
});
lienzo.addEventListener("mouseleave", () => {
    dibujando = false;
    contexto.beginPath();
});
lienzo.addEventListener("mousemove", dibujar);

function dibujar(e) {
    if (!dibujando) return;
    if (modo !== "brush" && modo !== "eraser") return;

    const x = e.offsetX;
    const y = e.offsetY;

    contexto.strokeStyle = document.getElementById("color").value;
    contexto.lineWidth = document.getElementById("size").value;

    if (modo === "eraser") {
        contexto.globalCompositeOperation = "destination-out";
    } else {
        contexto.globalCompositeOperation = "source-over";
    }

    contexto.lineTo(x, y);
    contexto.stroke();
    contexto.beginPath();
    contexto.moveTo(x, y);
}

// Tools
document.getElementById("brush").onclick = () => modo = "brush";
document.getElementById("eraser").onclick = () => modo = "eraser";
document.getElementById("text").onclick = () => modo = "text";
document.getElementById("rect").onclick = () => modo = "rect";
document.getElementById("circle").onclick = () => modo = "circle";
document.getElementById("clear").onclick = () => {
    contexto.clearRect(0, 0, lienzo.width, lienzo.height);
    guardarHistoria();
};

// Filters
document.getElementById("filter").addEventListener("change", function() {
    const imgData = contexto.getImageData(0, 0, lienzo.width, lienzo.height);
    const data = imgData.data;
    const filter = this.value;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i], g = data[i+1], b = data[i+2];

        if (filter === "grayscale") {
            const avg = (r+g+b)/3;
            data[i] = data[i+1] = data[i+2] = avg;
        }
        if (filter === "invert") {
            data[i] = 255 - r;
            data[i+1] = 255 - g;
            data[i+2] = 255 - b;
        }
        if (filter === "brightness") {
            data[i] = Math.min(r*1.2, 255);
            data[i+1] = Math.min(g*1.2, 255);
            data[i+2] = Math.min(b*1.2, 255);
        }
    }

    contexto.putImageData(imgData, 0, 0);
    guardarHistoria();
});

// Undo / Redo
document.getElementById("undo").onclick = () => {
    if (historyStep > 0) {
        historyStep--;
        restaurarHistoria(historyStep);
    }
};
document.getElementById("redo").onclick = () => {
    if (historyStep < canvasHistory.length - 1) {
        historyStep++;
        restaurarHistoria(historyStep);
    }
};

// Save
document.getElementById("save").onclick = () => {
    const enlace = document.createElement("a");
    enlace.download = "canvas.jpg";
    enlace.href = lienzo.toDataURL("image/jpeg", 0.95);
    enlace.click();
};

// Initialize history
guardarHistoria();
