let myName = prompt("Enter your name");

function sendMessage() {
  let message = document.getElementById("message").value;
  // save in database
  firebase.database().ref("messages").push().set({
    "sender": myName,
    "message": message
  })
  // prevent form submit
  return false;
}

// listen for incoming messages
firebase.database().ref("messages").on("child_added", function (snapshot) {
  // keep at least 1 root node (with no children it will delete)
  if (snapshot.key != 0) {
    // give each message unique id (not used anywhere as of now)
    let html_message = "<li id='message-" + snapshot.key + "'>";
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
  }
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