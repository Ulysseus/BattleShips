import React, { Component } from 'react'
import BattleShipContract from '../build/contracts/BattleShip.json'
import getWeb3 from './utils/getWeb3'
import './index.css';
import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'


//Function for Generating two D array
  function Create2DArray(rows) {
    var arr = [];

    for (var i=1;i<=rows;i++) {
       arr[i] = [];
    }

    return arr;
  }

// Create Player Boards
  var PlayerBoardOne = [];
  var PlayerBoardTwo = [];

  PlayerBoardOne = Create2DArray(10)
  PlayerBoardTwo = Create2DArray(10)
  for (var i=1;i<=10;i++) {
    for (var j =1;j<=10;j++){
     PlayerBoardOne[i][j] = 0;
     PlayerBoardTwo[i][j] = 0;
   }
  }

var leaf = [];
var firstRow = [];
var secondRow = [];
var thirdRow = [];
var fourthRow = [];
var fifthRow = [];
var sixthRow = [];
var merkleRoot = 0;

var tempHash = [0,0,0,0,0,0,0];

// Lets fill in some positions for Player1
PlayerBoardOne[7][3] = 4;
PlayerBoardOne[7][4] = 4;
PlayerBoardOne[7][5] = 4;
PlayerBoardOne[7][6] = 4;
PlayerBoardOne[6][1] = 3;
PlayerBoardOne[7][1] = 3;
PlayerBoardOne[8][1] = 3;
PlayerBoardOne[2][7] = 2;
PlayerBoardOne[3][7] = 2;
PlayerBoardOne[3][10] = 1;

// Set Board for Player2
// Lets fill in some positions for Player2
PlayerBoardTwo[9][3] = 4;
PlayerBoardTwo[9][4] = 4;
PlayerBoardTwo[9][5] = 4;
PlayerBoardTwo[9][6] = 4;
PlayerBoardTwo[2][1] = 3;
PlayerBoardTwo[3][1] = 3;
PlayerBoardTwo[4][1] = 3;
PlayerBoardTwo[2][3] = 2;
PlayerBoardTwo[3][3] = 2;
PlayerBoardTwo[8][8] = 1;



function Square(props)  {
    return (
      <button
        className="square"
        onClick={ props.onClick}
        >

        {props.value}
      </button>
    );
}




class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      gameValue: null,
      web3: null,
      contract:null,
      account:null,
      squares: Array(100).fill(null),
      IsNext:'No Player',
            xIsNext:0,
            counter:0,
            ship:'X',
            position1:null,
            position2:null,
            winner:null,

    }
  }



  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })

  }




  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const BattleShip = contract(BattleShipContract)
    BattleShip.setProvider(this.state.web3.currentProvider)


    // Declaring this for later so we can chain functions on SimpleStorage.
    var BattleShipInstance


    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      BattleShip.deployed().then((instance) => {
        BattleShipInstance = instance

  return BattleShipInstance.get.call(accounts[0]).then(result => {

       console.log(BattleShipInstance)

      return  this.setState({ gameValue: result[0] ,IsNext: result[1] ,contract: BattleShipInstance, account:accounts[0]})


})
    })

})
console.log(this.state.contract)






    //Calculate the hash of each element of the Board
    // I have used 0 in most places in reality these would need to be Random numbers
    // where the ships are would need to concatenate the value onto the Random numbers
    //My Javascript is very poor so I have not done this

  }
handleClickStart(event){


// Calculate Merkle Tree
var k = 1;

for( i = 1; i <= 10; i++) {
    for( j = 1; j <= 10; j++) {
      //first hash, each element
       leaf[k] = this.state.web3.sha3(''+PlayerBoardOne[i][j]);
// the ''+ converts the inetger to a string for the sha3 function

      k ++;
    }
}


for (k = 1; k <= 100;k += 2){
  // create first level of the tree
  firstRow[k] = this.state.web3.sha3(leaf[k].concat(leaf[k+1]));
//  console.log(''+leaf[k]+''+leaf[k+1]);
}

for (k = 1; k <= 50;k += 2){
  // create second level of the tree
  secondRow[k] = this.state.web3.sha3(''+firstRow[k],''+firstRow[k+1]);

}
//secondRow has an odd number so lets append a zero
secondRow[26] = 0;

for (k = 1; k <=26;k += 2){
  // create third level of the tree
  thirdRow[k] = this.state.web3.sha3(''+secondRow[k], ''+secondRow[k+1]);

}
  thirdRow[14] = 0;

for (k = 1; k <= 14;k += 2){
  // create fourth level of the tree
  fourthRow[k] = this.state.web3.sha3(''+thirdRow[k],''+thirdRow[k+1]);

}
fourthRow[8] = 0;

for (k = 1; k <= 8;k += 2){
  // create fifth level of the tree
  fifthRow[k] = this.state.web3.sha3(''+fourthRow[k], ''+fourthRow[k+1]);

}
for (k = 1; k <= 4;k += 2){
  // create sixth level of the tree
  sixthRow[k] = this.state.web3.sha3(''+fifthRow[k], ''+fifthRow[k+1]);

}



   merkleRoot = this.state.web3.sha3(''+sixthRow[1] ,''+sixthRow[3]);

// Now need to set Merkleroot in the contract*/
  const account = this.state.account
  const contract = this.state.contract

  var event2 = contract.logGameStarted({from: account,gas:400000});
  var event3 = contract.logCurrentPlayer({from:account,gas:400000});


event2.watch((error,result)=>{
   if(error){
     console.log(error);
     return;
   }
   return this.setState({gameValue:result.args.gameStarted});
 })

 event3.watch((error,result)=>{
    if(error){
      console.log(error);
      return;
    }
   return  this.setState({IsNext:result.args.player});
})

contract.newGame(merkleRoot,{from:account,gas:330000});

          }

handleClickJoin(event){
// Calculate the Merkle Tree
            var k = 1;


            for( i = 1; i <= 10; i++) {
                for( j = 1; j <= 10; j++) {
                  //first hash, each element
                   leaf[k] = this.state.web3.sha3(''+PlayerBoardTwo[i][j]);
          // the ''+ converts the inetger to a string for the sha3 function

                  k ++;
                }
            }





            for (k = 1; k <= 100;k += 2){
              // create first level of the tree
              firstRow[k] = this.state.web3.sha3(leaf[k].concat(leaf[k+1]));
            //  console.log(''+leaf[k]+''+leaf[k+1]);
            }

            for (k = 1; k <= 50;k += 2){
              // create second level of the tree
              secondRow[k] = this.state.web3.sha3(''+firstRow[k],''+firstRow[k+1]);

            }
            //secondRow has an odd number so lets append a zero
            secondRow[26] = 0;

            for (k = 1; k <=26;k += 2){
              // create third level of the tree
              thirdRow[k] = this.state.web3.sha3(''+secondRow[k], ''+secondRow[k+1]);

            }
              thirdRow[14] = 0;

            for (k = 1; k <= 14;k += 2){
              // create fourth level of the tree
              fourthRow[k] = this.state.web3.sha3(''+thirdRow[k],''+thirdRow[k+1]);

            }
            fourthRow[8] = 0;

            for (k = 1; k <= 8;k += 2){
              // create fifth level of the tree
              fifthRow[k] = this.state.web3.sha3(''+fourthRow[k], ''+fourthRow[k+1]);

            }



            for (k = 1; k <= 4;k += 2){
              // create sixth level of the tree
              sixthRow[k] = this.state.web3.sha3(''+fifthRow[k], ''+fifthRow[k+1]);

            }



              merkleRoot = this.state.web3.sha3(''+sixthRow[1] ,''+sixthRow[3]);

          // Now need to set Merkleroot in the contract*/
            const account = this.state.account
            const contract = this.state.contract




             var event1 = contract.logGameJoined({from:account,gas:400000});
             var event4 = contract.logCurrentPlayer({from:account,gas:400000});


      event1.watch((error,result)=>{
               if(error){
                 console.log(error);
                 return;
               }
                return this.setState({gameValue:result.args.gameJoined});
             })

      event4.watch((error,result)=>{
                if(error){
                  console.log(error);
                  return;
                }

               return  this.setState({IsNext:result.args.player});
              })

        //  Need to put Players2 Merkle Root in here
          contract.joinGame(merkleRoot,{from:account,gas:330000});

                    }



handleClickSquare(i) {

//So click on a square and that is the move basically i.

  const contract = this.state.contract
  const account = this.state.account

var event5 = contract.logCurrentPlayer({from:account,gas:400000});
var event6 = contract.logGamePlaying({from:account,gas:400000});
var event7 = contract.logGameHit({from:account,gas:400000});
var event8 = contract.logGamepreviousMove({from:account,gas:400000});
var event9 = contract.logGameWinner({from:account,gas:400000});

event5.watch((error,result)=>{
          if(error){
            console.log(error);
            return;
          }
         return  this.setState({IsNext:result.args.player});
        })

  event6.watch((error,result)=>{
            if(error){
              console.log(error);
              return;
            }
           return  this.setState({gameValue:result.args.gamePlaying});
            })

event7.watch((error,result)=>{
          if(error){
              console.log(error);
              return;
              }
             return  this.setState({ship:result.args.ship.c[0]});
              })

event8.watch((error,result)=>{
          if(error){
              console.log(error);
              return;
              }
              if(this.state.IsNext === "Player 2") this.setState({position1:result.args.position.c[0]});
              if(this.state.IsNext === "Player 1") this.setState({position2:result.args.position.c[0]});
              return;
              })

event9.watch((error,result)=>{
          if(error){
                console.log(error);
                return;
                }
               return  this.setState({winner:result.args.ship.c[0]});
                })

//So i players move
// So player clicks on a square this is his move
// We need the other players move to give him the merkle path
//so we need to query smart contract for the Move


// to prove we have not cheated




const squares = this.state.squares.slice();

var move;







//This first step actually sends the hash of the board contract needs the value at i
 if (move % 2 === 0){
  // so if move is even go to the left
   tempHash[0] = leaf[move-1] ;


  move /= 2;
} else{//if move is odd go right

  tempHash[0] = leaf[move+1] ;

    move = (move+1)/2
  }
  // So does the contract have the Merkle root and the hash of each position on the Board

  //Pass these values to the Game contract, one is the hash required the other
  // which side to concatenate on
  //Now do firstRow
  //Calculate the row and column of the board referred to by i



// Now calculate the Merkle Path to justify the Merkle Proof
  if (move % 2 === 0){
    tempHash[1] = firstRow[move-1] ;

   move /= 2;
 } else{
     tempHash[1] = firstRow[move+1] ;
     move = (move+1)/2
   }

   //Now do secondRow
   if (move % 2 === 0){
    tempHash[2] = secondRow[move-1] ;
    move /= 2;
   } else{
      tempHash[2] = secondRow[move+1] ;
      move = (move+1)/2
    }
    //send to smart contract

   //thirdRow
   if (move % 2 === 0){
  tempHash[3] = thirdRow[move-1] ;
    move /= 2;
   } else{
      tempHash[3] = thirdRow[move+1] ;
      move = (move+1)/2
    }

    //fourthRow
    if (move % 2 === 0){
     tempHash[4] = fourthRow[move-1] ;
     move /= 2;
   } else{
       tempHash[4] = fourthRow[move+1] ;
       move = (move+1)/2
     }

//Fifth row
  if (move % 2 === 0){
    tempHash[5] = fifthRow[move-1] ;
    move /= 2;
  } else{
    tempHash[5] = fifthRow[move+1] ;
    move = (move+1)/2
  }

        //Sixth row
        if (move % 2 === 0){
         tempHash[6] = sixthRow[move-1] ;

       } else{
           tempHash[6] = sixthRow[move+1] ;

         }




//This the bit it writes in the square
 squares[i] = 'X';


tempHash =[0,0,0,0,0,0,0];


var row;
var column;



//console.log('States at 549 is',this.state.position1,this.state.position2);
var t;
if(this.state.IsNext === "Player 1" )  t = this.state.position2;
if(this.state.IsNext === "Player 2" )  t = this.state.position1;


if(t<10)row = 1; else if (t !== 100) row = 1+Math.floor(t/10);else row = 10;

 if(t%10 === 0){column=10}else{column=t%10};



 if(this.state.IsNext === "Player 1"){
 console.log('Player 1');
  var tempString;
 // Get value of board at position from Player2s move
//console.log(row,column);
  tempString = PlayerBoardOne[row][column].toString();


  //console.log('Value of Player1 board',tempString);
  // To return with Player1 s move.
contract.makeMove(i,tempString,tempHash,{from:account,gas:330000});
} else if (this.state.IsNext === "Player 2") {
  //console.log("Player 2");
  //console.log(row,column);
  tempString = PlayerBoardTwo[row][column].toString();

  //console.log('Value of Player2 board',tempString);
  contract.makeMove(i,tempString,tempHash,{from:account,gas:330000});
}
 if(this.state.IsNext === "Player 1") squares[this.state.position1] = this.state.ship;

if(this.state.IsNext === "Player 2") squares[this.state.position2] = this.state.ship;

this.setState({squares: squares});


  }

  renderSquare(i) {
      return (
         <Square
           value={this.state.squares[i]}
           onClick={() => this.handleClickSquare(i)}
         />
       );

    }



  render() {

    const winner = null;
    let status1;
    if (winner) {
      status1 = 'Winner '+ this.state.winner;
    } else {

      status1 = 'Player: '+ this.state.IsNext;


    }


    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Battle Ships</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <p>BattleShip game</p>
              <h2>Smart Contract Example</h2>
              <p>Your contracts compiled and migrated successfully</p>


                <button onClick={this.handleClickStart.bind(this)}>Start Game</button>
                <button onClick={this.handleClickJoin.bind(this)}>Join Game</button>
                  <p>The state of the game is: {this.state.gameValue}</p>
                  <p>The Next Player is: {this.state.IsNext}</p>
                  <p>Player 1 Previous Move was: {this.state.position1}</p>
                  <p>Player 2 Previous Move was: {this.state.position2}</p>
            </div>
          </div>
        </main>

              <div className="status">{status1}</div>
              <div className="board-row">
                {this.renderSquare(1)}
                {this.renderSquare(2)}
                {this.renderSquare(3)}
                {this.renderSquare(4)}
                {this.renderSquare(5)}
                {this.renderSquare(6)}
                {this.renderSquare(7)}
                {this.renderSquare(8)}
                {this.renderSquare(9)}
                {this.renderSquare(10)}
              </div>
              <div className="board-row">
                {this.renderSquare(11)}
                {this.renderSquare(12)}
                {this.renderSquare(13)}
                {this.renderSquare(14)}
                {this.renderSquare(15)}
                {this.renderSquare(16)}
                {this.renderSquare(17)}
                {this.renderSquare(18)}
                {this.renderSquare(19)}
                {this.renderSquare(20)}
              </div>
              <div className="board-row">
                {this.renderSquare(21)}
                {this.renderSquare(22)}
                {this.renderSquare(23)}
                {this.renderSquare(24)}
                {this.renderSquare(25)}
                {this.renderSquare(26)}
                {this.renderSquare(27)}
                {this.renderSquare(28)}
                {this.renderSquare(29)}
                {this.renderSquare(30)}
              </div>
              <div className="board-row">
                {this.renderSquare(31)}
                {this.renderSquare(32)}
                {this.renderSquare(33)}
                {this.renderSquare(34)}
                {this.renderSquare(35)}
                {this.renderSquare(36)}
                {this.renderSquare(37)}
                {this.renderSquare(38)}
                {this.renderSquare(39)}
                {this.renderSquare(40)}
              </div>
              <div className="board-row">
              </div>
              <div className="board-row">
                {this.renderSquare(41)}
                {this.renderSquare(42)}
                {this.renderSquare(43)}
                {this.renderSquare(44)}
                {this.renderSquare(45)}
                {this.renderSquare(46)}
                {this.renderSquare(47)}
                {this.renderSquare(48)}
                {this.renderSquare(49)}
                {this.renderSquare(50)}
              </div>
              <div className="board-row">
                {this.renderSquare(51)}
                {this.renderSquare(52)}
                {this.renderSquare(53)}
                {this.renderSquare(54)}
                {this.renderSquare(55)}
                {this.renderSquare(56)}
                {this.renderSquare(57)}
                {this.renderSquare(58)}
                {this.renderSquare(59)}
                {this.renderSquare(60)}
              </div>
              <div className="board-row">
                {this.renderSquare(61)}
                {this.renderSquare(62)}
                {this.renderSquare(63)}
                {this.renderSquare(64)}
                {this.renderSquare(65)}
                {this.renderSquare(66)}
                {this.renderSquare(67)}
                {this.renderSquare(68)}
                {this.renderSquare(69)}
                {this.renderSquare(70)}
              </div>
              <div className="board-row">
                {this.renderSquare(71)}
                {this.renderSquare(72)}
                {this.renderSquare(73)}
                {this.renderSquare(74)}
                {this.renderSquare(75)}
                {this.renderSquare(76)}
                {this.renderSquare(77)}
                {this.renderSquare(78)}
                {this.renderSquare(79)}
                {this.renderSquare(80)}
              </div>
              <div className="board-row">
                {this.renderSquare(81)}
                {this.renderSquare(82)}
                {this.renderSquare(83)}
                {this.renderSquare(84)}
                {this.renderSquare(85)}
                {this.renderSquare(86)}
                {this.renderSquare(87)}
                {this.renderSquare(88)}
                {this.renderSquare(89)}
                {this.renderSquare(90)}
              </div>
              <div className="board-row">
                {this.renderSquare(91)}
                {this.renderSquare(92)}
                {this.renderSquare(93)}
                {this.renderSquare(94)}
                {this.renderSquare(95)}
                {this.renderSquare(96)}
                {this.renderSquare(97)}
                {this.renderSquare(98)}
                {this.renderSquare(99)}
                {this.renderSquare(100)}
              </div>


            </div>




    );
  }
}


export default App
