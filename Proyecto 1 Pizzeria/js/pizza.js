function renderLives() {
            const el = document.getElementById('lives-display');
            let html = '';
            for (let i = 0; i < gameState.maxLives; i++) {
                html += `<span class="life-heart text-xl ${i >= gameState.lives ? 'lost' : ''}">❤️</span>`;
            }
            el.innerHTML = html;
        }

        function updateScoreDisplay() { document.getElementById('score-value').innerText = gameState.score; }

        function prepareCanvas(canvas, cssSize) {
            const pixelRatio = Math.min(window.devicePixelRatio || 1, 3);
            canvas.width = Math.round(cssSize * pixelRatio);
            canvas.height = Math.round(cssSize * pixelRatio);
            const ctx = canvas.getContext('2d');
            ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            return ctx;
        }

        function drawSliceWithVerticalFraction(ctx, cx, cy, radius, startAngle, endAngle, d, color) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#334155';
            ctx.stroke();

            let midAngle = (startAngle + endAngle) / 2;
            let tx = cx + Math.cos(midAngle) * (radius * 0.6);
            let ty = cy + Math.sin(midAngle) * (radius * 0.6);
            
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#7c2d12';
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';
            ctx.font = '800 10px Inter, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.save();
            ctx.translate(tx, ty);
            ctx.rotate(90 * Math.PI / 180); 

            ctx.strokeText('1', 0, -3.5);
            ctx.fillText('1', 0, -3.5);
            ctx.strokeText(String(d), 0, 5.5);
            ctx.fillText(String(d), 0, 5.5);
            ctx.beginPath();
            ctx.moveTo(-3.5, 1);
            ctx.lineTo(3.5, 1);
            ctx.stroke();
            ctx.restore();
        }

        function drawAssemblyPizza(canvasId, denom, availableInThisPizza) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = prepareCanvas(canvas, 70);
            ctx.clearRect(0, 0, 70, 70);
            
            const cx = 35;
            const cy = 35;
            const r = 32;
            const sliceAngle = (2 * Math.PI) / denom;
            
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-90 * Math.PI / 180);
            ctx.translate(-cx, -cy);

            for (let i = 0; i < denom; i++) {
                if (i < availableInThisPizza) {
                    drawSliceWithVerticalFraction(ctx, cx, cy, r, i * sliceAngle, (i + 1) * sliceAngle, denom, CUSTOMER_COLOR);
                } else {
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.arc(cx, cy, r, i * sliceAngle, (i + 1) * sliceAngle);
                    ctx.closePath();
                    ctx.lineWidth = 1;
                    ctx.setLineDash([3, 3]);
                    ctx.strokeStyle = '#cbd5e1';
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }
            ctx.restore();
        }

        function renderAssembly() {
            const grid = document.getElementById('denom-grid');
            grid.innerHTML = '';
            denomList.forEach(d => {
                let available = gameState.inv[d] - gameState.box[d];
                let pizzasToDraw = Math.max(1, Math.ceil(available / d));
                
                let canvasesHtml = '';
                for(let i=0; i<pizzasToDraw; i++) {
                    canvasesHtml += `<canvas id="pizza-cvs-${d}-${i}" width="70" height="70" class="slice-token shrink-0 transition-transform hover:scale-105" role="img" aria-label="Pizza dividida en ${d} partes; cada rebanada representa 1/${d}" draggable="false" onclick="addToBox(${d})"></canvas>`;
                }

                grid.innerHTML += `
                    <div class="flex flex-col bg-white rounded-lg border border-slate-200 p-3 shadow-sm relative">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm font-bold text-slate-700">Pizzas de 1/${d}</span>
                            <span class="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-500">${available} rebanadas</span>
                        </div>
                        <p class="text-[11px] font-medium text-slate-500 mb-1">Cada rebanada representa <strong class="text-slate-700">1/${d}</strong>.</p>
                        <div class="flex gap-2 overflow-x-auto custom-scroll pb-2 mb-2 items-center min-h-[75px]">
                            ${canvasesHtml}
                        </div>
                        <div class="mt-auto flex gap-2">
                            <button onclick="addToBox(${d})" ${available <= 0 ? 'disabled' : ''} class="flex-1 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold text-xs py-2 rounded transition">
                                + Añadir
                            </button>
                            <button id="btn-req-${d}" onclick="requestMore(${d})" class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-2 rounded transition">
                                📦 Pedir
                            </button>
                        </div>
                    </div>
                `;
            });
            
            setTimeout(() => {
                denomList.forEach(d => {
                    let available = gameState.inv[d] - gameState.box[d];
                    let pizzasToDraw = Math.max(1, Math.ceil(available / d));
                    let slicesLeft = available;
                    for(let i=0; i<pizzasToDraw; i++) {
                        let slicesInThisPizza = Math.min(d, Math.max(0, slicesLeft));
                        drawAssemblyPizza(`pizza-cvs-${d}-${i}`, d, slicesInThisPizza);
                        slicesLeft -= slicesInThisPizza;
                    }
                });
            }, 10);
        }

        function renderBox() {
            const boxEl = document.getElementById('delivery-box');
            boxEl.innerHTML = '';
            
            let totalFraction = new Fraction(0, 1);
            let slicesToDraw = [];
            denomList.forEach(d => {
                for (let i = 0; i < gameState.box[d]; i++) {
                    slicesToDraw.push(d);
                    totalFraction = totalFraction.add(new Fraction(1, d));
                }
            });

            let numBoxes = Math.max(1, Math.ceil(totalFraction.toNumber()));
            
            let sliceIndex = 0;
            for(let b = 0; b < numBoxes; b++) {
                let boxDiv = document.createElement('div');
                boxDiv.className = 'pizza-box-bg w-[100px] h-[100px] shrink-0 shadow-sm rounded relative';
                
                let cvs = document.createElement('canvas');
                cvs.width = 90; cvs.height = 90;
                cvs.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing';
                
                cvs.setAttribute('draggable', 'false');
                cvs.setAttribute('aria-label', 'Pizza en la caja; arrastra hacia las rebanadas para quitar una pieza');
                
                boxDiv.appendChild(cvs);
                boxEl.appendChild(boxDiv);

                const cssSize = cvs.clientWidth || 90;
                const ctx = prepareCanvas(cvs, cssSize);
                const cx = cssSize / 2, cy = cssSize / 2, r = cssSize / 2 - 5;
                
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(-90 * Math.PI / 180);
                ctx.translate(-cx, -cy);
                
                let currentAngle = 0; 
                let boxSum = 0;

                while (sliceIndex < slicesToDraw.length && boxSum < 0.999) { 
                    let d = slicesToDraw[sliceIndex];
                    let fractionVal = 1 / d;
                    
                    if (boxSum + fractionVal > 1.001) break; 

                    let sliceRad = (2 * Math.PI) / d;
                    drawSliceWithVerticalFraction(ctx, cx, cy, r, currentAngle, currentAngle + sliceRad, d, CUSTOMER_COLOR);

                    currentAngle += sliceRad;
                    boxSum += fractionVal;
                    sliceIndex++;
                }
                ctx.restore();
            }
        }

        function dragStart(event, d) { event.dataTransfer.setData('text/plain', String(d)); }
        function dragStartUndo(event) { event.dataTransfer.setData('text/plain', 'undo'); }
        
        function dropHandler(event) {
            event.preventDefault();
            let data = event.dataTransfer.getData('text/plain');
            let d = parseInt(data, 10);
            if (!isNaN(d)) addToBox(d);
        }

        function dropAssemblyHandler(event) {
            event.preventDefault();
            let data = event.dataTransfer.getData('text/plain');
            if (data === 'undo') {
                undoLastBoxItem();
            }
        }

        function addToBox(d) {
            if (gameState.timerEnabled && gameState.timerMode !== 'PLAYING' && !gameState.tutorialActive) return;
            let available = gameState.inv[d] - gameState.box[d];
            if (available > 0) {
                gameState.box[d]++;
                gameState.boxHistory.push(d);
                renderAssembly();
                renderBox();
            }
        }

        function undoLastBoxItem() {
            if (gameState.boxHistory.length === 0) return;
            let d = gameState.boxHistory.pop();
            gameState.box[d]--;
            renderAssembly();
            renderBox();
        }

        function showChefNotice(message) {
            const container = document.getElementById('chef-dialog-container');
            const text = document.getElementById('chef-dialog-text');
            const nextBtn = document.getElementById('chef-btn-next');
            const skipBtn = document.getElementById('chef-btn-skip');

            if (!container || !text) return;
            container.classList.remove('hidden');
            text.innerHTML = message;
            nextBtn.style.display = 'none';
            skipBtn.style.display = 'none';

            clearTimeout(chefNoticeTimer);
            chefNoticeTimer = setTimeout(() => {
                if (gameState.tutorialActive) {
                    text.innerHTML = tutorialDialogHtml;
                    nextBtn.style.display = tutorialNextButtonVisible ? 'inline-block' : 'none';
                    return;
                }

                container.classList.add('hidden');
                text.innerHTML = '¡Hola! Te enseñaré cómo jugar.';
                nextBtn.style.display = 'inline-block';
                skipBtn.style.display = 'inline-block';
            }, 2600);
        }

        function requestMore(d) {
            const currentSlices = gameState.inv[d] || 0;

            if (currentSlices + d > gameState.maxSameTypePerSection * d) {
                showChefNotice(`No puedes tener más de ${gameState.maxSameTypePerSection} pizzas de 1/${d} en esta sección. No hay suficiente masa para hacer más.`);
                return;
            }

            if ((gameState.roundPizzaRequests || 0) >= gameState.maxRequestsPerRound) {
                showChefNotice(`No es posible pedir más pizza en esta ronda porque no hay suficiente masa para hacerlas. Solo puedes solicitar a lo más ${gameState.maxRequestsPerRound} pizzas de cualquier tipo por ronda.`);
                return;
            }

            gameState.inv[d] += d;
            gameState.roundPizzaRequests = (gameState.roundPizzaRequests || 0) + 1;
            renderAssembly();
            
            if (gameState.tutorialActive && gameState.tutorialStep === 16 && d === 2) {
                advanceTutorialStep(); 
            }
        }

        document.addEventListener('pointerdown', event => {
            if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
            const source = event.target.closest('canvas.slice-token, #delivery-box canvas');
            if (!source) return;

            activePizzaDrag = {
                source,
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                moved: false,
                denominator: source.classList.contains('slice-token')
                    ? Number(source.id.split('-')[2])
                    : null,
                originalPointerEvents: source.style.pointerEvents
            };
        });

        document.addEventListener('pointermove', event => {
            if (!activePizzaDrag || activePizzaDrag.pointerId !== event.pointerId) return;
            const distance = Math.hypot(event.clientX - activePizzaDrag.startX, event.clientY - activePizzaDrag.startY);
            if (!activePizzaDrag.moved && distance < 8) return;

            activePizzaDrag.moved = true;
            activePizzaDrag.source.classList.add('pizza-dragging');
            activePizzaDrag.source.style.pointerEvents = 'none';
        });

        document.addEventListener('pointerup', event => {
            if (!activePizzaDrag || activePizzaDrag.pointerId !== event.pointerId) return;
            const drag = activePizzaDrag;
            activePizzaDrag = null;

            if (drag.moved) {
                const dropTarget = document.elementFromPoint(event.clientX, event.clientY);
                const deliveryTarget = dropTarget && dropTarget.closest('#delivery-area');
                const assemblyTarget = dropTarget && dropTarget.closest('#assembly-area');

                if (drag.denominator && deliveryTarget) addToBox(drag.denominator);
                else if (drag.denominator === null && assemblyTarget) undoLastBoxItem();

                suppressPizzaClick = true;
                setTimeout(() => { suppressPizzaClick = false; }, 100);
            }

            drag.source.classList.remove('pizza-dragging');
            drag.source.style.pointerEvents = drag.originalPointerEvents;
        });

        document.addEventListener('pointercancel', event => {
            if (!activePizzaDrag || activePizzaDrag.pointerId !== event.pointerId) return;
            activePizzaDrag.source.classList.remove('pizza-dragging');
            activePizzaDrag.source.style.pointerEvents = activePizzaDrag.originalPointerEvents;
            activePizzaDrag = null;
        });

        document.addEventListener('click', event => {
            if (!suppressPizzaClick) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            suppressPizzaClick = false;
        }, true);
