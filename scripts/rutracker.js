function Rutracker() {};

Rutracker.prototype.search = function(searchTerm, callback, errorCallback) {
    var searcher = new TrackerSearch(this.url, searchTerm, this.parseRules);
    return searcher.search(callback, errorCallback);
}
Rutracker.prototype.url = 'http://rutracker.org/forum/tracker.php?f=313&nm=';
Rutracker.prototype.parseRules = {
    rows: '#tor-tbl .tCenter.hl-tr',
    cells: 'td',

    resolution: {
        index: 3,
        processing: function(elem) {
            var match = elem.innerText.trim().match(/720|1080/);
            return match === null ? 0 : match[0];
        }
    },

    id: {
        index: 3,
        processing: function(elem) {
            return elem.getElementsByTagName('a')[0].dataset.topic_id;
        }
    },

    size: {
        index: 5,
        processing: function(elem) {
            return elem.getElementsByTagName('a')[0].innerText.slice(0, -2);
        }
    },

    year: {
        index: 3,
        processing: function(elem) {
            var desc = elem.innerText.trim();

            return desc.match(/((19|20)[\d]{2})/g)[0];
        }
    },

    title: {
        index: 3,
        processing: function(elem) {
            var title = elem.innerText.trim().match(/(.*?)\s*\((.*?)\)/g)[0];

            return title.match(/(^.*) \(/g)[0].slice(0, -2);
        }
    },

    director: {
        index: 3,
        processing: function(elem) {
            var title = elem.innerText.trim().match(/(.*?)\s*\((.*?)\)/g)[0];

            return title.match(/\((.*)\)/g)[0].slice(1, -1);
        }
    }
};