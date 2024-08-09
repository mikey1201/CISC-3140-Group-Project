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
                movie.toLowerCase().normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .includes(query.normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')))
                .sort((a, b) => {
                // Sort by length first
                if (a.length !== b.length) {
                    return a.length - b.length;
                }
                // If lengths are equal, sort by first letters matching
                const queryLength = query.length;
                const aMatch = a.slice(0, queryLength).toLowerCase() === query;
                const bMatch = b.slice(0, queryLength).toLowerCase() === query;
                if (aMatch && !bMatch) {
                    return -1;
                } else if (!aMatch && bMatch) {
                    return 1;
                } else {
                    return 0;
                }
            }).slice(0, 20); // Limit to 20 suggestions
            console.log("Filtered movies:", filteredMovies);
            //add the titles to the suggestion box
            filteredMovies.forEach(movie => {suggestionsContainer.appendChild(createSuggestionItem(movie));});

            //display the suggestions
            if (filteredMovies.length === 0) {
                if (searchBar) searchBar.style.borderRadius = '18px';
                if (suggestionsContainer) suggestionsContainer.style.display = 'none';
                if (suggestionsArea) suggestionsArea.style.display = 'none';
            } else {
                if (searchBar) searchBar.style.borderRadius = '18px 18px 0 0';
                if (suggestionsContainer) suggestionsContainer.style.display = 'block';
                if (suggestionsArea) suggestionsArea.style.display = 'block';
            }
        } else {
            // If the search box is empty, hide suggestions
            if (searchBar) searchBar.style.borderRadius = '18px';
            if (suggestionsContainer) suggestionsContainer.style.display = 'none';
            if (suggestionsArea) suggestionsArea.style.display = 'none';
        }
    })
});

function createSuggestionItem(movie) {
    const suggestionItem = document.createElement('div');
    suggestionItem.classList.add('suggestion-item')
    suggestionItem.textContent = movie;
    //adding popup menu
    suggestionItem.addEventListener('click', () => {document.body.appendChild(createRankingArea(movie));});
    return suggestionItem;
}
function createRankingArea(movie) {
    const rankingArea = document.createElement('div');
    rankingArea.className = 'ranking-area';

    // Add event listener to the parent div
    rankingArea.addEventListener('click', () => {
        document.body.removeChild(rankingArea);
    });

    const rankingDiv = document.createElement('div');
    rankingDiv.className = 'ranking-div';
    rankingDiv.textContent = movie;
    // Add event listener to the child div to stop event propagation
    rankingDiv.addEventListener('click', (event) => {
        event.stopPropagation();
    });
    const buttonDiv = document.createElement('div');
    buttonDiv.id = 'button-div';
    const lovedButton = document.createElement('button');
    lovedButton.id = 'loved-button';
    lovedButton.className = 'rank-button';
    lovedButton.textContent = 'Loved it'
    const okayButton = document.createElement('button');
    okayButton.id = 'okay-button';
    okayButton.className = 'rank-button';
    okayButton.textContent = 'It was okay'
    const hatedButton = document.createElement('button');
    hatedButton.id = 'hated-button';
    hatedButton.className = 'rank-button';
    hatedButton.textContent = 'Hated it'

    buttonDiv.style.display = 'flex';

    const buttons = [lovedButton,okayButton,hatedButton];
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttonDiv.style.display = 'none';
            const movie1 = document.createElement('button');
            movie1.className = 'choice';
            movie1.textContent = movie.substring(0,28);
            const movie2 = document.createElement('button');
            movie2.className = 'choice';
            /*TODO Need to fetch movies from user list
                if users list is empty movie should go directly into that part of the list
                there are to be three separate lists for each user, loved it, okay, and hated it
             */
            movie2.textContent = 'filler movie'
            const choiceDiv = document.createElement('div');
            choiceDiv.id = 'choice-div';
            choiceDiv.append(movie1,movie2);
            rankingDiv.appendChild(choiceDiv);
        });
    });

    buttonDiv.append(lovedButton,okayButton,hatedButton);
    rankingDiv.appendChild(buttonDiv);

    rankingArea.appendChild(rankingDiv);

    return rankingArea;
}
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
let mArray = [];
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
let fArray = [];
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
    console.log('signing up');
    try {
        console.log('in try block')
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
function clearQuery() {
    const searchBar = document.getElementById('search-bar');
    searchBar.value = '';
    searchBar.dispatchEvent(new Event('input'));
}

function btnLike(){
	document.getElementById("likeButton").style.background="#32de84";
}

function btnYellow(){
	document.getElementById("yellowlikeButton").style.backgroundColor="yellow";
}

function btnDislike(){
	document.getElementById("dislikeButton").style.backgroundColor="#fd5c63";
}

function movePreferBoxLeft(){
	document.getElementById("movePreferBoxLeft").style.borderColor="gold";
	document.getElementById("movePreferBoxLeft").style.color="gold";
}

function movePreferBoxRight(){
	document.getElementById("movePreferBoxRight").style.borderColor="gold";
	document.getElementById("movePreferBoxRight").style.color="gold";
}

function btnReset(){
	document.getElementById("likeButton").style.background="green";
	document.getElementById("yellowlikeButton").style.background="gold";
	document.getElementById("dislikeButton").style.background="#C60C30";
	document.getElementById("movePreferBoxRight").style.borderColor="black";
	document.getElementById("movePreferBoxRight").style.color="black";
	document.getElementById("movePreferBoxLeft").style.borderColor="black";
	document.getElementById("movePreferBoxLeft").style.color="black";
	myDiv.style.display= "none"
}

 function openMoviebox() {
    if (myDiv.style.display === "none") {
      myDiv.style.display = "block";
    } else {
      myDiv.style.display = "none";
    }
  }
