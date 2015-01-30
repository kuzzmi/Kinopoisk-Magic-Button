function Movie(params) {
    this.id = params.id;
    this.title = params.title;
    this.size = params.size;
    this.director = params.director;
    this.year = params.year;
    this.source = params.source;
    this.resolution = params.resolution;
    this.specs = params.specs;
};

Movie.prototype.generateRow = function(cells) {
    var tr = document.createElement('tr');
    var movie = this;

    tr.className = 'row';

    var generateCell = function(property) {
        var td = document.createElement('td');
        td.className = 'cell ' + property;
        td.innerText = movie[property];
        return td;
    };

    var addCell = function(property) {
        tr.appendChild(generateCell(property));
    }

    for (var i = 0; i < cells.length; i++) {
        addCell(cells[i]);
    };

    return tr;
};