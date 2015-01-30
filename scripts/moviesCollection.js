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

MoviesCollection.prototype.generateTable = function(columns, sortProp, desc) {
    var table = document.createElement('table');
    var movies = this.get(sortProp, desc);
    var fields = columns.map(function(column) {
        return column.field;
    });
    var titles = columns.map(function(column) {
        return column.title;
    });

    var generateHeader = function(titles) {
        var thead = document.createElement('thead');
        var tr = document.createElement('tr');
        for (var i = 0; i < titles.length; i++) {
            var th = document.createElement('th');
            th.innerText = titles[i];
            tr.appendChild(th);
        }
        thead.appendChild(tr);
        return thead;
    };

    table.appendChild(generateHeader(titles));

    for (var i = 0; i < movies.length; i++) {
        var movie = movies[i];
        table.appendChild(movie.generateRow(fields));
    }

    return table;
};