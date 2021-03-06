(function () {
    function truncate(str, maxLength, suffix) {
        if(str.length > maxLength) {
            str = str.substring(0, maxLength + 1);
            str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
            str = str + suffix;
        }
        return str;
    }

    /* Using fake data for now */

    var stops = ["Squires West", "Main Red / Maple Nbnd", "Squires East", "Fairfax Ellett Nbnd"];
    fake_data = [];

    for (var i = 0; i < 10; i++) {
        var time = 0,
            actual = 0;
        for (var j = 0; j < stops.length; j++) {
            time += Math.floor(Math.random() * 100);
            actual += Math.floor(Math.random()  * 100);
            fake_data.push({
                        "trip": i,
                        "stop": stops[j],
                        "delta": time - actual,
                        "boarded": Math.floor(Math.random() * 50)
                    });
        }
    }

    /* End fake data generation */

    var xAxis,
        margin = {top: 20, right: 200, bottom: 0, left: 20},
        width = 500,
        height = 650
        cellSize = 40;

    updateTripView = function (data, sel) {
        d3.select(sel).selectAll("svg").remove();

        var svg = d3.select(sel).append("svg")
            .attr("class", "RdYlBl")
            .attr("width", width + margin.left + margin.right)
            //.attr("height", height + margin.top + margin.bottom)
            .attr("height", height)// + margin.top + margin.bottom)
            .style("margin-left", margin.left + "px")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var c = d3.scale.category20c();

        var x = d3.scale.linear()
            .range([0, width]);

        var stops = [];
        for (var i = 0; i < data.length; i++) {
            if (stops.indexOf(data[i]["stop"]) == -1) {
                stops.push(data[i]["stop"]);
            }
        }

        var maxPassengers = d3.max(data, function(d) { return d.boarded; });
        var maxAdherence = d3.max(data, function(d) { return Math.abs(d["delta"]); });

        var color = d3.scale.quantize()
            .domain([maxAdherence, 0.0])
            .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

        x = d3.scale.ordinal()
            .domain(stops)
            .range(d3.range(stops.length));

        xAxis = d3.svg.axis()
            .scale(x)
            .orient("top");

        data = d3.nest()
            .key(function (d) { return d["trip"]; })
            .key(function (d) { return d["stop"]; })
            .map(data);

        var xScale = d3.scale.linear()
            .domain([x(stops[0]), x(stops[stops.length - 1])])
            .range([0, stops.length * cellSize]);

        var abbr = function (str) {
            var words = str.split(' ');
            return words.map(function (word) { return word[0]; }).join('');
        };

        var g = svg.append("g")
            .attr("class","journal");

        var stopList = function (obj) {
            return Object.keys(obj).map(function (key) {
                return {"stop": key,
                    "entries": obj[key]
                };
            });
        };

        var avePassengers = function (d) {
            return d.entries.reduce(function (acc, curr) {
                return acc + curr.boarded;
            }, 0) / d.entries.length;
        };

        var aveAdherence = function (d) {
            return d.entries.reduce(function (prev, curr) {
                return prev + Math.abs(curr.delta);
            }, 0) / d.entries.length;
        };

        var outerx = function (d) {
            return cellSize * x(d.stop);
        };

        var outery = function (trip) {
            return trip * cellSize;
        };

        var innerx = function(d) {
            var person = d.num;
            return (person % 6) * (cellSize / 6);
        }

        var innery = function(d) {
            var person = d.num;
            return (Math.floor(person / 6)) * (cellSize / 6);
        }

        for (var trip_no in data) {
            var trip = stopList(data[trip_no]),
                people = [],
                nodes;

            for (var idx = 0; idx < trip.length; idx++) {
                g = svg.append("g").attr("class","journal")
                .attr("transform", "translate(" + outerx(trip[idx]) + "," + outery(trip_no) + ")");

                people = d3.range(avePassengers(trip[idx])).map(function(x) { return {num: x, pid: trip_no + "-" + idx + "-" + x}; });

                nodes = g.selectAll("rect")
                    .data(people)
                    .enter()
                    .append("rect")
                    .attr("x", function(d) { return innerx(d); })
                    .attr("y", function(d) { return innery(d); })
                    //.attr("y", circleY)
                    .attr("width", function() { return cellSize / 6; })
                    .attr("height", function() { return cellSize / 6; })
                    //.attr("height", circleRadius)
                    .attr("class", function(d) { return "day " + color(aveAdherence(trip[idx])); });
            }
        }

        drawGrid(svg, 40 / 6, 30 * 6, "#eee");
        drawGrid(svg, cellSize, 30, "#111");

        d3.select("#trip-legend").remove();
        var legendDiv = d3.select(sel)
                .insert("div", "svg")
                .attr("id", "trip-legend")
                .attr("class", "RdYlBl");

        insertLegend(legendDiv,
            "Average difference between scheduled and actual arrival times: ",
            0,
            maxAdherence,
            squareLegend(function (node) {
                node.attr("class", function(d) { return "day " + color(d); });
                //node.style("fill", function (d) { return d3.hsl(0, d / maxAdherence, 0.7); });
            }));

        /*insertLegend(legendDiv,
            "Number of passengers: ",
            0,
            maxPassengers,
            squareLegend(function (node) {
                node
                    .attr("height", function (d) { return rScale(d); })
                    .attr("width", function (d) { return rScale(d); });
            }));*/
    };

    function insertLegend(div, label, min, max, showSpectrum) {
            div.append("p")
                .text(label);

            div.append("span")
                .text(min);

            showSpectrum(div, min, max);

            div.append("span")
                .text(" " + max);
    }

    function squareLegend(toBeNamed) {
        return function (legend, min, max) {
            var cellSize = 12,
                spectrum = d3.range(min + (max - min) / 5, max + (max - min) / 5, (max - min) / 5);
            toBeNamed(legend.append("svg")
                .style("width", cellSize * 5.0)
                .style("height", cellSize * 1.1)
                .selectAll("box")
                .data(spectrum)
                .enter().append("rect")
                .attr("width", cellSize)
                .attr("height", cellSize)
                .attr("x", function(d) { return cellSize * spectrum.indexOf(d); }));
        };
    }

    function circleLegend(toBeNamed) {
        return function (legend, min, max) {
            var spectrum = d3.range(min, max, (max - min) / 4);
            toBeNamed(legend.append("svg")
                .style("width", 20 * 4.1)
                .style("height", 20 * 1.1)
                .selectAll("legend-circle")
                .data(spectrum)
                .enter().append("circle")
                .attr("cx", function (d) { return d * 20 * 4 / max + 10; })
                .attr("cy", 10)
                .style("fill", function (d) { return d3.hsl(0, 0.5, 0.7); }));
        };
    }

    var drawGrid = function (svg, cellSize, numCells, color) {
        svg.selectAll(".vline").data(d3.range(numCells)).enter()
            .append("line")
            .attr("x1", function (d) {
                return d * cellSize;
            })
            .attr("x2", function (d) {
                return d * cellSize;
            })
            .attr("y1", function (d) {
                return 0;
            })
            .attr("y2", function (d) {
                return numCells * cellSize;
            })
            .style("stroke", color);

        // horizontal lines
        svg.selectAll(".vline").data(d3.range(numCells)).enter()
            .append("line")
            .attr("y1", function (d) {
                return d * cellSize;
            })
            .attr("y2", function (d) {
                return d * cellSize;
            })
            .attr("x1", function (d) {
                return 0;
            })
            .attr("x2", function (d) {
                return numCells * cellSize;
            })
            .style("stroke", color);
    };
})();
