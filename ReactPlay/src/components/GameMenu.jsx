// src/components/GameMenu.jsx
function GameMenu({ onSelectGame }) {
  const games = [
    { id: 'tic-tac-toe', name: 'Tic-Tac-Toe', emoji: '⭕' },
    { id: 'memory', name: 'Memory Game', emoji: '🎴', disabled: false },
    { id: 'rps', name: 'Rock Paper Scissors', emoji: '✂️', disabled: true },
    { id: 'hangman', name: 'Hangman', emoji: '💀', disabled: true },
  ]

  const handleGameClick = (gameId, isDisabled) => {
    console.log('Game clicked:', gameId, 'Disabled:', isDisabled) // Debug log
    if (!isDisabled) {
      onSelectGame(gameId)
    }
  }

  return (
    <div className="game-menu">
      <div className="games-grid">
        {games.map(game => (
          <div
            key={game.id}
            className={`game-card ${game.disabled ? 'disabled' : ''}`}
            onClick={() => handleGameClick(game.id, game.disabled)}
          >
            <span className="game-emoji">{game.emoji}</span>
            <h3>{game.name}</h3>
            <p>{game.disabled ? 'Coming Soon' : 'Click to Play'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GameMenu