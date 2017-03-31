//Global variables
var statistics = []; // All members data for use on Attendance pages

//----------------COMBINED FUNCTIONS----------------------------------------
// Onload 
$(function(){
    var congressUrl = getAPIurl();
    console.log("Loading data...");
    $.getJSON(congressUrl, function(data){
        console.log("Data obtained successfully");
        initialize(data);
    });    
});


//-------------------INDIVIDUAL FUNCTIONS---------------------------------------
/***********************  LOYALTY PAGES  ***********************************/

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
    statistics = getStats(members); // This has been created as global 
    fillAtGlanceTable();
    var mostLeastData = sortLoyalty(statistics);
    addMostLeastData(mostLeastData[1], '#mostL');
    addMostLeastData(mostLeastData[0], '#leastL');
    addCopyrightYear();
}


//-------------------CREATE ARRAY OF STATS TO USE IN ATTENDANCE & LOYALTY TABLES----------------------------------
// Gets data from the JSON 'members' and creates an array of objects (one for each member) with the properties: name, party,  total_votes, missed_votes, missed_votes_pct, votes_with_party_pct)
function getStats(members) {
    //var members = data.results[0].members;
    for (var i = 0; i < members.length; i++) {	
        var middle = members[i].middle_name || ""; 
        var memberStats = {
            name: members[i].first_name+" "+ middle +" "+members[i].last_name,
            party: members[i].party,
            total: members[i].total_votes,
            missed: members[i].missed_votes,
            missed_pct: members[i].missed_votes_pct,
            with_party_pct: members[i].votes_with_party_pct,
        };
        statistics.push(memberStats);
	}
    return statistics;
}


//---------------GET NUMBER FOR REPRESENTATIVES FOR EACH PARTY-------------
//Counts the total number of representatives for each party using the data in the array of objects: 'statistics'.
function getNumRepresentatives(statistics) {
    representatives = {"R": 0, "D": 0, "I": 0};
    for (var i = 0; i < statistics.length; i++){ //IMPROVE : Can I simplify this to remove if and simply put if find class which is the same as a propery of the object 'representatives' then add one to value of that property???
        if (statistics[i].party === "R"){
            representatives.R += 1;
        } 
        else if (statistics[i].party === "D"){
            representatives.D += 1;
        } 
        else {
            representatives.I += 1;
        }
    }
    return representatives;
}


//-----------HOW MANY MEMBERS ARE 10%----------------------------------------------
//Calculates (to nearest whole integer) the number of people 10% refers to - used for obtaining the top and bottom 10% (House: 44 Senate: 10)
function tenPerCent(statistics) {
    return Math.round(statistics.length/10);
}


//------------CALCULATE AVERAGE PERCENTAGE OF VOTES WITH PARTY---------------
//1. totalVotes takes the number of 'representatives' by party and the 'statistics' with all the data for each member and returns  an array ('sumVotes') of objects with the sum of percentage of votes (either missed or with party based on id of at a Glance table) for each party.
function totalVotes(statistics,representatives){ 
    var sumVotes = {"R": 0, "D": 0, "I": 0};
    for (i = 0; i < statistics.length; i++){
        if (statistics[i].party === "R"){
            sumVotes.R += parseFloat(statistics[i].with_party_pct);
            } 
        else if (statistics[i].party === "D"){
            sumVotes.D += parseFloat(statistics[i].with_party_pct);
            } 
        else {
            sumVotes.I += parseFloat(statistics[i].with_party_pct);
            }
    } 
    return sumVotes;
}

//2. Takes 'sumVotes' array and divides the sum total amounts for each party by the number of representatives in each party ('representatives') and returns a new array with the average percentages by party. It also rounds the results to a fixed 2 decimal places. 
function aveVotes(sumVotes,representatives){
    var percentages = [(sumVotes.R/representatives.R).toFixed(2), (sumVotes.D/representatives.D).toFixed(2), (sumVotes.I/representatives.I).toFixed(2), ((sumVotes.R+sumVotes.D+sumVotes.I)/(representatives.R+representatives.D+representatives.I)).toFixed(2)]; //Calculate overall ave percentages
    return percentages;
}


//--------------------AT A GLANCE TABLE DATA-----------------------------
//Fills in the At a Glance table data with relevant data 'statistics'. This function is used for all 4 instances of the table (Attendance & Loyalty, House & Senate)
function fillAtGlanceTable() {
    var representatives = getNumRepresentatives(statistics);
    var sumVotes = totalVotes(statistics,representatives);
    var percentages = aveVotes(sumVotes,representatives);
    var parties = ["Republican","Democrat","Independent", "Total"];
    var representatives2 = [representatives.R,representatives.D,representatives.I, statistics.length];
    for (var i = 0; i < parties.length; i++){ //loop through filtered members
        $('#glance').append($('<tr>')
            .append($('<td>').text(parties[i])) //-1 inserts each cell at the end of the row
            .append($('<td>').text(representatives2[i]))
            .append($('<td>').text(percentages[i]+'%')))
    }  
}


/*
function fillAtGlanceTable() {
    var representatives = getNumRepresentatives(statistics);
    var sumVotes = totalVotes(statistics,representatives);
    var percentages = aveVotes(sumVotes,representatives);
    var parties = ["Republican","Democrat","Independent", "Total"];
    var representatives2 = [representatives.R,representatives.D,representatives.I, statistics.length];
    for (var i = 0; i < parties.length; i++){ //loop through filtered members
        var newRow = document.createElement("tr"); //Create new tableRow
        document.getElementById("glance").appendChild(newRow); // Insert row into table by ID
        newRow.insertCell(-1).innerHTML = parties[i];  //-1 inserts each cell at the end of the row
        newRow.insertCell(-1).innerHTML = representatives2[i];
        newRow.insertCell(-1).innerHTML = percentages[i]+'%';
        }  
} */


//------------SORT LOYALTY----------------------
// Takes an array (statistics) and sorts it into order based on percentage of votes with ('with_party_pct'). Orders statistics from mostLoyal (10% with highest 'with_party_pct') to the leastLoyal (10% with lowest 'with_party_pct').Outputs an array ('mostLeastData') which can be used top fill in the tables and contains the 2 arrays for 'leastLoyal' and ' mostLoyal'.
function sortLoyalty(statistics) {  
    statistics.sort(function(a,b){return a.with_party_pct - b.with_party_pct});//sorts lowest->highest('Least' Tables)
    var leastLoyal = statistics.slice(0,tenPerCent(statistics)); // first 10% of array (corresponds to bottom 10%)
    addExtraPeople(leastLoyal); //Add anyone with same results as last of 10%
    
    statistics.sort(function(a,b){return b.with_party_pct - a.with_party_pct});//sort highest->lowest('Most' Tables)
    var mostLoyal = statistics.slice(0,tenPerCent(statistics)); //first 10% of array (corresponds to top 10%)
    addExtraPeople(mostLoyal); //Add anyone with same results as last of 10%
    
    var mostLeastData = []; 
    mostLeastData.push(leastLoyal, mostLoyal); //Group Most and Least results in one array
    return mostLeastData;
}


// ---------DECIDE IF NEED TO INCLUDE EXTRA PEOPLE IN THE MOST & LEAST TABLES--------------
//Takes the sorted list of statistics and checks if the 'last' person included in 10% hassame percentage as next person in the list, if so that member's data is pushed to an existing 'arr' array (leastLoyal or mostLoyal) used to populate the Most and Least tables.
function addExtraPeople(arr){
    var last = statistics[tenPerCent(statistics)-1];
    for (var i = 0; i < statistics.length-tenPerCent(statistics); i++){ //length needs to be for total minus the 10%
        var next = statistics[tenPerCent(statistics)+i];
        if (last.with_party_pct === next.with_party_pct){ 
            arr.push(next);
        }
    }
    return arr;
}


//-----------------POPULATE MOST AND LEAST TABLES-------------------------
//Use the arrays 'mostLeastData' which will either have attendance or loyalty data (as obtained from sortAttendance and sortLoyalty functions). This function is used for all 4 instances of the table (Attendance & Loyalty, House & Senate).
function addMostLeastData(data, tableId) {
    var table = $(tableId);   // This gets the ID of the table to be filled
    var rows = '';    // need to create empt rows to push the 'data' info to
    var template = $('#mostLeast-template').html();  //this saves my tempalte to a variable
    data.forEach(function(member){  //for each member within the dta
        rows += Mustache.render(template, member);  //add the relevant tempalte data for each member into each row
    });  
    table.html(rows);  //fill in the table with all the rows
};


//----------------AUTOFILL DATE IN FOOTER----------------------------------
//Add copyright and current year to Footer
function addCopyrightYear(){
    var today = new Date(); 
    var year = today.getFullYear(); 
    $("footer").html("&copy; Copyright TGIF " + year + " | All Rights Reserved");
}


