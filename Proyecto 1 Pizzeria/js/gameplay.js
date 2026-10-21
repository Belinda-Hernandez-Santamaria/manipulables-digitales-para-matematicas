function submitOrder() {
            if (gameState.isGameOver) return;
            
            let target = gameState.currentOrder.objetivo;
            let sum = new Fraction(0, 1);
            denomList.forEach(d => { if (gameState.box[d] > 0) sum = sum.add(new Fraction(gameState.box[d], d)); });
            let piecesUsed = denomList.reduce((acc, d) => acc + gameState.box[d], 0);

            let invBefore = { ...gameState.inv };
            denomList.forEach(d => { gameState.inv[d] -= gameState.box[d]; });

            let correct = sum.equals(target);
            let isExcess = !correct && sum.greaterThan(target);
            let combination = denomList.filter(d => gameState.box[d] > 0).map(d => `${gameState.box[d]} × 1/${d}`).join(' + ') || 'Sin rebanadas';

        
            if (gameState.tutorialActive) {
                if (gameState.tutorialStep === 5) {
                    if (correct) {
                        gameState.score += 50;
                        updateScoreDisplay();
                        advanceTutorialStep(); 
                    }
                    else {
                        showModal("¡Ups!", "El pedido de Ana era de 1/2. Intenta arrastrar la pizza que tiene marcada la fracción 1/2 a la caja.");
                        gameState.box = {2:0,3:0,4:0,6:0,8:0}; gameState.boxHistory = []; renderAssembly(); renderBox();
                    }
                    return;
                }
                if (gameState.tutorialStep === 17) {
                    if (correct) {
                        gameState.score += 50;
                        updateScoreDisplay();
                        advanceTutorialStep();
                    }
                    else {
                        showModal("¡Ups!", "Recuerda que una pizza entera se forma con dos medios (1/2 + 1/2).");
                        gameState.box = {2:0,3:0,4:0,6:0,8:0}; gameState.boxHistory = []; renderAssembly(); renderBox();
                    }
                    return;
                }
            }

            let idealCombo = suggestCombination(invBefore, target);
            let idealPieces = idealCombo ? denomList.reduce((acc, d) => acc + idealCombo[d], 0) : piecesUsed;
            let isOptimal = (correct && piecesUsed === idealPieces);

            const attempt = { outcome: correct ? 'correct' : isExcess ? 'excess' : 'missing', combination };
            gameState.currentOrderAttempts.push(attempt);

            if (correct) {
                stopTimer();
                let bonusTime = gameState.timerEnabled ? 10 : 0; 
                let bonusOpt = isOptimal ? 5 : 0; 
                let points = 50 + bonusTime + bonusOpt;
                gameState.score += points;
                updateScoreDisplay();
                saveCompletedOrder(true, points, isOptimal, piecesUsed, combination);
                showResult('correct', gameState.currentOrder.multi, bonusTime, bonusOpt);
            } else {
                stopTimer();
                gameState.lives--;
                denomList.forEach(d => { gameState.inv[d] += gameState.box[d]; });
                gameState.box = {2:0,3:0,4:0,6:0,8:0};
                gameState.boxHistory = [];
                renderAssembly();
                renderBox();
                renderLives();
                if (gameState.lives <= 0) saveCompletedOrder(false, 0, false, piecesUsed, null);
                showResult(isExcess ? 'excess' : 'missing', gameState.currentOrder.multi, 0, 0);
            }
        }

        function saveCompletedOrder(correct, points, optimized, piecesUsed, deliveryMethod, timeout = false) {
            const record = {
                round: gameState.round,
                orderNumber: gameState.currentOrderInRound,
                text: gameState.currentOrder.texto,
                correct,
                timeout,
                optimized,
                piecesUsed,
                deliveryMethod,
                points,
                errors: gameState.currentOrderAttempts.filter(attempt => attempt.outcome === 'excess' || attempt.outcome === 'missing').length,
                attempts: [...gameState.currentOrderAttempts]
            };
            gameState.history.push(record);
            gameState.roundHistory.push(record);
            gameState.currentOrderAttempts = [];
            renderOrderHistoryNotes();
        }

        function saveTimedOutOrder() {
            gameState.currentOrderAttempts.push({ outcome: 'timeout', combination: 'Tiempo agotado' });
            saveCompletedOrder(false, 0, false, 0, null, true);
        }

        function suggestCombination(inv, target) {
            let best = null; let minPieces = Infinity;
            function backtrack(index, currentSum, currentCombo, piecesCount) {
                if (currentSum.equals(target)) {
                    if (piecesCount < minPieces) { minPieces = piecesCount; best = { ...currentCombo }; }
                    return;
                }
                if (currentSum.greaterThan(target) || index >= denomList.length) return;
                let d = denomList[index];
                for (let count = 0; count <= inv[d]; count++) {
                    let val = new Fraction(count, d);
                    let nextSum = currentSum.add(val);
                    if (nextSum.greaterThan(target)) break;
                    currentCombo[d] = count;
                    backtrack(index + 1, nextSum, currentCombo, piecesCount + count);
                    currentCombo[d] = 0;
                }
            }
            backtrack(0, new Fraction(0,1), {2:0,3:0,4:0,6:0,8:0}, 0);
            return best;
        }

        function showResult(type, multi, bonusTime, bonusOpt) {
            const modal = document.getElementById('result-modal');
            const title = document.getElementById('result-title');
            const msg = document.getElementById('result-message');
            const actionButton = document.getElementById('btn-accept-result');
            document.getElementById('result-icon').innerText = type === 'correct' ? '😀' : (type === 'timeout' ? '⏰' : (type === 'excess' ? '😠' : '😡'));

            if (type === 'correct') {
                title.innerHTML = '¡Pedido entregado correctamente!'; title.className = 'text-xl font-bold mb-2 text-green-600';
                msg.innerHTML = pickRandom(multi ? MSG_CORRECT_MULTI : MSG_CORRECT_SINGLE);
                if (bonusTime > 0) msg.innerHTML += `<br><span class="text-sm text-blue-600 font-bold block mt-2">+${bonusTime} pts extra por tiempo.</span>`;
                if (bonusOpt > 0) msg.innerHTML += `<br><span class="text-sm text-green-600 font-bold block mt-1">🌟 +${bonusOpt} pts extra por pedido óptimo.</span>`;
            } else if (type === 'excess') {
                title.innerHTML = 'Pedido incorrecto: sobró pizza'; title.className = 'text-xl font-bold mb-2 text-red-600';
                msg.innerHTML = pickRandom(MSG_EXCESS);
            } else if (type === 'missing') {
                title.innerHTML = 'Pedido incorrecto: faltó pizza'; title.className = 'text-xl font-bold mb-2 text-red-600';
                msg.innerHTML = pickRandom(multi ? MSG_MISSING_MULTI : MSG_MISSING_SINGLE);
            } else if (type === 'timeout') {
                title.innerHTML = 'Se acabó el tiempo'; title.className = 'text-xl font-bold mb-2 text-red-600';
                msg.innerHTML = 'El cliente se cansó de esperar y se fue.';
            }

            if (type === 'excess' || type === 'missing') {
                actionButton.innerText = gameState.lives <= 0 ? 'Ver resultado final' : 'Reintentar pedido';
                actionButton.onclick = retryOrder;
            } else {
                actionButton.innerText = 'Aceptar';
                actionButton.onclick = acceptResult;
            }

            modal.classList.remove('hidden'); modal.classList.add('flex');
        }

        function retryOrder() {
            document.getElementById('result-modal').classList.add('hidden');
            document.getElementById('result-modal').classList.remove('flex');

            if (gameState.lives <= 0) {
                gameOver(false);
                return;
            }

            renderAssembly();
            renderBox();
            if (gameState.timerEnabled) startPlayingTimer();
        }

        function acceptResult() {
            document.getElementById('result-modal').classList.add('hidden');
            document.getElementById('result-modal').classList.remove('flex');

            if (gameState.lives <= 0) {
                gameOver(false);
                return;
            }
            gameState.currentOrderInRound++;
            nextOrder();
        }

        function endRoundSummary() {
            stopTimer();
            let correctas = gameState.roundHistory.filter(h => h.correct);
            let optimas = correctas.filter(h => h.optimized).length;
            let noOptimas = correctas.length - optimas;

            let html = `<div class="space-y-4 text-center text-slate-700">
                <p class="text-lg font-bold text-slate-800">Has completado la Ronda ${gameState.round}</p>
                <div class="grid grid-cols-2 gap-3 text-center">
                    <div class="bg-slate-50 border rounded-lg p-3"><div class="text-xs text-slate-500 uppercase">Puntos de esta ronda</div><div class="text-2xl font-bold text-green-600">${gameState.score - gameState.roundScoreStart}</div></div>
                    <div class="bg-slate-50 border rounded-lg p-3"><div class="text-xs text-slate-500 uppercase">Pedidos Correctos</div><div class="text-2xl font-bold text-blue-600">${correctas.length} / ${gameState.ordersPerRound}</div></div>
                </div>`;
            
            if (optimas > 0) {
                html += `<div class="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 font-bold text-sm">🌟 ¡Ganaste bonificaciones por ${optimas} pedido(s) óptimo(s)!</div>`;
            }
            if (noOptimas > 0) {
                html += `<div class="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 text-sm">💡 Sugerencia: En ${noOptimas} pedido(s) podrías haber usado menos rebanadas. ¡Intenta optimizar para ganar +5 puntos extras en cada uno!</div>`;
            }
            html += `</div>`;

            showModal("📋 Resumen de Ronda", html, () => { startRound(gameState.round + 1); }, null, "Siguiente Ronda ▶");
        }

        function gameOver(earlyExit = false) {
            gameState.isGameOver = true;
            let titleText = earlyExit ? "🏁 Juego terminado anticipadamente" : "💔 ¡Te quedaste sin vidas!";
            let html = `<div class="text-center text-slate-700 space-y-4"><p class="text-xl">La partida ha terminado. Llegaste a la Ronda ${gameState.round}.</p><p class="text-3xl font-bold text-slate-800">Puntuación: ${gameState.score}</p></div>`;
            showModal(titleText, html, () => {
                document.getElementById('game-view').classList.add('hidden');
                document.getElementById('main-menu-view').classList.remove('hidden');
            }, null, "Volver al Menú");
        }

        function promptEarlyExit() { showModal("Terminar Partida", "¿Estás seguro de que deseas terminar? Verás tu puntuación final.", () => gameOver(true), () => {}); }
