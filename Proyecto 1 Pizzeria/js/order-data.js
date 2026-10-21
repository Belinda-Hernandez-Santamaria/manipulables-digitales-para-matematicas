const denomList = [2, 3, 4, 6, 8];
        const initialInventory = { 2: 2, 3: 3, 4: 4, 6: 6, 8: 8 };
        const CUSTOMER_COLOR = "#f97316";

        const NAMES = ["Diego", "Carlos", "Mateo", "Luis", "Andrés", "Fernando", "Emilio", "Javier", "Rodrigo", "Sebastián", "María", "Sofía", "Valentina", "Camila", "Daniela", "Lucía", "Paola", "Renata", "Ximena", "Gabriela", "Roger", "Beli"];
        function pickNames(count) {
            let pool = [...NAMES];
            let chosen = [];
            for (let i = 0; i < count; i++) {
                let idx = Math.floor(Math.random() * pool.length);
                chosen.push(pool[idx]);
                pool.splice(idx, 1);
            }
            return chosen;
        }

        const fractionPool = [
            {f: new Fraction(1,2), t:"un medio", s:"1/2"}, {f: new Fraction(1,3), t:"un tercio", s:"1/3"},
            {f: new Fraction(2,3), t:"dos tercios", s:"2/3"}, {f: new Fraction(1,4), t:"un cuarto", s:"1/4"},
            {f: new Fraction(3,4), t:"tres cuartos", s:"3/4"}, {f: new Fraction(1,6), t:"un sexto", s:"1/6"},
            {f: new Fraction(5,6), t:"cinco sextos", s:"5/6"}, {f: new Fraction(1,8), t:"un octavo", s:"1/8"},
            {f: new Fraction(3,8), t:"tres octavos", s:"3/8"}, {f: new Fraction(5,8), t:"cinco octavos", s:"5/8"},
            {f: new Fraction(7,8), t:"siete octavos", s:"7/8"}
        ];
        function getRandomFraction() { return fractionPool[Math.floor(Math.random() * fractionPool.length)]; }
        function getRandomFormat(fracObj) { return Math.random() < 0.5 ? fracObj.t : fracObj.s; }

        const additionTemplates = [
            { names:2, fracs:2, multi:true,  text:(n,f)=>`${n[0]} solicita ${f[0]} de pizza y ${n[1]} solicita ${f[1]} de pizza. Entrega la cantidad de pizza que necesitan.`, target:(fr)=>fr[0].add(fr[1]) },
            { names:1, fracs:2, multi:false, text:(n,f)=>`${n[0]} solicita ${f[0]} de pizza para su comida y ${f[1]} para compartir. Entrega el total de pizza solicitado.`, target:(fr)=>fr[0].add(fr[1]) },
            { names:0, fracs:2, multi:true,  text:(n,f)=>`La escuela solicita ${f[0]} de pizza para los estudiantes y ${f[1]} para los profesores. Entrega el total de pizza para la escuela.`, target:(fr)=>fr[0].add(fr[1]) }
        ];

        const subtractionTemplates = [
            { names:1, fracs:2, multi:false, text:(n,f)=>`${n[0]} solicita ${f[0]} de pizza, pero cancela ${f[1]} de su pedido. Entrega la cantidad de pizza que aún solicita.`, target:(fr)=>fr[0].sub(fr[1]) },
            { names:1, fracs:2, multi:false, text:(n,f)=>`La familia de ${n[0]} solicita ${f[0]} de pizza, pero reduce su pedido en ${f[1]}. Entrega la cantidad de pizza que necesita la familia.`, target:(fr)=>fr[0].sub(fr[1]) },
            { names:2, fracs:2, multi:true,  text:(n,f)=>`${n[0]} y ${n[1]} solicitan ${f[0]} de pizza, pero ${n[1]} cancela ${f[1]} del pedido. Entrega la cantidad de pizza que aún solicitan.`, target:(fr)=>fr[0].sub(fr[1]) }
        ];

        const validDenoms = [1, 2, 3, 4, 6, 8];

        class CardGenerator {
            static generate() {
                for (let i = 0; i < 100; i++) {
                    let isAddition = Math.random() < 0.5;
                    let templates = isAddition ? additionTemplates : subtractionTemplates;
                    let tmpl = templates[Math.floor(Math.random() * templates.length)];
                    let fracObjs = [];
                    for (let k = 0; k < tmpl.fracs; k++) fracObjs.push(getRandomFraction());

                    if (!isAddition && !fracObjs[0].f.greaterThan(fracObjs[1].f)) continue;

                    let target;
                    try { target = tmpl.target(fracObjs.map(o => o.f)); } catch (e) { continue; }

                    if (target.n <= 0 || !validDenoms.includes(target.d) || target.toNumber() > 2.5) continue;

                    let names = pickNames(tmpl.names);
                    let fracDisplays = fracObjs.map(o => getRandomFormat(o));
                    return { texto: tmpl.text(names, fracDisplays), objetivo: target, multi: tmpl.multi, name: names[0] };
                }
                let n = pickNames(1);
                return { texto: `${n[0]} solicita un medio de pizza. Entrega la cantidad que solicita.`, objetivo: new Fraction(1,2), multi:false, name: n[0] };
            }
        }

        const MSG_CORRECT_SINGLE = ["el cliente se fue satisfecho porque le entregaste lo que pidió.", "el cliente se fue muy feliz porque le entregaste lo que solicitó."];
        const MSG_CORRECT_MULTI = ["los clientes se fueron muy satisfechos porque les entregaste lo que solicitaron.", "los clientes se fueron muy felices porque les entregaste lo que pidieron."];
        const MSG_EXCESS = ["Gracias por el regalo amigo, pero si sigues así te quedarás sin pizza para los demás en el futuro.", "Ahora ¿qué hago con esta pizza extra?"];
        const MSG_MISSING_SINGLE = ["Esto no es lo que pedí amigo pizzero.", "Me faltó pizza en mi pedido, ahora ¿dónde consigo el faltante?"];
        const MSG_MISSING_MULTI = ["Esto no es lo que pedimos amigo pizzero.", "Nos faltó pizza en nuestro pedido, ahora ¿dónde conseguimos el faltante?"];
        function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
