function Movie(params) {
    this.id = params.id;
    this.title = params.title;
    this.size = params.size;
    this.year = params.year;
    this.source = params.source;
    this.resolution = params.resolution;
    this.specs = params.specs;
};

Movie.prototype.generateRow = function() {
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

    addCell('resolution');
    addCell('size');
    addCell('year');
    addCell('title');

    return tr;
};