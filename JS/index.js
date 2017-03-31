
$(function(){
    copyrightDate();
});

//----------------AUTOFILL DATE IN FOOTER----------------------------------
function copyrightDate(){
    var today = new Date(); 
    var year = today.getFullYear(); 
    $("footer").html("&copy; Copyright TGIF " + year + " | All Rights Reserved");
}

/* OLD JS CODE
function copyrightDate(){
    var today = new Date(); 
    var year = today.getFullYear(); 
    document.getElementById("footer").innerHTML = "&copy; Copyright TGIF " + year + " | All Rights Reserved";
}
*/

