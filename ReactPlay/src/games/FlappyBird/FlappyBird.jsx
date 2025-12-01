// src/games/FlappyBird/FlappyBird.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import './FlappyBird.css'

function FlappyBird({ onBack }) {
  const canvasRef = useRef(null)
  const requestRef = useRef(null)
  const [gameState, setGameState] = useState('menu')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [birdY, setBirdY] = useState(300)
  const [birdVelocity, setBirdVelocity] = useState(0)
  const [pipes, setPipes] = useState([])
  const [pipeSpeed, setPipeSpeed] = useState(4)
  const [gravity, setGravity] = useState(0.5)
  const [jumpStrength, setJumpStrength] = useState(-10)
  const [birdColor, setBirdColor] = useState('#FFD700')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [difficulty, setDifficulty] = useState('normal')
  const [particles, setParticles] = useState([])
  const [isMobile, setIsMobile] = useState(false)

  // Smooth animation variables
  const lastTimeRef = useRef(0)
  const frameCountRef = useRef(0)

  // Sound effects
  const audioRef = useRef({
    jump: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-short-bird-chirp-1256.mp3'),
    score: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
    hit: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-explosion-2759.mp3')
  })

  // Bird color options
  const birdColors = [
    '#FFD700', // yellow
    '#FF4444', // red
    '#4444FF', // blue
    '#44FF44'  // green
  ]

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initialize high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('flappyHighScore')
    const savedBirdColor = localStorage.getItem('flappyBirdColor')
    
    if (savedHighScore) setHighScore(parseInt(savedHighScore))
    if (savedBirdColor) setBirdColor(savedBirdColor)
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('flappyHighScore', highScore.toString())
    localStorage.setItem('flappyBirdColor', birdColor)
  }, [highScore, birdColor])

  // Set difficulty
  useEffect(() => {
    switch(difficulty) {
      case 'easy':
        setPipeSpeed(3)
        setGravity(0.4)
        setJumpStrength(-9)
        break
      case 'hard':
        setPipeSpeed(5)
        setGravity(0.6)
        setJumpStrength(-11)
        break
      default:
        setPipeSpeed(4)
        setGravity(0.5)
        setJumpStrength(-10)
    }
  }, [difficulty])

  // Play sound
  const playSound = (sound) => {
    if (soundEnabled && audioRef.current[sound]) {
      audioRef.current[sound].currentTime = 0
      audioRef.current[sound].play().catch(e => console.log('Sound error:', e))
    }
  }

  // Jump function
  const jump = useCallback(() => {
    if (gameState === 'menu') {
      startGame()
    } else if (gameState === 'playing') {
      setBirdVelocity(jumpStrength)
      playSound('jump')
      
      // Add jump particles
      const newParticles = [...particles]
      for (let i = 0; i < 8; i++) {
        newParticles.push({
          x: 120,
          y: birdY + 15,
          vx: (Math.random() - 0.5) * 2,
          vy: Math.random() * -3 - 1,
          life: 20,
          color: '#FF8C00'
        })
      }
      setParticles(newParticles)
    }
  }, [gameState, birdY, jumpStrength, particles])

  // Start game
  const startGame = () => {
    setGameState('playing')
    setScore(0)
    setBirdY(300)
    setBirdVelocity(0)
    setPipes([])
    setParticles([])
    lastTimeRef.current = performance.now()
    frameCountRef.current = 0
  }

  // Reset game
  const resetGame = () => {
    setGameState('menu')
    if (score > highScore) {
      setHighScore(score)
    }
  }

  // Generate pipe
  const generatePipe = () => {
    const gap = difficulty === 'easy' ? 200 : difficulty === 'hard' ? 150 : 180
    const topHeight = Math.floor(Math.random() * 300) + 100
    
    return {
      x: 1000,
      topHeight,
      bottomHeight: 700 - topHeight - gap,
      passed: false,
      color: difficulty === 'easy' ? '#27AE60' : difficulty === 'hard' ? '#2ECC71' : '#2ECC71'
    }
  }

  // Optimized game loop with smooth animation
  const gameLoop = useCallback((timestamp) => {
    if (gameState !== 'playing') return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Calculate delta time for smooth animation
    const deltaTime = timestamp - lastTimeRef.current
    lastTimeRef.current = timestamp
    frameCountRef.current++

    // Clear canvas with dark blue gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 700)
    gradient.addColorStop(0, '#0f172a')
    gradient.addColorStop(1, '#1e293b')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1000, 700)

    // Update bird with delta time
    const deltaFactor = deltaTime / 16.67 // Normalize to 60fps
    let newBirdY = birdY + birdVelocity * deltaFactor
    let newBirdVelocity = birdVelocity + gravity * deltaFactor

    // Boundary check
    if (newBirdY < 20) {
      newBirdY = 20
      newBirdVelocity = 0
    }
    if (newBirdY > 660) {
      newBirdY = 660
      newBirdVelocity = 0
    }

    setBirdY(newBirdY)
    setBirdVelocity(newBirdVelocity)

    // Update pipes with smooth movement
    let newPipes = pipes.map(pipe => ({
      ...pipe,
      x: pipe.x - pipeSpeed * deltaFactor
    })).filter(pipe => pipe.x > -100)

    // Add new pipe at consistent intervals
    if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 600) {
      newPipes.push(generatePipe())
    }

    // Check for score
    newPipes = newPipes.map(pipe => {
      if (!pipe.passed && pipe.x < 110) {
        setScore(prev => prev + 1)
        playSound('score')
        
        // Add score particles
        const newParticles = [...particles]
        for (let i = 0; i < 5; i++) {
          newParticles.push({
            x: 150,
            y: 100,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * -2 - 1,
            life: 30,
            color: '#FFD700'
          })
        }
        setParticles(newParticles)
        
        return { ...pipe, passed: true }
      }
      return pipe
    })

    // Update particles
    let newParticles = particles
      .map(p => ({
        ...p,
        x: p.x + p.vx * deltaFactor,
        y: p.y + p.vy * deltaFactor,
        life: p.life - 1
      }))
      .filter(p => p.life > 0)

    // Check collisions
    const birdCollision = checkCollision(newBirdY, newPipes)
    if (birdCollision) {
      playSound('hit')
      
      // Add explosion particles
      for (let i = 0; i < 25; i++) {
        newParticles.push({
          x: 120,
          y: newBirdY,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          life: 50,
          color: birdColor
        })
      }
      
      setGameState('gameOver')
      setParticles(newParticles)
      return
    }

    // Update state
    setPipes(newPipes)
    setParticles(newParticles)

    // Draw everything
    drawPipes(ctx, newPipes)
    drawBird(ctx, newBirdY)
    drawParticles(ctx, newParticles)
    drawGround(ctx)
    drawScore(ctx)

    // Continue game loop
    requestRef.current = requestAnimationFrame(gameLoop)
  }, [gameState, birdY, birdVelocity, pipes, particles, gravity, pipeSpeed, difficulty, birdColor])

  // Draw bird with smooth animation
  const drawBird = (ctx, y) => {
    // Add wing flap animation
    const wingFlap = Math.sin(frameCountRef.current * 0.2) * 5
    
    // Body
    ctx.fillStyle = birdColor
    ctx.beginPath()
    ctx.ellipse(120, y, 20, 16, 0, 0, Math.PI * 2)
    ctx.fill()

    // Wing with animation
    ctx.fillStyle = birdColor
    ctx.beginPath()
    ctx.ellipse(115, y + 3 + wingFlap, 15, 12, Math.PI / 4, 0, Math.PI * 2)
    ctx.fill()

    // Eye
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(130, y - 8, 4, 0, Math.PI * 2)
    ctx.fill()

    // Eye highlight
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(131, y - 9, 1.5, 0, Math.PI * 2)
    ctx.fill()

    // Beak
    ctx.fillStyle = '#FF8C00'
    ctx.beginPath()
    ctx.moveTo(135, y)
    ctx.lineTo(150, y - 5)
    ctx.lineTo(150, y + 5)
    ctx.closePath()
    ctx.fill()
  }

  // Draw pipes with gradient
  const drawPipes = (ctx, pipes) => {
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillStyle = pipe.color
      ctx.fillRect(pipe.x, 0, 70, pipe.topHeight)
      
      // Top pipe cap
      ctx.fillStyle = '#145A32'
      ctx.fillRect(pipe.x - 5, pipe.topHeight - 25, 80, 25)
      
      // Bottom pipe
      ctx.fillStyle = pipe.color
      ctx.fillRect(pipe.x, 700 - pipe.bottomHeight, 70, pipe.bottomHeight)
      
      // Bottom pipe cap
      ctx.fillStyle = '#145A32'
      ctx.fillRect(pipe.x - 5, 700 - pipe.bottomHeight, 80, 25)
    })
  }

  // Draw particles
  const drawParticles = (ctx, particles) => {
    particles.forEach(particle => {
      const alpha = particle.life / 50
      ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba')
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.life / 15, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  // Draw ground with pattern
  const drawGround = (ctx) => {
    // Ground
    ctx.fillStyle = '#8B4513'
    ctx.fillRect(0, 680, 1000, 20)
    
    // Grass
    ctx.fillStyle = '#2ECC71'
    ctx.fillRect(0, 680, 1000, 5)
  }

  // Draw score with glow effect
  const drawScore = (ctx) => {
    // Score text
    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 64px Arial'
    ctx.textAlign = 'center'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 4
    ctx.strokeText(score.toString(), 500, 120)
    ctx.fillText(score.toString(), 500, 120)
  }

  // Check collision with optimized detection
  const checkCollision = (birdY, pipes) => {
    const birdRadius = 18
    const birdLeft = 120 - birdRadius
    const birdRight = 120 + birdRadius
    const birdTop = birdY - birdRadius
    const birdBottom = birdY + birdRadius

    // Ground collision
    if (birdBottom >= 680) return true

    // Pipe collision with simple AABB
    for (const pipe of pipes) {
      const pipeLeft = pipe.x
      const pipeRight = pipe.x + 70
      
      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        if (birdTop < pipe.topHeight) return true
        if (birdBottom > 700 - pipe.bottomHeight) return true
      }
    }

    return false
  }

  // Handle key presses
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [jump])

  // Handle click/tap
  const handleClick = (e) => {
    e.preventDefault()
    jump()
  }

  // Start game loop with requestAnimationFrame
  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [gameState, gameLoop])

  // Mobile instructions card (shown at top for small phones)
  const MobileInstructionsCard = () => (
    <div className="mobile-instructions-card">
      <div className="mobile-instructions-header">
        <h4>Quick Guide</h4>
      </div>
      <div className="mobile-instructions-content">
        <div className="mobile-instruction-item">
          <span className="mobile-instruction-icon">🎮</span>
          <span className="mobile-instruction-text">Tap or press SPACE to flap</span>
        </div>
        <div className="mobile-instruction-item">
          <span className="mobile-instruction-icon">🎯</span>
          <span className="mobile-instruction-text">Avoid pipes & ground</span>
        </div>
        <div className="mobile-instruction-item">
          <span className="mobile-instruction-icon">⚡</span>
          <span className="mobile-instruction-text">1 point per pipe</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flappy-bird">
      <div className="game-header">
        <button onClick={onBack} className="back-button">← Back</button>
        <h1>Flappy Bird</h1>
        <div className="header-controls">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)} 
            className={`sound-toggle ${soundEnabled ? 'on' : 'off'}`}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      <div className="game-layout">
        <div className="game-main">
          {/* Mobile Instructions Card (only on small screens) */}
          {isMobile && window.innerWidth <= 450 && <MobileInstructionsCard />}

          <div className="game-section">
            <div className="game-canvas-container">
              <canvas 
                ref={canvasRef} 
                width={1000} 
                height={700}
                onClick={handleClick}
                className="game-canvas"
                onTouchStart={handleClick}
              />
              
              {/* Game Over Screen */}
              {gameState === 'gameOver' && (
                <div className="game-over-screen">
                  <div className="game-over-content">
                    <h2>Game Over!</h2>
                    <div className="final-score">Score: {score}</div>
                    <div className="high-score">Best: {Math.max(score, highScore)}</div>
                    <button onClick={resetGame} className="play-again-button">
                      Play Again
                    </button>
                  </div>
                </div>
              )}

              {/* Start Screen */}
              {gameState === 'menu' && (
                <div className="start-screen">
                  <div className="start-content">
                    <h2>Flappy Bird</h2>
                    <div className="high-score-display">
                      <div>Best Score: {highScore}</div>
                    </div>
                    <div className="controls-info">
                      <p>{isMobile ? 'TAP to flap' : 'Press SPACE or CLICK to flap'}</p>
                      <p>Navigate through the pipes</p>
                    </div>
                    <button onClick={startGame} className="start-button">
                      Start Game
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Game Controls */}
            <div className="game-controls">
              <div className="controls-grid">
                <div className="control-group">
                  <label>Difficulty:</label>
                  <select 
                    value={difficulty} 
                    onChange={(e) => setDifficulty(e.target.value)}
                    disabled={gameState === 'playing'}
                  >
                    <option value="easy">Easy</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="control-group">
                  <label>Bird Color:</label>
                  <div className="color-options">
                    {birdColors.map(color => (
                      <button
                        key={color}
                        className={`color-option ${birdColor === color ? 'selected' : ''}`}
                        onClick={() => setBirdColor(color)}
                        style={{ backgroundColor: color }}
                        aria-label={`Select ${color} bird`}
                      />
                    ))}
                  </div>
                </div>

                <div className="control-buttons">
                  <button 
                    onClick={jump} 
                    className="jump-button"
                    disabled={gameState === 'gameOver'}
                  >
                    {isMobile ? 'TAP!' : 'FLAP!'}
                  </button>
                  <button 
                    onClick={resetGame} 
                    className="reset-button"
                    disabled={gameState === 'menu'}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Instructions Sidebar (hidden on mobile) */}
        {!isMobile && (
          <div className="instructions-sidebar">
            <div className="instructions-card">
              <div className="instructions-header">
                <h3>How to Play</h3>
              </div>
              
              <div className="instructions-content">
                <div className="instruction-step">
                  <div className="step-icon">1</div>
                  <div className="step-content">
                    <h4>Flap to Fly</h4>
                    <p>Press <strong>SPACEBAR</strong>, <strong>UP ARROW</strong>, or <strong>CLICK</strong> to make the bird flap and fly upward.</p>
                  </div>
                </div>

                <div className="instruction-step">
                  <div className="step-icon">2</div>
                  <div className="step-content">
                    <h4>Avoid Pipes</h4>
                    <p>Navigate through the green pipes without hitting them. Each pipe you pass gives you 1 point.</p>
                  </div>
                </div>

                <div className="instruction-step">
                  <div className="step-icon">3</div>
                  <div className="step-content">
                    <h4>Don't Hit Ground</h4>
                    <p>Avoid flying too low and hitting the ground. Gravity will pull your bird down naturally.</p>
                  </div>
                </div>

                <div className="instruction-step">
                  <div className="step-icon">4</div>
                  <div className="step-content">
                    <h4>Difficulty Levels</h4>
                    <ul className="difficulty-list">
                      <li><strong>Easy:</strong> Wider gaps, slower speed</li>
                      <li><strong>Normal:</strong> Standard gaps and speed</li>
                      <li><strong>Hard:</strong> Narrower gaps, faster speed</li>
                    </ul>
                  </div>
                </div>

                <div className="instruction-step">
                  <div className="step-icon">5</div>
                  <div className="step-content">
                    <h4>Tips & Tricks</h4>
                    <ul className="tips-list">
                      <li>Tap rhythmically instead of holding</li>
                      <li>Anticipate the next pipe's position</li>
                      <li>Stay centered in the gap</li>
                      <li>Practice makes perfect!</li>
                    </ul>
                  </div>
                </div>

                <div className="game-stats">
                  <h4>Game Statistics</h4>
                  <div className="stats-grid">
                    <div className="stat">
                      <div className="stat-value">{highScore}</div>
                      <div className="stat-label">Best Score</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">{score}</div>
                      <div className="stat-label">Current Score</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FlappyBird