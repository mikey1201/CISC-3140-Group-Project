document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:3000/api/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        if (response.ok) {
            document.getElementById('user-name').textContent = data.username;
            

            const myListDiv = document.getElementById('my-list');
            if (data.lists && data.lists.loveIt) {
                data.lists.loveIt.forEach(movie => {
                    const movieItem = document.createElement('div');
                    movieItem.textContent = movie;
                    myListDiv.appendChild(movieItem);
                });
            }

            const myFriendsDiv = document.getElementById('my-friends');
            if (data.friends) {
                data.friends.forEach(friend => {
                    const friendItem = document.createElement('div');
                    friendItem.textContent = friend;
                    myFriendsDiv.appendChild(friendItem);
                });
            }
        } else {
            alert(data.message);
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Error fetching profile information.');
    }
    document.getElementById('backButton').addEventListener('click', function(data) {
        const username = localStorage.getItem('username'); 
        window.location.href = `/?username=${data.username}`;
    });

});


async function addFriend(friendId) {
    try {
        const response = await fetch('http://localhost:3000/api/add-friend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ friendId }) // 
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);
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
            userDiv.textContent = user.username;

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

