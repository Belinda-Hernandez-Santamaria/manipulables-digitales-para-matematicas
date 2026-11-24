function showInstructions(fromMenu, midGame = false, withTimer = false) {
            if (fromMenu) {
                document.getElementById('main-menu-view').classList.add('hidden');
                document.getElementById('mode-select-view').classList.add('hidden');
                document.getElementById('game-view').classList.remove('hidden');
                gameState.timerEnabled = withTimer;
                savedGameState = null;
                tutorialContext = 'menu';
            } else if (midGame) {
                stopTimer();
                savedGameState = {
                    inv: JSON.parse(JSON.stringify(gameState.inv)),
                    box: JSON.parse(JSON.stringify(gameState.box)),
                    boxHistory: [...gameState.boxHistory],
                    score: gameState.score,
                    lives: gameState.lives,
                    round: gameState.round,
                    currentOrderInRound: gameState.currentOrderInRound,
                    currentOrder: gameState.currentOrder,
                    orderCompleted: gameState.orderCompleted,
                    roundPizzaRequests: gameState.roundPizzaRequests || 0,
                    timeLeft: gameState.timeLeft,
                    timerEnabled: gameState.timerEnabled
                };
                gameState.timerEnabled = true;
                tutorialContext = 'ingame';
            }

            // Clean state for tutorial
            gameState.inv = { ...initialInventory };
            gameState.box = {2:0,3:0,4:0,6:0,8:0};
            gameState.boxHistory = [];
            gameState.score = 0;
            gameState.lives = 3;
            document.getElementById('timer-display').classList.toggle('hidden', !gameState.timerEnabled);
            document.getElementById('customer-name').classList.add('hidden');
            document.getElementById('customer-emoji').classList.remove('client-worried');

            renderLives();
            updateScoreDisplay();
            renderAssembly();
            renderBox();

            startTutorial();
        }

        function prepareNewGameState(withTimer) {
            gameState.timerEnabled = withTimer;
            savedGameState = null;
            tutorialContext = 'newgame';
            document.getElementById('mode-select-view').classList.add('hidden');
            document.getElementById('main-menu-view').classList.add('hidden');
            document.getElementById('game-view').classList.remove('hidden');
            document.getElementById('timer-display').classList.toggle('hidden', !withTimer);

            gameState.inv = { ...initialInventory };
            gameState.box = {2:0,3:0,4:0,6:0,8:0};
            gameState.boxHistory = [];
            gameState.score = 0;
            gameState.lives = 3;
            gameState.isGameOver = false;
            gameState.orderCompleted = false;
            gameState.history = [];
            gameState.roundHistory = [];
            gameState.currentOrderAttempts = [];
            gameState.roundPizzaRequests = 0;
            renderOrderHistoryNotes();
            gameState.round = 1;
            gameState.currentOrderInRound = 1;
            gameState.currentOrder = null;
            gameState.timeLeft = 0;

            document.getElementById('round-info').innerText = `Preparación`;
            document.getElementById('order-text').innerText = 'Esperando cliente...';
            document.getElementById('customer-emoji').innerText = '🧑';
            document.getElementById('customer-name').classList.add('hidden');

            renderLives();
            updateScoreDisplay();
            renderAssembly();
            renderBox();
        }

        function showWelcomeModal() {
            const modal = document.getElementById('welcome-modal');
            if (!modal) return;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            const primaryButton = document.getElementById('welcome-btn-tutorial');
            if (primaryButton) setTimeout(() => primaryButton.focus(), 50);
        }

        function closeWelcomeModal() {
            const modal = document.getElementById('welcome-modal');
            if (!modal) return;
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        // Para iniciar el tutorial desde una nueva partida (después de elegir modalidad)
        function startTutorialForNewGame(withTimer) {
            prepareNewGameState(withTimer);
            document.getElementById('round-info').innerText = `Tutorial`;
            startTutorial();
        }

        function clearTutorialInactivityTimers() {
            clearTimeout(tutorialInactivityWarningTimer);
            clearTimeout(tutorialSkipTimer);
            tutorialInactivityWarningTimer = null;
            tutorialSkipTimer = null;
            tutorialInactivityWarningVisible = false;
        }

        function resetTutorialInactivity() {
            if (!gameState.tutorialActive) return;

            clearTutorialInactivityTimers();
            document.getElementById('chef-btn-skip').style.display = 'none';
            document.getElementById('chef-dialog-text').innerHTML = tutorialDialogHtml;

            tutorialInactivityWarningTimer = setTimeout(() => {
                if (!gameState.tutorialActive) return;
                tutorialInactivityWarningVisible = true;
                document.getElementById('chef-dialog-text').innerText = 'Si quieres saltar el tutorial, espera un momento: el botón «Saltar» aparecerá en breve.';
            }, 10000);

            tutorialSkipTimer = setTimeout(() => {
                if (!gameState.tutorialActive) return;
                document.getElementById('chef-btn-skip').style.display = 'inline-block';
            }, 20000);
        }

        document.addEventListener('click', event => {
            if (!gameState.tutorialActive) return;
            const target = event.target.closest('#game-view button, #game-view [onclick], #game-view canvas[draggable="true"], #chef-btn-next, #modal-container button');
            if (target) resetTutorialInactivity();
        }, true);

        function endTutorial() {
            if (gameState.tutorialActive && gameState.tutorialStep !== 19) return;

            clearTimeout(chefNoticeTimer);
            chefNoticeTimer = null;
            clearTutorialInactivityTimers();
            gameState.tutorialActive = false;
            document.getElementById('chef-dialog-container').classList.add('hidden');
            document.getElementById('tutorial-blocker').classList.add('hidden');
            removeHighlights();

            if (tutorialContext === 'ingame' && savedGameState) {
                // Restaurar estado de partida en curso
                gameState.inv = JSON.parse(JSON.stringify(savedGameState.inv));
                gameState.box = JSON.parse(JSON.stringify(savedGameState.box));
                gameState.boxHistory = [...savedGameState.boxHistory];
                gameState.score = savedGameState.score;
                gameState.lives = savedGameState.lives;
                gameState.round = savedGameState.round;
                gameState.currentOrderInRound = savedGameState.currentOrderInRound;
                gameState.currentOrder = savedGameState.currentOrder;
                gameState.orderCompleted = savedGameState.orderCompleted;
                gameState.roundPizzaRequests = savedGameState.roundPizzaRequests;
                gameState.timeLeft = savedGameState.timeLeft;
                gameState.timerEnabled = savedGameState.timerEnabled;
                savedGameState = null;

                renderLives();
                updateScoreDisplay();
                document.getElementById('timer-display').classList.toggle('hidden', !gameState.timerEnabled);
                updateTimerDisplay();

                document.getElementById('round-info').innerText = `Ronda ${gameState.round} - Pedido ${gameState.currentOrderInRound} de ${gameState.ordersPerRound}`;
                document.getElementById('order-text').innerText = gameState.currentOrder.texto;
                document.getElementById('customer-emoji').innerText = gameState.currentOrder.multi ? '🧑‍🤝‍🧑' : '🧑';
                document.getElementById('customer-name').classList.add('hidden');
                document.getElementById('customer-emoji').classList.remove('client-worried');

                renderAssembly();
                renderBox();

                showCurtain("Continuamos", () => {
                    if (gameState.timerEnabled) resumeTimer();
                });
            } else if (tutorialContext === 'newgame') {
                // Iniciar nueva partida (Ronda 1)
                // Reiniciar inventario y otros estados
                gameState.inv = { ...initialInventory };
                gameState.box = {2:0,3:0,4:0,6:0,8:0};
                gameState.boxHistory = [];
                gameState.score = 0;
                gameState.lives = 3;
                gameState.isGameOver = false;
                gameState.history = [];
                gameState.round = 1;
                gameState.currentOrderInRound = 1;
                gameState.currentOrder = null;
                gameState.timeLeft = 0;
                renderLives();
                updateScoreDisplay();
                document.getElementById('timer-display').classList.toggle('hidden', !gameState.timerEnabled);
                document.getElementById('customer-name').classList.add('hidden');
                startRound(1);
            } else {
                // Tutorial desde menú principal -> volver al menú con cortina
                showCurtain("<span style='font-size: 0.7em; text-align: center; display: block; line-height: 1.2; padding: 0 10px;'>¿Comenzamos una partida?</span>", () => {
                    document.getElementById('game-view').classList.add('hidden');
                    document.getElementById('main-menu-view').classList.remove('hidden');
                });
            }
        }

        // Saltar tutorial: avanzar al último paso y luego finalizar
        function skipTutorial() {
            // Si estamos en medio de una simulación de timer, limpiar
            if (mockInterval) clearInterval(mockInterval);
            // Forzar el paso final y luego ejecutar endTutorial
            gameState.tutorialStep = 19;
            // Ocultar el diálogo del chef y el bloqueo
            document.getElementById('chef-dialog-container').classList.add('hidden');
            document.getElementById('tutorial-blocker').classList.add('hidden');
            removeHighlights();
            endTutorial();
        }

        function goToModeSelect(forTutorial = false) {
            modeSelectContext = forTutorial ? 'tutorial' : 'game';
            document.getElementById('main-menu-view').classList.add('hidden');
            document.getElementById('mode-select-view').classList.remove('hidden');
        }

        function onModeSelected(withTimer) {
            if (modeSelectContext === 'tutorial') {
                showInstructions(true, false, withTimer);
                return;
            }

            prepareNewGameState(withTimer);
            showWelcomeModal();
        }

        const welcomeBtnTutorial = document.getElementById('welcome-btn-tutorial');
        if (welcomeBtnTutorial) {
            welcomeBtnTutorial.addEventListener('click', () => {
                closeWelcomeModal();
                startTutorialForNewGame(gameState.timerEnabled);
            });
        }

        const welcomeBtnStart = document.getElementById('welcome-btn-start');
        if (welcomeBtnStart) {
            welcomeBtnStart.addEventListener('click', () => {
                closeWelcomeModal();
                startRound(1);
            });
        }

        function backToMainMenu() {
            document.getElementById('mode-select-view').classList.add('hidden');
            document.getElementById('main-menu-view').classList.remove('hidden');
        }
        function attemptExitApp() { showModal("🚪 Salir", "<p>Puedes cerrar esta pestaña cuando quieras. ¡Nos vemos pronto!</p>"); }
        function promptExitToMenu() {
            showModal("Salir al menú", "¿Seguro que quieres salir? Perderás el progreso de esta partida.", () => {
                stopTimer();
                document.getElementById('game-view').classList.add('hidden');
                document.getElementById('main-menu-view').classList.remove('hidden');
            }, () => {});
        }

        function startTutorial() {
            stopTimer();
            clearTimeout(chefNoticeTimer);
            chefNoticeTimer = null;
            gameState.roundPizzaRequests = 0;
            gameState.tutorialActive = true;
            gameState.tutorialStep = 0;
            document.getElementById('tutorial-blocker').classList.remove('hidden');
            document.getElementById('chef-dialog-container').classList.remove('hidden');
            resetTutorialInactivity();
            runTutorialLogic();
        }

        function removeHighlights() {
            document.querySelectorAll('.tutorial-highlight').forEach(el => el.classList.remove('tutorial-highlight'));
            let mag = document.getElementById('temp-magnifier');
            if (mag) mag.remove();
            let cursorGuide = document.getElementById('temp-cursor-guide');
            if (cursorGuide) cursorGuide.remove();
            if (mockInterval) clearInterval(mockInterval);
        }

        function setChefDialog(text, showBtn = true) {
            tutorialDialogHtml = text;
            tutorialNextButtonVisible = showBtn;
            if (!tutorialInactivityWarningVisible) {
                document.getElementById('chef-dialog-text').innerHTML = text;
            }
            document.getElementById('chef-btn-next').style.display = tutorialNextButtonVisible ? 'inline-block' : 'none';
        }

        function advanceTutorialStep() {
            gameState.tutorialStep++;
            runTutorialLogic();
        }

        function runTutorialLogic() {
            removeHighlights();
            let step = gameState.tutorialStep;
            let blocker = document.getElementById('tutorial-blocker');

            if (step === 0) {
                setChefDialog("¡Hola! Soy el cocinero principal. Te acompañaré en tu visita por la pizzería.", true);
            } 
            else if (step === 1) {
                document.getElementById('top-right-buttons').classList.add('tutorial-highlight');
                setChefDialog("Estos botones te permiten consultar las instrucciones o terminar la partida.", true);
            }
            else if (step === 2) {
                document.getElementById('customer-request-panel').classList.add('tutorial-highlight');
                document.getElementById('order-history-panel').classList.add('tutorial-highlight');
                document.getElementById('customer-emoji').innerText = '👧';
                document.getElementById('customer-name').innerText = 'Ana';
                document.getElementById('customer-name').classList.remove('hidden');
                setChefDialog("Aquí llegan los clientes y te indican cuánta pizza necesitan. A un lado podrás ver el historial de los pedidos que entregues durante el juego y acceder a ellos en cualquier momento de la partida.", true);
            }
            else if (step === 3) {
                document.getElementById('assembly-area').classList.add('tutorial-highlight');
                setChefDialog("Aquí armas el pedido. Arrastra una pizza a la caja o pulsa + Añadir.", true);
            }
            else if (step === 4) {
                document.getElementById('delivery-area').classList.add('tutorial-highlight');
                setChefDialog("Aquí ves las rebanadas que elegiste. Cuando termines, pulsa Entregar.", true);
            }
            else if (step === 5) {
                gameState.currentOrder = { texto: "Hola, me han dicho que eres el nuevo de la pizzería, soy Ana y pasé por aquí para ver, pero tengo antojo de ½ pizza.", objetivo: new Fraction(1,2), multi: false };
                document.getElementById('order-text').innerText = gameState.currentOrder.texto;
                blocker.classList.add('hidden'); 
                document.getElementById('assembly-area').classList.add('tutorial-highlight');
                document.getElementById('delivery-area').classList.add('tutorial-highlight');
                setChefDialog("Ana necesita 1/2 pizza. Coloca una rebanada de 1/2 en la caja y pulsa Entregar.", false);
            }
            else if (step === 6) {
                blocker.classList.remove('hidden');
                document.getElementById('lives-display').classList.add('tutorial-highlight');
                document.getElementById('score-value').parentElement.classList.add('tutorial-highlight');
                setChefDialog("Cada pedido correcto vale 50 puntos. También puedes ganar extras usando menos rebanadas.", true);
            }
            else if (step === 7) {
                document.getElementById('lives-display').classList.add('tutorial-highlight');
                setChefDialog("Si te equivocas, perderás una vida. La partida termina cuando no te queden vidas.", true);
            }
            else if (step === 8) {
                if (tutorialContext !== 'menu') {
                    advanceTutorialStep();
                    return;
                }
                setChefDialog("Hay dos modalidades. Sin temporizador, puedes resolver cada pedido con calma.", true);
            }
            else if (step === 9) {
                if (tutorialContext !== 'menu') {
                    advanceTutorialStep();
                    return;
                }
                document.getElementById('timer-display').classList.add('tutorial-highlight');
                setChefDialog("Con temporizador, cada pedido tiene un límite de tiempo. Ahora verás cómo funciona.", true);
            }
            else if (step === 10) {
                if (tutorialContext !== 'menu' || !gameState.timerEnabled) {
                    advanceTutorialStep();
                    return;
                }
                blocker.classList.remove('hidden');
                document.getElementById('timer-display').classList.add('tutorial-highlight');
                setChefDialog("Observa el reloj: cuando el tiempo se agote, el cliente se marchará.", false);
                
                let mockTime = 3;
                document.getElementById('timer-value').innerText = `${mockTime}s`;
                clearInterval(mockInterval);
                mockInterval = setInterval(() => {
                    mockTime--;
                    document.getElementById('timer-value').innerText = `${mockTime}s`;
                    if(mockTime <= 2) {
                        document.getElementById('customer-emoji').classList.add('client-worried', 'tutorial-highlight');
                        document.getElementById('customer-emoji').innerText = '😟';
                    }
                    if(mockTime <= 0) {
                        clearInterval(mockInterval);
                        document.getElementById('timer-value').innerText = `0s`;
                        document.getElementById('timer-display').classList.remove('tutorial-highlight');
                        document.getElementById('customer-emoji').innerText = '💨'; 
                        document.getElementById('order-text').innerText = "¡El cliente se ha ido!";
                        setChefDialog("Al agotarse el tiempo, el cliente se marcha y pierdes una vida.", true);
                    }
                }, 1000);
            }
            else if (step === 11) {
                gameState.box = {2:0,3:0,4:0,6:0,8:0}; gameState.boxHistory = [];
                gameState.inv[2] = 0; 
                renderAssembly(); renderBox();
                
                document.getElementById('customer-name').innerText = 'Ana';
                document.getElementById('customer-emoji').innerText = '👧';
                document.getElementById('customer-emoji').classList.remove('client-worried', 'tutorial-highlight');

                gameState.currentOrder = { texto: "Hola, he vuelto y ahora quiero una pizza entera (1/1).", objetivo: new Fraction(1,1), multi: false };
                document.getElementById('order-text').innerText = gameState.currentOrder.texto;
                
                document.getElementById('assembly-area').classList.add('tutorial-highlight');
                setChefDialog("Ana ha vuelto y ahora necesita una pizza entera (1/1).", true);
            }
            else if (step === 12) {
                document.getElementById('assembly-area').classList.add('tutorial-highlight');
                setChefDialog("Si te faltan rebanadas, puedes pedir más al almacén. Pero hay un límite: solo puedes pedir hasta 2 pizzas por ronda.", true);
            }
            else if (step === 13) {
                document.getElementById('assembly-area').classList.add('tutorial-highlight');
                setChefDialog("Además, no puedes acumular más de 3 pizzas del mismo tipo en cada sección del almacén. Es la regla para mantener la masa suficiente.", true);
            }
            else if (step === 14) {
                document.getElementById('assembly-area').classList.add('tutorial-highlight');
                document.getElementById('delivery-area').classList.add('tutorial-highlight');
                setChefDialog("Para corregir la caja, arrastra las rebanadas de vuelta a esta sección.", true);
            }
            else if (step === 15) {
                document.getElementById('assembly-area').classList.add('tutorial-highlight');
                document.getElementById('delivery-area').classList.add('tutorial-highlight');
                setChefDialog("También puedes usar Modificar Pedido para quitar las rebanadas una por una.", true);
            }
            else if (step === 16) {
                document.getElementById('assembly-area').classList.add('tutorial-highlight');
                setChefDialog("Pulsa Pedir para solicitar pizzas divididas en medios. Recuerda: solo puedes pedir hasta 2 pizzas por ronda y no más de 3 pizzas del mismo tipo en el almacén.", false);
                setTimeout(() => {
                    let btnReq2 = document.getElementById('btn-req-2');
                    if(btnReq2) {
                        btnReq2.parentElement.style.position = 'relative';
                        btnReq2.parentElement.insertAdjacentHTML('beforeend', '<div id="temp-magnifier" class="magnifying-glass">🔍</div>');
                        btnReq2.parentElement.insertAdjacentHTML('beforeend', '<div id="temp-cursor-guide" class="cursor-guide">👉</div>');
                        btnReq2.style.position = 'relative';
                        btnReq2.style.zIndex = '60';
                    }
                    blocker.classList.add('hidden'); 
                }, 100);
            }
            else if (step === 17) {
                document.getElementById('assembly-area').classList.add('tutorial-highlight');
                document.getElementById('delivery-area').classList.add('tutorial-highlight');
                setChefDialog("Arma y entrega el pedido. Necesitas dos medios para completar una pizza entera.", false);
            }
            else if (step === 18) {
                blocker.classList.remove('hidden');
                setChefDialog("Al terminar cada ronda verás un resumen de tus pedidos y puntos extra.", true);
            }
            else if (step === 19) {
                endTutorial();
            }
        }
