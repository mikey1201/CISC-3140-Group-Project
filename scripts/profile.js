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
          document.getElementById('user-name').textContent = `data.username`;
          document.getElementById('username').textContent = data.username;
          

          const myListDiv = document.getElementById('my-list');
          data.myList.forEach(movie => {
              const movieItem = document.createElement('div');
              movieItem.textContent = movie;
              myListDiv.appendChild(movieItem);
          });

          const myFriendsDiv = document.getElementById('my-friends');
          data.friends.forEach(friend => {
              const friendItem = document.createElement('div');
              friendItem.textContent = friend;
              myFriendsDiv.appendChild(friendItem);
          });
      } else {
          alert(data.message);
          window.location.href = '/';
      }
  } catch (error) {
      console.error('Error fetching profile:', error);
      alert('Error fetching profile information.');
  }
});
