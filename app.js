const educationDataURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

const countyDataURL = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

Promise.all([fetch(educationDataURL), fetch(countyDataURL)])
  .then(responses => Promise.all(responses.map(response => response.json())))
  .then((data) => {
    const educationData = data[0];
    const countyData = data[1];
  
    mapGraph(educationData, countyData);
  });

const mapGraph = (educationData, countyData) => {
  const width = 1050;
  const height = 670;
  const padding = 50;
  
  //generate svg
  const svg = d3
     .select('.main-container')
     .append('svg')
     .attr('id', 'map-container')
     .attr('width', width)
     .attr('height', height)
  
  //generate legend
  const legendScale = d3
    .scaleOrdinal()
    .domain([3, 12, 21, 30, 39, 48, 57, 66])
    .range([0, 30, 60, 90, 120, 150, 180, 210])
  
  const legend = d3
    .select('svg')
    .append('g')
    .attr('id', 'legend')
    .selectAll('rect')
    .data([1, 2, 3, 4, 5, 6, 7])
    .enter()
    .append('rect')
    .attr('x', (d, i) => 30 * i + 630)
    .attr('y', 30)
    .attr('width', 30.6)
    .attr('height', 10)
    .attr('fill', (d) => {
      if(d === 1) {
        return '#B082CA';
      } else if(d === 2) {
        return '#A86FC7';
      } else if(d === 3) {
        return '#9C58C1';
      } else if(d === 4) {
        return '#9136C3';
      } else if(d === 5) {
        return '#8007C3';
      } else if(d === 6) {
        return '#5F0690';
      } else {
        return '#4A0570';
      }
    });
  
  svg
    .append('g')
    .attr("transform", `translate(630, 40)`)
    .call(d3.axisBottom(legendScale).tickFormat(d => (d) + '%'));
  
  //generate tooltip
  const tooltip = d3
     .select('.main-container')
     .append('div')
     .attr('id', 'tooltip')
     .style('opacity', 0)
  
  //generate map
   svg 
    .append('g')
    .selectAll('path')
    .data(topojson.feature(countyData, countyData.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', d3.geoPath())
    .attr('data-fips', (d) => d.id)
    .attr('data-education', (d) => {
      const output = educationData.find(item => d.id === item.fips);
      return output.bachelorsOrHigher;
    })
    .attr('fill', (d) => {
     const output = educationData.find(item => d.id === item.fips);
     
      if(output.bachelorsOrHigher < 12) {
        return '#B082CA';
      } else if(output.bachelorsOrHigher >= 12 && output.bachelorsOrHigher < 21) {
        return '#A86FC7';
      } else if(output.bachelorsOrHigher >= 21 && output.bachelorsOrHigher < 30) {
        return '#9C58C1';
      } else if(output.bachelorsOrHigher >= 30 && output.bachelorsOrHigher < 39) {
        return '#9136C3';
      } else if(output.bachelorsOrHigher >= 39 && output.bachelorsOrHigher < 48) {
        return '#8007C3';
      } else if(output.bachelorsOrHigher >= 48 && output.bachelorsOrHigher < 57) {
        return '#5F0690';
      } else {
        return '#4A0570';
      }
    })
    .on('mouseover', (d) => {
      tooltip.transition()
             .duration(100)
             .style('opacity', 0.9);
      tooltip.style('left', d3.event.pageX + 20 + 'px')
             .style('top', d3.event.pageY - 20 + 'px')
             .attr('data-education', function()  {
                const output = educationData.find(item => d.id === item.fips)
                return output.bachelorsOrHigher;
             });
      tooltip.html(() => {
         const output = educationData.find(item => d.id === item.fips)
         return (output.fips + ' ' + output.area_name + ', ' + output.state + ': ' + output.bachelorsOrHigher + '%');
      })
    })
    .on('mouseout', () => {
      tooltip.transition()
             .duration(100)
             .style('opacity', 0);
    })
}