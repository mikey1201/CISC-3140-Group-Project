// script.js
document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("search-bar");
    const suggestionsContainer = document.getElementById("suggestions");
    const suggestionsArea = document.getElementById("suggestions-box");

    let movies = [];
    // Load movies from JSON file
    fetch('data/movies.json')
        .then(response => {
            return response.json();
        })
        .then(data => {
            const uniqueTitles = new Set();
            movies = data
                .map(movie => movie.title)
                .filter(title => {
                    if (uniqueTitles.has(title)) {
                        return false;
                    } else {
                        uniqueTitles.add(title);
                        return true;
                    }
                });
            console.log("Unique movie titles:", movies);
        })
        .catch(error => console.error('Error loading movies:', error));




    searchBar.addEventListener("input", () => {
        console.log("Search bar input detected");
        const query = searchBar.value.toLowerCase();
        suggestionsContainer.innerHTML = "";

        if (query) {
            const filteredMovies = movies.filter(movie =>
                movie.toLowerCase().includes(query)
            ).slice(0, 20); // Limit to 20 suggestions
            console.log("Filtered movies:", filteredMovies);
            filteredMovies.forEach(movie => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item')
                suggestionItem.textContent = movie;
                suggestionsContainer.appendChild(suggestionItem);
            })
            suggestionsContainer.style.display = 'block';
            suggestionsArea.style.display = 'block'
        } else {
            suggestionsContainer.style.display = 'none';
            suggestionsArea.style.display = 'none';
        }
    })
});

