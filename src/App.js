import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import axios from 'axios';
const EMPTY_BOARD = Array(9).fill(null);
async function fetchComputerMove(board){
  const url = "https://hiring-react-assignment.vercel.app/api/bot"
  let result
  try{
    const response = await axios.post(url,board)
    result = {
      boxId: response.data,
      error: null
    }
  }catch(e){
    console.log(e)
    result = {
      boxId: -1,
      error: "computer failed to execute its turn"
    }
  }
  return result
}
const GameOver = (board)=>board.every(state=>state!==null)
const GameStart = (board)=>board.every(state=>state===null)

const checkWinner =( board,setWinCombo )=> {
  const winningSequences = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < winningSequences.length; i++) {
    const [a, b, c] = winningSequences[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      setWinCombo(winningSequences[i]);
      return board[a];
    }
  }
  return null;
};

const App = () => {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [playerSymbol, setPlayerSymbol] = useState('X');
  const [winner, setWinner] = useState(null);
  const [winCombo,setWinCombo]=useState(null);
  const [playerTurn,setPlayerTurn]=useState(true);
  const [gameOver,setGameOver]=useState(false);

  const handleClick = index => {
   
    if (playerTurn && board[index] === null) {
      
      setPlayerTurn(false);
      setBoard(board.map((state,ind)=>ind===index? playerSymbol : state));
      // console.log(board);
      // console.log(index);
    }
  }
  const executeComputerTurn = useCallback(async ()=>{

    const computerResponse = await fetchComputerMove(board)
    if(!computerResponse.error && !board[computerResponse.boxId]){
      setPlayerTurn(true)
      setBoard(board.map((state,ind)=>ind===computerResponse.boxId ? (playerSymbol==="X" ? "O": "X") : state));
    }
  },[board])
  

  useEffect(() => {
    const handleTurn = async () => {
      const winner = checkWinner(board,setWinCombo); // Assuming checkWinner returns the winner or null
      if (winner) {
        setWinner(winner);
        setGameOver(true);
      }
  
      if (GameOver(board)) {
        setGameOver(true);
      }
      console.log(winner);console.log(gameOver);
      if (!winner&&!gameOver && !playerTurn) {
        await executeComputerTurn();
      }
    };
  
    handleTurn();
  }, [board, playerTurn, gameOver]);
  
  const renderBox = index => {
    return (
      <div className={`box ${winCombo&&winCombo.includes(index)?"selected-symbol":null}`} onClick={() => handleClick(index)}>
        {board[index]}
      </div>
    );
  };
  const resetStates=()=>{
    setBoard(EMPTY_BOARD);
    setPlayerTurn(true);
    setWinner(null);
    setWinCombo(null);
    setGameOver(false);
  }
  return (
    <div className="App">

      <em><h1 className='start font'>Tic Tac Toe</h1></em>
      <div className="board">
        {board.map((box, index) => (
          <React.Fragment key={index}>{renderBox(index)}</React.Fragment>
        ))}
      </div>
      {winner && <div> <h2>{winner} wins!</h2></div>}
      {!winner && gameOver && <h2>It's a Draw</h2>}
      {gameOver  && <button className="button" onClick={resetStates}>Play Again</button>}
        {!gameOver&&<div>
          <h2>Select your symbol:</h2>
          <button className={`button ${playerSymbol==='X' ?("selected-symbol"):null }`} onClick={() =>{GameStart(board) && setPlayerSymbol('X')}}>X</button>
          <button className={`button ${playerSymbol==='O' ?("selected-symbol"):null }`} onClick={() =>{GameStart(board)&& setPlayerSymbol('O')}}>O</button>
        </div>
        }
    </div>
  );
};

export default App;