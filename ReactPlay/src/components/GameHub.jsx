// src/components/GameHub.jsx
import { useState } from 'react'
import GameMenu from './GameMenu'
import TicTacToe from '../games/TicTacToe/TicTacToe'
import MemoryGame from '../games/MemoryGame/MemoryGame'
import RockPaperScissors from '../games/RockPaperScissors/RockPaperScissors'
import Hangman from '../games/Hangman/Hangman'
import SnakeGame from '../games/SnakeGame/SnakeGame' // ← Add this import

function GameHub() {
  const [currentGame, setCurrentGame] = useState(null)

  const renderGame = () => {
    switch (currentGame) {
      case 'tic-tac-toe':
        return <TicTacToe onBack={() => setCurrentGame(null)} />
      case 'memory':
        return <MemoryGame onBack={() => setCurrentGame(null)} />
      case 'rps':
        return <RockPaperScissors onBack={() => setCurrentGame(null)} />
      case 'hangman':
        return <Hangman onBack={() => setCurrentGame(null)} />
      case 'snake': // ← Add this case
        return <SnakeGame onBack={() => setCurrentGame(null)} />
      default:
        return <GameMenu onSelectGame={setCurrentGame} />
        }
      }

      return (
        <div className="game-hub" style={{ width: '100%' }}>
      <header className="app-header">
        <h1>⚡ ReactPlay</h1>
        <p>Choose your game!</p>
      </header>
      {renderGame()}
        </div>
      )
    }

    export default GameHub