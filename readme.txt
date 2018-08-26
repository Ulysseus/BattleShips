Be aware, I have absolutely no knowledge of Javascript as such there are no checks on the UI for inappropriate
input. Only click on one square once. If you get sequence of accounts in MetaMask wrong the UI will be very confused.
Generally running migrate --reset in Truffle develop and starting again fixes things.

To operate
The Boards are hard coded into the application
Go into the directory /battleShip
Run truffle develop
then run compile
then migrate --reset
Start Chrome or a Web Browser that has MetaMask enabled
Connect MetaMask to http://127.0.0.1/9545. For some reason I always struggled with 8545.
In another Terminal window go to directory battleShip
Type npm run start
This will open the application in the browser at localhost:3000
Open another terminal window
Type npm run start when prompted to run on another port type Y
Now you should have two tabs open on the browser one at port 3000 and one at 3001
Go to the one at port 3000, this will be player 1
There are two buttons Marked Start Game and Join Game
MetaMask will have automatically connected to the first account from truffle develop
Import another account using the provided private key.
This step is essential.
Now make sure MetaMask is set to account 1
Click Start Game, wait till it is mined, the screen will change to Player 2 must join and make a Move
Change to the tab that has application at port 3001
Change to account 2 in MetaMask.
Click Join Game accept the transaction wait for it to be mined.
The state of the game will change to Joined.
The next Player is: will show Player 2
Now click on Player 2 board
A X will show the choice of move. Accept the transaction from MetaMask
The Next Player is: will change from Player 2 to Player 1
It's vitally important that you wait for the transactions to be mined.
When Player 1 is showing change to tab with application at port 3000
Change MetaMask back to account 1 and click on Player 1's board
It will show a X for the choice of move
Accept the transaction, wait till it says The next Player is: Player 2
Change to tab with application at port 3001
Change MetaMask back to account 2
Choose another square on Player 2's board, accept the transaction.
Player 2's board will show a 4 or a 3 or 2 or 1 if a ship was hit or 0 for no hit.
Change back to tab with application at port 3000
Change MetaMask account back to account 1 and then choose another square on player 1's board
As in the case of Player 2 it will show value of previous move.
And so on
The application is very fragile, I have never programmed in javascript before.
If it any stage it gives trouble; run migrate --reset in the terminal and wait for it to reset.

This is just to show how a front end would interact with the smart contract.
With hindsight given my lack of javascript programming experience perhaps a game project was a bad choice.

I am aware of how clunky the interface is. As I said I have come from absolutely no knowledge of Javascript.
The project gave me extreme trouble because I was not getting a value back from the ethereum node created by Truffle but a "promise"
Before this course I did not even know what a promise was, much reading up, on call backs and Javascript and plenty of trial and error eventually got me to the point
where I could see the value in the console window, then much much frustration, to realize that I could pass that value to this.setState({}) in React. Then about two days of frustration
until I realized that setState will not necessarily fire when called, its batched to improve performance.
I needed the value of the previous move of the opposite player so that the present player could respond with the value at that position in his board
along with the merkle proof that this value had not been tampered with, but because setState is batched it was not necessarily updating the value of position
when it was called, my cludge was to get the smart contract to emit the move and get the front end to write the value to the screen, my
reasoning was, that would cause react to update setState. The event.watch in the frontend runs this.setState({position:value received})
It worked, I did a lot of research on async functions as the 'await' keyword seemed like the way to go, but I never got it to work.
I realize now, that is because I was awaiting the response from the smart contract by using .call() (contract.f.call() as opposed to contract.f) then I realized
you can just call the function directly which responds immediately. The issue is 'await' will wait (stop execution) until the response, it will have no effect
on setState. I suppose there must be a way to force setState to run I did find a command something like forceUpdate but it refused to compile.
It occurs to me, that for people who are not famliar with object orientated programming. it might be easier if there was some kind of code. That wrapped it
so that it appeared to just return the value form the smart contract. 
