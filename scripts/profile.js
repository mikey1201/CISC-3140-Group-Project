document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3000/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log(data.friends);
        if (response.ok) {
            document.getElementById('user-name').textContent = data.username;
            
            displayMovieList(data.lists, 'my-list'); //
            displayFriendsList(data.friends, 'my-friends');

        } else {
            alert(data.message);
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Error fetching profile information.');
    }

    document.getElementById('backButton').addEventListener('click', function() {
        window.location.href = '/';
    });
});

function displayMovieList(lists, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; 

    if (lists) {
        const loveItDiv = document.createElement('div');
        loveItDiv.className = 'movie-list love-it';
        loveItDiv.innerHTML = '<h3>Love-It</h3>';
        
        const okayDiv = document.createElement('div');
        okayDiv.className = 'movie-list okay';
        okayDiv.innerHTML = '<h3>Okay</h3>';
        
        const hatedItDiv = document.createElement('div');
        hatedItDiv.className = 'movie-list hated-it';
        hatedItDiv.innerHTML = '<h3>Hated It</h3>';

        if (lists.loveIt && lists.loveIt.length > 0) {
            lists.loveIt.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.textContent = movie;
                loveItDiv.appendChild(movieItem);
            });
        } else {
            loveItDiv.innerHTML += '<p>No movies in the Love It list.</p>';
        }

        if (lists.okay && lists.okay.length > 0) {
            lists.okay.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.textContent = movie;
                okayDiv.appendChild(movieItem);
            });
        } else {
            okayDiv.innerHTML += '<p>No movies in the Okay list.</p>';
        }

        if (lists.hatedIt && lists.hatedIt.length > 0) {
            lists.hatedIt.forEach(movie => {
                const movieItem = document.createElement('div');
                movieItem.textContent = movie;
                hatedItDiv.appendChild(movieItem);
            });
        } else {
            hatedItDiv.innerHTML += '<p>No movies in the Hated It list.</p>';
        }
        container.appendChild(loveItDiv);
        container.appendChild(okayDiv);
        container.appendChild(hatedItDiv);
    } else {
        container.innerHTML = '<p>No lists available.</p>';
    }
}


function displayFriendsList(friends, containerId) {
    const myFriendsDiv = document.getElementById(containerId);
    myFriendsDiv.innerHTML = ''; 

    if (friends && friends.length > 0) {
        const ul = document.createElement("ul");
        
        
        friends.forEach(friend => {

            const newli = document.createElement("li");

            newli.textContent = friend.username;
            ul.appendChild(newli);
        });

        myFriendsDiv.appendChild(ul);
    } else {
        myFriendsDiv.textContent = 'You have no friends added yet.';
    }
}


async function addFriend(friendId) {
    try {
        const response = await fetch('http://localhost:3000/api/add-friend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ friendId })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
            location.reload();  // Reload the page to update the friend's list after adding
        } else {
            alert('Error adding friend: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding friend');
    }
}

async function searchAndAddFriend() {
    const searchQuery = document.getElementById('friendSearch').value;

    if (!searchQuery) {
        alert('Please enter a name to search');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/search-users?name=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        const searchResultsDiv = document.getElementById('searchResults');
        searchResultsDiv.innerHTML = '';

        if (!data.users || data.users.length === 0) {
            searchResultsDiv.textContent = 'No users found';
            return;
        }

        data.users.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.className = 'search-item';
            const userName = document.createElement('div');
            userName.textContent = user.username;
            userDiv.appendChild(userName);
            //userDiv.textContent = user.username;

            const addButton = document.createElement('button');
            addButton.textContent = 'Add Friend';
            addButton.onclick = () => addFriend(user._id);

            userDiv.appendChild(addButton);
            searchResultsDiv.appendChild(userDiv);
        });
    } catch (error) {
        console.error('Error searching for users:', error);
        alert('Error searching for users');
    }
}
