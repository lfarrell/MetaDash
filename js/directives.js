angular.module('metadataViewerApp').directive('bars', ['tipService', 'StatsService', function(tipService, StatsService) {
    function link(scope, element, attrs) {
        var width = (document.body.clientWidth / 3),
            height = 300,
            margin = {top: 20, right: 25, left: 90, bottom: 75},
            tip = tipService.tipDiv();

        scope.$watchGroup(['data', 'search'], function(values) {
            if(!values[0]) { return; }

            var data = values[0];
            var search = values[1];
        //    var sorted = _.sortByOrder(data, ['type', 'count', 'term'], ['desc', 'desc', 'asc']);
          //  console.log(sorted)
          //  console.log(group_sorted)
            var type_counts = d3.nest()
                .key(function(d) { return d.type; })
                .rollup(function(values) { return d3.sum(values, function(d) {return +d.count; }) })
                .entries(data);

            var sorted_type_counts = _.sortBy(type_counts, 'key');

            var keys = [];

            for(var i=0; i<sorted_type_counts.length; i++) {
                keys.push(sorted_type_counts[i].key);
            }

            var xScale = d3.scale.ordinal()
                .domain(keys)
                .rangeRoundBands([0, width], .05);

            var yScale = d3.scale.linear()
                .domain([0, d3.max(sorted_type_counts, function(d) { return d.values; })])
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left");

            var chart = d3.select(".bars").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            chart.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate("+ margin.left + "," + (height + margin.top) + ")")
                .call(xAxis);

            chart.append("text")
                .attr("x", width / 1.75)
                .attr("y", height + margin.bottom)
                .style("text-anchor", "zs")
                .text("Metadata Type");

            chart.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(yAxis);

            chart.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -height/2)
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Item Count");

            chart.selectAll("bar")
                .data(sorted_type_counts).enter().append("rect")
                .attr("x", function(d) { return xScale(d.key); })
                .attr("width", xScale.rangeBand())
                .attr("y", function(d) { return yScale(d.values); })
                .attr("height", function(d) { return height - yScale(d.values); })
                .attr("transform", "translate(" + margin.left + "," + (margin.top - 1) + ")")
                .on("mouseover", function(d) { /*console.log(d.values)*/ })
                .on("mouseover", function(d) {
                    var text = d.key + ' record returned <br/>' + StatsService.numFormat(d.values) + ' items';
                    tipService.tipShow(tip, text);
                })
                .on("mouseout", function(d) {
                    tipService.tipHide(tip);
                })
                .on("click", function (d) {
                    var facet, term;

                    if(d.term === 'rights') {
                        term = encodeURIComponent(d.term);
                    } else {
                        term = d.term;
                    }

                    if(scope.provider === 'euro') {
                        if(d.term === 'provider') {
                            term = '"' + d.term + '"';
                        }

                        facet = '&qf=' + d.type.toUpperCase() + '%3A' + term;
                    } else {
                        facet = ' ' + term;
                    }

                    window.open(StatsService.provider(scope.provider) + search + facet);
                });
        });
    }

    return {
        restrict: 'C',
        scope: {
            'provider': '@',
            'data': '=',
            'search': '='
        },
        link: link
    }
}]);

angular.module('metadataViewerApp').directive('boxPlot', ['tipService', 'StatsService', function(tipService, StatsService) {
    function link(scope, element, attrs) {
        var width = (document.body.clientWidth / 3),
            height = 300,
            margin = {top: 10, right: 70, left: 70, bottom: 75},
            tip = tipService.tipDiv();

        scope.$watchGroup(['data', 'search'], function(values) {
            if(!values[0]) { return; }

            var datas = values[0];
            var search = values[1];

            // Order & format data
            var sorted = _.sortByOrder(datas, ['type', 'count', 'term'], ['asc', 'desc', 'asc']);
            var nested_data = d3.nest()
                .key(function(d) { return d.type; })
                .key(function(d) { return d.count; })
                .rollup(function(leaves) { return leaves.length; })
                .entries(sorted);

            var keys = _.uniq(_.pluck(datas, 'type').sort(), true);
            var data = [];

            nested_data.forEach(function(d) {
                d.values.forEach(function(g) {
                   data.push({type: d.key, value: +g.key, count: +g.values})
                });
            });

            data.sort(function(a,b) {
                return b.count - a.count;
            });

            var circle_size = d3.scale.sqrt().domain(d3.extent(data, function(d) {
                return d.count;
            })).range([4, 15]).clamp(true);

            var xScale = d3.scale.linear()
                .domain([0, d3.max(data, function(d) { return d.value; })])
                .range([0, width]);

            var yScale = d3.scale.ordinal()
                .domain(keys)
                .rangeRoundBands([height, 0], .05);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left");

            var svg = d3.select(".box-plot").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate("+ margin.left + "," + (height + margin.top) + ")")
                .call(xAxis);

            svg.append("text")
                .attr("x", width / 1.75)
                .attr("y", height + margin.bottom)
                .text("Value Count");

            svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .call(yAxis);

            svg.selectAll("circle")
                .data(data).enter().append("circle")
                .attr("cx", function(d) { return xScale(d.value); })
                .attr("cy", function(d) { return yScale(d.type); })
                .attr("r", function(d) { return circle_size(d.count); })
                .attr("transform", "translate("+ margin.left + "," + (margin.top + 25) + ")")
                .on("mouseover", function(d) {
                    var text = d.count + ' record returned <br/>' + StatsService.numFormat(d.value) + ' items for <br/>' + d.type;
                    tipService.tipShow(tip, text);
                })
                .on("mouseout", function(d) {
                    tipService.tipHide(tip);
                });
        });
    }

    return {
        restrict: 'C',
        scope: {
            'provider': '@',
            'data': '=',
            'search': '='
        },
        link: link
    }
}]);

/**
 * Directive for creating tree maps
 * Port of http://mbostock.github.io/d3/talk/20111018/treemap.html to Angular
 */
angular.module('metadataViewerApp').directive('treeMap', ['tipService', 'StatsService', function(tipService, StatsService) {
    function link(scope, element, attrs) {
        var w = document.body.clientWidth - 60,
            h = 720,
            x = d3.scale.linear().range([0, w]),
            y = d3.scale.linear().range([0, h]),
            color = d3.scale.category10(),
            root,
            node;

        scope.$watchGroup(['data', 'search'], function(values) {
            if(!values[0]) { return; }

            var data = values[0];
            var search = values[1];

            var tip = tipService.tipDiv();

            var treemap = d3.layout.treemap()
                .round(false)
                .size([w, h])
                .sticky(true)
                .value(function (d) {
                    return d.count;
                });

            var svg = d3.select("#trees")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .append("g")
                .attr("transform", "translate(.5,.5)");


            var formatted_data = {"name": "items","children": []};
            var nested_data = d3.nest()
                .key(function(d) { return d.type; })
                .map(data);

            for(var key in nested_data) {
                var format = { name: key, children: nested_data[key] };
                formatted_data.children.push(format);
            }

            node = root = formatted_data;

            var nodes = treemap.nodes(root)
                .filter(function (d) {
                    return !d.children;
                });

            var cell = svg.selectAll("g")
                .data(nodes)
                .enter().append("g")
                .attr("class", "cell")
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                })
                .on("click", function (d) {
                    var facet, term;

                    if(node == root) {
                        return zoom(d.parent);
                    }

                    if(d.term === 'rights') {
                        term = encodeURIComponent(d.term);
                    } else {
                        term = d.term;
                    }

                    if(scope.provider === 'euro') {
                        if(d.term === 'provider') {
                            term = '"' + d.term + '"';
                        }

                        facet = '&qf=' + d.type.toUpperCase() + '%3A' + term;
                    } else if(scope.provider === 'dpla') {
                        facet = '&type[]=' + term;
                    } else {
                        facet = '&view=list&tab=' + term;
                    }

                    window.open(StatsService.provider(scope.provider) + search + facet);
                });

            cell.append("rect")
                .attr("width", function (d) {
                    return d.dx - 1;
                })
                .attr("height", function (d) {
                    return d.dy - 1;
                })
                .style("fill", function (d) {
                    return color(d.type);
                })
                .on("mouseover", function(d) {
                    var text = d.term + '<br/> returned ' + StatsService.numFormat(d.count) + ' items for <br/>' + d.type;
                    tipService.tipShow(tip, text);
                })
                .on("mouseout", function(d) {
                    tipService.tipHide(tip);
                });

            cell.append("foreignObject")
                .attr("class", 'fobj')
                .attr("width", function (d) {
                    return d.dx - 2;
                })
                .attr("height", function (d) {
                    return d.dy - 2;
                })
                .style("font-size", ".8em")
                .style("pointer-events", "none")
                .text(function (d) {
                    return d.term;
                });

            d3.select(window).on("click", function () {
                zoom(root);
            });

            d3.select("select").on("change", function () {
                treemap.value(this.value == "size" ? size : count).nodes(root);
                zoom(node);
            });

            d3.select(element[0]).append("p")
                .text("Implementation of zoomable treemap by Mike Bostock, http://mbostock.github.io/d3/talk/20111018/treemap.html")
                .style("color", "gray")
                .style("font-size", "12px");

            function size(d) {
                return d.count;
            }

            function count(d) {
                return 1;
            }

            function zoom(d) {
                var kx = w / d.dx, ky = h / d.dy;
                x.domain([d.x, d.x + d.dx]);
                y.domain([d.y, d.y + d.dy]);

                var t = svg.selectAll("g.cell").transition()
                    .duration(d3.event.altKey ? 7500 : 750)
                    .attr("transform", function (d) {
                        return "translate(" + x(d.x) + "," + y(d.y) + ")";
                    });

                t.select("rect")
                    .attr("width", function (d) {
                        return kx * d.dx - 1;
                    })
                    .attr("height", function (d) {
                        return ky * d.dy - 1;
                    });

                t.select(".fobj") // select foreignObject's class. Webkit browsers will give an empty selection otherwise
                    .attr("width", function (d) {
                        return kx * d.dx - 2;
                    })
                    .attr("height", function (d) {
                        return kx * d.dy - 2;
                    });

                node = d;
                d3.event.stopPropagation();
            }
        });
    }

    return {
        restrict: 'C',
        scope: {
            'provider': '@',
            'data': '=',
            'search': '='
        },
        link: link
    }
}]);