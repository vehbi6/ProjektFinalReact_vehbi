// src/games/SnakeGame/SnakeGame.jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import './SnakeGame.css'

function SnakeGame({ onBack }) {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }])
  const [food, setFood] = useState({ x: 5, y: 5 })
  const [powerUp, setPowerUp] = useState(null)
  const [direction, setDirection] = useState('RIGHT')
  const [nextDirection, setNextDirection] = useState('RIGHT')
  const [gameStatus, setGameStatus] = useState('idle')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [speed, setSpeed] = useState(160) // Comfortable base speed
  const [gameMode, setGameMode] = useState('walls')
  const [combo, setCombo] = useState(0)
  const [activePowerUp, setActivePowerUp] = useState(null)
  const [powerUpTimer, setPowerUpTimer] = useState(0)
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    foodEaten: 0,
    powerUpsCollected: 0
  })
  const [walls, setWalls] = useState([])

  // Use ref for direction to avoid stale closures in game loop
  const directionRef = useRef('RIGHT')
  const nextDirectionRef = useRef('RIGHT')

  // Game constants
  const GRID_SIZE = 20
  const CELL_SIZE = 20

  // Power-up types
  const POWER_UPS = {
    SPEED_BOOST: { type: 'SPEED_BOOST', emoji: '⚡', color: '#f59e0b', duration: 5000 },
    SLOW_DOWN: { type: 'SLOW_DOWN', emoji: '🐌', color: '#8b5cf6', duration: 5000 },
    DOUBLE_POINTS: { type: 'DOUBLE_POINTS', emoji: '2️⃣', color: '#10b981', duration: 7000 },
    INVINCIBILITY: { type: 'INVINCIBILITY', emoji: '🛡️', color: '#3b82f6', duration: 4000 }
  }

  // Initialize game
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore')
    const savedStats = localStorage.getItem('snakeStats')
    if (savedHighScore) setHighScore(parseInt(savedHighScore))
    if (savedStats) setStats(JSON.parse(savedStats))
    generateFood()
    generateWalls()
  }, [])

  // Keep refs in sync with state
  useEffect(() => {
    directionRef.current = direction
    nextDirectionRef.current = nextDirection
  }, [direction, nextDirection])

  // Generate walls for wall mode (only border walls, no middle walls)
  const generateWalls = () => {
    const wallPositions = []
    
    // Only border walls - no middle walls
    for (let i = 0; i < GRID_SIZE; i++) {
      wallPositions.push({ x: i, y: 0 }) // Top wall
      wallPositions.push({ x: i, y: GRID_SIZE - 1 }) // Bottom wall
      wallPositions.push({ x: 0, y: i }) // Left wall
      wallPositions.push({ x: GRID_SIZE - 1, y: i }) // Right wall
    }
    
    setWalls(wallPositions)
  }

  // Power-up timer
  useEffect(() => {
    let timer
    if (activePowerUp && powerUpTimer > 0 && gameStatus === 'playing') {
      timer = setInterval(() => {
        setPowerUpTimer(prev => {
          if (prev <= 1000) {
            clearActivePowerUp()
            return 0
          }
          return prev - 1000
        })
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [activePowerUp, powerUpTimer, gameStatus])

  const clearActivePowerUp = () => {
    setActivePowerUp(null)
    setPowerUpTimer(0)
    // Reset speed to normal if it was modified
    const baseSpeed = getBaseSpeed()
    if (speed !== baseSpeed) {
      setSpeed(baseSpeed)
    }
  }

  const getBaseSpeed = () => {
    switch (gameMode) {
      case 'speedrun': return 140  // Slower base for speedrun
      case 'classic': return 160   // Comfortable base
      case 'walls': return 160     // Comfortable base
      default: return 160
    }
  }

  const generateFood = () => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    }
    
    const isOnSnake = snake.some(segment => 
      segment.x === newFood.x && segment.y === newFood.y
    )
    
    const isOnWall = walls.some(wall => 
      wall.x === newFood.x && wall.y === newFood.y
    )
    
    if (isOnSnake || isOnWall) {
      generateFood()
    } else {
      setFood(newFood)
    }
  }

  const generatePowerUp = () => {
    if (Math.random() < 0.25 && !powerUp && !activePowerUp) {
      const powerUpTypes = Object.values(POWER_UPS)
      const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
      
      const newPowerUp = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        ...randomPowerUp
      }
      
      // Make sure power-up doesn't spawn on snake, food, or walls
      const isOnSnake = snake.some(segment => 
        segment.x === newPowerUp.x && segment.y === newPowerUp.y
      )
      const isOnFood = newPowerUp.x === food.x && newPowerUp.y === food.y
      const isOnWall = walls.some(wall => 
        wall.x === newPowerUp.x && wall.y === newPowerUp.y
      )
      
      if (!isOnSnake && !isOnFood && !isOnWall) {
        setPowerUp(newPowerUp)
        
        // Remove power-up after 8 seconds if not collected
        setTimeout(() => {
          setPowerUp(prev => prev?.x === newPowerUp.x && prev?.y === newPowerUp.y ? null : prev)
        }, 8000)
      }
    }
  }

  const activatePowerUp = (powerUpType) => {
    setActivePowerUp(powerUpType)
    setPowerUpTimer(powerUpType.duration)
    setPowerUp(null)
    
    setStats(prev => ({
      ...prev,
      powerUpsCollected: prev.powerUpsCollected + 1
    }))

    switch (powerUpType.type) {
      case 'SPEED_BOOST':
        setSpeed(prev => Math.max(100, prev - 20)) // Less speed boost
        break
      case 'SLOW_DOWN':
        setSpeed(prev => Math.min(220, prev + 40)) // Less slow down
        break
      case 'DOUBLE_POINTS':
        // Handled in scoring logic
        break
      case 'INVINCIBILITY':
        // Handled in collision logic
        break
      default:
        break
    }
  }

  const checkWallCollision = (head) => {
    if (gameMode === 'classic') {
      // In classic mode, wrap around edges
      head.x = (head.x + GRID_SIZE) % GRID_SIZE
      head.y = (head.y + GRID_SIZE) % GRID_SIZE
      return false
    } else {
      // In walls mode, check if head hits wall or goes out of bounds
      const hitWall = walls.some(wall => wall.x === head.x && wall.y === head.y)
      const outOfBounds = head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE
      return hitWall || outOfBounds
    }
  }

  const moveSnake = useCallback(() => {
    if (gameStatus !== 'playing') return

    // Use the current direction from ref for immediate response
    const currentDirection = nextDirectionRef.current
    setDirection(currentDirection)

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] }
      
      // Move head based on current direction
      switch (currentDirection) {
        case 'UP':
          head.y -= 1
          break
        case 'DOWN':
          head.y += 1
          break
        case 'LEFT':
          head.x -= 1
          break
        case 'RIGHT':
          head.x += 1
          break
        default:
          break
      }

      // Check wall collision
      const wallCollision = checkWallCollision(head)
      if (wallCollision && activePowerUp?.type !== 'INVINCIBILITY') {
        endGame()
        return prevSnake
      }

      // Self collision (unless invincible)
      const selfCollision = prevSnake.some((segment, index) => 
        index > 0 && segment.x === head.x && segment.y === head.y
      )

      if (selfCollision && activePowerUp?.type !== 'INVINCIBILITY') {
        endGame()
        return prevSnake
      }

      const newSnake = [head, ...prevSnake]
      let foodEaten = false
      let powerUpCollected = false

      // Check if food eaten
      if (head.x === food.x && head.y === food.y) {
        const basePoints = 10
        const comboMultiplier = Math.min(2.0, 1 + combo * 0.08) // Reduced combo bonus
        const powerUpMultiplier = activePowerUp?.type === 'DOUBLE_POINTS' ? 2 : 1
        const points = Math.floor(basePoints * comboMultiplier * powerUpMultiplier)
        
        setScore(prev => {
          const newScore = prev + points
          // MUCH more gradual speed increase - barely noticeable
          if (gameMode === 'speedrun') {
            if (newScore % 100 === 0 && speed > 110) { // Only every 100 points, minimal decrease
              setSpeed(prevSpeed => Math.max(110, prevSpeed - 3))
            }
          } else {
            if (newScore % 150 === 0 && speed > 130) { // Very slow progression
              setSpeed(prevSpeed => Math.max(130, prevSpeed - 3))
            }
          }
          return newScore
        })
        
        setCombo(prev => prev + 1)
        foodEaten = true
        generateFood()
        generatePowerUp()
        
        setStats(prev => ({
          ...prev,
          foodEaten: prev.foodEaten + 1
        }))
      } else {
        newSnake.pop()
        setCombo(0)
      }

      // Check if power-up collected
      if (powerUp && head.x === powerUp.x && head.y === powerUp.y) {
        activatePowerUp(powerUp)
        powerUpCollected = true
      }

      // Generate new power-up occasionally
      if (!powerUp && !powerUpCollected && Math.random() < 0.015) {
        generatePowerUp()
      }

      return newSnake
    })
  }, [gameStatus, activePowerUp, gameMode, speed, combo, walls])

  const endGame = () => {
    setGameStatus('gameover')
    if (score > highScore) {
      const newHighScore = score
      setHighScore(newHighScore)
      localStorage.setItem('snakeHighScore', newHighScore.toString())
    }
    
    setStats(prev => {
      const newStats = {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        totalScore: prev.totalScore + score
      }
      localStorage.setItem('snakeStats', JSON.stringify(newStats))
      return newStats
    })
  }

  // Game loop with requestAnimationFrame for smoother animation
  useEffect(() => {
    let lastUpdateTime = 0
    
    const gameLoop = (timestamp) => {
      if (gameStatus === 'playing') {
        if (!lastUpdateTime) lastUpdateTime = timestamp
        const deltaTime = timestamp - lastUpdateTime
        
        if (deltaTime >= speed) {
          moveSnake()
          lastUpdateTime = timestamp
        }
        
        requestAnimationFrame(gameLoop)
      }
    }

    if (gameStatus === 'playing') {
      requestAnimationFrame(gameLoop)
    }
  }, [gameStatus, moveSnake, speed])

  // Keyboard controls with immediate response
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameStatus === 'gameover') return

      // Prevent arrow key scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
      }

      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') {
            setNextDirection('UP')
            nextDirectionRef.current = 'UP'
          }
          break
        case 'ArrowDown':
          if (directionRef.current !== 'UP') {
            setNextDirection('DOWN')
            nextDirectionRef.current = 'DOWN'
          }
          break
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') {
            setNextDirection('LEFT')
            nextDirectionRef.current = 'LEFT'
          }
          break
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') {
            setNextDirection('RIGHT')
            nextDirectionRef.current = 'RIGHT'
          }
          break
        case ' ':
          if (gameStatus === 'idle') {
            startGame()
          } else if (gameStatus === 'playing') {
            setGameStatus('paused')
          } else if (gameStatus === 'paused') {
            setGameStatus('playing')
          }
          break
        case 'r':
        case 'R':
          if (gameStatus === 'playing' || gameStatus === 'paused') {
            resetGame()
          }
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameStatus])

  const startGame = () => {
    const baseSpeed = getBaseSpeed()
    setSnake([{ x: 10, y: 10 }])
    setDirection('RIGHT')
    setNextDirection('RIGHT')
    directionRef.current = 'RIGHT'
    nextDirectionRef.current = 'RIGHT'
    setScore(0)
    setCombo(0)
    setSpeed(baseSpeed)
    setGameStatus('playing')
    setPowerUp(null)
    setActivePowerUp(null)
    setPowerUpTimer(0)
    generateFood()
    if (gameMode === 'walls') {
      generateWalls()
    }
  }

  const resetGame = () => {
    setGameStatus('idle')
    setSnake([{ x: 10, y: 10 }])
    setDirection('RIGHT')
    setNextDirection('RIGHT')
    directionRef.current = 'RIGHT'
    nextDirectionRef.current = 'RIGHT'
    setScore(0)
    setCombo(0)
    const baseSpeed = getBaseSpeed()
    setSpeed(baseSpeed)
    setPowerUp(null)
    setActivePowerUp(null)
    setPowerUpTimer(0)
    generateFood()
    if (gameMode === 'walls') {
      generateWalls()
    }
  }

  const togglePause = () => {
    if (gameStatus === 'playing') {
      setGameStatus('paused')
    } else if (gameStatus === 'paused') {
      setGameStatus('playing')
    }
  }

  const changeGameMode = (mode) => {
    setGameMode(mode)
    if (gameStatus === 'playing') {
      resetGame()
      startGame()
    } else {
      resetGame()
    }
  }

  // Mobile touch controls
  const handleSwipe = (newDirection) => {
    if (gameStatus !== 'playing') return
    
    const oppositeDirections = {
      'UP': 'DOWN',
      'DOWN': 'UP',
      'LEFT': 'RIGHT',
      'RIGHT': 'LEFT'
    }
    
    if (directionRef.current !== oppositeDirections[newDirection]) {
      setNextDirection(newDirection)
      nextDirectionRef.current = newDirection
    }
  }

  const getAverageScore = () => {
    return stats.gamesPlayed > 0 ? Math.round(stats.totalScore / stats.gamesPlayed) : 0
  }

  return (
    <div className="snake-game">
      <div className="game-header">
        <button onClick={onBack} className="back-button">← Back to Menu</button>
        <h2>Snake Game</h2>
        <div className="score-display">
          <span>Score: {score}</span>
          <span>High Score: {highScore}</span>
        </div>
      </div>

      <div className="game-controls">
        <div className="game-mode-selector">
          <label>Game Mode:</label>
          <select 
            value={gameMode} 
            onChange={(e) => changeGameMode(e.target.value)}
            disabled={gameStatus === 'playing'}
          >
            <option value="walls">Walls (Game Over on hit)</option>
            <option value="classic">Classic (Wrap around edges)</option>
            <option value="speedrun">Speedrun (Faster pace)</option>
          </select>
        </div>
      </div>

      <div className="game-info">
        <div className="status">
          {gameStatus === 'idle' && (
            <span>Press SPACE or click Start to play!</span>
          )}
          {gameStatus === 'paused' && (
            <span className="paused">⏸️ Game Paused</span>
          )}
          {gameStatus === 'gameover' && (
            <span className="gameover">💀 Game Over! Final Score: {score}</span>
          )}
          {gameStatus === 'playing' && (
            <div className="playing-stats">
              <span>Speed: {Math.round(1000 / speed)} moves/sec</span>
              {combo > 1 && <span className="combo">Combo: x{combo}</span>}
              {activePowerUp && (
                <span className="active-power-up" style={{ color: activePowerUp.color }}>
                  {activePowerUp.emoji} {Math.ceil(powerUpTimer / 1000)}s
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="game-area">
        <div 
          className="game-board"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`
          }}
        >
          {/* Render grid cells */}
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE
            const y = Math.floor(index / GRID_SIZE)
            const isSnake = snake.some(segment => segment.x === x && segment.y === y)
            const isHead = snake[0] && snake[0].x === x && snake[0].y === y
            const isFood = food.x === x && food.y === y
            const isPowerUp = powerUp && powerUp.x === x && powerUp.y === y
            const isWall = walls.some(wall => wall.x === x && wall.y === y) && 
                          (x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1)

            return (
              <div
                key={index}
                className={`cell ${
                  isHead ? 'snake-head' : 
                  isSnake ? 'snake-body' : 
                  isFood ? 'food' : 
                  isPowerUp ? 'power-up' : 
                  isWall ? 'wall' : ''
                }`}
                style={
                  isPowerUp ? { 
                    backgroundColor: powerUp.color,
                    boxShadow: `0 0 10px ${powerUp.color}`
                  } : {}
                }
              >
                {isPowerUp && <span className="power-up-emoji">{powerUp.emoji}</span>}
                {isWall && <div className="wall-texture"></div>}
              </div>
            )
          })}
        </div>

        {/* Mobile controls */}
        <div className="mobile-controls">
          <div className="control-row">
            <button 
              className="control-btn up"
              onClick={() => handleSwipe('UP')}
            >
              ↑
            </button>
          </div>
          <div className="control-row">
            <button 
              className="control-btn left"
              onClick={() => handleSwipe('LEFT')}
            >
              ←
            </button>
            <button 
              className="control-btn right"
              onClick={() => handleSwipe('RIGHT')}
            >
              →
            </button>
          </div>
          <div className="control-row">
            <button 
              className="control-btn down"
              onClick={() => handleSwipe('DOWN')}
            >
              ↓
            </button>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        {gameStatus === 'idle' || gameStatus === 'gameover' ? (
          <button onClick={startGame} className="start-button">
            {gameStatus === 'gameover' ? 'Play Again' : 'Start Game'}
          </button>
        ) : (
          <button onClick={togglePause} className="pause-button">
            {gameStatus === 'paused' ? 'Resume' : 'Pause'}
          </button>
        )}
        
        <button onClick={resetGame} className="reset-button">
          Reset
        </button>
      </div>

      <div className="game-stats">
        <h3>Game Statistics</h3>
        <div className="stats-grid">
          <div className="stat">
            <span className="stat-value">{stats.gamesPlayed}</span>
            <span className="stat-label">Games Played</span>
          </div>
          <div className="stat">
            <span className="stat-value">{getAverageScore()}</span>
            <span className="stat-label">Average Score</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.foodEaten}</span>
            <span className="stat-label">Food Eaten</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.powerUpsCollected}</span>
            <span className="stat-label">Power-ups</span>
          </div>
        </div>
      </div>

      <div className="instructions">
        <h3>How to Play:</h3>
        <p>• Use Arrow Keys to control the snake</p>
        <p>• Spacebar to start/pause • R to reset</p>
        <p>• Eat food (🍎) to grow and score points</p>
        <p>• Avoid walls and yourself!</p>
        <p>• Collect power-ups for special abilities</p>
        <div className="power-up-info">
          <div>⚡ Speed Boost</div>
          <div>🐌 Slow Down</div>
          <div>2️⃣ Double Points</div>
          <div>🛡️ Invincibility</div>
        </div>
        <p className="mode-info">
          <strong>Walls Mode:</strong> Game ends if you hit border walls<br/>
          <strong>Classic Mode:</strong> Wrap around edges (no walls)<br/>
          <strong>Speedrun:</strong> Faster pace, very gradual speed increase
        </p>
      </div>
    </div>
  )
}

export default SnakeGame