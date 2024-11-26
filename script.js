
const API_KEY = 'af2006e40270e387571db4658ff28fb5';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentQuery = '';
let currentPage = 1;
let currentMovieId = null;

$(document).ready(function () {
   
  $('#results-container').addClass('grid-view');

  
  $('#grid-view').on('click', function () {
    $('#results-container').removeClass('list-view').addClass('grid-view');
  });

  $('#list-view').on('click', function () {
    $('#results-container').removeClass('grid-view').addClass('list-view');
  });

  
  $('#search-form').on('submit', function (e) {
    e.preventDefault();
    currentQuery = $('#search-input').val().trim();
    if (currentQuery) {
      currentPage = 1;
      fetchMovies();
    } else {
      alert('Please enter a search query!');
    }
  });

   
  $('#prev-page').on('click', function () {
    if (currentPage > 1) {
      currentPage--;
      fetchMovies();
    }
  });

  $('#next-page').on('click', function () {
    currentPage++;
    fetchMovies();
  });

  
  $('#discover-btn').on('click', function () {
    loadGenres();
  });

   loadPopularMovies();
});

 function loadPopularMovies() {
  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
  $.ajax({
    url: url,
    method: 'GET',
    success: function (response) {
      displaySearchResults(response.results);
    },
    error: function () {
      alert('Failed to load popular movies.');
    }
  });
}

function fetchMovies() {
  const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(currentQuery)}&page=${currentPage}`;

  console.log('Fetching search results for query:', currentQuery);
  $.ajax({
    url: url,
    method: 'GET',
    success: function (response) {
      console.log('Search results received:', response.results);

      const resultsContainer = $('#results-container');
      resultsContainer.empty(); // Clear previous results

      if (response.results.length === 0) {
        resultsContainer.append('<p>No results found.</p>');
        return;
      }

      response.results.forEach((movie) => {
        const movieCard = `
          <div class="result-item">
            <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}" />
            <h3>${movie.title}</h3>
            <p>${movie.release_date}</p>
            <button class="btn btn-info" onclick="fetchMovieDetails(${movie.id})">View Details</button>
          </div>
        `;
        resultsContainer.append(movieCard);
      });
    },
    error: function () {
      alert('Failed to fetch search results. Please try again later.');
    }
  });
}



 function displaySearchResults(movies) {
  const resultsContainer = $('#results-container');
  resultsContainer.empty();
  movies.forEach((movie) => {
    const movieCard = `
      <div class="result-item">
        <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}" />
        <h3>${movie.title}</h3>
        <p>${movie.release_date}</p>
        <button class="btn btn-info" onclick="fetchMovieDetails(${movie.id})">View Details</button>
      </div>
    `;
    resultsContainer.append(movieCard);
  });
}

// Fetch genres
function loadGenres() {
  const url = `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`;
  $.ajax({
    url: url,
    method: 'GET',
    success: function (response) {
      const resultsContainer = $('#results-container');
      resultsContainer.empty();
      response.genres.forEach((genre) => {
        const genreButton = `
          <button class="btn btn-primary m-2" onclick="loadMoviesByGenre(${genre.id})">
            ${genre.name}
          </button>
        `;
        resultsContainer.append(genreButton);
      });
    },
    error: function () {
      alert('Failed to load genres.');
    }
  });
}

 function loadMoviesByGenre(genreId) {
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&with_genres=${genreId}`;
  $.ajax({
    url: url,
    method: 'GET',
    success: function (response) {
      displaySearchResults(response.results);
    },
    error: function () {
      alert('Failed to load movies for this genre.');
    }
  });
}

 function fetchMovieDetails(movieId) {
  currentMovieId = movieId;
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=credits,reviews`;

     console.log(document.querySelectorAll('#cast-list a'));

     console.log(`Fetching details for movie ID: ${movieId}`);
  $.ajax({
    url: url,
    method: 'GET',
    success: function (response) {
      const detailsContainer = $('#movie-details');
      detailsContainer.empty();

       const movieDetails = `
        <h2>${response.title}</h2>
        <img src="${IMAGE_BASE_URL}${response.poster_path}" alt="${response.title}" />
        <p><strong>Release Date:</strong> ${response.release_date}</p>
        <p><strong>Overview:</strong> ${response.overview}</p>
        <h3>Cast:</h3>
        <ul>
          ${response.credits.cast
            .slice(0, 10)
            .map(
              (cast) => `
              <li>
                <button class="btn btn-link" onclick="fetchPersonDetails(${cast.id})">${cast.name}</button> as ${cast.character}
              </li>
            `
            )
            .join('')}
        </ul>
        <div id="trailer-container"></div> <!-- Container for the trailer -->
        <button class="btn btn-secondary mt-3" onclick="minimizeDetails()">Close Details</button>
      `;

      detailsContainer.append(movieDetails);

       fetchMovieTrailer(movieId);

      $('#details').removeClass('d-none');
    },
    error: function () {
      alert('Failed to load movie details.');
    }
  });
}

 function fetchMovieTrailer(movieId) {
  const url = `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}&language=en-US`;

  console.log(`Fetching trailer for movie ID: ${movieId}`);
  $.ajax({
    url: url,
    method: 'GET',
    success: function (response) {
      const trailer = response.results.find(
        (video) => video.type === 'Trailer' && video.site === 'YouTube'
      );

      if (trailer) {
        const trailerContainer = $('#trailer-container');
          const trailerHTML = `
            <h3>Trailer</h3>
            <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000;">
              <iframe
                src="https://www.youtube.com/embed/${trailer.key}"
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
              </iframe>
            </div>
          `;

        trailerContainer.append(trailerHTML);
      } else {
        console.log('No trailer available for this movie.');
      }
    },
    error: function () {
      alert('Failed to load trailer.');
    }
  });
}


function minimizeDetails() {
  const detailsContainer = $('#movie-details');
  detailsContainer.empty();
  $('#details').addClass('d-none');
}


 function fetchPersonDetails(personId) {
  const url = `${BASE_URL}/person/${personId}?api_key=${API_KEY}&language=en-US`;
  $.ajax({
    url: url,
    method: 'GET',
    success: function (response) {
      const detailsContainer = $('#movie-details');
      detailsContainer.empty();
      const personDetails = `
        <h2>${response.name}</h2>
        <p><strong>Biography:</strong> ${response.biography || 'No biography available.'}</p>
        <button class="btn btn-secondary" onclick="fetchMovieDetails(${currentMovieId})">Back to Movie Details</button>
      `;
      detailsContainer.append(personDetails);
    },
    error: function () {
      alert('Failed to load person details.');
    }
  });
}

function fetchPopularMedia() {
  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;

  console.log('Fetching popular movies...');
  $.ajax({
    url: url,
    method: 'GET',
    success: function (response) {
      console.log('Popular movies received:', response.results);

      const resultsContainer = $('#results-container');
      resultsContainer.empty();

      if (response.results.length === 0) {
        resultsContainer.append('<p>No popular movies found.</p>');
        return;
      }

      response.results.forEach((movie) => {
        const movieCard = `
          <div class="result-item">
            <img src="${IMAGE_BASE_URL}${movie.poster_path}" alt="${movie.title}" />
            <h3>${movie.title}</h3>
            <p>${movie.release_date}</p>
            <button class="btn btn-info" onclick="fetchMovieDetails(${movie.id})">View Details</button>
          </div>
        `;
        resultsContainer.append(movieCard);
      });
    },
    error: function () {
      alert('Failed to load popular movies.');
    }
  });
}
$(document).ready(function () {
  $('#popular-btn').on('click', function () {
    fetchPopularMedia();
  });
});


 function setButtonStyles() {
  const buttons = document.querySelectorAll('button');

  buttons.forEach((button) => {
    // Apply styles
    button.style.backgroundColor = '#6b6966';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '8px';
    button.style.padding = '5px 15px';
    button.style.fontSize = '.9rem';
    button.style.fontWeight = 'bold';
    button.style.cursor = 'pointer';
    button.style.transition = 'background-color 0.3s ease';

 
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#575551';
    });
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#6b6966';
    });
  });
}

 function observeDynamicButtons() {
  const resultsContainer = document.querySelector('#results-container');

   const observer = new MutationObserver(() => {
    setButtonStyles();
  });

  observer.observe(resultsContainer, { childList: true, subtree: true });
}


document.addEventListener('DOMContentLoaded', () => {
  setButtonStyles();
  observeDynamicButtons();
});


 function styleViewDetailsButtons() {
   const viewDetailsButtons = document.querySelectorAll('.result-item button');

 
  viewDetailsButtons.forEach((button) => {
    button.style.backgroundColor = '#945169';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.padding = '5px 10px';
    button.style.fontSize = '0.84rem';
    button.style.cursor = 'pointer';
    button.style.transition = 'background-color 0.3s ease';

     button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#471527';
    });
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#945169';
    });
  });
}

 document.addEventListener('DOMContentLoaded', () => {
   styleViewDetailsButtons();

   const resultsContainer = document.querySelector('#results-container');
  const observer = new MutationObserver(() => {
    styleViewDetailsButtons();
  });

  observer.observe(resultsContainer, { childList: true, subtree: true });
});

document.querySelector('#filter-year-btn').addEventListener('click', () => {
  const year = document.querySelector('#year-input').value;
  if (!year) {
    alert('Please enter a valid year.');
    return;
  }

    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&primary_release_year=${year}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
       const filteredMovies = data.results.filter(movie => {
        return movie.release_date && movie.release_date.startsWith(year);
      });

       displaySearchResults(filteredMovies);
    })
    .catch(error => console.error('Error fetching movies:', error));
});


document.querySelector('#search-input').addEventListener(
  'input',
  debounce((e) => {
    const query = e.target.value.trim();

    if (query) {
      const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const suggestions = data.results.slice(0, 5);
          const suggestionBox = document.querySelector('#suggestion-box');
          suggestionBox.innerHTML = '';

          if (suggestions.length > 0) {
            suggestions.forEach((movie) => {
              const suggestion = document.createElement('div');
              suggestion.textContent = movie.title;
              suggestion.style.padding = '10px';
              suggestion.style.cursor = 'pointer';

               suggestion.addEventListener('click', () => {
                fetchMovieDetails(movie.id);
                suggestionBox.innerHTML = '';
                suggestionBox.style.display = 'none';
                document.querySelector('#search-input').value = movie.title;
              });

              suggestionBox.appendChild(suggestion);
            });

            suggestionBox.style.display = 'block';
          } else {
            suggestionBox.style.display = 'none';
          }
        })
        .catch((error) => console.error('Error fetching autocomplete suggestions:', error));
    } else {
      document.querySelector('#suggestion-box').style.display = 'none';
    }
  }, 300)
);

function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}
