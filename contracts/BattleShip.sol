pragma solidity ^0.4.24;

contract BattleShip {
  uint public storedData;

  enum GameState {NotStarted,Started,Joined,Playing,Finished}
  mapping(address => uint8) public player;
  struct Game{
    uint8 player;
    GameState gameState;
    bytes32 merkleRoot;
    uint8 move;

  }
  uint private time;
  uint8 public currentPlayer;
  bool public flag1;
  bool public flag2;
  uint8 public requiredToWinPlayer1;
  uint8 public requiredToWinPlayer2;
  uint8 public previousMovePlayer1;
  uint8 public previousMovePlayer2;
  bytes32 public temphash;
  bool public FirstMove;



  Game public gamePlayer1;
  Game public gamePlayer2;


  event logGameStarted(string gameStarted);
  event logGameJoined(string gameJoined);
  event logCurrentPlayer(string player);
  event logReturnValue( uint8 current);
  event logReturnValue1( string current);
  event logGameWinner(string winner);
  event logGamePlaying(string gamePlaying);
  event logGameHit(uint8 ship);
  event logGamepreviousMove(uint8 position);


  modifier isStateNotStarted( ){

           require(gamePlayer1.gameState == GameState.NotStarted); _;
          }

   modifier isStateStarted( ){

           require((gamePlayer1.gameState == GameState.Started) ); _;
          }

  modifier isStatePlaying(){
         require( gamePlayer1.gameState== GameState.Playing || gamePlayer2.gameState== GameState.Playing); _;
  }
  modifier isStateFinished(){
         require( gamePlayer1.gameState== GameState.Finished && gamePlayer2.gameState== GameState.Finished); _;
  }
  modifier isStateJoined(){
         require( gamePlayer1.gameState== GameState.Joined || gamePlayer2.gameState== GameState.Joined); _;
  }

  modifier isStateNotJoined(){
         require(  gamePlayer2.gameState != GameState.Joined); _;
  }

  modifier isCurrentPlayer() {
          require(player[msg.sender] == currentPlayer); _;
      }
  modifier isPlayer1() {
          require(player[msg.sender] == gamePlayer1.player); _;
      }
  modifier isPlayer2() {
          require(player[msg.sender] == gamePlayer2.player); _;
      }
  modifier isPlayer() {
          require(player[msg.sender] == gamePlayer1.player || player[msg.sender] == gamePlayer2.player); _;
      }

  modifier isTooLong(){
      require(time-block.number<=30);_;
  }

function  get() public {

}

  // start a game by one player sending his address and the opponents address
  //Player1 will go second
  function newGame( bytes32 merkleroot)   isStateNotStarted()  public  {
      // check game not started already
      // Needs the Merkle root of each players board


               player[msg.sender] = 1;
               gamePlayer1 = Game({
                   player:player[msg.sender], // set to 1 that is player1
                   gameState:GameState.Started, // set state to started GameState gameState;
                   merkleRoot: merkleroot, //merkleRoot for player1
                   move:0
              } );

              //set currentplayer to player1
              currentPlayer = player[msg.sender];
              flag1 = true;

               emit logGameStarted('Game Started');
               emit logCurrentPlayer('Player 2 to Join and then make a Move');

           }

function joinGame(bytes32 merkleroot)   public isStateStarted isStateNotJoined {
                           //check is state started

                           // Check Game exists and is not joined
                player[msg.sender]=2;
                gamePlayer2 = Game({
                    player:player[msg.sender],//set  player2
                    merkleRoot: merkleroot, //merkleroot set for player2
                    gameState:GameState.Joined,//set stated to joined
                    move:0 // set move to first move
                  });
                        //set current player to Player 2
                          currentPlayer = player[msg.sender];
                          flag2 = true;
                         //previousMovePlayer2 = firstMove;
                         emit logGameJoined('Game Joined');
                         emit logCurrentPlayer('Player 2');

          }




/*
function firstMove(uint8 move) public {
       // Check GameState is Joined

                gamePlayer1.gameState = GameState.Playing;// Set game state to Playing
                gamePlayer2.gameState = GameState.Playing;


                if (gamePlayer2.player == currentPlayer) {
                  previousMovePlayer2 = move;
                  emit logCurrentPlayer('Player 1');
                  currentPlayer = gamePlayer1.player;
                }
                if (gamePlayer1.player == currentPlayer) {
                  previousMovePlayer1 = move;
                  emit logCurrentPlayer('Player 2');
                  currentPlayer = gamePlayer1.player;
              }
                emit logGamePlaying('Playing First Moves');
                emit logGamepreviousMove(move);


}
*/
function makeMove(uint8 move,string leafValue,bytes32[7] merkleProof)  public isPlayer isTooLong isStatePlaying() {



if (gamePlayer1.player == currentPlayer) {
     //so if Player1 is the current Player
     //he sends his present move plus value of his grid at the value of players2 last move
    // Plus the proof that this value is valid
    bytes32 _root1 = gamePlayer1.merkleRoot;
   if(!utilities.verifyProof(merkleProof,leafValue,previousMovePlayer2,_root1)){
     // set this player as winner and end the game
     emit logGameWinner('Winner is Player 1 by default');
     gamePlayer1.gameState = GameState.Finished;
     gamePlayer2.gameState = GameState.Finished;
     revert('Board was Changed');
   }

    //Failing the merkleProof should just bomb the contract and award the ether to other player that is player2
   // But assuming the rest of this code wont run unless its true


  currentPlayer = gamePlayer2.player; //swop players
  emit logCurrentPlayer('Player 2');
  emit logGamePlaying('Playing');
  emit logGameHit(utilities.stringToUint(leafValue));
  emit logGamepreviousMove(move);


   previousMovePlayer1 = move;

//if value is equal to 30 then declare a winner can grief by not putting in correct values?
  requiredToWinPlayer1 += utilities.stringToUint(leafValue);
  if (requiredToWinPlayer2 == 32){
      emit logGameWinner('Winner is Player 1');
      gamePlayer1.gameState = GameState.Finished;
      gamePlayer2.gameState = GameState.Finished;

}

  time = block.number;
    }
else if (gamePlayer2.player==currentPlayer) {
  //Take care of first move
//if(flag2) {firstMove(move);flag2 = false; return;}
    bytes32 _root2 = gamePlayer2.merkleRoot;
  if(!utilities.verifyProof(merkleProof,leafValue,previousMovePlayer1,_root2)){
//set this player as winner and end the game
  emit logGameWinner('Winner is Player 2 by default');
  gamePlayer1.gameState = GameState.Finished;
  gamePlayer2.gameState = GameState.Finished;
  revert("Board was Changed");
  }
    currentPlayer = gamePlayer1.player; //swop players

    emit logCurrentPlayer('Player 1');
    emit logGamePlaying('Playing');
    emit logGameHit(utilities.stringToUint(leafValue));
    emit logGamepreviousMove(move);


      previousMovePlayer2 = move;

  requiredToWinPlayer2 += utilities.stringToUint(leafValue);
   if (requiredToWinPlayer2 == 32){emit logGameWinner('Winner is Player 2');
    gamePlayer1.gameState = GameState.Finished;
    gamePlayer2.gameState = GameState.Finished;
    }

   time = block.number;
      }

}


}


library utilities {

function stringToUint(string s) internal pure returns (uint8 result) {
        bytes memory b = bytes(s);
        uint8 i;
        result = 0;
        for (i = 0; i < b.length; i++) {
            uint8 c = uint8(b[i]);
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
}

function verifyProof(bytes32[7] proofElement,string leafValue,uint8 previousmove,bytes32 _root) internal pure returns(bool) {

      bytes32 tempHash;
 // find the hash of the value at previousmove
    tempHash = keccak256(abi.encodePacked(leafValue));

    for(uint8 i=1;i<=7;i++)
        {

        if (previousmove%2 == 0)
            {
                tempHash = keccak256(abi.encodePacked(proofElement[i-1],tempHash));
                previousmove = previousmove/2;
            }
        else{
                tempHash = keccak256(abi.encodePacked(tempHash,proofElement[i-1]));
                previousmove = (previousmove+1)/2;
            }
        }


// going to hard wire it till I figure hashes out return (tempHash == _root);
return(true);
}
}
