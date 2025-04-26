// Get references to HTML elements
const greetButton = document.getElementById("greetButton");
const userNameInput = document.getElementById("userName");
const sealGreeting = document.getElementById("sealGreeting");

// Function to generate a unique number from the name input (hash function)
function getRizzScoreFromName(name) {
    // Simple hash function to convert a string into a unique number
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        const char = name.charCodeAt(i);
        hash = (hash << 5) - hash + char;
    }

    // Make sure the hash is positive
    hash = Math.abs(hash);

    // Return the score (we take hash modulo 100 to get a score between 0 and 100)
    return hash % 100 + 1;  // Ensure score is between 1 and 100
}

// Event listener for the button
greetButton.addEventListener("click", function() {
    const userName = userNameInput.value.trim(); // Get the user input and trim extra spaces

    if (userName === "") {
        sealGreeting.textContent = "yo, you gotta enter a name to see your seal rizz!";
        sealGreeting.style.color = "red"; // Optional: make error message red
        return; // Exit function if the input is empty
    }

    // Generate a unique "seal rizz meter" score based on the name
    const rizzScore = getRizzScoreFromName(userName);

    // Display a message based on the rizz score
    sealGreeting.textContent = `${userName}, your seal rizz meter is at ${rizzScore}! 🦭`;

    // Change color based on rizz score
    if (rizzScore > 80) {
        sealGreeting.style.color = "green"; // High rizz, green color
    } else if (rizzScore > 50) {
        sealGreeting.style.color = "orange"; // Medium rizz, orange color
    } else {
        sealGreeting.style.color = "red"; // Low rizz, red color
    }
});
