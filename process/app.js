'use strict';

var Q       = require('q');
var scrap   = require('scrap');

/**
 * getLabel - passes in the config object from the client.
 * This function MUST exist and MUST return a string.
 */
exports.getLabel = function(property, settings){

    // this is the object saved from your the /input portion of the slab.
    var searchTerm  = 'news';
    var siteUrl     = 'http://news.bbc.co.uk';

    if(settings && settings.searchTerm && settings.siteUrl){
        searchTerm  = settings.searchTerm;
        siteUrl     = settings.siteUrl;
    }

    if(property == 'mentions'){
        return searchTerm + ' on '+ siteUrl;
    }

    return 'bad property name';

};



/**
 * getData - passes in the config object from the client.
 * This function MUST exist and MUST return a promise.
 */
exports.getData = function(settings) {
    

  var urls = settings.siteUrl.replace(' ', '').split(",");

  var searches = [];

  urls.forEach(function(url){
    searches.push({term:settings.searchTerm, url:url});
  });

  var calls = searches.map(scrape);

  var deferred = Q.defer();

  Q.all(calls)
    .then(function(data){
      deferred.resolve({mentions:data});
    },function(err){
      deferred.reject(err);
    });

  return deferred.promise;

};

function scrape(search){

    var searchTerm  = search.term;
    var siteUrl     = search.url;

    // Slabs works on a promise system - for this we use the excellent 'Q' library.
    var deferred = Q.defer();

    var data = {
        value: 0,
        url: siteUrl
    };

    scrap({url:siteUrl, timeout:5000}, function(err, $) {

        if(err){
            console.log('Scrape Error');
            console.error(err);
            deferred.reject(err);
            return;
        }

        var pageContents = $('body').html();
        var res = pageContents.match(new RegExp(searchTerm, 'gi'));

        if(res){
            data.value = res.length;
            deferred.resolve(data);
        }else{
            deferred.resolve(data);
        }

    });

    return deferred.promise;
}


