const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=e1f43d3363f8d97feb327b5c1ced2f8a&append_to_response=credits`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

async function fetchMovieTrailer(movieId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=e1f43d3363f8d97feb327b5c1ced2f8a`);
        const data = await response.json();
        const trailer = data.results.find(result => result.type === 'Trailer');
        return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
    } catch (error) {
        console.error('Error fetching movie trailer:', error);
        return null;
    }
}

function getDirectorName(crew) {
    const director = crew.find(member => member.job === 'Director');
    return director ? director.name : 'Unknown';
}

async function getCastHTML(cast) {
    const castHTMLPromises = cast.map(async (castMember) => {
        const response = await fetch(`https://api.themoviedb.org/3/person/${castMember.id}?api_key=e1f43d3363f8d97feb327b5c1ced2f8a`);
        const data = await response.json();

        return `
            <div class="cast-item">
                <img src="https://image.tmdb.org/t/p/w500${data.profile_path}" alt="${castMember.name}" class="cast-image">
                <p class="cast-name">${castMember.name}</p>
            </div>
        `;
    });

    return (await Promise.all(castHTMLPromises)).join('');
}

async function displayMovieDetails(movieDetails) {
    if (!movieDetails) {
        return;
    }

    const moviePoster = document.getElementById('moviePoster');
    const movieDetailsContainer = document.getElementById('movieDetails');

    moviePoster.src = `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`;
    moviePoster.alt = movieDetails.title;

    const directorName = getDirectorName(movieDetails.credits.crew);

    const movieDetailsHTML = `
        <h2>${movieDetails.title}</h2>
        <p>Release Date: ${movieDetails.release_date}</p>
        <p>IMDb Rating: ${movieDetails.vote_average}</p>
        <p>Director: ${directorName}</p>
        <p>Description: ${movieDetails.overview}</p>
    `;

    movieDetailsContainer.innerHTML = movieDetailsHTML;

    const castContainer = document.getElementById('castContainer');

    const castHTML = await getCastHTML(movieDetails.credits.cast);
    castContainer.innerHTML = castHTML;

    const trailerButton = document.getElementById('trailerButton');
    trailerButton.addEventListener('click', async () => {
        const trailerLink = await fetchMovieTrailer(movieDetails.id);
        if (trailerLink) {
            window.open(trailerLink, '_blank');
        } else {
            alert('No trailer available for this movie.');
        }
    });

    trailerButton.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
    const movieDetails = await fetchMovieDetails(movieId);
    displayMovieDetails(movieDetails);
});
