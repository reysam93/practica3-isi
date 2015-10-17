describe('PlayersService', function () {
  'use strict';

  describe('getPlayerList', function () {
    it('should ask for the players in primarily in descending score order, then in alphabetical order and return them', function () {
      var result = {};
      spyOn(Players, 'find').and.returnValue(result);

      expect(PlayersService.getPlayerList()).toBe(result);
      expect(Players.find.calls.argsFor(0)).toEqual([{}, {sort: {score: -1, name: 1}}]);
    });
  });

  describe('getPlayer', function () {
    it('should ask for the player with the given id and return it', function () {
      var playerId = 1;
      var result = {_id: playerId};
      spyOn(Players, 'findOne').and.returnValue(result);

      expect(PlayersService.getPlayer(playerId)).toBe(result);
      expect(Players.findOne.calls.argsFor(0)).toEqual([playerId]);
    });
  });

  describe('Modify player score', function () {
    it('should add 5 points to the player score with the given id', function () {
      var playerId = 1;
      var score = 5;
      spyOn(Players, 'update');

      PlayersService.modifyPlayerScore(playerId, score);
      expect(Players.update.calls.argsFor(0)).toEqual([{_id: playerId}, {$inc: {score: score}}]);
    });

    it('should take 5 points from the player score with the given id', function () {
      var playerId = 1;
      var score = -5;
      spyOn(Players, 'update');

      PlayersService.modifyPlayerScore(playerId, score);
      expect(Players.update.calls.argsFor(0)).toEqual([{_id: playerId}, {$inc: {score: score}}]);
    });
  });

  describe('playersExist', function () {
    it('should return true when players exist', function () {
      var cursor = {
        count: function () {
          return 1;
        }
      };
      spyOn(Players, 'find').and.returnValue(cursor);
      expect(PlayersService.playersExist()).toBe(true);
    });

    it('should return false when no players exist', function () {
      var cursor = {
        count: function () {
          return 0;
        }
      };
      spyOn(Players, 'find').and.returnValue(cursor);
      expect(PlayersService.playersExist()).toBe(false);
    });
  });

  describe('addPlayer', function () {
    it('should call insert', function () {
      var name = 'name';
      var player = {
        name: name,
        score: 0,
        createdBy: Meteor.userId()
      }
      spyOn(Players, 'insert');
      PlayersService.addPlayer(name);
      expect(Players.insert.calls.argsFor(0)).toEqual([player]);
    });
  });

  describe('removePlayer', function (){
    it('should call remove',function () {
      var id = 1;
      spyOn(Players, 'remove');
      PlayersService.removePlayer(id);
      expect(Players.remove.calls.argsFor(0)).toEqual([{_id: id}]);
    });
  });
});