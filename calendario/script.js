let tasks = [];
let viewDate = new Date();

const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
];
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function changeMonth(offset) {
    viewDate.setMonth(viewDate.getMonth() + offset);
    render();
}

function render() {
    const grid = document.getElementById("calendarGrid");
    const display = document.getElementById("monthYearDisplay");

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    display.textContent = `${monthNames[month]} ${year}`;
    grid.innerHTML = "";

    weekDays.forEach(day => grid.appendChild(makeDiv("day-header", day)));

    grid.append(...Array(firstDayIndex).fill(makeDiv("day")));

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
        const dayEl = makeDiv("day", `<div class="day-num">${day}</div>`);

        tasks
            .filter(t => t.date === dateKey)
            .forEach(t => dayEl.appendChild(makeDiv("task", t.name)));

        grid.appendChild(dayEl);
    }
}

function makeDiv(className, html = "") {
    const d = document.createElement("div");
    d.className = className;
    d.innerHTML = html;
    return d;
}

async function loadTasks() {
    try {
        const response = await fetch('data.json');
        tasks = await response.json();

        const extra = JSON.parse(localStorage.getItem("extraTasks")) || [];
        tasks = [...tasks, ...extra];

        render();
    } catch (error) {
        console.error("Could not load tasks:", error);
    }
}

loadTasks();
