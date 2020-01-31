$(document).ready(function () {
var team1;
var team2;
var team1FullName;
var team2FullName;
var datePlayed;
var winningTeam;
var team1Score;
var team2Score;
var stage;
var searchString;
var messageString;
var isScheduled = false;
var isPlayed = false;
var dateScheduled;

var firstPage = $("#pageOne");
var secondPage = $("#pageTwo");
var thirdPage = $("#pageThree");

var displayDate = $("#date");
var displayWinner = $("#winner");
var displayScore = $("#score");
var displayStage = $("#stage");
var goBackBtn = $("#goBack");

initializeLocalStorage();
renderLocalStorage();
populateDropdowns(1);
populateDropdowns(2);

$('.dropdown-trigger').dropdown();

$(".team1").on("click", function(){
    $("#selectedTeam1").text($(this)[0].innerText);
    team1 = $(this)[0].innerText;

})

$(".team2").on("click", function(){
    
    $("#selectedTeam2").text($(this)[0].innerText);
    team2 = $(this)[0].innerText;
})

$("#goBtn").on("click", onGO);
goBackBtn.on("click", goToFirstPage);

$("#backFromFav").on("click", goToFirstPage);
$(".matchList").on("click", functionFromFavorites);

$("#fav").on("click", function(){
    thirdPage.css("display", "initial");
    firstPage.css("display", "none");
    secondPage.css("display", "none");  
})

$("#clearFav").on("click", function(){
    favMatches = [];
    localStorage.setItem("CLteamsDataKey", JSON.stringify(favMatches));
    $(".matchList").html("");
})

function onGO(){

    if(($("#selectedTeam1").text() === "Team 1") || ($("#selectedTeam2").text() === "Team 2"))
    {
        displayModal("Please select two teams.");
        return;
    }

    if(team1 === team2){
        displayModal("Both the teams selected are the same.");
        return;
    }

    setLocalStorage();
    renderLocalStorage();

    clearFlags();

    getData();

}

function displayMatchData(){

    firstPage.css("display", "none");
    secondPage.css("display", "initial");
    thirdPage.css("display", "none");

    displayDate.text(datePlayed);
    displayWinner.text(winningTeam);
    displayScore.text(team1Score + "\xa0\xa0\xa0" + team2Score);
    displayStage.text(stage);

    searchString = team1FullName + " vs " + team2FullName + " " + datePlayed + " Champions League";

    getVideo();

}

function getVideo() {
    $.ajax({
      type: 'GET',
      url: 'https://www.googleapis.com/youtube/v3/search?regionCode=GB',
      data: {
          key: 'AIzaSyB_1XHQC2AFAkaONYzmD5TjmWXngqSal_c',
          q: searchString,
          part: 'snippet',
          maxResults: 4,
          type: 'video',
          videoEmbeddable: true,
      }
    }).then(function(response) {
        
        $('.carousel').carousel();

        $('.next').click(function(){
            $('.carousel').carousel('next');
        })

        $('.prev').click(function(){
            $('.carousel').carousel('prev');
        })

        $('#video1').attr('src', 'https://www.youtube.com/embed/' + response.items[0].id.videoId);
        $('#video2').attr('src', 'https://www.youtube.com/embed/' + response.items[1].id.videoId);
        $('#video3').attr('src', 'https://www.youtube.com/embed/' + response.items[2].id.videoId);
        $('#video4').attr('src', 'https://www.youtube.com/embed/' + response.items[3].id.videoId);

  });
}

function goToFirstPage()
{
    firstPage.css("display", "initial");
    secondPage.css("display", "none");
    thirdPage.css("display", "none");

}

function displayModal(message){
    $("#exceptionMessage").text(message);
    $("#displayExceptions").css("display", "block");
    $(".close").on("click", function(){
        $("#displayExceptions").css("display", "none");
        });
}

function clearFlags(){
    isScheduled = false;
    isPlayed = false;
}

function getData(){
    $.ajax({
        headers:{'X-Auth-Token' : '3d5af28fa6024c74b54c5588d1536b09'},
        url: 'https://api.football-data.org/v2/competitions/2001/matches' ,
        dataType: 'json',
        type: 'GET'
        }).then(function(response){
    
            var indexTeam1 = teamShortNames.indexOf(team1);
            var indexTeam2 = teamShortNames.indexOf(team2);
            team1FullName = teamNames[indexTeam1];
            team2FullName = teamNames[indexTeam2];
    
            for(let i=response.matches.length-1; i>=0; i--)
            {
                
                if((team1FullName === response.matches[i].homeTeam.name && team2FullName === response.matches[i].awayTeam.name) || (team1FullName === response.matches[i].awayTeam.name && team2FullName === response.matches[i].homeTeam.name))
                
                {
                    if(response.matches[i].status === "FINISHED")
                    {
                        
                        isPlayed = true;
                        let utcDate = response.matches[i].utcDate;
                        let utcDateArr = utcDate.split("T");
                        let dt = utcDateArr[0];
                        dt = moment(dt , "YYYY-MM-DD").format("DD-MM-YYYY");
    
                        if(response.matches[i].score.winner === "DRAW")
                        {
                            winningTeam = "Draw";
                        }
                        else if(response.matches[i].score.winner === "HOME_TEAM")
                        {
                            winningTeam = response.matches[i].homeTeam.name;
                        }
                        else
                        {
                            winningTeam = response.matches[i].awayTeam.name;
                        }
    
                        scoreTeam1 = response.matches[i].homeTeam.name + " : " + response.matches[i].score.fullTime.homeTeam;
                        scoreTeam2 = response.matches[i].awayTeam.name + " : " + response.matches[i].score.fullTime.awayTeam;
    
                        stage = response.matches[i].stage;
                        
                        datePlayed = dt;
                        team1Score = scoreTeam1;
                        team2Score = scoreTeam2;
    
                        break;  
                    }
                         
                }
        
            }
    
            for(let i=0; i < response.matches.length; i++)
            {
                if((team1FullName === response.matches[i].homeTeam.name && team2FullName === response.matches[i].awayTeam.name) || (team1FullName === response.matches[i].awayTeam.name && team2FullName === response.matches[i].homeTeam.name))
                {
                    if(response.matches[i].status === "SCHEDULED")
                    {
                        isScheduled = true;
                        let utcDate = response.matches[i].utcDate;
                        let utcDateArr = utcDate.split("T");
                        let dt = utcDateArr[0];
                        dt = moment(dt , "YYYY-MM-DD").format("DD-MM-YYYY");
    
                        dateScheduled = dt;
                        break;
    
                    }
    
                }
    
            }

            if(isPlayed === true && isScheduled === false)
            {
                //display data only
                displayMatchData();
            }
            else if(isPlayed === true && isScheduled === true)
            {
                //display data and display modal
                displayMatchData();
                messageString = "The selected two teams are scheduled to play next on : " + dateScheduled + ".";
                displayModal(messageString);
    
            }
            else if(isPlayed === false && isScheduled === true)
            {
                //display modal only with date
                messageString = "The selected two teams are scheduled to play on :\xa0\xa0" + dateScheduled + "." + "\xa0 There was no match between them in this season yet." ;
                displayModal(messageString);
    
            }
            else
            {
                messageString = "The selected two teams have not played each other and are not scheduled to play";
                displayModal(messageString);   
            }
    
    
        });
}

function setLocalStorage(){
    let currentSelection = team1 + "\xa0" + "vs" + "\xa0" + team2;
    
    favMatches = JSON.parse(localStorage.getItem("CLteamsDataKey"));
    
    if(favMatches.indexOf(currentSelection) === -1)
    {
        if(favMatches.length < 4)
        {
            favMatches.push(currentSelection);
        }
        else
        {
            favMatches.shift();
            favMatches.push(currentSelection);
        }
    }
    
    localStorage.setItem("CLteamsDataKey", JSON.stringify(favMatches));
    
}

function renderLocalStorage(){
    favMatches = JSON.parse(localStorage.getItem("CLteamsDataKey"));
    $(".matchList").html("");
    for(let i=0; i<favMatches.length; i++)
    {
        let listItem = $("<li>");
        listItem.attr("class", "collection-item")
        listItem.css("background-color", "lightgrey");
        listItem.css("height", "30px");
        listItem.css("border-style" , "solid");
        listItem.css("border-color" , "black");
        listItem.css("text-align" , "center");
        listItem.css("line-height", "1.5")
        listItem.text(favMatches[i]);
        $(".matchList").append(listItem);
    }

}

function functionFromFavorites()
{
    let selectedItem = event.target.textContent;
    let splitArr = selectedItem.split("\xa0");

    team1 = splitArr[0].trim();
    team2 = splitArr[2].trim();

    clearFlags();
    getData();
}

function initializeLocalStorage(){
    //localStorage.removeItem("CLteamsDataKey");
    var favMatches = [];
    if(!("CLteamsDataKey" in localStorage))
    { 
        localStorage.setItem("CLteamsDataKey", JSON.stringify(favMatches));
    }
}

function populateDropdowns(x)
{
    for(let i = 0; i < teamShortNames.length; i++)
    {
        let listItem = $("<li>");
        listItem.attr("class" , `team${x}`);
        listItem.text(teamShortNames[i]);

        $(`#dropdown${x}`).append(listItem);

    }
}

});//end of document.ready
  