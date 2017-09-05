/**
 * Created by peter on 01/09/2017.
 */

'use strict';

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
        this.$level1 = $('#level1');
        this.$fileInput = $('#fileInput');

        // Set Listeners;
        this.$fileInput.on('change', () => this.readFiles(event));
    }

    readFiles(event) {
        let files = event.target.files;
        console.log("readFiles", files);
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
                    let contents = e.target.result;
                    if (fileType === "group") _this.addGroupData(contents);
                    if (fileType === "agent") {
                        let dateKey = file.name.substring(0,8);
                        _this.addAgentData(contents, dateKey);
                    }
                };
                reader.readAsText(file);
            } else {
                alert("You tried to load an unsupported file type");
                this.$fileInput.val("");
            }

        }

    }

    addGroupData(data){
        console.log("addGroupData", data);
        this.convertCSVtoJSON(data, "group");
        console.log("group data: ", this.groupData)
    }

    addAgentData(data, dateKey){
        console.log("addAgentData", data);
        this.convertCSVtoJSON(data, "agent", dateKey);
        console.log("agent data: ", this.agentData)
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

            for(let j = 0; j  < headers.length; j++){

                if (currentline[j]){
                    obj[headers[j]] = currentline[j]; // match heading with cell data and write into object
                }
            }

            // Push to array if not empty object
            if (Object.keys(obj).length > 0){

                if (dateKey) obj.dateKey = dateKey;

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

}

window.addEventListener('load', () => {
    new PhoneCallApp();
});