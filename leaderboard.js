// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

/**
 * Separate player logic into an own service singleton for better testability and reusability.
 * @type {{}}
 */
PlayersService = {
  getPlayerList: function () {
    return Players.find({}, {sort: {score: -1, name: 1}});
  },
  getPlayer: function (playerId) {
    return Players.findOne(playerId);
  },
  modifyPlayerScore: function (playerId, score) {
  	var userId = Meteor.userId();
    Players.update({_id: playerId}, {$inc: {score: score}});
  },
  playersExist: function () {
    return Players.find().count() > 0;
  },
  generateRandomPlayers: function (userId) {
    var names = ["Ada Lovelace",
                 "Grace Hopper",
                 "Marie Curie",
                 "Carl Friedrich Gauss",
                 "Nikola Tesla",
                 "Claude Shannon"];
    //var userId = Meteor.userId();
    for (var i = 0; i < names.length; i++) {
      Players.insert({name: names[i], score: this._randomScore(), createdBy: userId});
    }
  },
  _randomScore: function () {
    return Math.floor(Random.fraction() * 10) * 5
  },
  addPlayer: function(playerName){
    var currentUserId = Meteor.userId();
    var newPlayer = {
      name: playerName,
      score: 0,
      createdBy: currentUserId
    };
    Players.insert(newPlayer);
  },
  removePlayer: function(playerId){
  	var userId = Meteor.userId();
    Players.remove({_id: playerId});
  }
};

if (Meteor.isClient) {

  Meteor.subscribe('players');

  Template.leaderboard.helpers({
    players: function () {
      return PlayersService.getPlayerList();
    },

    selected_name: function () {
      var player = PlayersService.getPlayer(Session.get("selected_player"));
      return player && player.name;
    }
  });

  Template.leaderboard.events({
    'click input.inc': function () {
      PlayersService.modifyPlayerScore(Session.get("selected_player"), 5);
    },
    'click input.dec': function () {
      PlayersService.modifyPlayerScore(Session.get("selected_player"), -5);
    },
    'click input.remove': function(){
      PlayersService.removePlayer(Session.get("selected_player"));
    }
  });


  Template.player.helpers({
    selected: function () {
      return Session.equals("selected_player", this._id) ? "selected" : '';
    }
  });

  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    }
  });

  Template.addPlayerForm.events({
    'submit form': function(event){
      event.preventDefault();
      var playerName = $('[name=playerName]').val();
      PlayersService.addPlayer(playerName);
      $('[name=playerName]').val('');
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {

    if (!PlayersService.playersExist()) {
      PlayersService.generateRandomPlayers(1);
    }

  });

  //Meteor.publish('players', function(){
  	//var currentUserId = this.userId;
  	//return Players.find({createdBy: currentUserId})
    //});
} 