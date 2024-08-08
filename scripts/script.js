document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');
    const searchBar = document.getElementById("search-bar");
    const suggestionsContainer = document.getElementById("suggestions");
    const suggestionsArea = document.getElementById("suggestions-box");

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignUp);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleSignIn);
    }

    let movies = [];
    // Load movies from JSON file
    fetch('http://localhost:3000/data/movies')
        .then(response => response.json())
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

    // Check if searchBar exists before adding event listener
    if (searchBar) {
        searchBar.addEventListener("input", () => {
            console.log("Search bar input detected");
            const query = searchBar.value.toLowerCase();
            suggestionsContainer.innerHTML = "";

            if (query) {
                const filteredMovies = movies.filter(movie =>
                    movie.toLowerCase().includes(query)
                ).slice(0, 20); // Limit to 20 suggestions
                console.log("Filtered movies:", filteredMovies);
                // Add the titles to the suggestion box
                filteredMovies.forEach(movie => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = movie;
                    // Add popup menu
                    suggestionItem.addEventListener('click', () => {
                        const rankingArea = document.createElement('div');
                        rankingArea.className = 'ranking-area';

                        // Add event listener to the parent div
                        rankingArea.addEventListener('click', () => {
                            document.body.removeChild(rankingArea);
                        });

                        const rankingDiv = document.createElement('div');
                        rankingDiv.className = 'ranking-div';

                        // Add event listener to the child div to stop event propagation
                        rankingDiv.addEventListener('click', (event) => {
                            event.stopPropagation();
                        });

                        rankingArea.appendChild(rankingDiv);
                        document.body.appendChild(rankingArea);
                    });

                    suggestionsContainer.appendChild(suggestionItem);
                });
                // Display the suggestions
                if (filteredMovies.length === 0) {
                    searchBar.style.borderRadius = '18px';
                    suggestionsContainer.style.display = 'none';
                    suggestionsArea.style.display = 'none';
                } else {
                    searchBar.style.borderRadius = '18px 18px 0 0';
                    suggestionsContainer.style.display = 'block';
                    suggestionsArea.style.display = 'block';
                }
            } else {
                // If the search box is empty, hide suggestions
                searchBar.style.borderRadius = '18px';
                suggestionsContainer.style.display = 'none';
                suggestionsArea.style.display = 'none';
            }
        });
    }

    // Create the "My List" table
    const listTable = document.createElement("table");
    listTable.innerHTML = "<thead><th>Rank</th><th>Movies</th></thead>";
    const mArray = []; // Ensure mArray is defined
    for (const display of mArray) {
        const newRow = document.createElement("tr");
        const rank = document.createElement("td");
        const movie = document.createElement("td");
        rank.textContent = display.rank;
        movie.textContent = display.movie;
        newRow.appendChild(rank);
        newRow.appendChild(movie);
        listTable.appendChild(newRow);
    }
    const myListChart = document.getElementById('myListChart');
    if (myListChart) {
        myListChart.appendChild(listTable);
    }

    // Create the "Friends List" table
    const friendsTable = document.createElement("table");
    friendsTable.innerHTML = "<thead><th>Friends</th><th>Movies Ranked</th></thead>";
    const fArray = []; // Ensure fArray is defined
    for (const display of fArray) {
        const newRow = document.createElement("tr");
        const name = document.createElement("td");
        const movieRanked = document.createElement("td");
        name.textContent = display.name;
        movieRanked.textContent = display.movieRanked;
        newRow.appendChild(name);
        newRow.appendChild(movieRanked);
        friendsTable.appendChild(newRow);
    }
    const friendsList = document.getElementById('friendsList');
    if (friendsList) {
        friendsList.appendChild(friendsTable);
    }

    // Other functions
    function buttonMovies() {
        const hiddenBox = document.getElementById("myListChart");
        if (hiddenBox) {
            hiddenBox.style.display = (hiddenBox.style.display === "none") ? "block" : "none";
        }
    }

    function buttonFriends() {
        const hiddenBox = document.getElementById("friendsList");
        if (hiddenBox) {
            hiddenBox.style.display = (hiddenBox.style.display === "none") ? "block" : "none";
        }
    }

    function clickLogin() {
        document.getElementById("loginBox").style.display = 'block';
        document.getElementById("signupBox").style.display = 'none';
    }

    function clickSignUp() {
        document.getElementById("signupBox").style.display = 'block';
        document.getElementById("loginBox").style.display = 'none';
    }

    function clickClose() {
        document.getElementById("signupBox").style.display = 'none';
        document.getElementById("loginBox").style.display = 'none';
    }

    // Sign-up handler
    async function handleSignUp(event) {
        event.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                signupForm.reset();
                clickLogin();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error during sign-up');
        }
    }

    // Sign-in handler
    async function handleSignIn(event) {
        event.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Login successful!');
                localStorage.setItem('token', data.token);
                window.location.href = '/login';
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error during sign-in');
        }
    }
});
