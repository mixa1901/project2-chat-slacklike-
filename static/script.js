

document.addEventListener('DOMContentLoaded', function() {


	// if username was already submitted or channel choosed
	if (localStorage.getItem("username") != null) {
		if (localStorage.getItem("channel") != null && !document.querySelector("#send")) {
			redirect();
		} else { 
			greetings();
		}

	}

	// clicking Chaterino removes whole user's data
	document.querySelector('#main').onclick = () => {
		localStorage.removeItem('channel');
		localStorage.removeItem('username');
	}


	// submid button disabled by default
	if (document.querySelector('#name')) {
		document.querySelector('#name').disabled = true;
	}
	
	// when user starts to type submit button enabled 
	if (document.querySelector("#username")) {
		document.querySelector("#username").onkeyup = function() {
			
			// if user type coorect symbols button enabled
			if (document.querySelector("#username").value.length > 0 && /^[a-z0-9_]+$/i.test(document.querySelector("#username").value)) {
				document.querySelector('#name').disabled = false;
			} else {
				document.querySelector('#name').disabled = true;
			}
		};
	}
	
	// when user starts to type submit button enabled 
	if (document.querySelector("#name_channel")) {
		document.querySelector("#name_channel").onkeyup = function() {
			if (document.querySelector("#name_channel").value.length > 0 && /^[a-z0-9_]+$/i.test(document.querySelector("#name_channel").value))  {
				document.querySelector('#channelsub').disabled = false;
			} else {
				document.querySelector('#channelsub').disabled = true;
			}
		};
	}



	if (document.querySelector("#send")) {
		document.querySelector('#send').disabled = true;
		
		// if user on channel's page remember channel's location
		localStorage.setItem('channel',  window.location.href.split("channels/")[1]);
		
		document.querySelector("#message").onkeyup = function() {
			if (document.querySelector("#message").value.length > 0)  {
				document.querySelector('#send').disabled = false;
			} else {
				document.querySelector('#send').disabled = true;
			}
		};
	}
	// after submiting username stores in local storage
	if (document.querySelector("#name")) {
		document.querySelector("#name").onclick = getName; 
	}


	// after clicking create channel
	if (document.querySelector("#new_channel")) {
		document.querySelector("#new_channel").onclick = function() {

			// disabled existing channels
			document.querySelector('#greet_chan').style.display = "none";
			document.querySelector('.ex_channels').style.display = "none";
			
			// shows form for submitting name of channel
			document.querySelector('.channel').style.display = "block";
			document.querySelector('#exist_channel').disabled = false;
			document.querySelector('#new_channel').disabled = true;

		}; 
	}

	// after clicking choose abailible channels
	if (document.querySelector("#exist_channel")) {
		document.querySelector("#exist_channel").onclick = function() {
			
			// shows list of channels
			document.querySelector('.ex_channels').style.display = "block";
			
			// disabled creating
			document.querySelector('.channel').style.display = "none";
			document.querySelector('#greet_chan').style.display = "none";
			document.querySelector('#exist_channel').disabled = true;
			document.querySelector('#new_channel').disabled = false;
			
			// clear list to avoid overwhelming of list items
			document.querySelector('#ex_channels').innerHTML = ""

			//get list
			channels();


		}; 
	}

	// submit new channel
	if (document.querySelector("#channel")) {
		document.querySelector("#channel").onsubmit = ifChannelXist;
	}


	// connect to websocket 
	var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

	if (document.querySelector("#send")) {
		document.querySelectorAll("li").forEach(function(element) {
			let sender = element.firstElementChild.firstElementChild.firstElementChild.innerHTML;

			if (sender == localStorage.getItem("username")) {
				var node = document.createElement("DIV");    
				node.classList.add("col-lg-1");
				node.classList.add('col-xl-1');
				node.classList.add('col-md-1');
				node.classList.add('col-sm-1');   
				node.innerHTML = '<button type="button" class="remove btn btn-dark btn-sm">Remove</button>';   
				element.firstElementChild.appendChild(node);
			} else {
				console.log("no");
			}
		})

		// get view on last message
		if (document.querySelector("#messages").lastElementChild != null) document.querySelector("#messages").lastElementChild.scrollIntoView();

		// send info to server
		socket.on('connect', () => {
			if (document.querySelector(".remove")) {
				var buttons = document.querySelectorAll(".remove");
				for(var i = 0; i < buttons.length; i++) {
					var button = buttons[i];
					button.onclick = function() {
						socket.emit('removing message', {'id': this.parentElement.parentElement.id, 'chat': window.location.href.split("channels/")[1]});
					}
				}
			}

			document.querySelector("#send").onclick = () => {

				document.querySelector('#send').disabled = true;
				var message = document.querySelector("#message").value;
				document.querySelector("#message").value = '';
				socket.emit('messaging', {'message': message, 'sender': localStorage.getItem("username"), 'chat': window.location.href.split("channels/")[1]});
		
				if (document.querySelector("#messages").lastElementChild != null)	document.querySelector("#messages").lastElementChild.scrollIntoView();
			}
			document.querySelector("#message").addEventListener("keyup", function(event) {

				// Cancel the default action, if needed
				event.preventDefault();
				// Number 13 is the "Enter" key on the keyboard
				if (event.keyCode === 13 && document.querySelector("#message").value.length > 0) {
				  // Trigger the button element with a click
					document.querySelector('#send').disabled = true;
					var message = document.querySelector("#message").value;
					document.querySelector("#message").value = '';
					socket.emit('messaging', {'message': message, 'sender': localStorage.getItem("username"), 'chat': window.location.href.split("channels/")[1]});
				
				}
			  });
			
			  


		})
	} 

	// get info from server
	
	if (document.querySelector("#send")) {
		socket.on('showing message', data => {

			var lenLi = document.querySelectorAll("li").length;
			if (lenLi > 99) {
				document.querySelector("#messages").firstElementChild.remove();
			}
			const li = document.createElement('li');
			
			if (localStorage.getItem("username") == data.sender) {
				li.innerHTML ="<div id =" + "'" + data.id + "'" + "class='row'><div class='col-lg-1 col-xl-1 col-md-1 col-sm-1'><b>" + data.sender +
							  ": " + '</b></div><div class="mes col-lg-9 col-xl-9 col-md-9 col-sm-9 ">' + data.message +
							  '</div><div class="col-lg-1 col-xl-1 col-md-1 col-sm-1">'  + data.time + '</div><div class="col-lg-1 col-xl-1 col-md-1 col-sm-1"><button type="button" class="remove btn btn-dark btn-sm">Remove</button></div></div>';
			} else {

				li.innerHTML ="<div id =" + "'" + data.id + "'" + "class='row'><div class='col-lg-1 col-xl-1 col-md-1 col-sm-1'><b>" + data.sender +
				": " + '</b></div><div class="mes col-lg-9 col-xl-9 col-md-9 col-sm-9 ">' + data.message +
				'</div><div class="col-lg-1 col-xl-1 col-md-1 col-sm-1">'  + data.time + '</div></div>';
			}
					
			document.querySelector('#messages').append(li);		
			if (document.querySelector("#messages").lastElementChild != null)	document.querySelector("#messages").lastElementChild.scrollIntoView();
			// remove
			if (document.querySelector(".remove")) {
				var buttons = document.querySelectorAll(".remove");
				for(var i = 0; i < buttons.length; i++) {
					var button = buttons[i];
					button.onclick = function() {
						console.log(this.parentElement.parentElement.id)
						socket.emit('removing message', {'id': this.parentElement.parentElement.id, 'chat': window.location.href.split("channels/")[1]});
					}
				}
			}

		})
		socket.on('rem message', data => {
			document.getElementById(data.id).remove();
		})
	} 



			

})

// save username in local storage
function getName() {
	localStorage.setItem('username', document.querySelector("#username").value);
	greetings();
}

// greet user 
function greetings() {
	if (document.querySelector('.username')) {
		document.querySelector('.username').style.visibility = 'hidden';
		document.querySelector('#exist_channel').style.display = "inline-block";
		document.querySelector('#new_channel').style.display = "inline-block";
		document.querySelector('#greetings').innerHTML = "Hello, " + localStorage.getItem("username") + "!";
	}
}

function redirect() {
	window.location.replace("/channels/" + localStorage.getItem("channel"));
	return false;
}

function ifChannelXist() {
	// initialize new request
	const request = new XMLHttpRequest();
	const channel = document.querySelector('#name_channel').value;

	request.open('POST', '/channel');
	
	request.onload = function() {
		const data = JSON.parse(request.responseText);
		if (data["answer"]) {
			document.querySelector(".channel").style.display = "none";
			document.querySelector('#greet_chan').style.display = "block";
			document.querySelector("#greet_chan").innerHTML = "Success! You created new channel: " +
															"<a href=/channels/" + channel + ">" + '/' + channel +
															"</a>"
		} else {
			document.querySelector('#greet_chan').style.display = "block";
			document.querySelector("#greet_chan").innerHTML = "Sorry! Channel already exists :("
			document.querySelector(".channel").style.display = "none";
			document.querySelector('#new_channel').disabled = false;
		}
	}
	const data = new FormData();
	data.append('channel', channel);

	request.send(data);
	return false;


}


function channels() {
	const request = new XMLHttpRequest();

	request.open('GET', '/channel');

	request.onload = function() {
		const data = JSON.parse(request.responseText);
		for(var i = 0; i < data.length; i++) {
			document.querySelector('#ex_channels').innerHTML += "<li><a href="+ "/channels/" + data[i] + '>' +"/"+data[i]+"</a></li>";
			
		}
	}

	request.send();
	return false;
}



