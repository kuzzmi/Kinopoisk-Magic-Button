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