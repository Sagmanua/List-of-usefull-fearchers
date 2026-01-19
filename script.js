const deck = document.getElementById("deck");
const typeFilter = document.getElementById("typeFilter");
const priorityFilter = document.getElementById("priorityFilter");
let allNotes = [];

async function loadNotes() {
    const response = await fetch('data.json');
    allNotes = await response.json();
    displayNotes(allNotes);
}

function getPriorityClass(priority) {
    switch(priority) {
        case "Vital": return "vital";
        case "High Utility": return "high-utility";
        case "Situational": return "situational";
        case "Marginal": return "marginal";
        case "Useless": return "useless";
        default: return "";
    }
}

function displayNotes(notes) {
    deck.innerHTML = "";
    notes.forEach(note => {
        const pClass = getPriorityClass(note.priority);
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="priority-badge ${pClass}">${note.priority || 'Unrated'}</div>
            <div class="type-label">${note.type}</div>
            <h3>${note.title}</h3>
            <p>${note.description || ""}</p>
            <a class="btn" href="${note.link}" target="_blank">Open Link</a>
        `;
        deck.appendChild(card);
    });
}

function applyFilters() {
    const typeVal = typeFilter.value;
    const priorityVal = priorityFilter.value;

    const filtered = allNotes.filter(note => {
        const matchesType = typeVal === "all" || note.type === typeVal;
        const matchesPriority = priorityVal === "all" || note.priority === priorityVal;
        return matchesType && matchesPriority;
    });

    displayNotes(filtered);
}

typeFilter.addEventListener("change", applyFilters);
priorityFilter.addEventListener("change", applyFilters);

loadNotes();