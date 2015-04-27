/**
 * wiki namespace.
 */
if (typeof wiki == "undefined") {
    var wiki = {
        init : function() {
            this.attribute = null;
        },
        getWikiArticles: function(point){
            var wikipediaURL = 'http://ws.geonames.org/findNearbyWikipediaJSON?formatted=true'+
                '&lat=' + point.lat() + '&lng='+
                point.lon() + '&style=full&username=mrmikee';

            var wikiRequestTimeout = setTimeout(function(){
                console.log("failed to get wikipedia resources");
                $('#wiki').html('<div class="error">Wikipedia Communications Error.</div>');
            }, 8000);

            $.ajax({
                url: wikipediaURL,
                jsonp: "callback",
                dataType: "json",
                success: function( response ) {
                    clearTimeout(wikiRequestTimeout);
                    var article_list = response.geonames;
                    var wikiItems = '<ul>';
                    if (article_list.length > 0){
                        for (var x = 0; x < article_list.length; x++) {
                            article = article_list[x];
                            console.log(article.wikipediaUrl);
                            wikiItems += '<li><a href="http://' + article.wikipediaUrl +
                                    '">' + article.title + '</a></li>';
                            // console.log(article.title + ' http://' + article.wikipediaUrl);
                        };
                        wikiItems += '</ul>';
                        $("#wiki").html(wikiItems);
                        return article_list;
                    }else{
                        $('#wiki').html('No Wikipedia Articles found near here.');
                    }
                },
                fail: function(error){
                    console.log(error);

                }
            });
        }
    };

    wiki.init();
};
