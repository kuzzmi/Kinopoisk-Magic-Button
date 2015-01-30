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

var ajax = {
    get: function(url, headers, callback, errorCallback) {
        var x = new XMLHttpRequest();
        x.open('GET', url);
        if (typeof headers === 'object') {
            for (var name in headers) {
                var header = headers[name];
                x.setRequestHeader(name, header);
            }
        }
        x.onload = function() {
            if (typeof headers === 'function') {
                headers(x.response);
            } else {
                callback(x.response);
            }
        };
        x.onerror = errorCallback;
        x.send();
        return x;
    }
};

function TrackerSearch(url, term, parseRules) {
    this.searchUrl = url + encodeURIComponent(term);
    this.parseRules = parseRules;
};

TrackerSearch.prototype.search = function(callback, errorCallback) {
    var me = this;
    ajax.get(me.searchUrl, function(response) {
        var movies = new MoviesCollection();
        var container = document.createElement('div');
        container.innerHTML = response;

        var rows = container.getElementsByTagName(me.parseRules.rows);

        console.log(me.searchUrl, me.parseRules.rows, rows);

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var fields = row.getElementsByTagName(me.parseRules.cells)

            movies.add(new Movie({
                resolution: me.applyParseRule(fields, me.parseRules.resolution),
                id: me.applyParseRule(fields, me.parseRules.id),
                size: me.applyParseRule(fields, me.parseRules.size),
                year: me.applyParseRule(fields, me.parseRules.year),
                title: me.applyParseRule(fields, me.parseRules.title)
            }));
        }

        callback(movies);
    }, function() {});
};

TrackerSearch.prototype.applyParseRule = function(fields, rule) {
    var result;
    var elem = fields[rule.index];

    if (rule.processing) {
        result = rule.processing(elem);
        console.log(result);
    } else {
        result = elem.innerText.trim();
    }

    return result;
};

function RutrackerSearch(searchTerm) {
    var me = new TrackerSearch(this.url, searchTerm, this.parseRules);

    return me;
};

RutrackerSearch.prototype.url = 'http://rutracker.org/forum/tracker.php?f=313&nm=';
RutrackerSearch.prototype.parseRules = {
    rows: '#tor-tbl .tCenter.hl-tr',
    cells: 'td',

    resolution: {
        index: 3,
        processing: function(elem) {
            return elem.innerText.trim().match(/720|1080/)[0] || 0;
        }
    },

    id: {
        index: 2
    },

    size: {
        index: 2
    },

    year: {
        index: 2
    },

    title: {
        index: 2
    }
};

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function search(searchTerm, callback, errorCallback) {

    var rs = new RutrackerSearch(searchTerm);
    rs.search(callback);

    /* var nnm = 'http://nnm-club.me/forum/tracker.php?f=227&nm=';
    var rutracker = 'http://rutracker.org/forum/tracker.php?f=313&nm=';
    var encoded = encodeURIComponent(searchTerm);
    var movies = new MoviesCollection();

    ajax.get(rutracker + encoded, function(response) {
        var container = document.createElement('div');
        container.innerHTML = response;

        var results = container.querySelectorAll('#tor-tbl .tCenter.hl-tr');

        for (var i = 0; i < results.length; i++) {
            var fields = results[i].getElementsByTagName('td');
            var category = fields[2].innerText.trim();
            var desc = fields[3].innerText.trim();
            var topicId = fields[3].getElementsByTagName('a')[0].dataset.topic_id;

            var title = desc.match(/(.*?)\s*\((.*?)\)/g)[0];
            var year = desc.match(/((19|20)[\d]{2})/g)[0];
            var specs = desc.match(/\[.*\]/g)[0];
            var size = fields[5].getElementsByTagName('a')[0].innerText.slice(0, -2);

            var resolution = desc.match(/720|1080/);
            if (!resolution) {
                resolution = 0;
            } else {
                resolution = resolution[0];
            }

            movies.add(new Movie({
                resolution: resolution,
                id: topicId,
                size: size,
                year: year,
                title: title
            }));
        }

        ajax.get(nnm + encoded, function(response) {
            container.innerHTML = response;

            results = container.querySelectorAll('.forumline.tablesorter tr[class]');
            callback(movies.get('resolution', true));
            printResultsAmount(results);
        }, function() {
            errorCallback('Network error.');
        })

    }, function() {
        errorCallback('Network error.');
    });*/
}

function renderStatus(statusText) {
    document.getElementById('status').innerHTML += statusText;
}

function createRow(item) {
    var tr = document.createElement('tr');

    for (var prop in item) {
        var td = document.createElement('td');
        if (prop === 'topicId') {
            continue;
        }
        if (prop === 'title') {
            var a = document.createElement('a');
            a.href = 'http://rutracker.org/forum/viewtopic.php?t=' + item.topicId;
            a.innerText = item.title;
            a.target = "_blank";
            td.appendChild(a);
        } else {
            td.className = prop;
            td.innerText = item[prop];
            if (prop === 'resolution') {
                tr.className += ' res' + item[prop];
                if (item[prop] === 0) {
                    td.innerText = 'Unknown';
                }
            }
        }
        tr.appendChild(td);
    }

    return tr;
}

Element.prototype.prependChild = function(child) {
    this.insertBefore(child, this.firstChild);
};

function renderTable(items) {
    var table = document.getElementById('table');
    printResultsAmount(items);
    var rows = [];
    for (var i = 0; i < items.length; i++) {
        rows.push(items[i].generateRow());
    }

    printResultsAmount(rows);
    // table.children = rows;
    for (var i = 0; i < rows.length; i++) {
        table.prependChild(rows[i]);
    };
    console.log(rows.length);
}

function printResultsAmount(items) {
    var resultsCount = document.getElementById('results-count');

    resultsCount.getElementsByTagName('span')[0].innerText = items.length;
}

document.addEventListener('DOMContentLoaded', function() {

    getMovieTitle(function(title) {
        search(title, function(items) {
            renderTable(items);
        }, function(errorMessage) {
            renderStatus('Cannot display image. ' + errorMessage);
        });
        // Put the image URL in Google search.
        // renderStatus('Performing Google Image search for ' + url);

        // search(url, function(imageUrl, width, height) {

        //     renderStatus('Search term: ' + url + '\n' +
        //         'Google image search result: ' + imageUrl);
        //     var imageResult = document.getElementById('image-result');
        //     // Explicitly set the width/height to minimize the number of reflows. For
        //     // a single image, this does not matter, but if you're going to embed
        //     // multiple external images in your page, then the absence of width/height
        //     // attributes causes the popup to resize multiple times.
        //     imageResult.width = width;
        //     imageResult.height = height;
        //     imageResult.src = imageUrl;
        //     imageResult.hidden = false;

        // }, function(errorMessage) {
        //     renderStatus('Cannot display image. ' + errorMessage);
        // });
    });
});