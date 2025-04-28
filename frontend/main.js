// Floating background of general medicines
async function createFloatingMedicines() {
    const bg = document.getElementById('medicines-bg');
    try {
        const res = await fetch('medicines.json');
        const data = await res.json();
        const medicines = data.medicines;
        // Randomly pick 18-25 medicines to float
        const count = Math.min(25, Math.max(18, Math.floor(window.innerWidth / 40)));
        for (let i = 0; i < count; i++) {
            const med = medicines[Math.floor(Math.random() * medicines.length)];
            const span = document.createElement('span');
            span.className = 'med-float';
            span.textContent = med;
            // Randomize horizontal position, size, speed, and delay
            const left = Math.random() * 90;
            const fontSize = 0.9 + Math.random() * 1.2;
            const duration = 18 + Math.random() * 16;
            const delay = Math.random() * 24;
            span.style.left = left + 'vw';
            span.style.fontSize = fontSize + 'rem';
            span.style.animationDuration = duration + 's';
            span.style.animationDelay = delay + 's';
            bg.appendChild(span);
        }
    } catch (e) {
        // Fail silently if medicines.json not found
    }
}
createFloatingMedicines();

// --- UI Helpers ---
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}
function showError(msg) {
    const box = document.getElementById('error-box');
    box.textContent = msg;
    box.style.display = 'block';
}
function hideError() {
    document.getElementById('error-box').style.display = 'none';
}
function showResults(effect, remedies, medicine) {
    const effectBox = document.getElementById('medicine-effect');
    const remediesBox = document.getElementById('remedies-list');
    effectBox.innerHTML = `<h2>Effect of <span style='color:#1976d2'>${medicine}</span>:</h2><p>${effect}</p>`;
    effectBox.style.display = 'block';
    if (remedies && remedies.length > 0) {
        remediesBox.innerHTML = `<h3>Closest Natural Remedies:</h3>` +
            remedies.map(remedy =>
                `<div class='remedy-card' style='animation:fadeIn 0.7s;'>
                    <strong>${remedy.name}</strong><br>${remedy.effect}<br>
                    <span style='font-size:0.95em;color:#555;'>Match Score: ${remedy.match_score.toFixed(2)}</span>
                </div>`
            ).join("");
    } else {
        remediesBox.innerHTML = `<p>No natural remedies found for this effect.</p>`;
    }
    remediesBox.style.display = 'block';
}
function hideResults() {
    document.getElementById('medicine-effect').style.display = 'none';
    document.getElementById('remedies-list').style.display = 'none';
}

// --- Medicine Suggestions ---
let cachedMedicines = null;
async function fetchMedicines() {
    if (cachedMedicines) return cachedMedicines;
    try {
        const response = await fetch("medicines.json");
        const data = await response.json();
        cachedMedicines = data.medicines;
        return cachedMedicines;
    } catch (error) {
        return [];
    }
}
async function showSuggestions() {
    const input = document.getElementById("medicine-input").value.toLowerCase();
    const suggestionsBox = document.getElementById("suggestions-box");
    if (input.length < 2) {
        suggestionsBox.innerHTML = "";
        suggestionsBox.style.display = 'none';
        return;
    }
    const medicines = await fetchMedicines();
    const filtered = medicines.filter(med => med.toLowerCase().includes(input));
    suggestionsBox.innerHTML = filtered
        .map(med => `<div class="suggestion-item" tabindex="0">${med}</div>`)
        .join("");
    suggestionsBox.style.display = filtered.length > 0 ? "block" : "none";
    // Keyboard and click support
    Array.from(suggestionsBox.children).forEach(item => {
        item.onclick = () => selectMedicine(item.textContent);
        item.onkeydown = e => {
            if (e.key === 'Enter') selectMedicine(item.textContent);
        };
    });
}
function selectMedicine(medicine) {
    document.getElementById("medicine-input").value = medicine;
    document.getElementById("suggestions-box").innerHTML = "";
    document.getElementById("suggestions-box").style.display = 'none';
    document.getElementById("medicine-input").focus();
}

// --- Fetch and Display Results ---
async function fetchMedicineEffect(medicine) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/get_medicine_effect?medicine_name=${encodeURIComponent(medicine)}`);
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
}
async function handleSearch() {
    hideError();
    hideResults();
    const medicine = document.getElementById("medicine-input").value.trim();
    if (medicine === "") {
        showError("Please enter a medicine name.");
        return;
    }
    showLoading(true);
    try {
        const data = await fetchMedicineEffect(medicine);
        showLoading(false);
        showResults(data.effect, data.remedies, medicine);
    } catch (error) {
        showLoading(false);
        showError(error.message || "Error fetching medicine details.");
    }
}

// --- Event Listeners ---
document.getElementById("search-button").addEventListener("click", handleSearch);
document.getElementById("medicine-input").addEventListener("keyup", e => {
    showSuggestions();
    if (e.key === 'Enter') handleSearch();
});
document.addEventListener("click", e => {
    if (!document.getElementById("suggestions-box").contains(e.target) && e.target.id !== "medicine-input") {
        document.getElementById("suggestions-box").style.display = 'none';
    }
});
// Optional: fadeIn animation for remedy cards
const style = document.createElement('style');
style.innerHTML = `@keyframes fadeIn { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: none; } }`;
document.head.appendChild(style); 