// YOUR CODE HERE:
var app = {};

app.friends = {};

app.init = function (){
  app.bindEvents();
  app.fetch();
  setInterval(app.fetch, 1000);
};

app.currentRoom = undefined;

app.bindEvents = function(){
  $('#home').on('click', app.setRoom);
  $('#chats').on('click', '[data-room]', app.setRoom);
  $('#chats').on('click', '.username', app.addFriend);
  $('#send').on('submit', app.handleSubmit);
};

app.setRoom = function(e){
  e.preventDefault();
  var $this = $(this);
  var currentRoom = $('#currentRoom');
  var room = $this.text();

  if(room === 'Default' || $this.is('#home')){
    currentRoom.text('Home');
    app.currentQuery = app.server;
    app.currentRoom = undefined;
  } else {
    currentRoom.text(room);
    app.currentRoom = room;
    app.currentQuery = app.server + '&' + encodeURI('where={"roomname":"' + room + '"}');
  }

};

app.ajaxRequest = function(config){
  var deferred = $.Deferred();

  config.url = app.currentQuery;

  config.success = function(data){
    deferred.resolve(data);
  };

  config.error = function(err){
    deferred.reject(err);
  };

  $.ajax(config);

  return deferred.promise();
};

app.send = function (message){

  // $.ajax({
  //   type: 'POST',
  //   data: JSON.stringify(message),
  //   url: app.server,
  //   success: function(data){
  //     app.addMessage(message);
  //   }
  // });

  var request = app.ajaxRequest({
    type: 'POST',
    data: JSON.stringify(message)
  });

  request.then(function(data){
    console.log(data);
    app.addMessage(message);
  });

};

app.fetch = function(){
  // $.ajax({
  //   type:'GET',
  //   url:app.server,
  //   success:function(data){
  //     for(var i = 0; i < data.results.length; i++){
  //       app.addMessage(data.results[i]);
  //     }
  //   }
  // });

  var request = app.ajaxRequest({
    type: 'GET'
  });

  request.then(function(data){
    app.clearMessages();
    for(var i = data.results.length - 1; i >= 0; i--){
      app.addMessage(data.results[i]);
    }
  });

};

app.clearMessages = function(){
  $('#chats').html("");
};

app.addMessage = function(message){
  // var html = [
  //   '<div class="message">',
  //     '<h2 class="username">' + strip(message.username) + '</h2>',
  //     '<p>' + strip(message.text) + '</p>',
  //     '<small>' + strip(message.roomname) + '</small>',
  //   '</div>'
  // ].join('');
  var container = $('<div />', {
    'class': 'message'
  });

  var username = $('<h2 />', {
    'class': 'username'
  }).text(message.username);

  if(app.friends.hasOwnProperty(message.username)){
    username.css('color', 'red');
  }

  var text = $('<p />').text(message.text);
  var room = $('<a />', {
    href: '#',
    'data-room': true
  }).text(message.roomname || 'Default');

  container.append(username);
  container.append(text);
  container.append(room);

  $('#chats').prepend(container);
};

app.addRoom = function(roomName){
  $('#roomSelect').append('<div>' + roomName + '</div>');
};

app.addFriend = function(e){
  e.preventDefault();
  var $this = $(this);
  var friend = $this.text();
  app.friends[friend] = true;
};

app.handleSubmit = function(e){
  e.preventDefault();
  var $this = $(this);
  var message = {
    text: $this.find('#message').val(),
    username: window.location.search.substr(1).split('=')[1],
    roomname: app.currentRoom
  };
  app.send(message);
};

app.server = "https://api.parse.com/1/classes/chatterbox?order=-createdAt";
app.currentQuery = app.server;

$(document).on('ready', app.init);
