
/*
 * we assume the following global variables are defined:
 * - svg, plot
 * - xScale, yScale
 * - config 
 */

/*
 * draw white plot background
 * useful for debugging before we draw the heatmap
 */

var cellOpacity = 0;

var months = new Array(12);
months[0] = "Jan";
months[1] = "Feb";
months[2] = "Mar";
months[3] = "Apr";
months[4] = "May";
months[5] = "Jun";
months[6] = "Jul";
months[7] = "Aug";
months[8] = "Sept";
months[9] = "Oct";
months[10] = "Nov";
months[11] = "Dec";

var drawBackground = function () {
    plot.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", config.plot.width)
      .attr("height", config.plot.height)
      .style("fill", "white");
};

/*
 * draws the x and y axis
 * https://github.com/mbostock/d3/wiki/SVG-Axes#axis
 */
var drawAxes = function () {
    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .tickPadding(0)
      .tickFormat(function (d) {
          return months[d.getMonth()] + " " + d.getDate();
      });

    var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .tickPadding(0);

    plot.append("g")
      .attr("id", "x-axis")
      .attr("class", "axis")
      .attr("transform", translate(0, config.plot.height))
      .call(xAxis)
      .style("fill", function (d) {

          //Hide X-axis if label is not visible 
          if (cellOpacity == 0) {
              return "#FFFFFF";
          }

      });

    plot.append("g")
      .attr("id", "y-axis")
      .attr("class", "axis")
      .call(yAxis);
};


/*
 * draws the heatmap
 * not too complicated due to how we nested the data
 * but, it can be tricky to figure out which scale to use where
 */
var drawHeatmap = function () {

    // create a group per row
    var rows = plot.append("g")
      .attr("id", "heatmap")
      .attr("class", "cell")
      .selectAll("g")
      .data(data2)
      .enter()
      .append("g")
      .attr("id", function (d) { return "Region-" + d["RegionID"]; })
      .attr("transform", function (d) { return translate(0, yScale(d["RegionName"])); });


    // create rect per column
    var cells = rows.selectAll("rect")
      .data(function (d) { return d.values; })
      .enter()
      .append("rect")
      .attr("x", function (d) { return xScale(d.date); })
      .attr("y", 0)
      .attr("width", xScale.rangeBand())
      .attr("height", yScale.rangeBand())
      //.on("click", function (d, i) { alert(months[d.date.getMonth()] + " " + d.date.getDate() + " - " + numberWithCommas(d.value)); })
      //.on("mouseover", function (d, i) { alert(d.value); })
      //.on("mouseout", function (d, i) { alert(d.value); })
      .style("fill", function (d) {

          var box = this.getBBox();

          if (box.width < 45) {
              cellOpacity = 0;
          }
          else {
              cellOpacity = 1;
          }

          return colorScale(d.value);
      })
      .append("title")
      .text(function (d) { return months[d.date.getMonth()] + " " + d.date.getDate() + " - " + numberWithCommas(d.value); });


    //// create rect per column
    //var cells = rows.selectAll("image")
    //  .data(function (d) { return d.values; })
    //  .enter()
    //  .append("image")
    //  .attr("xlink:href", function (d) {return "Image.ashx?num=" + nFormatter(d.value, 1);})
    //  .attr("x", function (d) { return xScale(d.date); }) 
    //  .attr("y", 0) 
    //  .attr("width", xScale.rangeBand())
    //  .attr("height", yScale.rangeBand())
    //  .on("click", function (d, i) { alert(d.value); });


    labels = rows.selectAll("text")
      .data(function (d) { return d.values; })
      .enter()
      .append("text")
      .attr("x", function (d) { return xScale(d.date); })
      .attr("y", function (d) { return "1.35em"; })
      .style({
          stroke: "DarkGray",
          "stroke-width": "0.2px",
          "font-size": "10px",
          "font-family": "Verdana",
          "font-weight": "normal"
      })
      .text(function (d) { return nFormatter(d.value, 1); })
      .style("opacity", function () { return cellOpacity; });

};

/*
 * draw plot title in upper left margin
 * will center the text in the margin
 */
var drawTitle = function () {
    var title = svg.append("text")
      .text("My Test")
      .attr("id", "title")
      .attr("x", config.margin.left)
      .attr("y", 0)
      .attr("dx", 0)
      .attr("dy", "18px")
      .attr("text-anchor", "left")
      .attr("font-size", "18px");

    // shift text so it is centered in plot area
    var bounds = title.node().getBBox();
    var yshift = (config.margin.top - bounds.height) / 2;
    title.attr("transform", translate(0, yshift));
};

/*
 * draw a color legend at top of plot
 * this is ridiculously hard for the amount of pixels we
 * are drawing, but it is also ridiculously important
 *
 * another approach is to threshold our values
 * we will leave that for another time
 */
var drawLegend = function () {
    // map our color domain to percentage stops for our gradient
    // we know min is 0% and max is 100%
    // but we have to find where the average falls between there
    var percentScale = d3.scale.linear()
      .domain(d3.extent(colorScale.domain()))
      .rangeRound([0, config.legend.width]);

    svg.append("defs")
      .append("linearGradient")
      .attr("id", "gradient")
      .selectAll("stop")
      .data(colorScale.domain())
      .enter()
      .append("stop")
      .attr("offset", function (d) {
          return "" + percentScale(d) + "%";
      })
      .attr("stop-color", function (d) {
          return colorScale(d);
      });

    // create group for legend elements
    // will translate it to the appropriate location later
    var legend = svg.append("g")
     .attr("id", "legend")
     .attr("transform", translate(
       config.svg.width - config.margin.right - config.legend.width,
       (config.margin.top - config.legend.height) / 2)
     );

    // draw the color rectangle with gradient
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", config.legend.width)
      .attr("height", config.legend.height)
      .attr("fill", "url(#gradient)");

    // create another scale so we can easily draw an axis on the color box
    var legendScale = d3.scale.linear()
      .domain(percentScale.domain())
      .range([0, config.legend.width]);

    // use an axis generator to draw axis under color box
    var legendAxis = d3.svg.axis()
      .scale(legendScale)
      .orient("bottom")
      .innerTickSize(1)
      .outerTickSize(1)
      .tickPadding(1)
      .tickValues(colorScale.domain());

    // draw it!
    legend.append("g")
      .attr("id", "color-axis")
      .attr("class", "legend")
      .attr("font-size", "9px")
      .attr("transform", translate(0, config.legend.height))
      .call(legendAxis);

    // calculate how much to shift legend group to fit in our plot area nicely
    var bounds = legend.node().getBBox();
    var xshift = config.svg.width - bounds.width;
    var yshift = (config.margin.top - bounds.height) / 2;
    legend.attr("transform", translate(xshift, yshift));
};

function nFormatter(num, digits) {

    var si = [
      { value: 1E18, symbol: "E" },
      { value: 1E15, symbol: "P" },
      { value: 1E12, symbol: "T" },
      { value: 1E9, symbol: "G" },
      { value: 1E6, symbol: "M" },
      { value: 1E3, symbol: "K" }
    ], i;
    for (i = 0; i < si.length; i++) {
        if (num >= si[i].value) {
            return (num / si[i].value).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + si[i].symbol;
        }
    }
    return num.toString();

}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


