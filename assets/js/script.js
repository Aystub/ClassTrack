$('document').ready(function(){
    $("#schoolNameField").on("focus", function(){
        name = $("#schoolNameField").val();

        $.ajax({
          url: "/schoolGetter",
          type: "POST",
          data: { school: name },
          success: function(data){
            var jsonObj = $.parseJSON(data);
            schoolSuggestions(jsonObj, "#schoolNameField", "#schoolSug");
          },
          error: function(){
            console.log("NOPE");
          }
        });
    });
});

function addSugToField(theSug, theField, sugDivID){
    console.log("theSug: " + theSug);
    console.log("theField: " + theField);
    $(theField).val($(theSug).html());
    $(sugDivID).html("");
}

function schoolSuggestions(jsonObj, activeField, sugDivID){
    var enteredVal;

    $(activeField).on('keyup', function(){
        $(sugDivID).html(" ");
        enteredVal = $(activeField).val();

        if(enteredVal != ""){
          for(var i = 0; i < jsonObj.length; i++){
              if(jsonObj[i].school_name.indexOf(enteredVal) >= 0){
                  $(sugDivID).html( $(sugDivID).html() + '<div onclick="addSugToField(this, '+"'"+activeField+"', "+"'"+sugDivID+"'"+');" class="suggestion">'+ jsonObj[i].school_name + ', State: ' + jsonObj[i].state + ', County: ' + jsonObj[i].county + '</div><br>');
              }
          }
        }
    });
}

function studentLookup(jsonObj, sugDivID){
    $(sugDivID).html('<table id="studentTable" class="table"><tr><th>Full Name</th><th>Add</th></tr>');

    for(var i = 0; i < jsonObj.length; i++){
      $("#studentTable tr:last").after('<tr><td>'+ jsonObj[i].first_name + " " + jsonObj[i].last_name + '</td><td><button onclick="addChild('+"'"+jsonObj[i].auth_ids[i]+"'"+')" class="btn btn-default">Add</button></td></tr>');
    }
}

function lookupChild(){
    var child = $("#childIDField").val()

    $.ajax({
      url: '/lookupChild',
      type: 'POST',
      data: { childID: child },
      success: function(data){
        var jsonObj = $.parseJSON(data);
        studentLookup(jsonObj, "#childResults");
      },
      error: function(){
        console.log("NOPE!");
      }
    });
}

function addChild(student_id){
  $.ajax({
    url: "/addChild",
    type: "POST",
    data: { student_id : student_id },
    success: function(){
      $("#message").html("You have been successfully linked!")
    },
    error: function(){
      $("#message").html("We're sorry, something went wrong.")
    }
  });
}

//For Classes
function studentLookupForClasses(jsonObj, sugDivID){
  $(sugDivID).html('<table id="studentTable" class="table"><tr><th>Full Name</th><th>Add</th></tr>');

  for(var i = 0; i < jsonObj.length; i++){
    $("#studentTable tr:last").after('<tr><td>'+ jsonObj[i].first_name + " " + jsonObj[i].last_name + '</td><td><button onclick="addChild('+"'"+jsonObj[i].auth_ids[i]+"'"+')" class="btn btn-default">Add</button></td></tr>');
  }
}

function lookupChildForClasses(){
  var child = $("#childIDField").val()

  $.ajax({
    url: '/lookupChild',
    type: 'POST',
    data: { childID: child },
    success: function(data){
      var jsonObj = $.parseJSON(data);
      studentLookupForClasses(jsonObj, "#childResults");
    },
    error: function(){
      console.log("NOPE!");
    }
  });
}
