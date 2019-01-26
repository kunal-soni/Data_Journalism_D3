// @TODO: YOUR CODE HERE!
var svgWidth = 1000;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

console.log(`Inside the svg ${svg}`);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params for X and Y axes
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.5,
        d3.max(healthData, d => d[chosenXAxis]) * 2
      ])
      .range([0, width]);  
    // Return xLinearScale
    return xLinearScale;
}
  
// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var xAxis = d3.axisBottom(newXScale);
  return xAxis;
}
  
// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
  circlesGroup.transition().duration(1000).attr("cx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}
  
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
  if (chosenXAxis === "poverty") {
    var label = "Poverty";
  }
  else if (chosenXAxis === "age") {
    var label = "Age (Median)";
  }
  else if (chosenXAxis === "income") {
    var label = "Income (Median)";
  }
  else {
      console.log("Check if condition, chosenXAxis is not in here");
  }
  console.log(`label: ${label}`);
  console.log(`chosenXAxis: ${chosenXAxis}`);
  
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      console.log(`chosenXAxis is: ${chosenXAxis}`);
      if(chosenXAxis === 'poverty'){
      return (`${d.state}<br>${label}: ${d[chosenXAxis]}%<br>HealthCare: ${d.healthcare}%`);
      }
      else {
      return (`${d.state}<br>${label}: ${d[chosenXAxis]}<br>HealthCare: ${d.healthcare}%`);        
      }
    });
  
  circlesGroup.call(toolTip);
  
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data,this);
  })
  // onmouseout event
  circlesGroup.on("mouseout", function(data, index) {
    toolTip.hide(data);
  });
  return circlesGroup;
}

// Import Data
d3.csv("assets/data/data.csv").then(function(healthData, err) {

if(err) throw err;

// Step 1: Parse Data/Cast as numbers
// ==============================
healthData.forEach(function(data) {
  data.poverty = +data.poverty;
  data.healthcare = +data.healthcare;
  data.age = +data.age;
  data.income = +data.income;
  data.smokes = +data.smokes;
  data.obesity = +data.obesity;
});

// Step 2: Create scale functions
// ==============================
// xLinearScale calls above function xScale
var xLinearScale = xScale(healthData, chosenXAxis);

// Create y scale function
var yLinearScale = d3.scaleLinear()
  // Add 2 to the max value to cover range on graph
  .domain([3, d3.max(healthData, d => d.healthcare)+2])
  .range([height, 0]);

// Step 3: Create initial axis functions
// ==============================
var xAxis = d3.axisBottom(xLinearScale);
var yAxis = d3.axisLeft(yLinearScale); 

// Step 4: Append Axes to the chart
// ==============================
chartGroup.append("g")
   .classed("x-axis",true)
   .attr("transform", `translate(0, ${height})`)
   .call(xAxis);

chartGroup.append("g")
   .call(yAxis);
    
// Step 5: Create Circles
// ==============================
var circlesGroup = chartGroup.selectAll("circle")
  .data(healthData)
  .enter()
  .append("circle")  
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d.healthcare))
  .attr("r", "6")
  .attr("fill", "darkcyan")
  .attr("opacity", ".5")
  .html("fill", d => d.abbr);

  // chartGroup.selectAll("text")
  // .data(healthData)
  // .enter()
  // //.append("text")
  // .text(d => d.abbr);
  // //.attr("text", d => d.abbr);  

// Step 6: Initialize tool tip
// ==============================
var toolTip = d3.tip()
  .attr("class", "tooltip")
  .offset([80, -60])
  .html(function(d) {
  return (`${d.state}<br>Poverty: ${d.poverty}<br>Healthcare: ${d.healthcare}`);
  });

// Create group for 3 x-axis labels
var labelsGroup = chartGroup.append("g")
.attr("transform", `translate(${width / 2}, ${height + 20})`);

var povertyLabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 20)
.attr("value", "poverty") 
.classed("active", true)
.text("In Poverty (%)");

var ageLabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 40)
.attr("value", "age") 
.classed("inactive", true)
.text("Age (Median)");

var incomeLabel = labelsGroup.append("text")
.attr("x", 0)
.attr("y", 60)
.attr("value", "income") 
.classed("inactive", true)
.text("Income (Median)");

// Append Y Axis
chartGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left + 40)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .attr("class", "axisText")
  .text("Lacks Healthcare (%)");

// Create tooltip in the chart
// ==============================
chartGroup.call(toolTip);  

// updateToolTip function above csv import
// ==============================
var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

// x axis labels event listener
labelsGroup.selectAll("text").on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  if (value !== chosenXAxis) {
    // replaces chosenXAxis with value
    chosenXAxis = value;
    console.log(`Chosen X-Axis value: ${chosenXAxis}`);

    // updates x scale for new data
    xLinearScale = xScale(healthData, chosenXAxis);

    // updates x axis with transition
    console.log(`chosen x Axis: ${chosenXAxis}`);
    xAxis = renderAxes(xLinearScale, chosenXAxis);
    svg.select(".xAxis").transition().duration(300).call(xAxis);

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // changes classes to change bold text
    if (chosenXAxis === "poverty") {
        povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        incomeLabel
            .classed("active", false)
            .classed("inactive", true);
    }
    else if (chosenXAxis === "age") {
        ageLabel
          .classed("active", true)
          .classed("inactive", false);
        povertyLabel
          .classed("active", false)
          .classed("inactive", true);
        incomeLabel
          .classed("active", false)
          .classed("inactive", true);    
    }
    else if (chosenXAxis === "income") {
        incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);        
    }
    else {
        console.log(`Missed out on the if else conditions`);
    }
  }
  else
  {
      console.log(`Value is equal to the chosen x axis: ${value}`);
  }
});
});