//----------------COMBINED FUNCTIONS----------------------------------------
// Onload
function onload(){
    var members = data.results[0].members;// Could this be a global variable
    var allMembers = showMembers(members);// Could this be a global variable
    var lines = allMembers;
    createRow(lines);
    copyrightDate();
} 
        
// Filter on click
function filterOnClick(){
    var members = data.results[0].members;// Could this be a global variable
    var allMembers = showMembers(members);// Could this be a global variable
    var checked = getCheckedBoxes();
    var selected = getSelected(); 
    var linesParty = filterByParty(checked,members,allMembers);
    var linesState = filterByState(selected,members,allMembers);
    var common = compare(linesParty,linesState);
    var lines = combineFilters(selected,checked,linesParty,linesState,common);
    createRow(lines); 
    checkLinesEmpty(lines);
}

 

//-------------------INDIVIDUAL FUNCTIONS---------------------------------------

//-------------------CREATE ARRAY WITH ALL DATA----------------------------------
// Gets data from the JSON 'members' and creates a nested array with the name, party, state, seniority, votes % and url for each member.
function showMembers(members) {
    var members = data.results[0].members;
    var allMembers =  [];
	for (var i = 0; i < members.length; i++) {	
        var middle = members[i].middle_name || "";
		allMembers.push([members[i].first_name+" "+ middle +" "+members[i].last_name,
                         members[i].party,
                         members[i].state, 
                         members[i].seniority,
                         members[i].votes_with_party_pct+"%",
                         members[i].url])
	}
    return (members,allMembers);
}


//------------------CHECK WHICH CHECKBOXES ARE SELECTED----------------------------
//Determines which checkboxes have been selected from the three different party options.
function getCheckedBoxes() {
    var checked = []; // array that will store class names of the boxes which are checked eg checked=["D", "R"]
    var checkboxes = document.getElementsByTagName("input");  // gets all the input tags
        for (var i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].checked){ // if checkbox is checked
                var selected = checkboxes[i].getAttribute("class"); // get the class attribute
                checked.push(selected); // add the class to the array
            }
        }
    return checked;
}   


//-----------------FILTER BY PARTY--------------------------------------------------
// Filters 'allMember' array, based on the value of the party field in each 'members' data and returns results which match the 'checked' checkboxes.
function filterByParty(checked,members,allMembers){
    var linesParty = []; // or the results of the Party filter
        for (var i = 0; i < members.length; i++){
            if (checked.length === 1){ 
                if (allMembers[i][1] == checked[0]){ 
                linesParty.push(allMembers[i]);
                }
            }
            else if (checked.length === 2){
                if (allMembers[i][1] == checked[0] || allMembers[i][1] == checked[1]){
                linesParty.push(allMembers[i]);
                }
            }
            else {
                linesParty.push(allMembers[i]);
                } 
            }
    return linesParty;
}


//---------------CHECK WHICH DROPDOWN IS SELECTED----------------------------------
//Determines which option has been selected from the dropdown menu for state.
function getSelected() {
    var option = document.getElementsByTagName("option");  // gets all the input tags
    for (var i = 0; i < option.length; i++){
        if (option[i].selected === true){ // if option selected
            var selected = option[i].getAttribute("class"); // get the class attribute
            return selected;
            break; // then exit loop
        }
    }
} 


//-----------------FILTER BY STATE-------------------------------------------------
// Filters 'allMember' array, based on the value of the state field in each 'members' data and returns results which match the 'selected' option from the dropdown menu.
function filterByState(selected,members,allMembers){
    var linesState = [];  // For the results of the State filter
        if (selected === "default"){
            linesState = allMembers; //though this will cancel out any selection from first filter
        }
        else {
            linesState = []; // resetting linesState to fill it with filtered data
            for (var i = 0; i < members.length; i++){
                if (members[i].state === selected){
                    linesState.push(allMembers[i]); // though it will push data to lines which is already there.
                    }
                }
        } 
    return linesState;
}


//------------------COMBINE RESULTS OF BOTH FILTERS---------------------------------
// Combining results of both arrays to out put the lines required to build the table with createRow(). Inputs required are results of which checkboxes are 'checked' and which drop down option is 'selected', and their corresponding results from the filters 'linesParty' and 'linesState' and the 'common' values which are in BOTH filter results.
function combineFilters(selected,checked,linesParty,linesState,common){
    if (selected === "default" || selected === 0) { // If state is all or defult then use only results from linesParty  
        lines = linesParty;
    }
    else if (checked.length === 3 || checked.length === 0){ // If all or none checkbboxes selected - use only the linesState
        lines = linesState;
    }
    else {
        lines = getLines(common,linesState);//When both filters are being used return results which are common to both
    }
    return lines;
}
 

//------------------GET NAMES-------------------------------------------
//Make arrays with only the name field so that they can be compared using _.intersection. The argument 'arr' will take both the array linesParty and linesState when used in compare().
function getNames(arr){
    var names = [];
    for (var i = 0; i < arr.length; i++){
        var name = arr[i][0];
        names.push(name);
    }
    return names;  
}




//--------------------GET LINES IN COMMON-----------------------------------
// Takes names in 'common' array, checks which lines in 'linesState' have the same name and pushes to the lines. The results is used in the createRow().
function getLines(common,linesState){  
    lines = []
    for (var i = 0; i < common.length; i++){
        for (var j = 0; j < linesState.length; j++){
            if (linesState[j][0] === common[i]){
                lines.push(linesState[j]);
                break;
            }
        }
    }
    return lines;
}


//------------------COMPARE TO GET NAMES IN COMMON---------------------------------
//Checking which names are in both arrays: 'linesParty' and 'linesState', returns a list of names which appear in both arrays and therefore apply to both selected filters.
function compare(linesParty,linesState){
    var partyNames = getNames(linesParty);
    var stateNames = getNames(linesState);
    var common = _.intersection(partyNames, stateNames);
    return common;
}


//--------------------CREATE TABLES USING LINES ARRAY-----------------------------
//Construct a table with the 'lines' of member data that should be included.
function createRow(lines) {
    document.getElementById("table_data").innerHTML= '';  //reset table each time
    for (var i = 0; i < lines.length; i++){ //loop through filtered members
        var properties = [lines[i][0],lines[i][1],lines[i][2],lines[i][3],lines[i][4]]; //create variables for each field 
        var newRow = document.createElement("tr"); //Create new tableRow
        document.getElementById("table_data").appendChild(newRow); // Insert row into table by ID
            for (var k = 0; k < properties.length; k++){ //loop through each members and create new cells
                var newCell = document.createElement("td"); // Create cells within that row
                newRow.appendChild(newCell); // add new cell to new row
                var newText = document.createTextNode(properties[k]); // Create text within row
                newCell.appendChild(newText);  // add text within new cell
                }
        }  
}



//-------------------NO RESULTS------------------------------------------
function checkLinesEmpty(lines) {
    if (lines.length === 0){
        var newDiv = document.createElement("div");
        document.getElementById("table_data").appendChild(newDiv);
        newDiv.setAttribute('class', "warning");
        var newText = document.createTextNode("No results. Try using a broader filter");
        newDiv.appendChild(newText);
    }
}

//----------------AUTOFILL DATE IN FOOTER----------------------------------
//Add copyright and current year to Footer
function copyrightDate(){
    var today = new Date(); 
    var year = today.getFullYear(); 
    document.getElementById("footer").innerHTML = "&copy; Copyright TGIF " + year + " | All Rights Reserved";
}








    



