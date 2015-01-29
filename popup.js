// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 **/
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        var title = tab.title;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        // console.assert(typeof url == 'string', 'tab.url should be a string');
        // console.log(tab);
        callback(title);
    });

    // Most methods of the Chrome extension APIs are asynchronous. This means that
    // you CANNOT do something like this:
    //
    // var url;
    // chrome.tabs.query(queryInfo, function(tabs) {
    //   url = tabs[0].url;
    // });
    // alert(url); // Shows "undefined", because chrome.tabs.query is async.
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

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getImageUrl(searchTerm, callback, errorCallback) {
    var url = 'http://rutracker.org/forum/tracker.php?f=313&nm=' +
        encodeURIComponent(searchTerm);

    ajax.get(url, function(response) {
        var container = document.createElement('div');
        container.innerHTML = response;

        var results = container.querySelectorAll('#tor-tbl .tCenter.hl-tr');

        var titles = [];

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

            titles.push({
                // category: category,
                resolution: resolution,
                topicId: topicId,
                size: size,
                year: year,
                title: title,
                // specs: specs
            });

        };
        titles = titles.sort(function(a, b) {
            return +a.resolution - +b.resolution;
        });
        callback(titles);
    }, function() {
        errorCallback('Network error.');
    });
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
        rows.push(createRow(items[i]));
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

    getCurrentTabUrl(function(url) {
        getImageUrl(url, function(items) {
            renderTable(items);
        }, function(errorMessage) {
            renderStatus('Cannot display image. ' + errorMessage);
        });
        // Put the image URL in Google search.
        // renderStatus('Performing Google Image search for ' + url);

        // getImageUrl(url, function(imageUrl, width, height) {

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