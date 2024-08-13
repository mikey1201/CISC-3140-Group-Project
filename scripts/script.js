let movie_data = [];
document.addEventListener("DOMContentLoaded", () => {

    const searchBar = document.getElementById("search-bar");
    const suggestionsContainer = document.getElementById("suggestions");
    const suggestionsArea = document.getElementById("suggestions-box");

    const loginBox = document.getElementById('login-box');
    loginBox.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    let movies = [];

    // Load movies from JSON file
    fetch('http://localhost:3000/api/movies')
        .then(response => response.json())
        //get a list of just the movie titles and filter out duplicates
        .then(data => {
            const uniqueTitles = new Set();
            movie_data = data;
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
            console.log(filteredMovies);
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

    const exitButtonDiv = document.createElement('div');
    exitButtonDiv.className = 'exit-button-div';
    const exitButton = document.createElement('button');
    exitButton.className = 'exit-button';
    exitButton.textContent = '✖';
    exitButton.addEventListener('click', () => {
       document.body.removeChild(rankingArea);
    });
    exitButtonDiv.appendChild(exitButton);
    rankingDiv.appendChild(exitButtonDiv);

    const movieName = document.createElement('p');
    movieName.id = 'movie-name';
    movieName.textContent = movie;
    const movieDescriptionDiv = document.createElement('div');
    movieDescriptionDiv.id = 'movie-description-div';
    const movieDescription = document.createElement('p');
    movieDescription.id = 'movie-description';
    const extract = movie_data.find(m => m.title === movie).extract;
    if (!extract.includes('null')) {
        movieDescription.textContent = extract;
    }
    rankingDiv.appendChild(movieName);
    movieDescriptionDiv.appendChild(movieDescription);
    rankingDiv.appendChild(movieDescriptionDiv);
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

    const buttons = [lovedButton, okayButton, hatedButton];
    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            console.log('event listener');
            buttonDiv.style.display = 'none';
            const movie1 = document.createElement('button');
            movie1.className = 'choice';
            movie1.textContent = movie.substring(0, 28);
            const movie2 = document.createElement('button');
            movie2.className = 'choice';

            try {
                console.log('try block');
                const response = await fetch('http://localhost:3000/api/user-info', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = await response.json(); // Await and parse JSON response
                console.log(data); // Log the data to see its structure

                const loved = data.lists.loveIt; // Accessing lists from the parsed data
                const okay = data.lists.okay;
                const hated = data.lists.hatedIt;

                const bid = button.id;
                if (bid === 'loved-button') {
                    rateProcess(loved, movie, movie1, movie2, bid);
                } else if (bid === 'okay-button') {
                    rateProcess(okay, movie, movie1, movie2, bid);
                } else {
                    rateProcess(hated, movie, movie1, movie2, bid);
                }
                console.log('end rate process');
            } catch (error) {
                console.log(error.message);
            }

            const choiceDiv = document.createElement('div');
            choiceDiv.id = 'choice-div';
            choiceDiv.append(movie1, movie2);
            rankingDiv.appendChild(choiceDiv);
            console.log('end of function');
        });
    });

    buttonDiv.append(lovedButton,okayButton,hatedButton);

    rankingDiv.appendChild(buttonDiv);

    rankingArea.appendChild(rankingDiv);

    return rankingArea;
}
async function rateProcess(list, movie, button1, button2, bid) {
    if (list.length === 0) {
        list.push(movie);
        if (bid === 'loved-button') {
            await updateUserLists({ loveIt: list });
        } else if (bid === 'okay-button') {
            await updateUserLists({ okay: list });
        } else {
            await updateUserLists({ hatedIt: list });
        }
        console.log('closing menu');
        window.location.href = '/';
    } else if (list.includes(movie)) {
        console.log('closing menu');
        window.location.href = '/';
    } else {
        let choice = null;
        button1.addEventListener('click', () => {
            choice = true;
        });
        button2.addEventListener('click', () => {
            choice = false;
        });

        let low = 0;
        let high = list.length - 1;

        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            button2.textContent = list[high];

            if (!choice) {
                list.splice(high + 1, 0, movie);
                if (bid === 'loved-button') {
                    await updateUserLists({ loveIt: list });
                } else if (bid === 'okay-button') {
                    await updateUserLists({ okay: list });
                } else {
                    await updateUserLists({ hatedIt: list });
                }
                return list;
            }

            button2.textContent = list[mid];

            if (choice) {
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        list.splice(low, 0, movie);
        if (bid === 'loved-button') {
            await updateUserLists({ loveIt: list });
        } else if (bid === 'okay-button') {
            await updateUserLists({ okay: list });
        } else {
            await updateUserLists({ hatedIt: list });
        }
    }
}

async function updateUserLists(newLists) {
    try {
        const response = await fetch('http://localhost:3000/api/user/lists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newLists)
        });

        const data = await response.json();

        console.log('Response Status:', response.status);
        if (response.ok) {
            console.log('Lists updated successfully:', data.lists);
        } else {
            console.error('Failed to update lists:', data.message);
        }
    } catch (error) {
        console.error('Error updating lists:', error);
    }
}

document.getElementById('credentials-div').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (document.getElementById('signIn').style.display !== 'none') {
        handleSignIn(username, password);
    } else {
        handleSignUp(username, password);
    }
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
    document.getElementById("login-area").style.display = 'flex';
}
function hideLogin() {
    const loginArea = document.getElementById('login-area');
    loginArea.style.display = 'none';
}

function clickSignUp() {
    document.getElementById("signupBox").style.display = 'block';
    document.getElementById("loginBox").style.display = 'none';
}

function clickClose() {
    document.getElementById("login-area").style.display = 'none';
}
function signSwitch() {
    const signIn = document.getElementById('signIn');
    const signUp = document.getElementById('signUp');
    const signSwitchButton = document.getElementById('sign-switch');
    const loginBoxText = document.getElementById('login-box-text');
    const accountPrompt = document.getElementById('account-prompt');
    if (loginBoxText.textContent === 'Sign in') {
        loginBoxText.textContent = 'Sign up';
        signUp.style.display = 'block';
        signIn.style.display = 'none';
        signSwitchButton.textContent = 'Sign in';
        accountPrompt.textContent = 'Already have an account?';
    } else {
        loginBoxText.textContent = 'Sign in';
        signUp.style.display = 'none';
        signIn.style.display = 'block';
        signSwitchButton.textContent = 'Sign up';
        accountPrompt.textContent = 'Don\'t have an account?';
    }
}

async function handleSignUp(username, password) {
    console.log('signing up');
    try {
        console.log('in try block');
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
            document.getElementById('credentials-div').reset();
            clickLogin();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error during sign-up');
    }
}

async function handleSignIn(username, password) {
    console.log('signing in');
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        console.log(data); // Log the data for debugging

        if (response.ok) {
            alert('Login successful!');
            localStorage.setItem('token', data.token);
            //TODO ?? not sure how to handle this
            window.location.href = `/profile.html?username=${username}`; 
        } else {
            alert(data.message); // Display the error message from the server
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error during sign-in');
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch user information from the server
        const response = await fetch('http://localhost:3000/api/user-info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Check if the request was successful
        if (response.ok) {
            const data = await response.json();
            console.log('User info:', data);
            makeListItems(data.lists.loveIt);
            makeListItems(data.lists.okay);
            makeListItems(data.lists.hatedIt);

        } else {
            console.log('Failed to fetch user info');
            // Handle unauthorized access or errors
            window.location.href = '/'; // Redirect to login if not authenticated
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
});

function makeListItems(list) {
    list.forEach(movie => {
        const listDiv = document.getElementById('list');
        const listItem = document.createElement('div');
        listItem.className = 'list-item';
        listItem.textContent = listDiv.childNodes.length+1 + ' ' + movie;
        listDiv.appendChild(listItem);
    });
}
async function checkLoginStatus() {
    try {
        const response = await fetch('http://localhost:3000/api/user-info');
        if (response.ok) {
            const data = await response.json();
            console.log('User is logged in:', data);
            // Update the UI to reflect the user's logged-in status
        } else {
            console.log('User is not logged in');
            // Redirect to login page or show login UI
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener("DOMContentLoaded", checkLoginStatus);

function clearQuery() {
    const searchBar = document.getElementById('search-bar');
    searchBar.value = '';
    searchBar.dispatchEvent(new Event('input'));
}

function btnLike(){
	document.getElementById("likeButton").style.background="#32de84";
	var x=mArray.length;
	var object={rank: x+1, movie: 'movieName'};
	mArray[x]=object;
}

function btnYellow(){
	document.getElementById("yellowlikeButton").style.backgroundColor="yellow";
	var x=mArray.length;
	var object={rank: x+1, movie: 'movieName'};
	mArray[x]=object;
}

function btnDislike(){
	document.getElementById("dislikeButton").style.backgroundColor="#fd5c63";
	var x=mArray.length;
	var object={rank: x+1, movie: 'movieName'};
	mArray[x]=object;
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
