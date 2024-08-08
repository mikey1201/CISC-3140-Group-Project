document.addEventListener("DOMContentLoaded", () => {
    
    document.getElementById('signupForm').addEventListener('submit', handleSignUp());
    document.getElementById('loginForm').addEventListener('submit', handleSignIn());
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
                //adding popup menu
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
            })
            //display the suggestions
            if (filteredMovies.length === 0) {
                searchBar.style.borderRadius = '18px';
                suggestionsContainer.style.display = 'none';
                suggestionsArea.style.display = 'none';
            } else { //if there are no matches hide suggestions
                searchBar.style.borderRadius = '18px 18px 0 0';
                suggestionsContainer.style.display = 'block';
                suggestionsArea.style.display = 'block'
            }
        } else {
            //if the search box is empty hide suggestions
            searchBar.style.borderRadius = '18px';
            suggestionsContainer.style.display = 'none';
            suggestionsArea.style.display = 'none';
        }
    })
});

 function buttonMovies() {/*calls the function to create my list*/
    var hiddenBox = document.getElementById("myListChart");
    if (hiddenBox.style.display === "none") {
      hiddenBox.style.display = "block";
    } else {
      hiddenBox.style.display = "none";
    }
  }

  function buttonFriends() {/*calls the function to create friend list*/
    const hiddenBox = document.getElementById("friendsList");
    if (hiddenBox.style.display === "none") {
      hiddenBox.style.display = "block";
    } else {
      hiddenBox.style.display = "none";
    }
  }

const listTable = document.createElement("table");/*creates the my list table doesnt matter how many movies*/
listTable.innerHTML = "<thead><th>Rank</th><th>Movies</th></thead>";
for(display of mArray){
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
myListChart.appendChild(listTable);

const friendsTable = document.createElement("table");/*creates the my list table doesnt matter how many movies*/
friendsTable.innerHTML = "<thead><th>Friends</th><th>Movies Ranked</th></thead>";
for(display of fArray){
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
friendsList.appendChild(friendsTable);

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
            document.getElementById('signupForm').reset();
            clickLogin();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error during sign-up');
    }
}

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
