angular.module('metadataViewerApp').service('LoadService', function() {
    this.file_load = function (text_file, $scope) {
        d3.json(text_file, function (error, graph) {
            load(graph);
        });

        function load(data) {
            // put the data into angular's scope
            $scope.data = data;
            $scope.loading = false;
            $scope.loaded = true;
            $scope.search_term = $scope.search;
            $scope.search = '';

            $scope.$apply();
        }
    };

    this.queryFormat = function(terms) {
        return terms.replace(/\s+/g, '+');
    };

    this.canvasFormat = function($scope) {
        $scope.loading = true;
        $scope.loaded = false;

        d3.selectAll("svg").remove();

        return $scope;
    };

    this.chartChange = function($scope) {
        $scope.graphType = function(t) {
            $scope.chart = t;
        };

        return $scope;
    };
});

angular.module('metadataViewerApp').service('tipService', function() {
    this.tipDiv = function() {
        var tip = document.querySelectorAll(".tooltip"); // check that there's not already a tip div

        if(tip.length) {
            return d3.select(".tooltip");
        }

        return d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

    };

    this.tipShow = function(tip, text) {
        tip.transition()
            .duration(200)
            .style("opacity", .9);

        tip.html(text)
            .style("top", (d3.event.pageY-38)+"px")
            .style("left", (d3.event.pageX-38)+"px");

    };

    this.tipHide = function(tip) {
        tip.transition()
            .duration(500)
            .style("opacity", 0);
    };
});

angular.module('metadataViewerApp').service('StatsService', function() {
    this.numFormat = function(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    this.provider =  function(p) {
        switch (p) {
            case "dpla":
                return "http://dp.la/search?q=";
                break;
            case "euro":
                return "http://www.europeana.eu/portal/search.html?query=";
                break;
            case "digitalnz":
                return "http://www.digitalnz.org/records?text=";
                break;
            default:
                return "http://dp.la/search?q=";
        }
    };

    this.textFormat = function(number) {
        return (number > 1) ? 's' : '';
    };
});