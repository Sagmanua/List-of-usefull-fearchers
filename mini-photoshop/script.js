const lienzo = document.getElementById("canvas");
const contexto = lienzo.getContext("2d");

// Set initial canvas size
lienzo.width = 800;
lienzo.height = 500;
contexto.lineCap = "round";
contexto.lineJoin = "round";

let dibujando = false;
let modo = "brush";
let startX = 0;
let startY = 0;
let canvasHistory = [];
let historyStep = -1;

// --- History Logic ---
function guardarHistoria() {
    // Remove future steps if we are in the middle of an undo chain
    if (historyStep < canvasHistory.length - 1) {
        canvasHistory = canvasHistory.slice(0, historyStep + 1);
    }
    canvasHistory.push(lienzo.toDataURL());
    historyStep++;
}

function restaurarHistoria(step) {
    const img = new Image();
    img.src = canvasHistory[step];
    img.onload = () => {
        contexto.clearRect(0, 0, lienzo.width, lienzo.height);
        contexto.drawImage(img, 0, 0);
    };
}

// --- Mouse Events ---
lienzo.addEventListener("mousedown", e => {
    dibujando = true;
    startX = e.offsetX;
    startY = e.offsetY;
    
    contexto.beginPath(); // Start a new path for drawing
    contexto.moveTo(startX, startY);

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

lienzo.addEventListener("mousemove", (e) => {
    if (!dibujando) return;
    
    if (modo === "brush" || modo === "eraser") {
        contexto.strokeStyle = modo === "eraser" ? "#FFFFFF" : document.getElementById("color").value;
        contexto.lineWidth = document.getElementById("size").value;
        contexto.globalCompositeOperation = "source-over"; // Simple way for beginners
        
        // If erasing on a transparent canvas, use destination-out
        if (modo === "eraser") {
            contexto.strokeStyle = "white"; // Or use destination-out logic
        }

        contexto.lineTo(e.offsetX, e.offsetY);
        contexto.stroke();
    }
});

lienzo.addEventListener("mouseup", e => {
    if (!dibujando) return;

    contexto.strokeStyle = document.getElementById("color").value;
    contexto.lineWidth = document.getElementById("size").value;

    if (modo === "rect") {
        contexto.strokeRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
    } else if (modo === "circle") {
        const radius = Math.hypot(e.offsetX - startX, e.offsetY - startY);
        contexto.beginPath();
        contexto.arc(startX, startY, radius, 0, Math.PI * 2);
        contexto.stroke();
    }

    dibujando = false;
    guardarHistoria();
});

// --- Tools & Filters ---
document.getElementById("brush").onclick = () => modo = "brush";
document.getElementById("eraser").onclick = () => modo = "eraser";
document.getElementById("text").onclick = () => modo = "text";
document.getElementById("rect").onclick = () => modo = "rect";
document.getElementById("circle").onclick = () => modo = "circle";

document.getElementById("clear").onclick = () => {
    contexto.clearRect(0, 0, lienzo.width, lienzo.height);
    guardarHistoria();
};

document.getElementById("upload").addEventListener("change", function(e) {
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            contexto.clearRect(0, 0, lienzo.width, lienzo.height);
            contexto.drawImage(img, 0, 0, lienzo.width, lienzo.height);
            guardarHistoria();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
});

// Filters (Optimized)
document.getElementById("filter").addEventListener("change", function() {
    if (this.value === "none") return;
    const imgData = contexto.getImageData(0, 0, lienzo.width, lienzo.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        if (this.value === "grayscale") {
            const avg = (data[i] + data[i+1] + data[i+2]) / 3;
            data[i] = data[i+1] = data[i+2] = avg;
        } else if (this.value === "invert") {
            data[i] = 255 - data[i];
            data[i+1] = 255 - data[i+1];
            data[i+2] = 255 - data[i+2];
        } else if (this.value === "brightness") {
            data[i] = Math.min(data[i] * 1.2, 255);
            data[i+1] = Math.min(data[i+1] * 1.2, 255);
            data[i+2] = Math.min(data[i+2] * 1.2, 255);
        }
    }
    contexto.putImageData(imgData, 0, 0);
    guardarHistoria();
});

// Undo/Redo Buttons
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

document.getElementById("save").onclick = () => {
    const link = document.createElement("a");
    link.download = "my-drawing.png";
    link.href = lienzo.toDataURL();
    link.click();
};

// Start history
guardarHistoria();