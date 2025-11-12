// src/games/Hangman/Hangman.jsx
import { useState, useEffect } from 'react'
import './Hangman.css'

function Hangman({ onBack }) {
  const [word, setWord] = useState('')
  const [guessedLetters, setGuessedLetters] = useState([])
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameStatus, setGameStatus] = useState('playing') // playing, won, lost
  const [score, setScore] = useState(0)

  // Word bank - you can expand this!
  const wordBank = [
    'REACT', 'JAVASCRIPT', 'PROGRAMMING', 'COMPUTER', 'DEVELOPER',
    'HANGMAN', 'GAME', 'CODE', 'ALGORITHM', 'FUNCTION',
    'VARIABLE', 'COMPONENT', 'STATE', 'PROPS', 'HOOKS'
  ]

  // Initialize game
  useEffect(() => {
    startNewGame()
  }, [])

  const startNewGame = () => {
    const randomWord = wordBank[Math.floor(Math.random() * wordBank.length)]
    setWord(randomWord)
    setGuessedLetters([])
    setWrongGuesses(0)
    setGameStatus('playing')
  }

  const handleLetterGuess = (letter) => {
    if (gameStatus !== 'playing' || guessedLetters.includes(letter)) return

    const newGuessedLetters = [...guessedLetters, letter]
    setGuessedLetters(newGuessedLetters)

    if (!word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1
      setWrongGuesses(newWrongGuesses)
      
      if (newWrongGuesses >= 6) {
        setGameStatus('lost')
      }
    } else {
      // Check if player won
      const wordLetters = Array.from(new Set(word.split('')))
      const hasWon = wordLetters.every(ltr => newGuessedLetters.includes(ltr))
      if (hasWon) {
        setGameStatus('won')
        setScore(prev => prev + 1)
      }
    }
  }

  const displayWord = () => {
    return word.split('').map(letter => 
      guessedLetters.includes(letter) ? letter : '_'
    ).join(' ')
  }

  const getHangmanDrawing = () => {
    const parts = [
      wrongGuesses >= 1, // head
      wrongGuesses >= 2, // body
      wrongGuesses >= 3, // left arm
      wrongGuesses >= 4, // right arm
      wrongGuesses >= 5, // left leg
      wrongGuesses >= 6  // right leg
    ]

    return (
      <div className="hangman-drawing">
        <div className="gallows">
          <div className="top-bar"></div>
          <div className="vertical-bar"></div>
          <div className="base"></div>
        </div>
        
        <div className="man">
          {parts[0] && <div className="head"></div>}
          {parts[1] && <div className="body"></div>}
          {parts[2] && <div className="left-arm"></div>}
          {parts[3] && <div className="right-arm"></div>}
          {parts[4] && <div className="left-leg"></div>}
          {parts[5] && <div className="right-leg"></div>}
        </div>
      </div>
    )
  }

  const getKeyboardLetters = () => {
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  }

  const getHint = () => {
    const unguessedLetters = Array.from(new Set(word.split(''))).filter(
      letter => !guessedLetters.includes(letter)
    )
    return unguessedLetters[0] // Return first unguessed letter as hint
  }

  const useHint = () => {
    if (gameStatus !== 'playing') return
    
    const hintLetter = getHint()
    if (hintLetter) {
      handleLetterGuess(hintLetter)
      setScore(prev => Math.max(0, prev - 0.5)) // Penalty for using hint
    }
  }

  return (
    <div className="hangman">
      <div className="game-header">
        <button onClick={onBack} className="back-button">← Back to Menu</button>
        <h2>Hangman</h2>
        <div className="score">Score: {score}</div>
      </div>

      <div className="game-info">
        <div className="status">
          {gameStatus === 'playing' && (
            <span>Wrong guesses: {wrongGuesses}/6</span>
          )}
          {gameStatus === 'won' && (
            <span className="won-message">🎉 You won! The word was "{word}"</span>
          )}
          {gameStatus === 'lost' && (
            <span className="lost-message">💀 Game over! The word was "{word}"</span>
          )}
        </div>
      </div>

      <div className="game-area">
        <div className="hangman-container">
          {getHangmanDrawing()}
        </div>

        <div className="word-display">
          <div className="word">{displayWord()}</div>
          <div className="word-length">({word.length} letters)</div>
        </div>
      </div>

      <div className="keyboard">
        {getKeyboardLetters().map(letter => (
          <button
            key={letter}
            className={`key ${
              guessedLetters.includes(letter) 
                ? word.includes(letter) ? 'correct' : 'wrong'
                : ''
            }`}
            onClick={() => handleLetterGuess(letter)}
            disabled={guessedLetters.includes(letter) || gameStatus !== 'playing'}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="action-buttons">
        <button 
          onClick={useHint} 
          className="hint-button"
          disabled={gameStatus !== 'playing'}
        >
          💡 Get Hint (-0.5 points)
        </button>
        
        <button onClick={startNewGame} className="reset-button">
          {gameStatus === 'playing' ? 'Restart Game' : 'Play Again'}
        </button>
      </div>

      {gameStatus !== 'playing' && (
        <div className="game-over-message">
          <button onClick={startNewGame} className="play-again-button">
            Play Another Word
          </button>
        </div>
      )}
    </div>
  )
}

export default Hangman