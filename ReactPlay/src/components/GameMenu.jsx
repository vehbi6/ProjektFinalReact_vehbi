// src/components/GameMenu.jsx
import { useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, EffectCoverflow, Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-coverflow'
import './GameMenu.css'

function GameMenu({ onSelectGame }) {
  const games = [
    { 
      id: 'tic-tac-toe', 
      name: 'Tic-Tac-Toe', 
      emoji: '⭕',
      description: 'Classic 3-in-a-row strategy',
      color: '#0066FF',
      bgColor: 'linear-gradient(135deg, #0066FF20, #0066FF40)',
      comingSoon: false
    },
    { 
      id: 'memory', 
      name: 'Memory Game', 
      emoji: '🎴',
      description: 'Test your memory with card matching',
      color: '#FF6B35',
      bgColor: 'linear-gradient(135deg, #FF6B3520, #FF6B3540)',
      comingSoon: false
    },
    { 
      id: 'rps', 
      name: 'FlappyBird', 
      emoji: '🐤',
      description: 'Fly the bird through obstacles',
      color: '#10b981',
      bgColor: 'linear-gradient(135deg, #10b98120, #10b98140)',
      comingSoon: false
    },
    { 
      id: 'hangman', 
      name: 'Hangman', 
      emoji: '💀',
      description: 'Guess the word before the man hangs!',
      color: '#8b5cf6',
      bgColor: 'linear-gradient(135deg, #8b5cf620, #8b5cf640)',
      comingSoon: false
    },
    { 
      id: 'snake', 
      name: 'Snake Game', 
      emoji: '🐍',
      description: 'Classic arcade with power-ups',
      color: '#f59e0b',
      bgColor: 'linear-gradient(135deg, #f59e0b20, #f59e0b40)',
      comingSoon: false
    },
    { 
      id: 'quiz', 
      name: 'Quiz Challenge', 
      emoji: '🧠',
      description: 'Test your knowledge with trivia',
      color: '#ef4444',
      bgColor: 'linear-gradient(135deg, #ef444420, #ef444440)',
      comingSoon: true
    }
  ]

  return (
    <div className="game-menu">
      <div className="swiper-container">
        <Swiper
          modules={[Navigation, Pagination, EffectCoverflow, Autoplay]}
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 20,
            stretch: 0,
            depth: 200,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{ 
            clickable: true,
            dynamicBullets: true 
          }}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          autoplay={{ 
            delay: 1000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          loop={true}
          speed={800}
          className="games-swiper-coverflow"
        >
          {games.map((game, index) => (
            <SwiperSlide key={game.id}>
              <div 
                className={`game-slide-coverflow ${game.comingSoon ? 'coming-soon' : ''}`}
                style={{ 
                  '--game-color': game.color,
                  '--game-bg': game.bgColor,
                  '--slide-index': index
                }}
                onClick={() => !game.comingSoon && onSelectGame(game.id)}
              >
                <div className="slide-content-coverflow">
                  <div className="game-emoji-coverflow">{game.emoji}</div>
                  <h3 className="game-title-coverflow">{game.name}</h3>
                  <p className="game-description-coverflow">{game.description}</p>
                  
                  <div className="slide-footer-coverflow">
                    {game.comingSoon ? (
                      <span className="coming-soon-badge-coverflow">Coming Soon</span>
                    ) : (
                      <button className="play-button-coverflow">
                        Play Now
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Reflection effect */}
                <div className="slide-reflection"></div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        <div className="swiper-button-prev custom-nav"></div>
        <div className="swiper-button-next custom-nav"></div>
      </div>

      {/* Fallback grid for smaller screens */}
      <div className="games-grid-fallback">
        {games.map(game => (
          <div
            key={game.id}
            className={`game-card ${game.comingSoon ? 'disabled' : ''}`}
            onClick={() => !game.comingSoon && onSelectGame(game.id)}
          >
            <span className="game-emoji">{game.emoji}</span>
            <h3>{game.name}</h3>
            <p>{game.comingSoon ? 'Coming Soon' : 'Click to Play'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default GameMenu