// TMDb API Configuration
const API_KEY = 'af2006e40270e387571db4658ff28fb5'; // Replace with your API key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Base URL for images

// Event Listeners
$(document).ready(function () {
  // Search form submit event
  $('#search-form').on('submit', function (e) {
    e.preventDefault(); // Prevent form from refreshing the page
    const query = $('#search-input').val(); // Get user input
    if (query) {
      searchMovies(query);
    }
  });

  // Load popular movies on page load
  loadPopularMovies();
});

// Fetch popular movies
function loadPopularMovies() {
  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;

  $.ajax({
    url: url,
    method: 'GET',
    success: function (response) {
      displaySearchResults(response.results);
    },
    error: function () {
      alert('Failed to fetch popular movies.');
    },
  });
}

// Search for movies
function searchMovies(query) {
  const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${query}`;

  $.ajax({
    url: url,
    method: 'GET',
    success: function (response) {
      if (response.results.length > 0) {
        displaySearchResults(response.results);
      } else {
        $('#results-container').html('<p>No results found.</p>');
      }
    },
    error: function () {
      alert('Failed to fetch search results.');
    },
  });
}

// Display search or popular movie results
function displaySearchResults(movies) {
  const resultsContainer = $('#results-container');
  resultsContainer.empty(); // Clear previous results

  movies.forEach(movie => {
    const poster = movie.poster_path
      ? `${IMAGE_BASE_URL}${movie.poster_path}`
      : 'https://via.placeholder.com/500x750?text=No+Image';

    const movieCard = `
      <div class="result-item">
        <img src="${poster}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>Release Date: ${movie.release_date || 'N/A'}</p>
        <button onclick="viewMovieDetails(${movie.id})" class="btn btn-primary btn-sm">View Details</button>
      </div>
    `;

    resultsContainer.append(movieCard);
  });
}

// View movie details
function viewMovieDetails(movieId) {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,reviews`;

  $.ajax({
    url: url,
    method: 'GET',
    success: function (movie) {
      displayMovieDetails(movie);
    },
    error: function () {
      alert('Failed to fetch movie details.');
    },
  });
}

// Display detailed movie information
function displayMovieDetails(movie) {
  const detailsSection = $('#details');
  detailsSection.removeClass('d-none'); // Show details section

  const poster = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Image';

  const cast = movie.credits.cast.slice(0, 5).map(c => c.name).join(', ');

  const detailsHtml = `
    <h2>${movie.title}</h2>
    <div id="movie-details">
      <img src="${poster}" alt="${movie.title}">
      <div>
        <p><strong>Overview:</strong> ${movie.overview}</p>
        <p><strong>Release Date:</strong> ${movie.release_date}</p>
        <p><strong>Rating:</strong> ${movie.vote_average || 'N/A'}</p>
        <p><strong>Cast:</strong> ${cast || 'N/A'}</p>
      </div>
    </div>
  `;

  detailsSection.html(detailsHtml);
}
