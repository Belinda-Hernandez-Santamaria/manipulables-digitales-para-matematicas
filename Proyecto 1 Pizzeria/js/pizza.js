function renderLives() {
            const el = document.getElementById('lives-display');
            let html = '';
            for (let i = 0; i < gameState.maxLives; i++) {
                html += `<span class="life-heart text-xl ${i >= gameState.lives ? 'lost' : ''}">❤️</span>`;
            }
            el.innerHTML = html;
        }

        function updateScoreDisplay() { document.getElementById('score-value').innerText = gameState.score; }

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
            
            ctx.fillStyle = 'white';
            ctx.font = 'bold 11px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.save();
            ctx.translate(tx, ty);
            ctx.rotate(90 * Math.PI / 180); 
            
            ctx.fillText("1", 0, -6);
            ctx.fillText(d.toString(), 0, 6);
            ctx.fillRect(-4, 0, 8, 1.5); 
            ctx.restore();
        }

        function drawAssemblyPizza(canvasId, denom, availableInThisPizza) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
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
                    canvasesHtml += `<canvas id="pizza-cvs-${d}-${i}" width="70" height="70" class="slice-token shrink-0 transition-transform hover:scale-105" draggable="true" ondragstart="dragStart(event, ${d})" onclick="addToBox(${d})"></canvas>`;
                }

                grid.innerHTML += `
                    <div class="flex flex-col bg-white rounded-lg border border-slate-200 p-3 shadow-sm relative">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm font-bold text-slate-700">Pizzas de 1/${d}</span>
                            <span class="text-xs font-semibold px-2 py-1 bg-slate-100 rounded text-slate-500">${available} rebanadas</span>
                        </div>
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
                
                // Hacer el canvas en la caja arrastrable para remover (undo)
                cvs.setAttribute('draggable', 'true');
                cvs.setAttribute('ondragstart', 'dragStartUndo(event)');
                
                boxDiv.appendChild(cvs);
                boxEl.appendChild(boxDiv);

                const ctx = cvs.getContext('2d');
                const cx = 45, cy = 45, r = 40;
                
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

        function requestMore(d) {
            gameState.inv[d] += d;
            renderAssembly();
            
            if (gameState.tutorialActive && gameState.tutorialStep === 16 && d === 2) {
                advanceTutorialStep(); 
            }
        }
