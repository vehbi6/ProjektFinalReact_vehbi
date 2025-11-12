// src/games/RockPaperScissors/RockPaperScissors.jsx
import { useState } from 'react'
import './RockPaperScissors.css'

function RockPaperScissors({ onBack }) {
  const [playerChoice, setPlayerChoice] = useState(null)
  const [computerChoice, setComputerChoice] = useState(null)
  const [result, setResult] = useState('')
  const [score, setScore] = useState({ player: 0, computer: 0, ties: 0 })
  const [gameHistory, setGameHistory] = useState([])

  const choices = [
    { id: 'rock', name: 'Rock', emoji: '🪨', beats: 'scissors' },
    { id: 'paper', name: 'Paper', emoji: '📄', beats: 'rock' },
    { id: 'scissors', name: 'Scissors', emoji: '✂️', beats: 'paper' }
  ]

  const getRandomChoice = () => {
    const randomIndex = Math.floor(Math.random() * choices.length)
    return choices[randomIndex]
  }

  const determineWinner = (player, computer) => {
    if (player.id === computer.id) {
      return 'tie'
    } else if (player.beats === computer.id) {
      return 'player'
    } else {
      return 'computer'
    }
  }

  const handlePlayerChoice = (choice) => {
    const computer = getRandomChoice()
    
    setPlayerChoice(choice)
    setComputerChoice(computer)

    const winner = determineWinner(choice, computer)
    
    let resultMessage = ''
    let newScore = { ...score }

    switch (winner) {
      case 'player':
        resultMessage = `You win! ${choice.emoji} beats ${computer.emoji}`
        newScore.player += 1
        break
      case 'computer':
        resultMessage = `Computer wins! ${computer.emoji} beats ${choice.emoji}`
        newScore.computer += 1
        break
      default:
        resultMessage = `It's a tie! Both chose ${choice.emoji}`
        newScore.ties += 1
    }

    setResult(resultMessage)
    setScore(newScore)

    // Add to game history
    setGameHistory(prev => [{
      player: choice,
      computer: computer,
      result: winner,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev.slice(0, 4)]) // Keep only last 5 games
  }

  const resetGame = () => {
    setPlayerChoice(null)
    setComputerChoice(null)
    setResult('')
    setGameHistory([])
  }

  const resetScore = () => {
    setScore({ player: 0, computer: 0, ties: 0 })
    resetGame()
  }

  return (
    <div className="rock-paper-scissors">
      <div className="game-header">
        <button onClick={onBack} className="back-button">← Back to Menu</button>
        <h2>Rock Paper Scissors</h2>
      </div>

      <div className="game-info">
        <div className="score-board">
          <div className="score player-score">
            <span>You: {score.player}</span>
          </div>
          <div className="score ties">
            <span>Ties: {score.ties}</span>
          </div>
          <div className="score computer-score">
            <span>Computer: {score.computer}</span>
          </div>
        </div>
        {result && (
          <div className={`result ${result.includes('win') ? 'win' : result.includes('lose') ? 'lose' : 'tie'}`}>
            {result}
          </div>
        )}
      </div>

      <div className="choices-section">
        <div className="choices">
          {choices.map(choice => (
            <button
              key={choice.id}
              className={`choice-btn ${playerChoice?.id === choice.id ? 'selected' : ''}`}
              onClick={() => handlePlayerChoice(choice)}
            >
              <span className="choice-emoji">{choice.emoji}</span>
              <span className="choice-name">{choice.name}</span>
            </button>
          ))}
        </div>

        {(playerChoice && computerChoice) && (
          <div className="battle-area">
            <div className="choice-display player-choice">
              <span className="choice-emoji-large">{playerChoice.emoji}</span>
              <span>Your choice</span>
            </div>
            
            <div className="vs">VS</div>
            
            <div className="choice-display computer-choice">
              <span className="choice-emoji-large">{computerChoice.emoji}</span>
              <span>Computer's choice</span>
            </div>
          </div>
        )}
      </div>

      {gameHistory.length > 0 && (
        <div className="game-history">
          <h3>Recent Games</h3>
          <div className="history-list">
            {gameHistory.map((game, index) => (
              <div key={index} className="history-item">
                <span>{game.timestamp}</span>
                <span>{game.player.emoji} vs {game.computer.emoji}</span>
                <span className={`history-result ${game.result}`}>
                  {game.result === 'player' ? 'You won' : 
                   game.result === 'computer' ? 'Computer won' : 'Tie'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button onClick={resetGame} className="reset-button">
          New Round
        </button>
        <button onClick={resetScore} className="reset-score-button">
          Reset Score
        </button>
      </div>
    </div>
  )
}

export default RockPaperScissors