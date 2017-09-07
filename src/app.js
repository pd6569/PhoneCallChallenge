/**
 * Created by peter on 01/09/2017.
 */

'use strict';

import DataAnalysis from './DataAnalysis'

class PhoneCallApp {

    constructor() {
        console.log("PhoneCallAppCreated");

        // Data
        this.groupData = [];
        this.agentData = [];

        // Headers
        this.groupDataHeaders = [];
        this.agentDataHeaders = [];

        // Get DOM elements
        this.$fileInput = $('#fileInput');
        this.$analysisOutput = $('.analysisOutput');
        this.$datesContainer = $('#datesContainer');
        this.$analysisDisplay = $('#analysisDisplay');

        // Set Listeners;
        this.$fileInput.on('change', () => this.readFiles(event));
        this.$datesContainer.on('click', '.analyse-date', (event) => this.analyseSingleDate($(event.currentTarget).attr('data-id')));
    }

    readFiles(event) {
        this.resetAppData();
        this.updateAnalysisConsole("Loading files data...");
        let _this = this;
        let files = event.target.files;
        let numFiles = files.length;
        let i = 0;
        if (!files) {
            return;
        }

        for (let file of files){
            let fileType;
            let _this = this;
            if ((/\.(csv)$/i).test(file.name)){
                if (file.name.includes("group")) {
                    fileType = "group";
                } else if (file.name.includes("agent")) {
                    fileType = "agent";
                } else {
                    console.log("Error loading file");
                    return;
                }
                let reader = new FileReader();
                reader.onload = function(e) {
                    i++;
                    let contents = e.target.result;
                    if (fileType === "group") {
                        _this.convertCSVtoJSON(contents, "group");
                    }
                    if (fileType === "agent") {
                        let dateKey = file.name.substring(0,8);
                        let dateStr = dateKey.slice(0,4) + '-' + dateKey.slice(4,6) + '-' + dateKey.slice(6);
                        _this.convertCSVtoJSON(contents, "agent", dateStr);
                    }
                    if (i === numFiles) {
                        _this.updateAnalysisConsole(`Files data loaded. ${numFiles} files.`);
                        _this.calcDateRange();
                        _this.updateAnalysisConsole("Num rows of data: " + _this.calcNumRows());

                    }
                };
                reader.readAsText(file);
            } else {
                alert("You tried to load an unsupported file type");
                this.$fileInput.val("");
                this.updateAnalysisConsole("Failed to load file data");
            }

        }

    }

    calcDateRange(){
        let dates = {};
        let dateFrom;
        let dateTo;
        let data;
        this.updateAnalysisConsole("Calculating date range...");
        this.groupData.length ? data = this.groupData : data = this.agentData;

        for (let row of data){
            let dateObj = row.timestamp;
            dates[this.formatDate(dateObj)] = true;
            if (!dateFrom) dateFrom = dateObj;
            if (!dateTo) dateTo = dateObj;
            if (dateObj < dateFrom) dateFrom = dateObj;
            if (dateObj > dateTo) dateTo = dateObj;
        }

        this.addDates(dates);

        this.updateAnalysisConsole("Date from: " + this.formatDate(dateFrom, true) + " to: " + this.formatDate(dateTo, true));
    }

    calcNumRows(){
        return this.groupData.length + this.agentData.length;
    }

    addDates(dates){
        this.$datesContainer.removeClass('hidden');
        this.$datesContainer.append(`<div class="analyse-all link">Analayse all</div>`);
        for (let date in dates){
            this.$datesContainer.append(`<div>${date} | <span class="analyse-date link" data-id="${Date.parse(date)}">analyse</span></div>`);
        }
    }


    
    convertCSVtoJSON(csv, dataType, dateKey) {

        let _this = this;

        let lines = csv.split("\n"); // creates an array of lines - first line is headings

        let result = []; // array to store each row of data as an object

        let headers = lines[0].split(","); // create array from headings

        if (dataType === "group" && this.groupDataHeaders.length == 0) {
            this.groupDataHeaders = headers;
        }

        if (dataType === "agent" && this.agentDataHeaders.length == 0) {
            this.agentDataHeaders = headers;
        }


        // loop through data row by row (starting at second line which is the data, not headings)
        for(let i = 1; i < lines.length; i++){

            let obj = {}; // Object to store row data
            let currentline = lines[i].split(","); // separate each cell from row and store in array

            if (dateKey) {
                let dateObj = new Date(Date.parse(dateKey));
                if (dateObj) obj.timestamp = dateObj;
            }

            for(let j = 0; j  < headers.length; j++){

                if (currentline[j]){
                    obj[headers[j]] = currentline[j]; // match heading with cell data and write into object
                    if (headers[j] === "timestamp") {
                        let dateStr = currentline[j];
                        let dateObj = new Date(Date.parse(dateStr));
                        if (dateObj) obj[headers[j]] = dateObj
                    }
                }
            }

            // Push to array if not empty object
            if (Object.keys(obj).length > 0){

                // Store each row object in result array
                if (dataType === "group") {
                    if (validateRow(obj, dataType)) this.groupData.push(obj);
                }
                if (dataType === "agent") {
                    if (validateRow(obj, dataType)) this.agentData.push(obj);
                }
            }

        }

        function validateRow(rowData, dataType){
            if (dataType === "group"){
                if (Object.keys(rowData).length < _this.groupDataHeaders.length) return false;
                return true;
            }

            if (dataType === "agent"){
                if (Object.keys(rowData).length < _this.agentDataHeaders.length) return false;
                return true;
            }
        }
    }

    analyseSingleDate(timestamp){
        console.log("analysedate: ", timestamp);
        this.$analysisDisplay.removeClass('hidden');
        let date = new Date(parseInt(timestamp));
        let dateStr = this.formatDate(date);
        $('.analysis-subtitle').text(dateStr);
        this.updateAnalysisConsole("Isolating data for: " + dateStr);
        let groupDataToAnalyse = [];
        let agentDataToAnalyse = [];
        if (this.groupData){
            for (let row of this.groupData){
                if (this.formatDate(row.timestamp) === dateStr) groupDataToAnalyse.push(row);
            }
        }
        if (this.agentData){
            for (let row of this.agentData) {
                if (this.formatDate(row.timestamp) === dateStr) agentDataToAnalyse.push(row);
            }
        }
        this.updateAnalysisConsole("Data isolated");

        let dataAnalysisParams = {};
        if (groupDataToAnalyse) dataAnalysisParams.groupData = this.filterGroupDataForWorkingHours(groupDataToAnalyse);
        if (agentDataToAnalyse) dataAnalysisParams.agentData = agentDataToAnalyse;
        new DataAnalysis(dataAnalysisParams, this, false);
    }

    filterGroupDataForWorkingHours(data){
        this.updateAnalysisConsole("Filtering group data for working hours");
        let filteredData = [];
        for (let row of data){
            if (row.timestamp.getHours() >= 8 && row.timestamp.getHours() < 18){
                filteredData.push(row);
            }
        }
        this.updateAnalysisConsole("Group data filtered");
        return filteredData;
    }

    updateAnalysisConsole(text){
        this.$analysisOutput.append(`<div>${text}</div>`);
    }

    resetAppData(){
        this.$analysisOutput.empty();
        this.$datesContainer.empty();
        this.groupData = [];
        this.agentData = [];
    }

    formatDate(date, includeTime) {

        let dateFormat;

        let monthNames = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct",
            "Nov", "Dec"
        ];

        let day = "" + date.getDate();
        if (day.length == 1) day = '0' + day;
        let monthIndex = date.getMonth();
        let year = date.getFullYear();
        let hours = "" + date.getHours();
        let minutes = "" + date.getMinutes();
        if (hours.length == 1) hours = '0' + hours;
        if (minutes.length == 1) minutes = '0' + minutes;
        let time = hours + ':' + minutes;

        if (includeTime) {
            return time + ' ' + day + ' ' + monthNames[monthIndex] + ' ' + year;
        }

        return day + '-' + monthNames[monthIndex] + '-' + year;
    }

}

window.addEventListener('load', () => {
    new PhoneCallApp();
});