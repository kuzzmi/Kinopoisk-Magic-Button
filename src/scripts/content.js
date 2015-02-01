function getMovieTitle() {
    return document.querySelector('[itemprop="alternativeHeadline"]').innerText;
}

getMovieTitle();

Element.prototype.prependChild = function(child) {
    this.insertBefore(child, this.firstChild);
};

function renderTable(moviesCollection) {
    var newMenuSub = document.querySelector('#syn table .brand_words');
    var parentDiv = newMenuSub.parentNode;
    var columns = [{
        title: 'Разрешение',
        field: 'resolution'
    }, {
        title: 'Размер',
        field: 'size'
    }, {
        title: 'Год',
        field: 'year'
    }, {
        title: 'Название',
        field: 'title',
    }, {
        title: 'Режиссер',
        field: 'director'
    }, {
        title: 'Ссылка',
        field: '"Перейти →":href'
    }];

    var table = moviesCollection.generateTable(columns, 'resolution');

    var td = document.createElement('td');
    var tr = document.createElement('tr');
    var a = document.createElement('a');
    td.className = 'main_line';
    td.style.verticalAlign = 'middle';
    td.style.height = '25px';
    td.colspan = '3';
    a.innerText = 'Скачать';
    td.appendChild(a);
    tr.appendChild(td);
    document.querySelector('#syn table tbody').prependChild(tr);

    parentDiv.insertBefore(table, newMenuSub);
};

function search(searchTerm, callback, errorCallback) {
    var rutracker = new Rutracker();
    rutracker.search(searchTerm, function(moviesCollection) {
        console.log(moviesCollection);
        callback(moviesCollection);
    });
}

search(getMovieTitle(), function(moviesCollection) {

    renderTable(moviesCollection);

}, function(errorMessage) {
    console.log('Cannot display image. ' + errorMessage);
});