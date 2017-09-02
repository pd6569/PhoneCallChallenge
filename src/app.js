/**
 * Created by peter on 01/09/2017.
 */

'use strict';

class PhoneCallApp {

    constructor() {
        console.log("PhoneCallAppCreated");
        this.loadData();

        // Level 1 group data
        this.level1RawGroupData = [];
        this.level1FilteredGroupData = {};

        // Level 1 agent data
        this.level1RawAgentData = [];
        this.level1FilteredAgentData = {};

        // Headers
        this.groupDataHeaders = [];
        this.agentDataHeaders = [];

        // Get DOM elements
        this.$level1 = $('#level1');
    }

    loadData(){
        let _this = this;

        $.ajax({
            'url': 'data/20170418_000000_agent_statistics.csv',
            'success': function(data) {
                _this.level1RawAgentData = _this._convertCSVtoJSON(data, "agent");
                _this.initLevel1Analysis("agent");
            }
        });

        $.ajax({
            'url': 'data/20170418_000000_group_statistics.csv',
            'success': function(data) {
                _this.level1RawGroupData = _this._convertCSVtoJSON(data, "group");
                _this.initLevel1Analysis("group");
            }
        })
    }

    initLevel1Analysis(dataType){
        if (dataType === "group"){
            this.generateActiveCallData(); // data contains empty data for out of hours (e.g. between midnight - 8:00, and after 18:30).
            this.analyseActiveCallData();
        }

        if (dataType === "agent"){

        }
    }

    generateActiveCallData(){
        console.log("generateActiveCallData");
        this.level1FilteredGroupData.activeCallData = [];
        for (let row of this.level1RawGroupData){
            if (row["avg. wait time "] !== "00:00:00") {
                this.level1FilteredGroupData.activeCallData.push(row);
            }
        }

        console.log("Active call data: ", this.level1FilteredGroupData.activeCallData)
    }

    analyseActiveCallData(){

        let activeData = this.level1FilteredGroupData.activeCallData;

        // Get first and last call times
        let numActiveTimepoints = activeData.length;
        this.level1FilteredGroupData.firstCallTimestamp = activeData[0]["timestamp"];
        this.level1FilteredGroupData.lastCallTimestamp = activeData[numActiveTimepoints - 1]["timestamp"];
        this.$level1.append(`<p><strong>First call data obtained at:</strong> ${this.level1FilteredGroupData.firstCallTimestamp}`);
        this.$level1.append(`<p><strong>Last call data obtained at:</strong> ${this.level1FilteredGroupData.lastCallTimestamp}`);

        // Get totals
        for (let heading of this.groupDataHeaders){
            if (heading !== "timestamp"){
                let total = 0;
                for (let row of activeData){
                    let val = parseInt(row[heading]);
                    total += val;
                }
                this.$level1.append(`<p><strong>Total ${heading}:</strong> ${total}`);
            }
        }
    }
    
    _convertCSVtoJSON(csv, dataType) {

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

            for(let j = 0; j  < headers.length; j++){

                if (currentline[j]){
                    obj[headers[j]] = currentline[j]; // match heading with cell data and write into object
                }
            }

            // Push to array if not empty object
            if (Object.keys(obj).length > 0){
                // Store each row object in result array
                result.push(obj);
            }

        }

        //return array of objects representing CSV data rows
        return result;
    }

}



window.addEventListener('load', () => {
    new PhoneCallApp();
});