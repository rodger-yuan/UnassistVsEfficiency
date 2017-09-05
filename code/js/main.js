// margins and svg size
var margin = { top: 20, right: 0, bottom: 0, left: 145 },
  width = 1000 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var svg = d3.select("#scatter").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

drawScatter()

// update chart with select change
d3.select('#year')
  .on('change', function() {
    drawScatter();
  });

d3.select('#team')
  .on('change', function() {
    drawScatter();
  });

// update chart with button click
d3.selectAll('button')
  .on('click', function(){
    var team = ( $(this).attr('id').slice(7,10) )
    var year = ( $(this).attr('id').slice(0,7) )

    $('#year').val(year)
    $('#team').val(team)

    drawScatter();
  })

function drawScatter() {

  d3.csv("data/" + d3.select("#year").property("value") + "_effvsts.csv", function(data) {
    data.forEach(function(d) {       
      d.uast = +d.uast //convert strings to numbers
      d.ts = +d.ts;                          
    });    

    var padding = 40; 
    var label_padding = 2;

    // remove previous graph
    svg.selectAll("*").remove();

    // scales and axes
    var xScale = d3.scaleLinear()
          .domain([0, 1])
          .range([padding, width - padding]);

    var yScale = d3.scaleLinear()
        .domain([0.3, 0.75])
        .range([height - padding, padding]);

    var rScale = d3.scaleLinear()
        .domain([10, 48])
        .range([2, 15]);

    var xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format(".0%"));

    var yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.format(".0%"));

    var xAxis = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + (height - padding) + ')')
      .call(xAxis);

    var yAxis = svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + padding + ",0)")
      .call(yAxis);

    svg.append("text") // x-axis label
      .text("TS%")
      .attr("x", function(d) {
        return padding * 1.5;
      })
      .attr("y", function(d) {
        return padding + 20;
      })
      .style("font-size", "40px")
      .attr("fill", "grey");

    svg.append("text") // y-axis label
      .text("Unassist%")
      .attr("x", function(d) {
        return width - margin.left - margin.right - 80;
      })
      .attr("y", function(d) {
        return height - padding * 1.5;
      })
      .style("font-size", "40px")
      .attr("fill", "grey");

    // tooltips
    var div = d3.select("#scatter").append("div") 
      .attr("class", "tooltip")       
      .style("opacity", 0);

    // datapoints
    var points = svg.selectAll("circle").data(data);

    points.enter().append("circle")

      // position and size
      .attr("cx", function(d) {
        return xScale(d.uast);
        })
      .attr("cy", function(d) {
        return yScale(d.ts);
        })
      .attr("r", function(d) {
        return rScale(d.min);
        })

      // tooltips
      .on("mouseover", function(d) {    
        if (d.team != d3.select("#team").property("value")) {
          div.transition()    
              .duration(200)    
              .style("opacity", 1);    
          div.html(d.name + " (" + d.team + ")")
              .style("left", d3.event.pageX + 5 + "px")
              .style("top", d3.event.pageY - 10 + "px");
          }      
        })  
      .on("mouseout", function(d) {   
        if (d.team != d3.select("#team").property("value")) {
          div.transition()    
              .duration(500)    
              .style("opacity", 0); 
          }
        })

      // fill and opacity
      .style("fill", function(d) {
        if (d.team != d3.select("#team").property("value")) {
          return "black";
          } else {
          return "blue";
          }
        })
      .style("fill-opacity", function(d) {
        if (d.team != d3.select("#team").property("value")) {
          return 0.1;
          } else {
          return 0.7;
          }
        });

    // labelling (using d3fc to prevent overlap)
    var textLabel = fc.layoutTextLabel()
      .padding(label_padding)
      .value(function(d) { return d.name; });

    var strategy = fc.layoutGreedy(fc.layoutGreedy());

    var labels = fc.layoutLabel(strategy)
      .size(function(_, i, g) {
          var textSize = d3.select(g[i])
              .select('text')
              .node()
              .getBBox();
          return [textSize.width + label_padding * 2, textSize.height + label_padding * 2];
      })
      .position(function(d) { return [xScale(d.uast), yScale(d.ts)]; })
      .component(textLabel);

    svg.datum(data.filter(function(d){ return d.team == d3.select("#team").property("value");}))
      .call(labels);
  })
}
