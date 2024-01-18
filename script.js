const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlMWY0M2QzMzYzZjhkOTdmZWIzMjdiNWMxY2VkMmY4YSIsInN1YiI6IjY0YzI0MzE5ZGI0ZWQ2MDEwMWE5ZjQzNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.yF35cLTqzgO0zSssUmHoZ94DG3dAfVVxUL4SGgwFsAc'
    }
};

let page = 1;
let isLoading = false;

fetch('https://api.themoviedb.org/3/trending/movie/week', options)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not OK. Status: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (!data.results || data.results.length === 0) {
            throw new Error('No movie data found');
        }
        const movies = data.results.slice(0, 3);

        const carouselInner = document.querySelector('.carousel-inner');
        carouselInner.innerHTML = '';

        movies.forEach((movie, index) => {
            const slideItem = document.createElement('div');
            slideItem.classList.add('carousel-item');

            if (index === 0) {
                slideItem.classList.add('active');
            }

            const posterDiv = document.createElement('div');
            posterDiv.classList.add('movie-poster');

            const img = document.createElement('img');
            img.classList.add('card-img-top');
            img.src = 'https://image.tmdb.org/t/p/w500' + movie.poster_path;
            img.alt = movie.title;

            img.addEventListener('click', () => {
                window.location.href = `movie_details.html?id=${movie.id}`;
            });

            posterDiv.appendChild(img);
            slideItem.appendChild(posterDiv);

            carouselInner.appendChild(slideItem);
        });
    })
    .catch(err => console.error(err));

async function fetchPopularMovies() {
    try {
        const response = await fetch('https://api.themoviedb.org/3/movie/popular?api_key=e1f43d3363f8d97feb327b5c1ced2f8a');
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        return [];
    }
}

async function searchMovies(query) {
    console.log('query', query);
    try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=e1f43d3363f8d97feb327b5c1ced2f8a&query=${query}`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching search results:', error);
        return [];
    }
}

document.getElementById('searchButton').addEventListener('click', async () => {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();

    if (query === '') {
        alert('Please enter a movie title to search.');
        return;
    }

    const movies = await searchMovies(query);

    const movieResultsContainer = document.getElementById('movieResults');
    movieResultsContainer.innerHTML = '';

    if (movies.length === 0) {
        movieResultsContainer.innerHTML = '<p>No movies found</p>';
        return;
    }

    movies.forEach((movie, index) => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('card', 'searchCard', 'mb-3');
        movieCard.innerHTML = `
        <a href="movie_details.html?id=${movie.id}" class="movieLink">
            <div class="row searchCards g-0">
              <div class="col-md-4">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} Poster" class="img-fluid">
              </div>
              <div class="col-md-8">
                <div class="card-body">
                  <h5 class="card-title">${movie.title}</h5>
                  <p class="card-text">Year: ${movie.release_date}</p>
                </div>
              </div>
            </div>
          `;
        movieResultsContainer.appendChild(movieCard);
    });
});

function createPopularMoviesCarouselItem(movies) {
    const carouselItem = document.createElement('div');
    carouselItem.classList.add('carousel-item');
    carouselItem.classList.add('popularCarousel');

    const movieRow = document.createElement('div');
    movieRow.classList.add('row', 'popularMoviesRow', 'p-3');

    movies.forEach((movie) => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('col-md-2', 'mb-3', 'm-2', 'p-2', 'popularMovieCard');
        movieCard.innerHTML = `
            <a href="movie_details.html?id=${movie.id}" class="movieLink">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} Poster" class="img-fluid">
                <p class="card-text popularCardName mt-3">${movie.title}</p>
            </a>
        `;
        movieRow.appendChild(movieCard);
    });

    carouselItem.appendChild(movieRow);
    return carouselItem;
}

async function loadPopularMovies() {
    const popularMoviesCarousel = document.getElementById('popularMoviesCarousel');
    const carouselInner = popularMoviesCarousel.querySelector('.carousel-inner');

    if (isLoading) {
        return;
    }

    isLoading = true;
    const popularMovies = await fetchPopularMovies(page);
    isLoading = false;

    if (popularMovies.length === 0) {
        window.removeEventListener('scroll', onScroll);
        return;
    }

    const carouselItems = [];
    const maxSlides = 3;
    for (let i = 0; i < popularMovies.length && carouselItems.length < maxSlides; i += 6) {
        const moviesSlice = popularMovies.slice(i, i + 6);
        const carouselItem = createPopularMoviesCarouselItem(moviesSlice);
        carouselItems.push(carouselItem);
    }

    carouselInner.innerHTML = '';
    carouselItems[0].classList.add('active');
    carouselItems.forEach((item) => carouselInner.appendChild(item));

    const nextButton = document.querySelector('.carousel-control-next');

    nextButton.addEventListener('click', () => {
        const currentSlide = document.querySelector('.carousel-item.active');
        const nextSlide = currentSlide.nextElementSibling || currentSlide.parentElement.firstElementChild;
        currentSlide.classList.remove('active');
        nextSlide.classList.add('active');
    });
}

loadPopularMovies();

async function fetchMovies(page) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=e1f43d3363f8d97feb327b5c1ced2f8a&page=${page}`);
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

function createMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('col-md-4', 'mb-3');

    movieCard.innerHTML = `
    <a href="movie_details.html?id=${movie.id}" class="movieLink">
        <div class="movieDisplay card">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title} Poster" class="movieCard card-img-top">
            <div class="card-body">
                <h5 class="card-title">${movie.title}</h5>
                <p class="card-text">Release Date: ${movie.release_date}</p>
                <p class="card-text">IMDb Rating: ${movie.vote_average}</p>
            </div>
        </div>
    `;

    return movieCard;
}

async function loadMovies() {
    if (isLoading) {
        return;
    }

    const movieCardContainer = document.getElementById('movieCardContainer');

    isLoading = true;
    const movies = await fetchMovies(page);
    isLoading = false;

    if (movies.length === 0) {
        window.removeEventListener('scroll', onScroll);
        return;
    }

    const fragment = document.createDocumentFragment();
    movies.forEach((movie) => {
        const movieCard = createMovieCard(movie);
        fragment.appendChild(movieCard);
    });

    movieCardContainer.appendChild(fragment);
    page++;
}

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        loadMovies();
    }
});

