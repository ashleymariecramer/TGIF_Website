//Global variables
var allMembers = []; // All members data for use on Congress113 page

//----------------COMBINED FUNCTIONS----------------------------------------

//var congressUrl = 'https://nytimes-ubiqum.herokuapp.com/congress/113/senate';

// Onload 
$(function(){
    var congressUrl = getAPIurl();
    console.log("Loading data...");
    $.getJSON(congressUrl, function(data){
        console.log("Data obtained successfully");
        initialize(data);
    }); 
  //$.getJSON(senateUrl, initialize); // this is a shorter way to write the above
});



//-------------------INDIVIDUAL FUNCTIONS---------------------------------------

/***********************  CONGRESS113 PAGES  ***********************************/
function getAPIurl(){
    if ($('body').hasClass("house")){
        congressUrl = 'https://nytimes-ubiqum.herokuapp.com/congress/113/house';
    }
    else {
        congressUrl = 'https://nytimes-ubiqum.herokuapp.com/congress/113/senate';
    }
return congressUrl;
}

function initialize(data){
    var members = data.results[0].members; // Should this be a global variable?
    var allMembers = getMembersData(members); // This has been created as global 
    fillTable(allMembers);
    addCopyrightYear();
    filterOnClick();
}
    
    
function filterOnClick(){
    $('input, select').on('change', function(){  //'click' does not get activated when selecgt dropdown option
        var membersData = combineFilters();
        fillTable(membersData); 
        checkIfMembersDataEmpty(membersData);
    });
}


//-------------------CREATE ARRAY OF OBJECTS WITH ALL THE DATA----------------------------------
// Gets data from the JSON 'members' and creates an array of objects(one for each member) with the properties: name, party, state, seniority, votes % and url.
function getMembersData(members) {
    //var members = data.results[0].members;
	for (var i = 0; i < members.length; i++) {	
        var middle = members[i].middle_name || ""; 
        var memberData = {
            name: members[i].first_name+" "+ middle +" "+members[i].last_name,
            party: members[i].party,
            state: members[i].state,
            seniority: members[i].seniority,
            votes: members[i].votes_with_party_pct+"%",
            url: members[i].url,
        };
        allMembers.push(memberData);
	}
    return allMembers;
}


//------------------CHECK WHICH CHECKBOXES ARE SELECTED----------------------------
//Determines which checkboxes have been selected from the three different party options.
function getCheckedBoxes() {
    var checked = []; // array that will store class names of the boxes which are checked eg checked=["D", "R"]
    var checkedBoxes = $("input:checked");
    checkedBoxes.each(function(){
        checked.push($(this).attr("class")); // $(this) refers checkedBoxes.each (each element of checkedBoxes) 
    });
    return checked;
};
    

//-----------------FILTER BY PARTY--------------------------------------------------
// Filters 'allMember' array, based on the value of the party field in each 'members' data and returns results which match the 'checked' checkboxes.
function filterByParty(checked,allMembers){
    var membersDataParty = []; // or the results of the Party filter
        for (var i = 0; i < allMembers.length; i++){
            if (checked.length === 1){ 
                if (allMembers[i].party === checked[0]){ 
                membersDataParty.push(allMembers[i]);
                }
            }
            else if (checked.length === 2){
                if (allMembers[i].party === checked[0] || allMembers[i].party === checked[1]){
                membersDataParty.push(allMembers[i]);
                }
            }
            else {
                membersDataParty.push(allMembers[i]);
                } 
            }
    return membersDataParty;
}



//---------------CHECK WHICH DROPDOWN IS SELECTED----------------------------------
//Determines which option has been selected from the dropdown menu for state.
function getSelectedState() {
    var selected = $("option:selected").attr("class"); //returns class of selected option
    return selected;
} 


//-----------------FILTER BY STATE-------------------------------------------------
// Filters 'allMember' array, based on the value of the state field in each 'members' data and returns results which match the 'selected' option from the dropdown menu.
function filterByState(selected,allMembers){
    var membersDataState = [];  // For the results of the State filter
        if (selected === "default"){
            membersDataState = allMembers; //though this will cancel out any selection from first filter
        }
        else {
            membersDataState = []; // resetting membersDataState to fill it with filtered data
            for (var i = 0; i < allMembers.length; i++){
                if (allMembers[i].state === selected){
                    membersDataState.push(allMembers[i]); // though it will push data to membersData which is already there.
                    }
                }
        } 
    return membersDataState;
}


//------------------COMBINE RESULTS OF BOTH FILTERS---------------------------------
// Combining results of both arrays to out put the membersData required to build the table with fillTable(). Inputs required are results of which checkboxes are 'checked' and which drop down option is 'selected', and their corresponding results from the filters 'membersDataParty' and 'membersDataState' and the 'common' values which are in BOTH filter results.
function combineFilters(){
    var checked = getCheckedBoxes();
    var selected = getSelectedState(); 
    var membersDataParty = filterByParty(checked,allMembers);
    var membersDataState = filterByState(selected,allMembers);
    var common = compare(membersDataParty,membersDataState);
    
    if (selected === "default" || selected === 0) { // If state is all or default use only membersDataParty  
        membersData = membersDataParty;
    }
    else if (checked.length === 3 || checked.length === 0){ // If all or none checkboxes selected - use only membersDataState
        membersData = membersDataState;
    }
    else {
        membersData = getMembersDataInCommon(common,membersDataState); // sWhen both filters are used return results which are common to both
    }
    return membersData;
}
 

//------------------GET NAMES-------------------------------------------
//Make arrays with only the name field so that they can be compared using _.intersection. The argument 'arr' will take both the array membersDataParty and membersDataState when used in compare().
function getNames(arr){
    var names = [];
    for (var i = 0; i < arr.length; i++){
        var name = arr[i].name;
        names.push(name);
    }
    return names;  
}


//------------------COMPARE TO GET NAMES IN COMMON---------------------------------
//Checking which names are in both arrays: 'membersDataParty' and 'membersDataState', returns a list of names which appear in both arrays and therefore apply to both selected filters.
function compare(membersDataParty,membersDataState){
    var partyNames = getNames(membersDataParty);
    var stateNames = getNames(membersDataState);
    var common = _.intersection(partyNames, stateNames);
    return common;
}


//--------------------GET membersData IN COMMON-----------------------------------
// Takes names in 'common' array, checks which members in 'membersDataState' have the same name and pushes them to the membersData. The results is used in the createRow().
function getMembersDataInCommon(common,membersDataState){  
    membersData = []
    for (var i = 0; i < common.length; i++){
        for (var j = 0; j < membersDataState.length; j++){
            if (membersDataState[j].name === common[i]){
                membersData.push(membersDataState[j]);
            }
        }
    }
    return membersData;
}


//--------------------FILL TABLE USING MEMBERS DATA-----------------------------
//Construct a table with the 'membersData' of member data that should be included.
//With jQuery
function fillTable(membersData) {
    var table = $('#table_data');
    table.html('');  //reset table each time
    membersData.forEach(function(member) {
        table.append(
            $('<tr>')
            .append($('<td>').append($('<a>').attr('href', member.url).text(member.name)))
            .append($('<td>').text(member.party))
            .append($('<td>').text(member.state))
            .append($('<td>').text(member.seniority))
            .append($('<td>').text(member.votes))
        );
    });
}
    

//-------------------IF NO RESULTS FOUND------------------------------------------
function checkIfMembersDataEmpty(membersData) {
    var message = $("#message");
    message.html('');  //reset warning message each time
    if (membersData.length === 0){
        message.append($('<div>').attr("class", "warning").text("No results. Try using a broader filter"));
    }
}


//----------------AUTOFILL DATE IN FOOTER----------------------------------
//Add copyright and current year to Footer
function addCopyrightYear(){
    var today = new Date(); 
    var year = today.getFullYear(); 
    $("footer").html("&copy; Copyright TGIF " + year + " | All Rights Reserved");
}

