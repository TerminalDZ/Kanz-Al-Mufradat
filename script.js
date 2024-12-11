class Game {
    constructor() {
        this.teams = {
            team1: {
                players: [],
                score: 0
            },
            team2: {
                players: [],
                score: 0
            }
        };
        this.currentTeam = 'team1';
        this.currentPlayerIndex = 0;
        this.letters = [];
        this.selectedLetters = [];
        this.timer = null;
        this.timeLeft = 60;
        this.gameStarted = false;
        this.currentMatch = null;
        this.currentMatchIndex = 0;
        this.totalMatches = 0;
        this.initializeGame();
    }

    initializeGame() {
        // DOM elements using jQuery
        this.startButton = $('#startGame');
        this.deleteButton = $('#deleteLastLetter');
        this.submitButton = $('#submitWord');
        this.resetButton = $('#resetGame');
        this.gridElement = $('#letterGrid');
        this.selectedLettersContainer = $('#selectedLettersContainer');
        this.timerElement = $('.timer span');
        this.currentPlayerElement = $('#currentPlayerName');
        this.currentPointsElement = $('#currentPoints span');

        // Event listeners with jQuery
        this.startButton.on('click', () => this.startGame());
        this.deleteButton.on('click', () => this.deleteLastLetter());
        this.submitButton.on('click', () => this.submitWord());
        this.resetButton.on('click', () => this.resetGame());

        // Load saved data
        this.loadGameData();
        
        // Initialize demo players if none exist
        if (this.teams.team1.players.length === 0) {
            this.addDemoPlayers();
        }

        this.updateTeamsDisplay();
    }

    addDemoPlayers() {
        this.teams.team1.players = [
          
        ];
        this.teams.team2.players = [
            
        ];
    }

    startGame() {
        if (this.gameStarted) return;
        
        // Match players by age
        const matches = this.matchPlayersByAge();
        if (matches.length === 0) {
            Toastify({
                text: "يجب إضافة لاعبين في كلا الفريقين للبدء",
                duration: 3000,
                gravity: "top",
                position: "left",
                style: {
                    background: "var(--error-color)",
                }
            }).showToast();
            return;
        }

        this.currentMatch = matches[0]; // Start with first match
        this.currentMatchIndex = 0;
        this.totalMatches = matches.length;
        
        // Set current players
        this.teams.team1.currentPlayer = this.currentMatch.team1Player;
        this.teams.team2.currentPlayer = this.currentMatch.team2Player;
        
        this.gameStarted = true;
        this.currentTeam = 'team1';
        this.resetRound();
        this.updateDisplay();
        this.startTimer();
        
        // Show matched players toast
        Toastify({
            text: `مباراة: ${this.currentMatch.team1Player.name} (${this.currentMatch.team1Player.age} سنة) ضد ${this.currentMatch.team2Player.name} (${this.currentMatch.team2Player.age} سنة)`,
            duration: 5000,
            gravity: "top",
            position: "left",
            style: {
                background: "var(--primary-color)",
            }
        }).showToast();
    }

    matchPlayersByAge() {
        // Sort players by age
        const team1Players = [...this.teams.team1.players].sort((a, b) => a.age - b.age);
        const team2Players = [...this.teams.team2.players].sort((a, b) => a.age - b.age);
        
        // Reset played status
        team1Players.forEach(player => player.played = false);
        team2Players.forEach(player => player.played = false);
        
        // Match players with similar ages
        const matches = [];
        let i = 0, j = 0;
        
        while (i < team1Players.length && j < team2Players.length) {
            matches.push({
                team1Player: team1Players[i],
                team2Player: team2Players[j]
            });
            i++;
            j++;
        }
        
        return matches;
    }

    generateLetters() {
        const arabicLetters = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي';
        this.letters = [];
        const gridSize = 10;
        
        for (let i = 0; i < gridSize; i++) {
            let letter;
            do {
                letter = arabicLetters[Math.floor(Math.random() * arabicLetters.length)];
            } while (this.countLetter(letter) >= 2);
            
            this.letters.push(letter);
        }
        
        this.renderGrid();
    }

    countLetter(letter) {
        return this.letters.filter(l => l === letter).length;
    }

    renderGrid() {
        this.gridElement.empty();
        this.letters.forEach((letter, index) => {
            const cell = $('<div>')
                .addClass('grid-cell')
                .html(`
                    <div class="cell-number">${index + 1}</div>
                    <div class="cell-letter">${letter || ''}</div>
                `)
                .data('index', index)
                .on('click', () => this.selectLetter(index));
            
            this.gridElement.append(cell);
        });
    }

    selectLetter(index) {
        if (!this.gameStarted) return;
        
        const letter = this.letters[index];
        if (letter) {
            this.selectedLetters.push({ letter, index: index + 1 }); // Store the display number instead of array index
            this.updateSelectedLettersDisplay();
            this.letters[index] = null;
            this.renderGrid();
        }
    }

    updateSelectedLettersDisplay() {
        this.selectedLettersContainer.empty();
        this.selectedLetters.forEach(({ letter, index }) => {
            const letterElement = $('<span>')
                .addClass('selected-letter')
                .text(`${letter} (${index})`); // Show the cell number with the letter
            this.selectedLettersContainer.append(letterElement);
        });
        
        // Update current points
        const currentPoints = this.calculatePoints();
        this.currentPointsElement.text(currentPoints);
    }

    deleteLastLetter() {
        if (this.selectedLetters.length > 0) {
            const { letter, index } = this.selectedLetters.pop();
            this.letters[index - 1] = letter; // Convert back to array index
            this.updateSelectedLettersDisplay();
            this.renderGrid();
        }
    }

    submitWord() {
        if (this.selectedLetters.length === 0) {
            Toastify({
                text: "يرجى اختيار حروف أولاً",
                duration: 3000,
                gravity: "top",
                position: "left",
                style: {
                    background: "var(--warning-color)",
                    color: "black"
                }
            }).showToast();
            return;
        }

        const currentTeam = this.teams[this.currentTeam];
        const points = this.calculatePoints();
        currentTeam.score += points;
        
        Toastify({
            text: `+${points} نقطة للفريق ${this.currentTeam === 'team1' ? 'الأول' : 'الثاني'}`,
            duration: 3000,
            gravity: "top",
            position: "left",
            style: {
                background: "var(--success-color)",
            }
        }).showToast();
        
        this.updateScore();
        this.nextPlayer();
        this.resetRound();
        this.saveGameData();
    }

    calculatePoints() {
        return this.selectedLetters.reduce((total, { index }) => total + index, 0);
    }

    nextPlayer() {
        const currentTeam = this.teams[this.currentTeam];
        currentTeam.players[this.currentPlayerIndex].played = true;

        this.currentTeam = this.currentTeam === 'team1' ? 'team2' : 'team1';
        this.currentPlayerIndex = this.getNextPlayerIndex();

        if (this.isGameComplete()) {
            this.endGame();
        } else {
            this.updateCurrentPlayer();
            this.resetTimer();
        }
    }

    getNextPlayerIndex() {
        const team = this.teams[this.currentTeam];
        for (let i = 0; i < team.players.length; i++) {
            if (!team.players[i].played) return i;
        }
        return 0;
    }

    isGameComplete() {
        return Object.values(this.teams).every(team => 
            team.players.every(player => player.played)
        );
    }

    startTimer() {
        this.timeLeft = 60;
        this.updateTimerDisplay();
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            if (this.timeLeft <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        this.timerElement.text(this.timeLeft);
    }

    handleTimeUp() {
        clearInterval(this.timer);
        
        Toastify({
            text: "انتهى الوقت!",
            duration: 3000,
            gravity: "top",
            position: "left",
            style: {
                background: "var(--danger-color)",
            }
        }).showToast();

        this.nextPlayer();
        this.resetRound();
    }

    resetTimer() {
        clearInterval(this.timer);
        this.startTimer();
    }

    resetRound() {
        this.selectedLetters = [];
        this.updateSelectedLettersDisplay();
        this.currentPointsElement.text('0');
        this.generateLetters();
    }

    updateScore() {
        $(`#${this.currentTeam} .score span`).text(this.teams[this.currentTeam].score);
    }

    updateCurrentPlayer() {
        const currentTeam = this.teams[this.currentTeam];
        const currentPlayer = currentTeam.players[this.currentPlayerIndex];
        this.currentPlayerElement.text(
            `${currentPlayer.name} (${this.currentTeam === 'team1' ? 'الفريق الأول' : 'الفريق الثاني'})`
        );
    }

    updateTeamsDisplay() {
        ['team1', 'team2'].forEach(teamId => {
            const teamElement = $(`#${teamId} .players`);
            teamElement.empty();
            this.teams[teamId].players.forEach(player => {
                const playerElement = $('<div>')
                    .addClass('player')
                    .text(`${player.name} (${player.age} سنة)`);
                if (player.played) playerElement.css('opacity', '0.5');
                teamElement.append(playerElement);
            });
        });
    }

    endGame() {
        clearInterval(this.timer);
        const winner = this.teams.team1.score > this.teams.team2.score ? 'الفريق الأول' : 'الفريق الثاني';
        const winnerScore = Math.max(this.teams.team1.score, this.teams.team2.score);
        
        Swal.fire({
            title: 'انتهت اللعبة!',
            html: `
                <div class="text-center">
                    <h3 class="mb-3">🏆 الفائز هو ${winner}</h3>
                    <p class="mb-2">النتيجة النهائية:</p>
                    <p class="h4">${winnerScore} نقطة</p>
                </div>
            `,
            icon: 'success',
            confirmButtonText: 'حسناً',

            allowOutsideClick: false
        }).then(() => {
            this.gameStarted = false;
            this.startButton.prop('disabled', false);
        });
    }

    resetGame() {
        Swal.fire({
            title: 'هل أنت متأكد؟',
            text: 'سيتم إعادة تعيين اللعبة وحذف جميع النقاط',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'var(--danger-color)',
            cancelButtonColor: 'var(--secondary-color)',
            confirmButtonText: 'نعم، أعد التعيين',
            cancelButtonText: 'إلغاء'
        }).then((result) => {
            if (result.isConfirmed) {
                clearInterval(this.timer);
                this.teams.team1.score = 0;
                this.teams.team2.score = 0;
                this.teams.team1.players.forEach(player => player.played = false);
                this.teams.team2.players.forEach(player => player.played = false);
                this.currentTeam = 'team1';
                this.currentPlayerIndex = 0;
                this.selectedLetters = [];
                this.gameStarted = false;
                this.startButton.prop('disabled', false);
                this.updateTeamsDisplay();
                this.updateScore();
                this.updateCurrentPlayer();
                this.letters = [];
                this.renderGrid();
                this.updateSelectedLettersDisplay();
                this.currentPointsElement.text('0');
                this.timeLeft = 60;
                this.updateTimerDisplay();
                this.saveGameData();

                Toastify({
                    text: "تم إعادة تعيين اللعبة",
                    duration: 3000,
                    gravity: "top",
                    position: "left",
                    style: {
                        background: "var(--info-color)",
                    }
                }).showToast();
            }
        });
    }

    saveGameData() {
        const gameData = {
            teams: this.teams,
            currentTeam: this.currentTeam,
            currentPlayerIndex: this.currentPlayerIndex
        };
        localStorage.setItem('gameData', JSON.stringify(gameData));
    }

    loadGameData() {
        const savedData = localStorage.getItem('gameData');
        if (savedData) {
            const gameData = JSON.parse(savedData);
            this.teams = gameData.teams;
            this.currentTeam = gameData.currentTeam;
            this.currentPlayerIndex = gameData.currentPlayerIndex;
            this.updateScore();
            this.updateTeamsDisplay();
        }
    }

    updateDisplay() {
        this.currentPlayerElement.text(
            `${this.currentMatch.team1Player.name} (${this.currentMatch.team1Player.age} سنة) ضد ${this.currentMatch.team2Player.name} (${this.currentMatch.team2Player.age} سنة)`
        );
    }
}

// Initialize the game when the page loads
$(document).ready(() => {
    new Game();
});
