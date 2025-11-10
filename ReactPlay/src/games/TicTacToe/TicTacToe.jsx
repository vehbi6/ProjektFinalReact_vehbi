// src/games/TicTacToe/TicTacToe.jsx
import { useState } from 'react'
import './TicTacToe.css'

function TicTacToe({ onBack }) {
  const [board, setBoard] = useState(Array(9).fill(null))
  const [isXNext, setIsXNext] = useState(true)

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ]
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }
    return null
  }

  const handleClick = (index) => {
    if (board[index] || calculateWinner(board)) return
    
    const newBoard = [...board]
    newBoard[index] = isXNext ? 'X' : 'O'
    setBoard(newBoard)
    setIsXNext(!isXNext)
  }

  const winner = calculateWinner(board)
  const isDraw = !winner && board.every(square => square !== null)

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setIsXNext(true)
  }

  const getStatus = () => {
    if (winner) return `Winner: ${winner}!`
    if (isDraw) return "It's a Draw!"
    return `Next player: ${isXNext ? 'X' : 'O'}`
  }

  return (
    <div className="tic-tac-toe">
      <div className="game-header">
        <button onClick={onBack} className="back-button">← Back to Menu</button>
        <h2>Tic-Tac-Toe</h2>
      </div>

      <div className="game-info">
        <div className="status">{getStatus()}</div>
      </div>

      <div className="board">
        {board.map((square, index) => (
          <button
            key={index}
            className="square"
            onClick={() => handleClick(index)}
          >
            {square}
          </button>
        ))}
      </div>

      <button onClick={resetGame} className="reset-button">
        New Game
      </button>
    </div>
  )
}

export default TicTacToe