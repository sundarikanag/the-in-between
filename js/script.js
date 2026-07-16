

const entryForm = document.getElementById("entryForm");
const journalGrid = document.getElementById("journalGrid");
const reflectionInput = document.getElementById("reflection");
const characterCount = document.getElementById("characterCount");
const formMessage = document.getElementById("formMessage");

const entryCount = document.getElementById("entryCount");
const favoriteCount = document.getElementById("favoriteCount");
const focusedCount = document.getElementById("focusedCount");

const latestEntryNumber = document.getElementById("latestEntryNumber");
const latestEntryTitle = document.getElementById("latestEntryTitle");
const latestEntryLocation = document.getElementById(
    "latestEntryLocation"
);

let memories = JSON.parse(
    localStorage.getItem("inBetweenMemories")
) || [];

function saveMemories() {
    localStorage.setItem(
        "inBetweenMemories",
        JSON.stringify(memories)
    );
}

function escapeHTML(value) {
    const temporaryElement = document.createElement("div");
    temporaryElement.textContent = value;
    return temporaryElement.innerHTML;
}

function formatDate(dateValue) {
    if (!dateValue) {
        return "date unknown";
    }

    const date = new Date(`${dateValue}T00:00:00`);

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
}

function getEntryNumber(index) {
    return String(memories.length - index).padStart(2, "0");
}

function createDetail(label, value) {
    if (!value) {
        return "";
    }

    return `
        <div class="memory-detail">
            <span>${escapeHTML(label)}</span>
            <p>${escapeHTML(value)}</p>
        </div>
    `;
}

function updateStats() {
    entryCount.textContent = memories.length;

    favoriteCount.textContent = memories.filter(
        (memory) => memory.favorite
    ).length;

    focusedCount.textContent = memories.filter(
        (memory) => memory.mood === "focused"
    ).length;
}

function updateLatestMemory() {
    if (memories.length === 0) {
        latestEntryNumber.textContent = "entry no. 01";
        latestEntryTitle.textContent =
            "forgot why i opened my laptop.";
        latestEntryLocation.textContent =
            "stayed anyway.";

        return;
    }

    const newestMemory = memories[0];

    latestEntryNumber.textContent = `entry no. ${String(
        memories.length
    ).padStart(2, "0")}`;

    latestEntryTitle.textContent = newestMemory.cafeName;

    latestEntryLocation.textContent =
        `${newestMemory.location} · ${formatDate(
            newestMemory.visitDate
        )}`;
}

function displayMemories() {
    journalGrid.innerHTML = "";

    if (memories.length === 0) {
        journalGrid.innerHTML = `
            <div class="empty-journal" id="emptyJournal">
                <p class="empty-number">00</p>

                <h3>
                    Nothing has been written here yet.
                </h3>

                <p>
                    Add the first place, drink, thought, or small
                    discovery you want to remember.
                </p>

                <a href="#new-entry">
                    begin the journal →
                </a>
            </div>
        `;

        updateStats();
        updateLatestMemory();
        return;
    }

    memories.forEach((memory, index) => {
        const memoryCard = document.createElement("article");
        memoryCard.className = "memory-card";

        const favoriteTag = memory.favorite
            ? `<span class="memory-tag">a place I’d return to</span>`
            : "";

        const moodTag = memory.mood
            ? `<span class="memory-tag">${escapeHTML(
                memory.mood
            )}</span>`
            : "";

        memoryCard.innerHTML = `
            <p class="memory-card-number">
                entry no. ${getEntryNumber(index)}
            </p>

            <h3>${escapeHTML(memory.cafeName)}</h3>

            <p class="memory-location">
                ${escapeHTML(memory.location)} ·
                ${formatDate(memory.visitDate)}
            </p>

            <div class="memory-details">
                ${createDetail("what kept me company", memory.drink)}
                ${createDetail("what brought me here", memory.workedOn)}
                ${createDetail("where I sat", memory.seat)}
                ${createDetail("what filled the room", memory.soundtrack)}
            </div>

            <p class="memory-reflection">
                “${escapeHTML(memory.reflection)}”
            </p>

            ${
                memory.discovery
                    ? `
                        <p class="memory-discovery">
                            <strong>a tiny thing worth remembering:</strong>
                            ${escapeHTML(memory.discovery)}
                        </p>
                    `
                    : ""
            }

            <div class="memory-card-footer">
                <div class="memory-tags">
                    ${moodTag}
                    ${favoriteTag}

                    <span class="memory-tag">
                        would return: ${escapeHTML(
                            memory.returnAnswer
                        )}
                    </span>
                </div>

                <button
                    type="button"
                    class="delete-entry"
                    data-id="${memory.id}"
                >
                    remove
                </button>
            </div>
        `;

        journalGrid.appendChild(memoryCard);
    });

    updateStats();
    updateLatestMemory();
}

reflectionInput.addEventListener("input", () => {
    characterCount.textContent =
        `${reflectionInput.value.length} / 500`;
});

entryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const newMemory = {
        id: Date.now(),
        cafeName: document
            .getElementById("cafeName")
            .value
            .trim(),

        location: document
            .getElementById("location")
            .value
            .trim(),

        visitDate: document.getElementById("visitDate").value,

        seat: document
            .getElementById("seat")
            .value
            .trim(),

        drink: document
            .getElementById("drink")
            .value
            .trim(),

        workedOn: document
            .getElementById("workedOn")
            .value
            .trim(),

        soundtrack: document
            .getElementById("soundtrack")
            .value
            .trim(),

        mood: document.getElementById("mood").value,

        discovery: document
            .getElementById("discovery")
            .value
            .trim(),

        reflection: reflectionInput.value.trim(),

        favorite: document.getElementById("favorite").checked,

        returnAnswer:
            document.getElementById("returnAnswer").value
    };

    memories.unshift(newMemory);

    saveMemories();
    displayMemories();

    entryForm.reset();
    characterCount.textContent = "0 / 500";

    formMessage.textContent =
        "This moment has been added to your journal.";

    setTimeout(() => {
        formMessage.textContent = "";
    }, 3500);

    document.getElementById("journal").scrollIntoView({
        behavior: "smooth"
    });
});

journalGrid.addEventListener("click", (event) => {
    if (!event.target.classList.contains("delete-entry")) {
        return;
    }

    const memoryId = Number(event.target.dataset.id);

    const shouldDelete = window.confirm(
        "Remove this memory from your journal?"
    );

    if (!shouldDelete) {
        return;
    }

    memories = memories.filter(
        (memory) => memory.id !== memoryId
    );

    saveMemories();
    displayMemories();
});

displayMemories();