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
        //get a list of just the movie titles and filter out duplicates
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

    //on user input look for movies containing the users query
    searchBar.addEventListener("input", () => {
        console.log("Search bar input detected");
        const query = searchBar.value.toLowerCase();
        suggestionsContainer.innerHTML = "";

        if (query) {
            const filteredMovies = movies.filter(movie =>
                movie.toLowerCase().includes(query)
            ).slice(0, 20); // Limit to 20 suggestions
            console.log("Filtered movies:", filteredMovies);
            //add the titles to the suggestion box
            filteredMovies.forEach(movie => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item')
                suggestionItem.textContent = movie;
                suggestionsContainer.appendChild(suggestionItem);
            })
            //display the suggestions
            if (filteredMovies.length === 0) {
                suggestionsContainer.style.display = 'none';
                suggestionsArea.style.display = 'none';
            } else { //if there are no matches hide suggestions
                suggestionsContainer.style.display = 'block';
                suggestionsArea.style.display = 'block'
            }
        } else {
            //if the search box is empty hide suggestions
            suggestionsContainer.style.display = 'none';
            suggestionsArea.style.display = 'none';
        }
    })
});

