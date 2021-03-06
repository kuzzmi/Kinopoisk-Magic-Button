function getMovieTitle(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    if (!chrome || !chrome.tabs) {
        callback('Avatar');
        return;
    }

    chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];
        var title = tab.title;
        callback(title);
    });
}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function search(searchTerm, callback, errorCallback) {

    var rutracker = new Rutracker();
    rutracker.search(searchTerm, function(moviesCollection) {
        console.log(moviesCollection);
        callback(moviesCollection);
    });

}

function renderStatus(statusText) {
    document.getElementById('status').innerHTML += statusText;
}

Element.prototype.prependChild = function(child) {
    this.insertBefore(child, this.firstChild);
};

function renderTable(moviesCollection) {
    var columns = [{
        title: 'Resolution',
        field: 'resolution'
    }, {
        title: 'Size',
        field: 'size'
    }, {
        title: 'Year',
        field: 'year'
    }, {
        title: 'Title',
        field: 'title:href',
    }, {
        title: 'Director',
        field: 'director'
    }];

    var table = moviesCollection.generateTable(columns, 'resolution');
    var container = document.querySelector('.container');
    container.appendChild(table);
};

function printResultsAmount(items) {
    var resultsCount = document.getElementById('results-count');

    resultsCount.getElementsByTagName('span')[0].innerText = items.length;
}

document.addEventListener('DOMContentLoaded', function() {

    getMovieTitle(function(title) {

        search(title, function(moviesCollection) {

            renderTable(moviesCollection);

        }, function(errorMessage) {
            renderStatus('Cannot display image. ' + errorMessage);
        });
    });

});