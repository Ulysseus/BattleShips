pragma solidity ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/BattleShip.sol";

contract TestBattleShip {

  BattleShip battleship;


    // Lets make sure the contract has some ether this can be a function or a public variable
    uint public initialBalance = 1 ether;
    //The next function resets everthing before each test basically its a hook
    function beforeEach() public {
  battleship = BattleShip(DeployedAddresses.BattleShip());

   }

  // fallback function allows the contract to accept ether
    function () public payable {}
    // Test that Game can only be created once

    function testnewGame() public {
      bool result;


      bytes32 merkleroot = keccak256(abi.encodePacked('test'));
      //battleship.newGame(merkleroot);

      result = address(battleship).call(abi.encodeWithSignature("newGame(bytes32)",merkleroot));
      Assert.isTrue(result,'Once Game started cannot restart');
      // Now that we know e can join a game need to test we cannot rejoin
    }
    //Now Check we cannot join again

    function testreStartnewGame() public {
      bool result;


      bytes32 merkleroot = keccak256(abi.encodePacked('test'));
      //battleship.newGame(merkleroot);

      result = address(battleship).call(abi.encodeWithSignature("newGame(bytes32)",merkleroot));
      Assert.isFalse(result,'Once Game started cannot restart');
      // Now that we know e can join a game need to test we cannot rejoin
    }




// Test that can the join game
function testjoinGame() public {
  bool result;

  bytes32 merkleroot = keccak256(abi.encodePacked('Fox'));


  result = address(battleship).call(abi.encodeWithSignature("joinGame(bytes32)",merkleroot));
  Assert.isTrue(result,'Once Game joined cannot rejoin');

}

//Test that cannot rejoin the game
function testrejoinGame() public {
  bool result;

  bytes32 merkleroot = keccak256(abi.encodePacked('Fox'));


  result = address(battleship).call(abi.encodeWithSignature("joinGame(bytes32)",merkleroot));
  Assert.isFalse(result,'Once Game joined cannot rejoin');

}
// Test Game is started before joining
function testjoinGameStarted() public {
  bool result;

  bytes32 merkleroot = keccak256(abi.encodePacked('test'));
  result = address(battleship).call(abi.encodeWithSignature("joinGame(bytes32)",merkleroot));
  Assert.isFalse(result,'Once Game joined cannot rejoin');

}




// Test can access makeMove once game started and Joined
function testPlayerMakeMove() public {
  bool result;
  uint8 i;


  bytes32 merkleroot = keccak256(abi.encodePacked('the'));


uint8 move = 8;
bytes32[7] storage merkleProof ;
//Fill the array with some hashes;
for (i=0;i<7;i++){
merkleProof[i] = keccak256(abi.encodePacked(i));
}

  result = address(battleship).call(abi.encodeWithSignature("makeMove(uint8 ,string ,bytes32[7])",move,"4",merkleProof));
  Assert.isTrue(result,'Could not access makeMove');

}
//Check that only players can access makeMove
function testPlayerMakeMove2() public {
  bool result1;
  bool result2;
  uint8 i;
  BattleShip battleship2 = new BattleShip();

  bytes32 merkleroot2 = keccak256(abi.encodePacked('the'));

 battleship2.newGame(merkleroot2);// start a new game
// join the game
  battleship2.joinGame(merkleroot2);

uint8 move = 8;
bytes32[7] storage merkleProof2 ;
//Fill the array with some hashes;
for (i=0;i<7;i++){
merkleProof2[i] = keccak256(abi.encodePacked(i));
}

  result2 = address(battleship2).call(abi.encodeWithSignature("makeMove(uint8 ,string ,bytes32[7])",move,"4",merkleProof2));
// You should be able to call it from battleship2 so result2 is True
//Now call it from battleship result1 should be false
result1 = address(battleship2).call(abi.encodeWithSignature("makeMove(uint8 ,string ,bytes32[7])",move,"4",merkleProof2));
//Now check that !result1 and result2 is true
  Assert.isFalse(!result1 && result2,'Should not be able to access unless a player');

}

}
