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

        var rows = container.querySelectorAll(me.parseRules.rows);

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var fields = row.querySelectorAll(me.parseRules.cells);

            movies.add(new Movie({
                resolution: me.applyParseRule(fields, me.parseRules.resolution),
                id: me.applyParseRule(fields, me.parseRules.id),
                size: me.applyParseRule(fields, me.parseRules.size),
                year: me.applyParseRule(fields, me.parseRules.year),
                title: me.applyParseRule(fields, me.parseRules.title),
                director: me.applyParseRule(fields, me.parseRules.director),
                href: me.applyParseRule(fields, me.parseRules.href),
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
    } else {
        result = elem.innerText.trim();
    }

    return result;
};