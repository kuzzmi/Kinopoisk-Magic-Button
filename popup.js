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

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getImageUrl(searchTerm, callback, errorCallback) {
    // Google image search - 100 searches per day.
    // https://developers.google.com/image-search/
    var searchUrl = 'http://rutracker.org/forum/tracker.php?nm=' +
        encodeURIComponent(searchTerm);
    var x = new XMLHttpRequest();
    x.open('GET', searchUrl);
    // The Google image search API responds with JSON, so let Chrome parse it.
    // x.responseType = 'json';
    x.onload = function() {
        // Parse and process the response from Google Image Search.

        var response = x.response;
        var container = document.createElement('div');
        container.innerHTML = response;

        var results = container.querySelectorAll('#tor-tbl .tCenter.hl-tr');

        var titles = [];

        for (var i = 0; i < results.length; i++) {
            var fields = results[i].getElementsByTagName('td');
            var category = fields[2].innerText.trim();
            var title = fields[3].innerText.trim();
            var link = {
                href: fields[5].getElementsByTagName('a')[0].href,
                size: fields[5].getElementsByTagName('a')[0].innerText
            };

            titles.push({
                category: category,
                link: link,
                title: title
            });
        };


        // if (!response || !response.responseData || !response.responseData.results ||
        //     response.responseData.results.length === 0) {
        //     errorCallback('No response from Google Image search!');
        //     return;
        // }
        // var firstResult = response.responseData.results[0];
        // // Take the thumbnail instead of the full image to get an approximately
        // // consistent image size.
        // var imageUrl = firstResult.tbUrl;
        // var width = parseInt(firstResult.tbWidth);
        // var height = parseInt(firstResult.tbHeight);
        // console.assert(
        //     typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
        //     'Unexpected respose from the Google Image Search API!');
        callback(titles);
    };
    x.onerror = function() {
        errorCallback('Network error.');
    };
    x.send();
}

function renderStatus(statusText) {
    document.getElementById('status').innerHTML += statusText;
}

function createRow(item) {
    var tr = document.createElement('tr');

    for (var prop in item) {
        var td = document.createElement('td');

        if (prop === 'link') {
            var a = document.createElement('a');
            a.href = item[prop].href;
            a.innerText = item[prop].size;
            a.target = "_blank";
            td.appendChild(a);
        } else {
            td.className = prop;
            td.innerText = item[prop];
        }
        tr.appendChild(td);
    }

    return tr;
}

function renderTable(items) {
    var table = document.getElementById('table');

    for (var i = 0; i < items.length; i++) {
        table.appendChild(createRow(items[i]));
    }
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