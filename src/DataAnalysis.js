/**
 * Created by peter on 07/09/2017.
 */

'use strict';

import * as d3 from 'd3'

export default class DataAnalysis {

    /****
     *
     * @param {object}  data
     * @param {array}   data.groupData
     * @param {array}   data.agentData
     * @param {boolean} multipleDates
     */
    constructor (data, appRef, multipleDates){
        console.log("DataAnalysis created", data.groupData);

        this.app = appRef;
        this.groupData = data.groupData;
        this.agentData = data.agentData;

        // Get elements
        this.$groupHeaderDropdown = $('select.group-header-dropdown');
        this.$calcTotalsBtn = $('#calculate-total-btn');
        this.$plotGraphBtn = $('#plot-graph-btn');

        // Reset
        this.$groupHeaderDropdown.empty();
        this.$calcTotalsBtn.off();
        this.$plotGraphBtn.off();

        // Set listeners
        this.$calcTotalsBtn.on('click', () => this.calcTotals());
        this.$plotGraphBtn.on('click', () => this.plotGraph());

        this.loadUi();
    }

    loadUi(){
        console.log("loadUi");
        if (this.groupData){
            for (let i = 1 ; i < this.app.groupDataHeaders.length ; i++ ){
                this.$groupHeaderDropdown.append(`<option value="${i}">${this.app.groupDataHeaders[i]}</option>`);
            }
        }
    }

    calcTotals(){
        console.log("calcTotals for: ", this.app.groupDataHeaders[this.$groupHeaderDropdown.val()]);
        let columnToCalc = this.app.groupDataHeaders[this.$groupHeaderDropdown.val()];

        let sum = 0;

        // average agents talking
        if (columnToCalc === this.app.groupDataHeaders[6]){
            for (let row of this.groupData){
                sum = sum + parseFloat(row[columnToCalc]);
            }
            return alert("Average: " + sum / this.groupData.length);
        }

        // average wait time or average abandonment time
        if (columnToCalc === this.app.groupDataHeaders[8] || columnToCalc === this.app.groupDataHeaders[9]) {
            let times = [];
            for (let row of this.groupData) {
                times.push(row[columnToCalc]);
            }
            return alert("Average (seconds): " + this.averageTimes(times));
        }


        for (let row of this.groupData){
            sum = sum + parseInt(row[columnToCalc]);
        }

        // average num agents staffed
        if (columnToCalc === this.app.groupDataHeaders[7]){
            return alert("Average: " + sum / this.groupData.length);
        }

        return alert("Total: " + sum);
    }

    plotGraph(){
        $('#graph').empty();
        let columnToPlot = this.app.groupDataHeaders[this.$groupHeaderDropdown.val()];
        let graph = d3.select("#graph"),
            WIDTH = 1000,
            HEIGHT = 500,
            MARGINS = {
                top: 20,
                right: 20,
                bottom: 20,
                left: 50
            };

        let minTime = this.groupData[0].timestamp;
        let maxTime = this.groupData[this.groupData.length - 1].timestamp;

        // set the dimensions and margins of the graph
        let margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // set the ranges
        let x = d3.scaleTime().range([0, width]);
        let y = d3.scaleLinear().range([height, 0]);

        // define the line
        let valueline = d3.line()
            .x(function(d) { return x(d.timestamp); })
            .y(function(d) { return y(d[columnToPlot]); });

        // append the svg obgect to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        let svg = d3.select("#graph").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        function draw(data) {

            // format the data
            /*data.forEach(function(d) {
                d.timestamp = +d.timestamp;
                d[columnToPlot] = +d[columnToPlot];
            });*/

            // sort date ascending
            data.sort(function(a, b){
                return a["timestamp"] - b["timestamp"];
            });

            // Scale the range of the data
            x.domain(d3.extent(data, function(d) { return d.timestamp; }));
            y.domain([0, d3.max(data, function(d) {
                return Math.max(d[columnToPlot]); })]);

            // Add the valueline path.
            svg.append("path")
                .data([data])
                .attr("class", "line")
                .attr("d", valueline);

            // Add the X Axis
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            // Add the Y Axis
            svg.append("g")
                .call(d3.axisLeft(y));
        }

        draw(this.groupData);

    }

    averageTimes(times){
        console.log("times: ", times);
        let totalSecs = 0;
        for (let time of times){
            let splitTime = time.split(':');
            let hoursToSecs = parseInt(splitTime[0]) * 60 * 60;
            let minsToSecs = parseInt(splitTime[1]) * 60;
            let secs = parseInt(splitTime[2]);
            totalSecs = totalSecs + hoursToSecs + minsToSecs + secs;
        }
        return totalSecs / times.length;
    }
}