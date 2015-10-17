var selectGraceHopper = function (callback) {
  Session.set("selected_player", Players.findOne({name: "Grace Hopper",
                                                  createdBy: Meteor.userId()})._id);
  if (callback) {
    Deps.afterFlush(callback);
  }
};

var unselectPlayer = function () {
  Session.set("selected_player", null);
};

describe("Testing LeaderBoard", function () {

  beforeAll(function (done){
    Meteor.call('clearDB', function () {
      Meteor.call('loadFixtures', function () {

        Meteor.loginWithPassword("user@gmail.com", "123456", function () {
          if (!PlayersService.playersExist()) {
            PlayersService.generateRandomPlayers(Meteor.userId());
          }
        });
        Meteor.logout();
        done();
      });
    });
  });

  describe("if loged",function (){

   beforeAll(function (done) {
      Meteor.loginWithPassword("user@gmail.com", "123456", function (err){
        Tracker.afterFlush(done);
      });
      done();
    });

    afterAll(function (done) {
      Meteor.logout(function () {
       Tracker.afterFlush(done);
      });
    });

    describe("Selecting Grace Hopper", function () {

      beforeEach(function (done) {
        Meteor.autorun(function (c) {
          var grace = Players.findOne({name: "Grace Hopper",
                                      createdBy: Meteor.userId()});
          if (grace) {
            c.stop();
            selectGraceHopper(done);
          }
        })
      });

      it("should show Grace above the give points button", function () {
        expect($("div.details > div.name").html()).toEqual("Grace Hopper");
      });

      it("should highlight Grace's name", function () {
        var parentDiv = $("span.name:contains(Grace Hopper)").parent();
        expect(parentDiv.hasClass("selected")).toBe(true);
      });
    });

    describe("Point Assignment", function () {
      beforeEach(function (done) {
        selectGraceHopper(done);
      });

      it("should give a player 5 points when he is selected and the button is pressed", function () {
        var graceInitialPoints = Players.findOne({name: "Grace Hopper"}).score;
        $("input.inc").click();
        expect(Players.findOne({name: "Grace Hopper"}).score).toBe(graceInitialPoints + 5);
      });

      it("should take 5 points from a player when he is selected and the button is pressed", function(){
        var graceInitialPoints = Players.findOne({name: "Grace Hopper"}).score;
        $("input.dec").click();
        expect(Players.findOne({name: "Grace Hopper"}).score).toBe(graceInitialPoints - 5);
      });
    });

    describe("Player Ordering", function () {
      it("should result in a list where the first player has as many or more points than the second player", function () {
        var players = PlayersService.getPlayerList().fetch();
        expect(players[0].score >= players[1].score).toBe(true);
      });
    });

    describe("Modifying the players list", function () {
      beforeAll(function (done) {
        selectGraceHopper(done);
      });

      it("should remove Grace Hopper", function () {
        $('input.remove').click();
        expect(Players.findOne({name: "Grace Hopper"})).toBe(undefined);
      });

      it("should add a new player ", function () {
        var playerName = 'Grace Hopper';
        $('[name=playerName]').val(playerName);
        $('form.newPlayer').submit(function () {
          expect(Players.findOne({name: playerName})).toBe(playerName);
        });       
      });
    });
  });

  describe("If not loged", function () {
    it("shouldn't add a new player if not loged", function () {
      console.log(Meteor.userId())
      var form = $('form.newPlayer').html();
      console.log(form);
      expect(form).toBe(undefined);
    });

    it("shouldn't see any player", function () {
      expect(Players.find().count()).toBe(0);
    })
  });

  describe("When more than one user", function (){

    beforeAll(function () {
      Meteor.loginWithPassword("user2@gmail.com", "123456", function (err){
        Tracker.afterFlush(done);
      });
      Players.insert({name: "New Player", score: 0, createdBy: Meteor.userId()});
    });
    
    afterAll(function (done) {
      Meteor.logout(function () {
       Tracker.afterFlush(done);
       done();
      });
    });

    it("user2 should see only his players",function (){
      expect(Players.find().count()).toBe(1);
    })
  })

});