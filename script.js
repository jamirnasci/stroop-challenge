/**
 * Color Match Challenge - Stroop Effect Game
 * A game where players must click the color button that matches the font color,
 * not the word displayed. Features progressive difficulty and score tracking.
 */

class ColorMatchGame {
    constructor() {
        // Game state variables
        this.isPlaying = false;
        this.currentScore = 0;
        this.gameTimer = null;
        this.currentTimeLimit = 3000; // Start with 3 seconds
        this.minTimeLimit = 800; // Minimum time limit (0.8 seconds)
        this.timeDecrement = 100; // Decrease time by 100ms each round
        
        // Available colors for the game
        this.colors = ['red', 'blue', 'green', 'yellow'];
        this.colorNames = ['RED', 'BLUE', 'GREEN', 'YELLOW'];
        
        // Current round data
        this.currentWord = '';
        this.currentFontColor = '';
        this.correctAnswer = '';
        
        // DOM elements
        this.initializeElements();
        
        // Event listeners
        this.setupEventListeners();
        
        // Load high score from localStorage
        this.loadHighScore();
        
        // Initialize sound effects
        this.initializeSounds();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        this.gameArea = document.getElementById('game-area');
        this.colorWord = document.getElementById('color-word');
        this.currentScoreEl = document.getElementById('current-score');
        this.highScoreEl = document.getElementById('high-score');
        this.timerBar = document.getElementById('timer-bar');
        this.startBtn = document.getElementById('start-btn');
        this.exitBtn = document.getElementById('exit-btn');
        this.gameOverScreen = document.getElementById('game-over');
        this.finalScoreEl = document.getElementById('final-score');
        this.highScoreMessage = document.getElementById('high-score-message');
        this.restartBtn = document.getElementById('restart-btn');
        this.menuBtn = document.getElementById('menu-btn');
        this.feedback = document.getElementById('feedback');
        
        // Color buttons
        this.colorButtons = {
            red: document.getElementById('red-btn'),
            blue: document.getElementById('blue-btn'),
            green: document.getElementById('green-btn'),
            yellow: document.getElementById('yellow-btn')
        };
    }

    /**
     * Set up event listeners for game interactions
     */
    setupEventListeners() {
        // Start game button
        this.startBtn.addEventListener('click', () => this.startGame());
        
        // Exit game button
        this.exitBtn.addEventListener('click', () => this.exitGame());
        
        // Restart game button
        this.restartBtn.addEventListener('click', () => this.restartGame());
        
        // Main menu button
        this.menuBtn.addEventListener('click', () => this.returnToMainMenu());
        
        // Color button clicks
        Object.keys(this.colorButtons).forEach(color => {
            this.colorButtons[color].addEventListener('click', () => this.handleColorClick(color));
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    /**
     * Initialize sound effects
     */
    initializeSounds() {
        this.correctSound = document.getElementById('correct-sound');
        this.wrongSound = document.getElementById('wrong-sound');
        
        // Set volume levels
        this.correctSound.volume = 0.3;
        this.wrongSound.volume = 0.3;
    }

    /**
     * Load high score from localStorage
     */
    loadHighScore() {
        const savedHighScore = localStorage.getItem('colorMatchHighScore');
        this.highScore = savedHighScore ? parseInt(savedHighScore) : 0;
        this.updateHighScoreDisplay();
    }

    /**
     * Save high score to localStorage
     */
    saveHighScore() {
        localStorage.setItem('colorMatchHighScore', this.highScore.toString());
    }

    /**
     * Update the high score display
     */
    updateHighScoreDisplay() {
        this.highScoreEl.textContent = this.highScore;
    }

    /**
     * Update the current score display
     */
    updateCurrentScoreDisplay() {
        this.currentScoreEl.textContent = this.currentScore;
    }

    /**
     * Start a new game
     */
    startGame() {
        this.isPlaying = true;
        this.currentScore = 0;
        this.currentTimeLimit = 3000;
        
        // Update UI
        this.gameArea.classList.add('playing');
        this.gameOverScreen.style.display = 'none';
        this.updateCurrentScoreDisplay();
        
        // Start first round
        this.startNewRound();
    }

    /**
     * Start a new round of the game
     */
    startNewRound() {
        if (!this.isPlaying) return;
        
        // Generate new round data
        this.generateRoundData();
        
        // Update display
        this.updateWordDisplay();
        
        // Enable color buttons
        this.enableColorButtons();
        
        // Start timer
        this.startTimer();
    }

    /**
     * Generate random word and font color for the current round
     */
    generateRoundData() {
        // Pick a random word
        const wordIndex = Math.floor(Math.random() * this.colorNames.length);
        this.currentWord = this.colorNames[wordIndex];
        
        // Pick a random font color (must be different from the word)
        let fontColorIndex;
        do {
            fontColorIndex = Math.floor(Math.random() * this.colors.length);
        } while (fontColorIndex === wordIndex);
        
        this.currentFontColor = this.colors[fontColorIndex];
        this.correctAnswer = this.currentFontColor;
    }

    /**
     * Update the word display with current word and font color
     */
    updateWordDisplay() {
        this.colorWord.textContent = this.currentWord;
        this.colorWord.style.color = this.currentFontColor;
        
        // Add pulse animation
        this.colorWord.classList.remove('pulse');
        setTimeout(() => this.colorWord.classList.add('pulse'), 10);
    }

    /**
     * Enable all color buttons for player interaction
     */
    enableColorButtons() {
        Object.values(this.colorButtons).forEach(button => {
            button.classList.remove('disabled');
            button.disabled = false;
        });
    }

    /**
     * Disable all color buttons
     */
    disableColorButtons() {
        Object.values(this.colorButtons).forEach(button => {
            button.classList.add('disabled');
            button.disabled = true;
        });
    }

    /**
     * Start the countdown timer for the current round
     */
    startTimer() {
        // Reset timer bar
        this.timerBar.style.transition = 'none';
        this.timerBar.style.width = '100%';
        
        // Start timer animation
        setTimeout(() => {
            this.timerBar.style.transition = `width ${this.currentTimeLimit}ms linear`;
            this.timerBar.style.width = '0%';
        }, 50);
        
        // Set timeout for game over
        this.gameTimer = setTimeout(() => {
            this.handleTimeUp();
        }, this.currentTimeLimit);
    }

    /**
     * Handle player clicking a color button
     */
    handleColorClick(selectedColor) {
        if (!this.isPlaying) return;
        
        // Clear the timer
        clearTimeout(this.gameTimer);
        
        // Disable buttons to prevent multiple clicks
        this.disableColorButtons();
        
        // Check if answer is correct
        if (selectedColor === this.correctAnswer) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
    }

    /**
     * Handle correct answer
     */
    handleCorrectAnswer() {
        // Increase score
        this.currentScore += 10;
        this.updateCurrentScoreDisplay();
        
        // Play correct sound
        this.playSound(this.correctSound);
        
        // Show feedback
        this.showFeedback('Correct!', 'correct');
        
        // Decrease time limit for next round (progressive difficulty)
        this.currentTimeLimit = Math.max(this.minTimeLimit, this.currentTimeLimit - this.timeDecrement);
        
        // Start next round after a short delay
        setTimeout(() => {
            this.startNewRound();
        }, 1000);
    }

    /**
     * Handle incorrect answer
     */
    handleIncorrectAnswer() {
        // Play wrong sound
        this.playSound(this.wrongSound);
        
        // Show feedback
        this.showFeedback('Wrong!', 'incorrect');
        
        // Add shake animation to the game area
        this.gameArea.classList.add('shake');
        setTimeout(() => this.gameArea.classList.remove('shake'), 500);
        
        // End game after a short delay
        setTimeout(() => {
            this.endGame();
        }, 1500);
    }

    /**
     * Handle time running out
     */
    handleTimeUp() {
        // Play wrong sound
        this.playSound(this.wrongSound);
        
        // Show feedback
        this.showFeedback('Time\'s Up!', 'incorrect');
        
        // Disable buttons
        this.disableColorButtons();
        
        // End game after a short delay
        setTimeout(() => {
            this.endGame();
        }, 1500);
    }

    /**
     * Show feedback message to the player
     */
    showFeedback(message, type) {
        this.feedback.textContent = message;
        this.feedback.className = `feedback ${type} show`;
        
        // Hide feedback after 1 second
        setTimeout(() => {
            this.feedback.classList.remove('show');
        }, 1000);
    }

    /**
     * Play a sound effect
     */
    playSound(audioElement) {
        try {
            audioElement.currentTime = 0;
            audioElement.play().catch(e => {
                // Handle autoplay policy restrictions silently
                console.log('Audio playback prevented by browser policy');
            });
        } catch (error) {
            // Silently handle audio errors
            console.log('Audio playback error:', error);
        }
    }

    /**
     * End the current game
     */
    endGame() {
        this.isPlaying = false;
        
        // Clear any running timers
        clearTimeout(this.gameTimer);
        
        // Update game state
        this.gameArea.classList.remove('playing');
        
        // Check for high score
        let isNewHighScore = false;
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
            this.updateHighScoreDisplay();
            isNewHighScore = true;
        }
        
        // Show game over screen
        this.showGameOverScreen(isNewHighScore);
    }

    /**
     * Show the game over screen
     */
    showGameOverScreen(isNewHighScore) {
        this.finalScoreEl.textContent = this.currentScore;
        
        if (isNewHighScore) {
            this.highScoreMessage.style.display = 'block';
        } else {
            this.highScoreMessage.style.display = 'none';
        }
        
        this.gameOverScreen.style.display = 'flex';
    }

    /**
     * Exit the current game and return to main menu
     */
    exitGame() {
        if (!this.isPlaying) return;
        
        // Stop the game
        this.isPlaying = false;
        
        // Clear any running timers
        clearTimeout(this.gameTimer);
        
        // Reset game state
        this.gameArea.classList.remove('playing');
        
        // Reset display elements
        this.colorWord.textContent = 'READY?';
        this.colorWord.style.color = '#333';
        this.timerBar.style.width = '100%';
        this.timerBar.style.transition = 'none';
        
        // Reset current score for next game
        this.currentScore = 0;
        this.updateCurrentScoreDisplay();
        
        // Show feedback
        this.showFeedback('Game Exited', 'incorrect');
    }

    /**
     * Return to the main menu from game over screen
     */
    returnToMainMenu() {
        this.gameOverScreen.style.display = 'none';
        
        // Reset display elements to initial state
        this.colorWord.textContent = 'READY?';
        this.colorWord.style.color = '#333';
        this.timerBar.style.width = '100%';
        this.timerBar.style.transition = 'none';
        
        // Reset current score display
        this.currentScore = 0;
        this.updateCurrentScoreDisplay();
        
        // Ensure game state is properly reset
        this.isPlaying = false;
        this.gameArea.classList.remove('playing');
    }

    /**
     * Restart the game
     */
    restartGame() {
        this.gameOverScreen.style.display = 'none';
        this.startGame();
    }

    /**
     * Handle keyboard input for accessibility
     */
    handleKeyPress(event) {
        if (!this.isPlaying) {
            // Allow starting game with spacebar or enter
            if (event.code === 'Space' || event.code === 'Enter') {
                event.preventDefault();
                if (!this.isPlaying) {
                    this.startGame();
                }
            }
            return;
        }
        
        // Map keys to colors during gameplay
        const keyMap = {
            'KeyR': 'red',
            'Digit1': 'red',
            'KeyB': 'blue',
            'Digit2': 'blue',
            'KeyG': 'green',
            'Digit3': 'green',
            'KeyY': 'yellow',
            'Digit4': 'yellow'
        };
        
        if (keyMap[event.code]) {
            event.preventDefault();
            this.handleColorClick(keyMap[event.code]);
        }
        
        // Allow exiting game with Escape key
        if (event.code === 'Escape') {
            event.preventDefault();
            this.exitGame();
        }
    }
}

/**
 * Initialize the game when the DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Create and start the game instance
    const game = new ColorMatchGame();
    
    // Add some helpful console messages for debugging
    console.log('Color Match Challenge loaded successfully!');
    console.log('Keyboard controls: R/1=Red, B/2=Blue, G/3=Green, Y/4=Yellow');
    console.log('Press Space or Enter to start the game');
    console.log('Press Escape to exit the game while playing');
});

/**
 * Service Worker registration for potential offline functionality
 * This is optional and can be uncommented if needed
 */
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
*/
