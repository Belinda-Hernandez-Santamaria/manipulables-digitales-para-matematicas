function startIntervalTick() {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = setInterval(() => {
                if (gameState.tutorialActive) {
                    stopTimer();
                    return;
                }

                gameState.timeLeft--;
                updateTimerDisplay();
                if (gameState.timeLeft <= 15 && gameState.timeLeft > 0) {
                    document.getElementById('customer-emoji').classList.add('client-worried');
                    document.getElementById('customer-emoji').innerText = gameState.currentOrder.multi ? '😟' : '😟';
                }
                if (gameState.timeLeft <= 0) {
                    clearInterval(gameState.timerInterval);
                    gameState.lives--; renderLives();
                    saveTimedOutOrder();
                    showResult('timeout', gameState.currentOrder.multi, 0, 0);
                }
            }, 1000);
        }

        function startPlayingTimer() {
            if (gameState.tutorialActive) {
                stopTimer();
                return;
            }

            gameState.timerMode = 'PLAYING';
            gameState.timeLeft = gameState.maxTime;
            document.getElementById('timer-display').classList.remove('hidden');
            document.getElementById('customer-emoji').classList.remove('client-worried');
            updateTimerDisplay();
            startIntervalTick();
        }

        function resumeTimer() {
            if (!gameState.timerEnabled || gameState.tutorialActive) return;
            gameState.timerMode = 'PLAYING';
            document.getElementById('timer-display').classList.remove('hidden');
            updateTimerDisplay();
            startIntervalTick();
        }

        function stopTimer() {
            clearInterval(gameState.timerInterval);
            gameState.timerMode = 'IDLE';
            document.getElementById('customer-emoji').classList.remove('client-worried');
        }

        function updateTimerDisplay() {
            const el = document.getElementById('timer-display');
            document.getElementById('timer-value').innerText = `${gameState.timeLeft}s`;
            if (gameState.timeLeft <= 15) el.classList.add('timer-danger'); else el.classList.remove('timer-danger');
        }
