let tasks = [];
let viewDate = new Date();

// Fetch the external JSON file
async function loadTasks() {
    try {
        const response = await fetch('data.json');
        tasks = await response.json();
        render();
    } catch (error) {
        console.error("Could not load tasks:", error);
    }
}

function changeMonth(offset) {
    viewDate.setMonth(viewDate.getMonth() + offset);
    render();
}

function render() {
    const grid = document.getElementById('calendarGrid');
    const display = document.getElementById('monthYearDisplay');
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    display.innerText = `${monthNames[month]} ${year}`;
    
    grid.innerHTML = '';
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
        const div = document.createElement('div');
        div.className = 'day-header';
        div.innerText = day;
        grid.appendChild(div);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let x = 0; x < firstDay; x++) {
        const empty = document.createElement('div');
        empty.className = 'day';
        grid.appendChild(empty);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.innerHTML = `<div class="day-num">${i}</div>`;

        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        tasks.filter(t => t.date === dateKey).forEach(task => {
            const tDiv = document.createElement('div');
            tDiv.className = 'task';
            tDiv.innerText = task.name;
            dayDiv.appendChild(tDiv);
        });

        grid.appendChild(dayDiv);
    }
}

// Start the app
loadTasks();