function initGame(withTimer) {
            // Ya no se usa directamente, ahora se usa startTutorialForNewGame
            // Mantenemos por compatibilidad, pero redirigimos
            startTutorialForNewGame(withTimer);
        }

        function showCurtain(textStr, callback) {
            const curtain = document.getElementById('round-curtain');
            const text = document.getElementById('curtain-text');
            text.innerHTML = textStr;
            curtain.classList.add('curtain-closed');
            
            setTimeout(() => {
                curtain.classList.remove('curtain-closed');
                if (callback) {
                    setTimeout(callback, 500); 
                }
            }, 2500);
        }

        function startRound(roundNum) {
            gameState.round = roundNum;
            gameState.currentOrderInRound = 1;
            gameState.roundHistory = [];
            gameState.roundScoreStart = gameState.score;
            showCurtain(`Ronda ${roundNum}`, () => {
                nextOrder();
            });
        }

        function nextOrder() {
            if (gameState.currentOrderInRound > gameState.ordersPerRound) {
                endRoundSummary();
                return;
            }
            
            gameState.box = {2:0,3:0,4:0,6:0,8:0};
            gameState.boxHistory = [];
            gameState.currentOrderAttempts = [];
            gameState.currentOrder = CardGenerator.generate();

            document.getElementById('round-info').innerText = `Ronda ${gameState.round} - Pedido ${gameState.currentOrderInRound} de ${gameState.ordersPerRound}`;
            document.getElementById('order-text').innerText = gameState.currentOrder.texto;
            document.getElementById('customer-emoji').innerText = gameState.currentOrder.multi ? '🧑‍🤝‍🧑' : '🧑';
            document.getElementById('customer-name').classList.add('hidden');

            renderAssembly();
            renderBox();

            if (gameState.timerEnabled) startPlayingTimer();
        }

        function escapeHtml(text) {
            return String(text).replace(/[&<>"']/g, character => ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
            }[character]));
        }

        function showOrderHistory() {
            const records = gameState.history;
            if (!records.length) {
                showModal('📌 Historial de pedidos', '<p class="text-center">Todavía no hay pedidos completados.</p>');
                return;
            }

            const rounds = [...new Set(records.map(record => record.round))].sort((a, b) => b - a);
            let html = '<div class="order-history-list">';
            rounds.forEach(round => {
                const roundRecords = records.filter(record => record.round === round);
                const roundPoints = roundRecords.reduce((total, record) => total + record.points, 0);
                html += `<section class="history-round"><h3>Ronda ${round}<span>${roundPoints} pts</span></h3><div class="history-order-grid">`;
                roundRecords.forEach(record => {
                    const attempts = record.attempts.map((attempt, index) => {
                        const result = attempt.outcome === 'correct' ? 'Correcto' : attempt.outcome === 'timeout' ? 'Se agotó el tiempo' : attempt.outcome === 'excess' ? 'Sobró pizza' : 'Faltó pizza';
                        return `<li>Intento ${index + 1}: ${result} · ${escapeHtml(attempt.combination)}</li>`;
                    }).join('');
                    const delivery = record.correct ? `<p><strong>Entrega:</strong> ${escapeHtml(record.deliveryMethod)}</p>` : '<p><strong>Entrega:</strong> pedido no completado</p>';
                    const status = record.correct ? 'Pedido entregado' : record.timeout ? 'No completado por tiempo' : 'No completado';
                    html += `<article class="history-order-note"><h4>Pedido ${record.orderNumber}<span>${record.points} pts</span></h4><p>${escapeHtml(record.text)}</p><p class="history-status">${status}${record.errors ? ` · ${record.errors} error(es)` : ''}</p>${delivery}<details><summary>Ver intentos (${record.attempts.length})</summary><ul>${attempts}</ul></details></article>`;
                });
                html += '</div></section>';
            });
            html += '</div>';
            showModal('📌 Historial de pedidos', html);
        }

        function renderOrderHistoryNotes() {
            const container = document.getElementById('order-history-notes');
            const count = document.getElementById('order-history-count');
            if (!container || !count) return;

            count.innerText = gameState.history.length;
            if (!gameState.history.length) {
                container.innerHTML = '<p class="text-xs text-slate-500">Las notas de pedidos completados aparecerán aquí.</p>';
                return;
            }

            const rounds = [...new Set(gameState.history.map(record => record.round))].sort((a, b) => b - a);
            container.innerHTML = rounds.map(round => {
                const records = gameState.history.filter(record => record.round === round);
                const points = records.reduce((total, record) => total + record.points, 0);
                const notes = records.map(record => {
                    const status = record.correct ? 'Entregado' : record.timeout ? 'Tiempo agotado' : 'No completado';
                    const detail = record.correct ? record.deliveryMethod : (record.attempts.length ? `${record.errors} error(es)` : status);
                    return `<article class="history-mini-note"><h4>Pedido ${record.orderNumber}<span>${record.points} pts</span></h4><p>${escapeHtml(record.text)}</p><p class="history-mini-result">${status}${detail && record.correct ? ` · ${escapeHtml(detail)}` : ''}${!record.correct && record.errors ? ` · ${record.errors} error(es)` : ''}</p></article>`;
                }).join('');
                return `<section class="history-mini-round"><h3>Ronda ${round}<span>${points} pts</span></h3>${notes}</section>`;
            }).join('');
        }
