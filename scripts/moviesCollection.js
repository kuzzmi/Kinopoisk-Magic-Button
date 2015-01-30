function MoviesCollection(movies) {
    this.movies = movies || [];
};

MoviesCollection.prototype.add = function(movie) {
    this.movies.push(movie);
};

MoviesCollection.prototype.get = function(sortProp, desc) {
    if (sortProp) {
        return this.movies.sort(function(a, b) {
            if (desc) {
                return +a[sortProp] - +b[sortProp];
            } else {
                return +b[sortProp] - +a[sortProp];
            }
        });
    } else {
        return this.movies;
    }
};