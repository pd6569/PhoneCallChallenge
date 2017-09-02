/**
 * Created by peter on 01/09/2017.
 */

'use strict';

class PhoneCallApp {

    constructor() {
        console.log("PhoneCallAppCreated");
        this.loadData();

        // Level 1 data
        this.level1GroupData = [];
        this.level1AgentData = [];
    }

    loadData(){
        let _this = this;

        $.ajax({
            'url': 'data/20170418_000000_agent_statistics.csv',
            'success': function(data) {
                _this.level1AgentData = _this._convertCSVtoJSON(data);
            }
        });

        $.ajax({
            'url': 'data/20170418_000000_group_statistics.csv',
            'success': function(data) {
                _this.level1GroupData = _this._convertCSVtoJSON(data);
            }
        })
    }
    
    _convertCSVtoJSON(csv) {

        let lines = csv.split("\n"); // creates an array of lines - first line is headings

        let result = []; // array to store each row of data as an object

        let headers = lines[0].split(","); // create array from headings

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