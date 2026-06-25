function stylize(input) {
    let parts = input.split('-');

    let capitalizedParts = parts.map(part => {
        if (part.toLowerCase().includes("gpt")) {
            return part.toUpperCase();
        }
        return part.charAt(0).toUpperCase() + part.slice(1);
    });

    return capitalizedParts.join(' ');
}

// ==========================
// OLLAMA MODEL FETCH
// ==========================
fetch('http://localhost:11434/api/tags')
    .then(response => response.json())
    .then(data => {
        const dropdown = document.getElementById('model');
        const models = data.models || [];

        dropdown.innerHTML = "";

        if (models.length === 0) {
            const option = document.createElement('option');
            option.textContent = "no models found 💀";
            option.value = "";
            dropdown.appendChild(option);
            dropdown.disabled = true;
            return;
        }

        models.forEach(model => {
            const option = document.createElement('option');

            // ollama uses "name"
            const modelName = model.name;

            option.value = modelName;
            option.textContent = stylize(modelName);

            dropdown.appendChild(option);
        });

        dropdown.disabled = false;

        // auto-select first model
        dropdown.value = models[0].name;
    })
    .catch(error => {
        console.error('Error fetching models:', error);

        const dropdown = document.getElementById('model');
        dropdown.innerHTML = "";

        const option = document.createElement('option');
        option.textContent = "failed to load models 💀";
        option.value = "";

        dropdown.appendChild(option);
        dropdown.disabled = true;
    });

// ==========================
// KONAMI EASTER EGG
// ==========================
let konami = false;

const easterEgg = new Konami(() => konamilol());

function konamilol() {
    if (konami) {
        console.log("umm you can only do it once... but okay");
        return;
    }

    konami = true;
    console.log("you got it");

    let items = [
        "Super threatening",
        "Extremely threatening",
        "UwUify",
        "EVIL AND INTIMIDATING HORSE MODE",
        "Manipulative"
    ];

    let dropdown = document.getElementById('style');

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        dropdown.appendChild(option);
    });

    items = ["Pirate", "Toki Pona"];
    dropdown = document.getElementById('languages');

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        dropdown.appendChild(option);
    });
}

// ==========================
// FORM SUBMIT (UNCHANGED)
// ==========================
document.getElementById('rulesForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const selectedRules = Array.from(document.querySelectorAll('input[name="rule"]:checked'))
        .map(checkbox => {
            const rule = checkbox.value;
            const punishmentSelect = checkbox.parentElement.querySelector('.punishment-select');
            const punishment = punishmentSelect ? punishmentSelect.value : 'No punishment specified';
            return `${rule} | Punishment: ${punishment}`;
        });

    if (selectedRules.length === 0) {
        alert('Please select at least one rule.');
        return;
    }

    const model = document.getElementById('model').value;
    const selectedLanguage = document.getElementById('languages').value || 'English';
    const selectedStyle = document.getElementById('style').value || 'Formal';

    const prompt = `Generate the following Discord Server rules in ${selectedLanguage}, using the ${selectedStyle} style, while adding specific text inside this point explaining what it means: Follow Discord's Terms of Service (link to https://discord.com/terms using markdown as well, punishment is a ban), ${selectedRules.join(', ')}`;

    console.log(prompt);

    const outputDiv = document.getElementById('output');
    const loaderContainer = document.createElement('div');
    loaderContainer.className = 'loader-container';

    const loader = document.createElement('div');
    loader.className = 'loader';

    loaderContainer.appendChild(loader);
    outputDiv.innerHTML = "";
    outputDiv.appendChild(loaderContainer);
    outputDiv.removeAttribute('hidden');

    fetch("http://localhost:11434/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: "system",
                    content: `You are an AI specifically designed to generate rules for Discord servers. You must be clear, concise, and structured. Output must be in ${selectedLanguage}.`
                },
                {
                    role: "system",
                    content: `You must speak in the ${selectedStyle.toLowerCase()} style, always.`
                },
                {
                    role: "system",
                    content: "List rules in order. Include punishments clearly. No extra fluff."
                },
                {
                    role: "user",
                    content: prompt
                }
            ]
        })
    })
    .then(response => response.json())
    .then(data => {
        const result = data.choices[0].message.content;

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy Markdown';

        copyButton.addEventListener('click', function() {
            navigator.clipboard.writeText(result)
                .then(() => alert('Markdown copied!'))
                .catch(err => console.error('Copy error:', err));
        });

        outputDiv.innerHTML = "";
        outputDiv.appendChild(copyButton);

        const markdownContent = document.createElement('div');
        markdownContent.innerHTML = marked.parse(result);
        outputDiv.appendChild(markdownContent);
    })
    .catch(error => {
        console.error('Error:', error);
        outputDiv.textContent = 'error generating rules 💀';
    });
});

// ==========================
// DARK MODE
// ==========================
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
}

document.getElementById('darkModeToggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});

// dont skibidi anyone.
