const API_URL = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const searchResultsContainer = document.getElementById("search-results");
const personalDictionaryContainer =
  document.getElementById("personalDictionary");

const displayErrorMessage = (message) => {
  const errorMessageElement = document.createElement("p");
  errorMessageElement.textContent = message;
  searchResultsContainer.innerHTML = ""; // Clear previous content
  searchResultsContainer.appendChild(errorMessageElement);
};

// Function to handle adding word to local storage when the "Add to My Vocabulary" button is clicked
const handleAddToDictionary = (word, definitionsByPartOfSpeech) => {
  // Call the function to add word data to local storage
  addToLocalStorage(word, definitionsByPartOfSpeech);

  // Display entries from local storage
  displayEntriesFromLocalStorage();

  // Feedback to the user that the word has been added
  alert(`"${word}" has been added to your vocabulary!`);
};

const searchWord = async () => {
  const searchTerm = searchInput.value.trim();
  //Check if search input is empty
  if (!searchTerm) {
    alert("Please enter a word to search.");
    return;
  }

  searchButton.disabled = true;
  searchResultsContainer.innerText = "Fetching word...";

  try {
    const response = await fetch(`${API_URL}${searchTerm}`);

    if (!response.ok) {
      let errorMessage = "";
      if (response.status === 404) {
        const errorData = await response.json();
        errorMessage = `${errorData.title}: ${errorData.message} ${errorData.resolution}`;
        console.error(
          `${errorData.title}: The word "${searchTerm}" is not available on this API.`
        );
      } else {
        errorMessage = "Failed to fetch data";
      }
      displayErrorMessage(errorMessage);
      return;
    }

    const data = await response.json();
    searchResultsContainer.innerHTML = ""; // Clear previous content

    // Initialize an object to store definitions grouped by part of speech
    const definitionsByPartOfSpeech = {};

    // Check if results exist
    if (data && data.length > 0) {
      // Iterate over each meaning of the word
      data[0].meanings.forEach((meaning) => {
        // Access the part of speech for the meaning
        const partOfSpeech = meaning.partOfSpeech;

        // Access the first definition for the meaning
        const firstDefinition = meaning.definitions[0].definition;

        // Check if the part of speech already exists in the definitions object
        if (!definitionsByPartOfSpeech[partOfSpeech]) {
          // If not, initialize an empty array for it
          definitionsByPartOfSpeech[partOfSpeech] = [];
        }
        // Push the first definition to the array corresponding to its part of speech
        definitionsByPartOfSpeech[partOfSpeech].push(firstDefinition);
      });

      // Create HTML element for the card
      const cardElement = document.createElement("div");
      cardElement.className = "bg-gray-200 p-4 rounded-xl shadow-2xl mb-4";

      // Add word to the card
      const wordElement = document.createElement("h2");
      wordElement.id = "word";
      wordElement.className = "text-3xl font-bold mb-2";
      wordElement.textContent = data[0].word;
      cardElement.appendChild(wordElement);

      // Iterate over each part of speech and its definitions
      Object.keys(definitionsByPartOfSpeech).forEach((partOfSpeech) => {
        // Add part of speech to the card
        const partOfSpeechElement = document.createElement("div");
        partOfSpeechElement.className = "py-2";
        partOfSpeechElement.innerHTML = `<p class="italic font-semibold block mb-1 text-base">${partOfSpeech}:</p>`;

        // Add meanings to the part of speech
        const definitionsList = document.createElement("ul");
        definitionsList.className = "font-light";
        definitionsByPartOfSpeech[partOfSpeech].forEach((definition) => {
          const definitionItem = document.createElement("li");
          definitionItem.className = "pb-1 list-disc list-inside";
          definitionItem.textContent = definition;
          definitionsList.appendChild(definitionItem);
        });

        partOfSpeechElement.appendChild(definitionsList);
        cardElement.appendChild(partOfSpeechElement);
      });

      const addToDictionary = document.createElement("button");
      addToDictionary.type = "button";
      addToDictionary.id = "add-to-dictionary";
      addToDictionary.className =
        "bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-xl my-2";
      addToDictionary.textContent = "Add to My Vocabulary";
      cardElement.appendChild(addToDictionary);

      // Append the card to the search results container
      searchResultsContainer.appendChild(cardElement);

      // Event listener to handle adding word to local storage when the "Add to My Vocabulary" button is clicked
      addToDictionary.addEventListener("click", () => {
        // Get the word and its definitions from the search results
        const word = document.querySelector("#word").textContent;
        // Call the function to add word data to local storage
        handleAddToDictionary(word, definitionsByPartOfSpeech);
      });
    } else {
      displayErrorMessage("No results found.");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    displayErrorMessage(`Error fetching data: ${error}`);
  } finally {
    searchButton.disabled = false;
    searchInput.value = "";
  }
};

// Function to handle adding word data to local storage
const addToLocalStorage = (word, definitionsByPartOfSpeech) => {
  // Check if the word already exists in the personal dictionary
  const personalDictionary =
    JSON.parse(localStorage.getItem("personalDictionary")) || [];
  const existingEntryIndex = personalDictionary.findIndex(
    (entry) => entry.word === word
  );

  if (existingEntryIndex === -1) {
    // If the word doesn't exist, push the new word data to the array of objects
    personalDictionary.push({ word, ...definitionsByPartOfSpeech });

    // Store the updated array of objects back into local storage
    localStorage.setItem(
      "personalDictionary",
      JSON.stringify(personalDictionary)
    );
  } else {
    // If the word already exists, display a message to the user
    alert(`"${word}" is already in your vocabulary!`);
  }
};

// Function to display entries from local storage
const displayEntriesFromLocalStorage = () => {
  try {
    // Retrieve the array of objects from local storage
    const wordBank =
      JSON.parse(localStorage.getItem("personalDictionary")) || [];

    // Clear previous content before displaying new entries
    personalDictionaryContainer.innerHTML = "";

    // Check if there are entries in the personal dictionary
    if (wordBank.length === 0) {
      const noEntriesMessage = document.createElement("p");
      noEntriesMessage.textContent = "Your personal dictionary is empty. Search a word to add some!";
      personalDictionaryContainer.appendChild(noEntriesMessage);
      return;
    }

    // Iterate over each entry in the wordBank
    wordBank.forEach((entry) => {
      const word = entry.word;

      // Create a card element for the entry
      const cardElement = document.createElement("div");
      cardElement.className = "bg-gray-200 p-4 rounded-xl shadow-2xl mb-4";

      // Add word to the card
      const wordElement = document.createElement("h2");
      wordElement.className = "text-2xl font-bold mb-2";
      wordElement.textContent = word;
      cardElement.appendChild(wordElement);

      // Iterate over each part of speech in the entry
      Object.keys(entry).forEach((partOfSpeech) => {
        // Skip the word property
        if (partOfSpeech !== "word") {
          const definition = entry[partOfSpeech][0]; // Get the first (and only) definition

          // Create elements for part of speech and definition
          const partOfSpeechElement = document.createElement("p");
          partOfSpeechElement.className = "italic font-semibold block mb-1";
          partOfSpeechElement.textContent = `${partOfSpeech}:`;

          const definitionElement = document.createElement("p");
          definitionElement.textContent = definition;

          // Append part of speech and definition elements to the card
          cardElement.appendChild(partOfSpeechElement);
          cardElement.appendChild(definitionElement);
        }
      });

      // Append the card to the container
      personalDictionaryContainer.appendChild(cardElement);
    });
  } catch (error) {
    console.error("Error displaying entries from local storage:", error);
    // Inform the user or handle the error appropriately
    const errorMessage = document.createElement("p");
    errorMessage.textContent =
      "An error occurred while displaying your personal dictionary. Please try again later.";
    personalDictionaryContainer.appendChild(errorMessage);
  }
};

// Call displayEntriesFromLocalStorage when the page loads
window.addEventListener("load", displayEntriesFromLocalStorage);

// Event listeners to handle search
searchButton.addEventListener("click", searchWord); // Click search button to search
searchInput.addEventListener("keyup", (event) => {
  // Enter to search
  if (event.key === "Enter") {
    searchWord();
  }
});
