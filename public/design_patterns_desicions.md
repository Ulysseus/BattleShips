Battle ships is a game between two players.
Each has a 10x10 grid on which they place 'ships' in either a horizontal or vertical placement.
One battle ship which takes four squares, one cruiser which takes 3 squares one submarine which takes 2 squares
One Mine sweeper which takes 1 square.
The players take alternate turns picking a square, the opposing player then responds with the value of the board at that position.
When one player has uncovered all the opponents ships. That player is deemed the winner of the game.
A tie is not possible because the moves alternate sequentially.
Once a winner is declared both boards are revealed. This is to prevent any cheating.

Clearly playing a game like Battleships remotely is not possible, as its not possible to verify that the opponent is not cheating.
In the case of using a blockchain, the board positions cannot be sent to the smart contract. As the opposing player could query the data and see the opponents board.
So a conceal reveal scheme is needed.
A straight forward scheme is to hash the board, submit the hash to the smart contract when a winner is declared, the player is then asked to reveal his board, the smart contract then hashes the result and confirms its the same as the initial hash.
The problem with this is, you only find out that the other player is cheating once a winner is announced.
And of course once the other player is announced the winner human nature being what it is they will refuse to reveal their board. Causing an irritating delay and it cannot be confirmed with certainty that the other player won.
So the solution I came up with was this.
Create a MerkleTree of each players board, when the game is started Player 1 submits the root of his Merkle Tree, when player two joins the game he submits the root of his Merkle Tree.
Now Player 2 submits a move to the smart contract, the contract passes this move over too Player 1
Player 1 takes Player 2's move and responds with the value at that position on his board together with the Merkle path to that position, player 1 also sends his move for Player 2.
The smart contract Verifies that the Mekle Path given corresponds with the Merkle Root submitted by player 1, if it does not it reverts the code and assigns Player 2 as the winner by default.
This process is repeated for Player 2.
This continues until a winner is decided, or a delay of longer than 30 blocks is recorded.
The delay is an emergency stop, basically the smart contract will stop running if the game takes too long and assign the winner as the last player, i.e. the one not taking so long.

I have implemented the Merkle Proof code in the smart contract, a function verifyProof is implemented via a library.
Unfortunately I had great trouble getting a hash of two hashes calculated via web3.sha3 in Javascript to agree with the result given in solidity with keccak256, so I have hard wired the code to always return true for verification

I have absolutely no Javascript experience, so this project has take an enormous amount of my time. getting to the bottom of the hashing issue, was just taking too long.

But here is the issue, consider the following test contract;

pragma solidity ^0.4.24;
contract Test {
//define two public variable so we can see the values in them
bytes32 public temphash;
bytes32 public temphash1;
bytes public check;
bytes32 public result;
function show(string valueLeft,string valueRight) public returns(bytes32){
//calculate the keccak256 hashes of the values passed to the function
temphash = keccak256(abi.encodePacked(valueLeft));
temphash1 = keccak256(abi.encodePacked(valueRight));
// Lets see what abi.encodePacked(temphash,temphash1) gives
check = abi.encodePacked(temphash,temphash1);
// now calculate the keccak256 hash of the hashes
result = keccak256(abi.encodePacked(temphash,temphash1));
return(result);
}
}

If you put that in remix and deploy it

Set valueLeft:4 and valueRight:0

You get that temp hash is 0x13600b294191fc92924bb3ce4b969c1e7e2bab8f4c93c3fc6d0a51733df3c060
temphash1 is 0x044852b2a670ade5407e78fb2863c51de9fcb96542a07186fe3aeda6bb8a116d
The value of check is
0x13600b294191fc92924bb3ce4b969c1e7e2bab8f4c93c3fc6d0a51733df3c060044852b2a670ade5407e78fb2863c51de9fcb96542a07186fe3aeda6bb8a116d
which is the concatenation of the two hashes in temp hash and temphash1
The result of hashing this is 0x709e733e8b98ca16d2282e6dde9d05b0e76aa3d9bbee3a419b7dd38ad6d1deaf
and is stored in the variable result
But if I put the concatenation of temp hash and temphash1 into this website http://emn178.github.io/online-tools/keccak_256.html
I have checked the website it is using the same Keccack as solidity.
I get 238ed0f6e1535ae2f95584f86ab89c3037a2caf9ad92ce698b713de378e3e408
Which is clearly not the same as (0x)709e733e.... the value in result
I get its something to do with the encoding but its very difficult to debug the code if I cant follow it through and see that its calculating each step correctly.


Because its a a hash function its really difficult to see where the problem is coming from.

Another thing not implemented in the code, because it would be a front end change, is that each position on the board needs to be blinded by a random number, I use 0 for no ship and 4 for a battleship 3 for a cruiser etc.
The idea would be to append 0-4 to a large random number. Then the first byte of that number would be the value of the board at that position. This procedure is needed, because the opponent can see the opposing players Merkle root, since he knows its only 10 positions out of 100 that are non zero, he can just run through all the possibilities until he uncovers the opponents board.

It should be easy to implement this though.
Given the time constraints I did not implement more than one game, the idea would be to alter the smart contract to accept more than one game and keep track of which games where between which players, A reasonably simple task using a mapping between addresses and uint.

I had to use a function stringToUint that I got off ethPM. This is contained within the library contract.
The need for this is as a result of the Merkle proofs, the Hashes require a string so the Frontend passes a string for the value of the board at a certain position. The smart contract needs to calculate a winner by totalling the all of these values, so it requires a function to convert the string to a integer.

Since the smart contract is not payable I was not to concerned with the issues surrounding maintaining ether balancing.
The smart contract contains a fallback function to take care of any accidental payments of ether.
