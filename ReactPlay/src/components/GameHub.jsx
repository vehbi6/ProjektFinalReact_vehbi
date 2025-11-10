// src/components/GameHub.jsx
import { useState } from 'react'
import GameMenu from './Gamemenu'
import TicTacToe from '../games/TicTacToe/TicTacToe'
import MemoryGame from '../games/MemoryGame/MemoryGame' 

function GameHub() {
  const [currentGame, setCurrentGame] = useState(null)

  const renderGame = () => {
    switch (currentGame) {
      case 'tic-tac-toe':
        return <TicTacToe onBack={() => setCurrentGame(null)} />
      case 'memory':
        return <MemoryGame onBack={() => setCurrentGame(null)} />
      default:
        return <GameMenu onSelectGame={setCurrentGame} />
    }
  }

  return (
    <div className="game-hub">
      <header className="app-header">
        <h1>⚡ ReactPlay</h1>
        <p>Choose your game!</p>
      </header>
      {renderGame()}
    </div>
  )
}

export default GameHub