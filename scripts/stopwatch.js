//globals
let stopwatchList = [];
let idCounter = 1; //gives id to the stopwatch object

function Stopwatch(isPaused = true, title, startTime = Date.now(), notes = [], accumulatedTime = 0) {
    if (title == null) {
        title = document.getElementById("title").value;
    }
    this.id = idCounter;
    idCounter = idCounter + 1;
    this.isPaused = isPaused;
    this.title = title;
    this.accumulatedTime = accumulatedTime;
    this.startTime = startTime;
    this.notes = notes;
}

function MillisToTimeString(remMillis) {
    let remSeconds = Math.floor(remMillis / 1000);
    let secs = remSeconds % 60;
    remSeconds = remSeconds - secs;
    let mins = (remSeconds / 60) % 60;
    remSeconds = remSeconds / 60 - mins;
    let hrs = remSeconds / 60;
    if (hrs < 10) hrs = "0" + hrs;
    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;
    return hrs + ":" + mins + ":" + secs;
}

function GetStopwatchHTML(stopwatch) {
    let pausePlayButtonStr = function (isPaused) {
        if (!isPaused) {
            return (
                "<span class='btn btn-warning glyphicon glyphicon-pause' onclick='PausePlayToggle(this, " +
                stopwatch.id +
                ")'>Pause</span>"
            );
        } else {
            return (
                "<span class='btn btn-success glyphicon glyphicon-play' onclick='PausePlayToggle(this, " +
                stopwatch.id +
                ")'>Play</span>"
            );
        }
    };
    let retStr =
        "<div class='col-md-6' id='" +
        stopwatch.id +
        "'>" +
        "<div class='panel panel-default'>" +
        "<div class='panel-heading'>" +
        "<div class='row'>" +
        "<div class='col-md-8'>" +
        "<h3 class='panel-title'>" +
        stopwatch.title +
        "</h3>" +
        "</div>" +
        "<div class='col-md-4 text-center'>" +
        "<button type='button' class='btn btn-default glyphicon glyphicon-pencil' data-toggle='modal' data-target='#notesModal' onclick='fillModal(" +
        stopwatch.id +
        ")'>" +
        " Notes" +
        "</button>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<div class='panel-body'>" +
        "<h2 class='text-center' + id='watch" +
        stopwatch.id +
        "'>" +
        MillisToTimeString(Date.now() - stopwatch.startTime + stopwatch.accumulatedTime) +
        "</h2>" +
        "</div>" +
        "<div class='panel-footer'>" +
        "<div class='btn-group btn-group-justified'>" +
        pausePlayButtonStr(stopwatch.isPaused) +
        "<span class='btn btn-info glyphicon glyphicon-refresh' onclick='RestartStopwatch(" +
        stopwatch.id +
        ")'>Restart</span>" +
        "<span class='btn btn-danger glyphicon glyphicon-remove' onclick='DeleteStopwatch(" +
        stopwatch.id +
        ")'>Remove</span>" +
        "<!/div>" +
        "</div>" +
        "</div>" +
        "</div>";

    return retStr;
}

function CreateNewStopwatch() {
    stopwatchList[stopwatchList.length] = new Stopwatch();
    $("#stopwatches").append(
        GetStopwatchHTML(stopwatchList[stopwatchList.length - 1])
    );
    document.getElementById("title").value = "";
}

function DeleteStopwatch(id) {
    let stopwatch = GetStopwatchById(id);
    document.getElementById(id).outerHTML = "";
    stopwatchList.splice(stopwatchList.indexOf(stopwatch), 1)
}

function RestartStopwatch(id) {
    let stopwatch = GetStopwatchById(id);
    stopwatch.startTime = Date.now();
    stopwatch.curTime = Date.now();
    stopwatch.accumulatedTime = 0;
    document.getElementById("watch" + id).innerHTML = MillisToTimeString(0);
}

function PauseStopwatch(id)
{
    let stopwatch = GetStopwatchById(id);
    stopwatch.isPaused = true;
    stopwatch.accumulatedTime += Date.now() - stopwatch.startTime;
    stopwatch.startTime = null;
}

function UnpauseStopwatch(id)
{
    let stopwatch = GetStopwatchById(id);
    stopwatch.startTime = Date.now();
    stopwatch.isPaused = false;
}

function DeleteAll() {
    while (stopwatchList.length > 0) {
        DeleteStopwatch(stopwatchList[0].id);
    }
}

function UpdateTimeOfAll() {
    for (let i = 0; i < stopwatchList.length; i++) {
        let stopwatch = stopwatchList[i];
        if (stopwatch.isPaused) {
            continue;
        }
        let tempId = "watch" + stopwatch.id;
        let tempModalId = "note" + stopwatch.id;
        let timeString = MillisToTimeString(Date.now() - stopwatch.startTime + stopwatch.accumulatedTime);
        document.getElementById(tempId).innerHTML = timeString;
        let tempModal = document.getElementById(tempModalId);
        if (tempModal !== null) {
            tempModal.innerHTML = timeString;
        }
    }
}

function GetStopwatchById(id)
{
    let index = stopwatchList.findIndex(sw => sw.id === id);
    if (index === -1) {
        return null
    }
    return stopwatchList[index];
}

//for pause play
function PausePlayToggle(elem, id) {
    if (elem.innerHTML == "Pause") {
        elem.outerHTML =
            "<span class='btn btn-success glyphicon glyphicon-play' onclick='PausePlayToggle(this, " +
            id +
            ")'>Play</span>";
        PauseStopwatch(id);
    } else if (elem.innerHTML == "Play") {
        elem.outerHTML =
            "<span class='btn btn-warning glyphicon glyphicon-pause' onclick='PausePlayToggle(this, " +
            id +
            ")'>Pause</span>";
        UnpauseStopwatch(id);
    }
}

//function to add note to the watch's list and reload the modal
function AddNote(id) {
    for (let i = 0; i < stopwatchList.length; i++) {
        if (stopwatchList[i].id == id) {
            stopwatchList[i].notes.push(document.getElementById("newNote").value);
            fillModal(id);
            break;
        }
    }
}

//function to remove note from list when cross button in list items is pressed
function RemoveNote(elem, id, noteIndex) {
    for (let i = 0; i < stopwatchList.length; i++) {
        if (stopwatchList[i].id == id) {
            stopwatchList[i].notes.splice(noteIndex, 1);
            elem.outerHTML = "";
        }
    }
}

//function to fill the modal dynamically when a note button is called
function fillModal(id) {
    let watch = null;
    let retHtmlTitle = "";
    let retHtmlBody = "";
    let retHtmlFooter = "";

    for (let i = 0; i < stopwatchList.length; i++) {
        if (stopwatchList[i].id == id) {
            watch = stopwatchList[i];
        }
    }
    if (watch == null) {
        console.log("error");
    }

    retHtmlTitle = watch.title;

    retHtmlBody =
        retHtmlBody +
        "<h2 class='text-center' + id='note" +
        watch.id +
        "'>" +
        MillisToTimeString(Date.now() - watch.startTime + watch.accumulatedTime) +
        "</h2>" +
        "<hr>";

    retHtmlBody += "<ul class='list-group'>";
    for (let i = 0; i < watch.notes.length; i++) {
        retHtmlBody +=
            "<li class='row list-group-item'>" +
            "<p class='col-md-11 list-item'>" +
            watch.notes[i] +
            "</p>" +
            "<span class='col-md-1 glyphicon glyphicon-remove pull-right' onclick='RemoveNote(this.parentNode, " +
            watch.id +
            ", " +
            i +
            ")'>" +
            "</span>" +
            "</li>";
    }
    retHtmlBody += "</ul>";

    retHtmlFooter +=
        "<div class='input-group'>" +
        "<input type='text' name='noteText' class='form-control' id='newNote' placeholder='Write Note' onKeyDown='if(event.which==13) AddNote(" +
        watch.id +
        ")' />" +
        "<span class='input-group-btn'>" +
        "<button onclick='AddNote(" +
        watch.id +
        ")' class='form-control btn btn-primary'><span class='glyphicon glyphicon-plus'></span> Add Note </button>" +
        "</span>" +
        "</div>";

    $("#notesModalTitle").html(retHtmlTitle);
    $("#notesModalBody").html(retHtmlBody);
    $("#notesModalFooter").html(retHtmlFooter);
}

//clocks get updated each second because of this
setInterval(UpdateTimeOfAll, 1000);

//store the list of stopwatches in the cookie so that reloading the page does not cause data to loss
window.onbeforeunload = function (e) {
    e = e || window.event;
    localStorage.setItem("myCookie", JSON.stringify(stopwatchList));
};

//load the list of stopwatches in listStopWatch and attach them to html is list is present in cookie.
window.onload = function (e) {
    e = e || window.event;
    let savedStopwatches = JSON.parse(localStorage.getItem("myCookie"));
    for (let i = 0; i < savedStopwatches.length; i++) {
        let sw = savedStopwatches[i];
        stopwatchList.push(new Stopwatch(
            sw.isPaused,
            sw.title,
            sw.startTime,
            sw.notes,
            sw.accumulatedTime,
        ));
        $("#stopwatches").append(
            GetStopwatchHTML(stopwatchList[stopwatchList.length - 1])
        );
    }
};

function detectEnter(event) {
    event = event || window.event;
    if (event.keyCode == 13) {
        CreateNewStopwatch();
    }
}


//Set event listeners for each target.

let addWatchButton = document.getElementById("addWatch-btn");
addWatchButton.addEventListener("click", CreateNewStopwatch);
console.log(addWatchButton.textContent)

let removeAllButton = document.getElementById("removeAll-btn");
removeAllButton.addEventListener("click", DeleteAll);
console.log(removeAllButton.textContent);