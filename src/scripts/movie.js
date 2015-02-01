function Movie(params) {
    this.id = params.id;
    this.title = params.title;
    this.size = params.size;
    this.director = params.director;
    this.year = params.year;
    this.source = params.source;
    this.href = params.href;
    this.resolution = params.resolution;
    this.specs = params.specs;
};

Movie.prototype.generateRow = function(cells) {
    var tr = document.createElement('tr');
    var movie = this;

    tr.className = 'row res' + this.resolution;

    var generateCell = function(property) {
        var td = document.createElement('td');
        td.className = 'cell ' + property;

        if (!!~property.indexOf(':')) {
            var link = property.split(':');
            var baseProp = link[0];
            var linkProp = link[1];

            var a = document.createElement('a');
            a.href = movie[linkProp];
            a.target = '_blank';
            if (baseProp[0] === '"') {
                a.innerText = baseProp.slice(1, -1);
            } else {
                a.innerText = movie[baseProp];
            }
            td.appendChild(a);
        } else {
            td.innerText = movie[property];
        }

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