// src/games/MemoryGame/MemoryGame.jsx
import { useState, useEffect } from 'react'
import './MemoryGame.css'

function MemoryGame({ onBack }) {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [solved, setSolved] = useState([])
  const [moves, setMoves] = useState(0)
  const [disabled, setDisabled] = useState(false)

  // Card symbols - you can use emojis, images, or letters
  const cardSymbols = ['🍎', '🍌', '🍒', '🍇', '🍊', '🍓', '🥝', '🍑']

  // Initialize game
  useEffect(() => {
    resetGame()
  }, [])

  const resetGame = () => {
    // Create pairs of cards and shuffle them
    const initialCards = [...cardSymbols, ...cardSymbols]
      .map((symbol, index) => ({
        id: index,
        symbol,
        flipped: false,
        solved: false
      }))
      .sort(() => Math.random() - 0.5)
    
    setCards(initialCards)
    setFlipped([])
    setSolved([])
    setMoves(0)
  }

  const handleCardClick = (id) => {
    // Prevent clicking if already flipped, solved, or disabled during flip animation
    if (disabled || flipped.includes(id) || solved.includes(id) || flipped.length === 2) {
      return
    }

    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)

    // If two cards are flipped, check for match
    if (newFlipped.length === 2) {
      setMoves(moves + 1)
      setDisabled(true)

      const [firstId, secondId] = newFlipped
      const firstCard = cards.find(card => card.id === firstId)
      const secondCard = cards.find(card => card.id === secondId)

      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        setSolved([...solved, firstId, secondId])
        setFlipped([])
        setDisabled(false)
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setFlipped([])
          setDisabled(false)
        }, 1000)
      }
    }
  }

  const isGameComplete = solved.length === cards.length && cards.length > 0

  return (
    <div className="memory-game">
      <div className="game-header">
        <button onClick={onBack} className="back-button">← Back to Menu</button>
        <h2>Memory Game</h2>
      </div>

      <div className="game-info">
        <div className="stats">
          <span>Moves: {moves}</span>
          <span>Pairs: {solved.length / 2} / {cardSymbols.length}</span>
        </div>
        {isGameComplete && (
          <div className="win-message">
            🎉 You won in {moves} moves!
          </div>
        )}
      </div>

      <div className="cards-grid">
        {cards.map(card => (
          <div
            key={card.id}
            className={`card ${
              flipped.includes(card.id) || solved.includes(card.id) ? 'flipped' : ''
            } ${solved.includes(card.id) ? 'solved' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-inner">
              <div className="card-front">?</div>
              <div className="card-back">{card.symbol}</div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={resetGame} className="reset-button">
        New Game
      </button>
    </div>
  )
}

export default MemoryGame