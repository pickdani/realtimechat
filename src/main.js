let myName = prompt("enter a username, empty for anon");

if (myName.length > 10) {
    myName = myName.substring(0, 10) + "...";
}
if (myName == "" || myName == "pickdani") {
    myName = "anon"
}

function sendMessage() {
    let message = document.getElementById("message").value;

    // read in the date of the message sent previously from the database
    firebase.database().ref('timestamp').on('value', (snap) => {
        let recentDate = snap.val().date;

        // get current date when message is sent
        let dateObj = new Date();
        let month = dateObj.getUTCMonth() + 1; //months from 1-12
        let day = dateObj.getUTCDate();
        let year = dateObj.getUTCFullYear();
        let date = month + "/" + day + "/" + year;

        // if the date of this message hasn't been seen, then add it
        if (date != recentDate) {
            // save in database
            firebase.database().ref("messages").push().set({
                "sender": myName,
                "message": message,
                "timestamp": date
            })

            firebase.database().ref("timestamp").set({
                "date": date
            });
        }
        else {
            firebase.database().ref("messages").push().set({
                "sender": myName,
                "message": message,
                "timestamp": null
            })
        }
    });


    // prevent form submit
    return false;
}

// listen for incoming messages
firebase.database().ref("messages").on("child_added", function (snapshot) {
    // give each message unique id
    let html_message = "<li id='message-" + snapshot.key + "'>";
    // only show date if it is not null
    if (snapshot.val().timestamp != null) {
        html_message = "<p class=\"timestamp\">" + snapshot.val().timestamp + "</p>" + html_message;
    }
    html_message += "<i><b>" + snapshot.val().sender + "</b></i>" + ": "
        + snapshot.val().message;
    html_message += "</li>";
    // add message to front of the list
    document.getElementById("messages").innerHTML =
        html_message + document.getElementById("messages").innerHTML;


    // delete this message after 30 seconds
    setTimeout(function () {
      deleteMessage(snapshot.key);
    }, 30000);
});


// given snapshot key removes it from firebase
function deleteMessage(key) {
    // delete message
    firebase.database().ref("messages").child(key).remove();
}

// attach listener for delete message
firebase.database().ref("messages").on("child_removed", function (snapshot) {
    // remove message node
    let element = document.getElementById("message-" + snapshot.key);
    // fade out message
    element.style.transition = "opacity 5s ease";
    element.style.opacity = "0";
});
