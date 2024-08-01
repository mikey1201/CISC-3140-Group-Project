let array = [/*mock data for my list wont be copied over*/
  {rank: 1, movie: 'movieName'},
  {rank: 2, movie: 'movieName'},
  {rank: 3, movie: 'movieName'},
  {rank: 4, movie: 'movieName'},
  {rank: 5, movie: 'movieName'},
  {rank: 6, movie: 'movieName'},];

const listTable = document.createElement("table");/*creates the my list table doesnt matter how many movies*/
listTable.innerHTML = "<thead><th>Rank</th><th>Movies</th></thead>";
for(display of array){
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

function openBox(){/*dims the screen when movieBox is open*/
	document.getElementById("overlayDim").style.display = "block";
}

function closeBox(){/*undims the screen when movieBox is closed*/
	document.getElementById("overlayDim").style.display = "none";
}