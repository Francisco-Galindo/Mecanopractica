var mode;
var total_presses = 0;
var correct_presses = 0;
var incorrect_presses = 0;
var correct_spaces = 0;
var playing = false;
var playing_timer = 0;
var timer = 0;
var acc;
var wpm;
var terminado;
var space_pressed;
var fingers = [];
var finger_letters =    [['q', 'a', 'á', 'z', '1', '!'], 
                        ['w', 's', 'x', '2', '\"'], 
                        ['e', 'é', 'd', 'c', '3', '#'], 
                        ['r', 'f', 'v', '4', '$', 't', 'g', 'b'], 
                        ['u', 'ú', 'j', 'm', '7', '/', 'y', 'h', 'n'], 
                        ['i', 'í', 'k', ',', '(', '8'], 
                        ['o', 'ó', 'l', '.', '9', ')'], 
                        ['p', 'ñ', '-', '=', '0'],
                        [' ']];

var wpm_list = [];
var acc_list = [];
var spans = []
var loop;
var velocidad = 1;
var palabras_totales;
var study_mode;
var text_id = 'undefined';
var source;
var highscore = [];
var username;

var answer_options = [];
var correct_answer = null;
var leitner = null;
var answered_correctly = null;
var has_answered = false;


document.addEventListener('DOMContentLoaded', function() {
    mode = localStorage.getItem('mode');
    study_mode = localStorage.getItem('study-mode');

    if (mode.includes('Glosario')) {
        let button_message = 'Activar modo de repaso'
        if (study_mode == 'true') {
            button_message = 'Desactivar modo de repaso'
            document.getElementById('boton-estudio').innerHTML = `<button class="btn btn-dark" onclick="changeStudyMode(\'false\')">${button_message}</button>`
        } else {
            document.getElementById('boton-estudio').innerHTML = `<button class="btn btn-secondary" onclick="changeStudyMode(\'true\')">${button_message}</button>`
        }
        
    }


    drawFingerImage('hand-left', undefined);
    let mode_str = document.getElementById('mode-indicator');
    mode_str.innerHTML = `${mode}`;
    if (mode === 'Fácil') {
        document.getElementById('worst_finger_indicator_text').innerHTML = 'Dedo a practicar: ';
    }
    username = document.getElementById('username').innerHTML;

    spans = []
    total_presses = 0;
    correct_presses = 0;
    incorrect_presses = 0;
    correct_spaces = 0;
    playing = false;
    playing_timer = 0;
    timer = 0;
    terminado = 0;
    space_pressed = 0;
    fingers = [];
    fingers.length = 16;
    for (let i=0; i<16; ++i) fingers[i] = 0;
    wpm_list = [];
    acc_list = [];
    palabras_totales = 0;

    fetchWords(mode);




    loop = setInterval(actualizarJuego, 1000/velocidad)

    document.getElementById('question').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    document.getElementById('text-block').style.display = 'block';
    document.getElementById('form').style.display = 'block';
    document.getElementById("form").reset();


});


function actualizarJuego() {

    if (playing === true) {
        timer += (1/velocidad);
        playing_timer -= (1/velocidad);
        if (timer === 300 || playing_timer <= 0) {
            playing = false;
            results(false);
            stopGame(loop);
        }
        showVel();
    } else if (playing === false && timer > 0) {
        stopGame(loop); 
        if (isStudying()) {
            console.log('no es posible')
            question()
            
        } else {
            postResults();
        }

    }
}


function stopGame(loop) {
    clearInterval(loop);
}


// Haciendo fetch de las palabras que aparecerán en el juego
function fetchWords(mode) {
    if (mode.includes("Glosario")) {
        mode = mode.concat(`,${study_mode}`)

    }
    console.log(mode)
    fetch('/practica/' + mode)
    .then(response => response.json())
    .then(words => {
        console.log(words);
        const div = document.querySelector('#text');
        div.innerHTML = "";
        let contador = 0
        words.forEach(function(word) {

            let cortar = true
            if (contador === 0 && (mode.includes("Glosario") || mode.includes("Texto"))) {
                source =  JSON.parse(word).author;
                text_id = JSON.parse(word).id;
                console.log(text_id)
                if (study_mode === 'true') {
                    answer_options = JSON.parse(word).options
                    correct_answer = JSON.parse(word).answer
                    leitner = JSON.parse(word).leitner

                    if (JSON.parse(word).error) {
                        alert(JSON.parse(word).error)
                        changeStudyMode('false')
                    }

                }

            } else {
                let letters = JSON.stringify(word.word);

                if (letters === undefined) {
                    cortar = false
                    letters = JSON.parse(word).word;
                }
                let n = letters.length;
                let i = 1
                if (cortar === false) {
                    i = 0;
                    n ++;
                }
    
                for (let j = i; j < n-1; j++) {
                    const letter = document.createElement("span");
                    letter.innerHTML = `${letters.charAt(j)}`
                    letter.classList.add("unwritten");
                    div.append(letter);
                }
                const space = document.createElement("span");
                space.innerHTML = ` `;
                space.classList.add("unwritten");
                space.classList.add("space");
                palabras_totales ++;
                div.append(space);
            

            }
            contador ++;
        });
    })
    .then(function(){ 
        const div = document.querySelector('#text')
        spans = div.children
        spans[0].style.borderLeft = "0.3vw dotted #d5ced9"

        // Poniendo el título del Glosario en negritas
        if (mode.includes('Glosario') === true && mode.includes('false') === true) {
            let i = 0;
            while (spans[i].innerHTML !== '.' && spans[i].innerHTML !== ':') {
                spans[i].style.fontWeight ='bold';
                i++;
            } 
            let mode_str = document.getElementById('mode-indicator');
            mode_str.innerHTML += `</br><span style="font-size: 5vw; font-weight: bold ;">${spans[0].innerHTML}</span>`; 
        }

        drawNextFinger(spans);

    })
    .catch(error => {
        const div = document.querySelector('#text');
        div.innerHTML = "";
        console.log('Error: ', error);
    });
}


// Buscar alguno de los spans que se requiera usar. El primer parámetro permite saber cuál es la clase de ese span, el segundo es el desfase que se quiere tener, el tercero es para elegir si se quiere obtener el índice del elemento o el elemento en cuestión, por último se elige si se quiere obtener el primer o el último elemento con las características elegidas.
function searchSpan(span_class_one, span_class_two, offset, index_or_element, first_last) {

    if (span_class_two === undefined) {
        span_class_two = span_class_one;
    }
    const all_leters = spans.length;

    let i;
    if (first_last === "first") {
        i = 0;
        while (i < all_leters && !(spans[i].classList.contains(span_class_one) && spans[i].classList.contains(span_class_two)))  {
            i++;
        }
    } else {
        i = all_leters-1;
        while (i >= 0 && !(spans[i].classList.contains(span_class_one) && spans[i].classList.contains(span_class_two)))  {
            i--;
        }
    }
        
    let index = i + offset;


    if (index < 0) {
        index = 0;
    } else if (index >= all_leters || index < 0) {
        return null;
    }

    if (index_or_element === "index") {
        return index;
    }
    return spans[index];
}


// Se encarga de checar que la última palabra escrita sea correcta
function checkCorrectWord(mark) {
    var is_correct = true;

    var word = [];

    var first_letter = searchSpan("written", "space", 1, "index", "last");
    if (first_letter === 1) {
        first_letter = 0;
    } else if (first_letter === null) {
        return false;
    }

    const last_letter = searchSpan("unwritten", "space", -1, "index", "first");

    
    if ((mark === true)) {
        spans[last_letter + 1].className = "written space";
    }

    for (var i = first_letter; i <= last_letter; i++) {
        word.push(spans[i]);
    }
    word.forEach(function(span) {
        if (span.className !== "written correct") {
            if (mark === true && span.className == "unwritten") {
                span.className = "writtten";
            }
            is_correct = false;
        }
    });

    if ((mark === true)) {
        if (is_correct === false) {
            word.forEach(function(span) {
                span.style = "border-bottom: 2px solid #ee5d43;";
            });
        } else {
            correct_spaces ++;
            correct_presses ++;
        }
        document.getElementById("form").reset();
    }
    return is_correct;
}


// Borra la primer palabra que aparece en la pantalla de juego.
function deleteFirstWrittenWord() {
    var text = document.querySelector('#text');

    const first_space = searchSpan("space", undefined, 0, "index", "first");      

    if (typeof(first_space) !== 'number') {
        return;
    }

    for (let i = 0; i <= first_space; i++) {
        text.removeChild(text.childNodes[0]);
    }

}


// Esta pequeña función se encarga de identificar a qué dedo corresponde
function checkWhatFinger(key, finger_array) {

    if (finger_array === undefined) {
        finger_array = finger_letters;
    }

    let which_finger = -1;
    finger_array.forEach(function(finger) {
        if (finger.includes(key)) {

            which_finger = finger_array.indexOf(finger);
        }
    })
    return which_finger;
}


// Función que borra la última letra borrable
function deleteKey() {
    const key_to_delete = searchSpan("written", undefined, 0, "index", "last"); 


    // Cambiar la última letra escrita a no escrita
    if (!(spans[key_to_delete].innerHTML === " ")) {
        if (spans[key_to_delete].classList.contains("extra-letter")) {
            var text = document.querySelector('#text');
            text.removeChild(text.childNodes[key_to_delete]);

        } else {
            spans[key_to_delete].className = "unwritten";
        }
    }
}


// La función de escribir debe terminar la prueba cuando el tiempo acabe o (se escriba correctamente la última palabra, o se presione espacio en la última palabra), esto depende del modo en el que este el programa
function checkKeyPresses(key) {

    // Obtener el span con el cual comparar lo que ha sido tecleado
    const other_key = searchSpan("unwritten", undefined, 0, "index", "first");
    if (other_key !== null) {
        if (spans[other_key].className === "unwritten space") {
            var text = document.querySelector('#text');
            var letter = document.createElement("span");
            letter.innerHTML = `<span>${key}</span>`;
            letter.classList.add("extra-letter");
            letter.classList.add("written");

            text.insertBefore(letter, text.childNodes[other_key]);
            incorrect_presses ++;
        }
        // Si coincide el contenido del span con la tecla oprimida, marcar el span como correcto
        else {
            var index_finger = checkWhatFinger(spans[other_key].innerHTML, finger_letters);
            if (key === spans[other_key].innerHTML) {
                spans[other_key].className = "written correct";
                correct_presses ++;
                fingers[2*index_finger] ++;
            } else {
                spans[other_key].className = "written incorrect";
                incorrect_presses ++;
                fingers[2*index_finger + 1] ++;
            }
        }
    }
    // Haciendo un chequeo de la palabra automaticamente si se trata de la ultima palabra del juego 
    if (searchSpan("unwritten", undefined, 1, "element", "first") === null && checkCorrectWord(false)) {
        checkCorrectWord(true);
        playing = false;    
        terminado = 1;
    }
}


// Esta función es llamada cuando se presiona una tecla en el modo de practica
// Se ocupa de tomar la decision de llamar la función correspondiente dependiendo de si fue presionado el Backspace u otra tecla
function keyPressed(event) {
    const key = event.key;
    if (!(event.ctrlKey || key === "Shift" || event.altKey || event.isComposing || key === "Dead" || key === "OS")) {
        playing = true;
        playing_timer = 15;

        var cursor = searchSpan("unwritten", undefined, 0, "index", "first");
        var cursor_minus = searchSpan("unwritten", undefined, -1, "index", "first");
        if (spans[cursor_minus] !== undefined && spans[cursor_minus].className === "unwritten space") {
            cursor --;
        }
        
        if (spans[cursor] !== undefined) {
            spans[cursor].style.setProperty('border-left', 'initial');
        }

        if (key == "Backspace") {
            deleteKey();

        } else if (key === " ") {
            if (!(study_mode === 'true' && spans[0].innerHTML === 'N' && spans[29].innerHTML === '1')) {
                space_pressed ++;

                if(!checkCorrectWord(true) && searchSpan("unwritten", undefined, 1, "element", "first") === null) {

                    playing = false;
                    terminado = 1;
                }
                if (space_pressed > 1) {
                    deleteFirstWrittenWord();
                }
                total_presses ++;
                
                document.getElementById("word-counter").innerHTML = `${space_pressed} / ${palabras_totales} palabras escritas`
            }
            

        } else {
            checkKeyPresses(key);
            if (space_pressed === 0) {
                document.getElementById("word-counter").innerHTML = `0 / ${palabras_totales} palabras escritas`
            }
            total_presses ++;
        }

        cursor = searchSpan("unwritten", undefined, 0, "index", "first");
        cursor_minus = searchSpan("unwritten", undefined, -1, "index", "first");
        if (spans[cursor_minus] !== undefined && spans[cursor_minus].className === "unwritten space") {
            cursor --;
        }
        if (spans[cursor] !== undefined) {
        spans[cursor].style.borderLeft = "0.3vw dotted #d5ced9";
        }

        drawNextFinger(spans);
    }  
}


// Calculando la velocidad y precisión de escritura, añadiendo los resultados a la lista que será usada en el histograma al final de una partida
function calcVel(){
    wpm = Math.trunc(((correct_spaces / timer) * 60) * 100) / 100;
    acc = Math.trunc(((correct_presses / total_presses) * 100) * 100) / 100;
    wpm_list.push(wpm);
    acc_list.push(acc);
}

function showVel(){
    calcVel();
    const div = document.querySelector('#left_info');
    div.innerHTML = `acc: ${Math.round(acc)}%</br> wpm: ${Math.round(wpm)}`;
    div.innerHTML += `</br>Modo: ${mode}`;

}

function results(valid) {
    playing = false;

    let mode_str = document.getElementById('mode-indicator');
    mode_str.innerHTML = `<span style="font-size: 2vw">Modo ${mode}</span>`;

    const div = document.querySelector('#grafica-resultados');
    div.innerHTML = `<span style="font-size: 2vw;">Resultados</span>\n`;
    if (valid === false) {
        div.innerHTML += `<span style="font-size: 1vw; color: red;">Esta partida no es válida,\n porque tu presisión fue menor al 75% o pasaste demasiado tiempo sin escribir</span>\n`;
    }
    if (wpm == highscore[0] && highscore[1] == acc) {
        div.innerHTML += `<span style="font-size: 2vw; color: var(--success);">¡Nuevo record!</span>\n`
    }
    div.innerHTML += `<span style="font-size: 1.5vw;"> wpm: ${wpm}  </span>`;
    div.innerHTML += `<span style="font-size: 1.5vw;">acc: ${acc}%</span>\n`;
    div.innerHTML += `<div id="chart"><canvas id="histo"></canvas></div>`;
    if (mode.includes("Glosario") || mode.includes("Texto")) {
        div.innerHTML += `<span style="font-size: 0.75vw;">Fuente del texto: ${source}</span>`;

    }

    document.getElementById('question').style.display = 'none';
    document.querySelector('#text-block').style.display = 'none';
    document.querySelector('#form').style.display = 'none';
    document.querySelector('#results').style.display = 'block';
    crearTabla(wpm_list, acc_list, wpm_list.length);
}


// Se encarga de obtener la cookie solicitada
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function getSessions(func, value) {
    fetch(`/sessions/${mode}/`)
    .then(response => response.json())
    .then(sessions => {
        const div = document.querySelector('#left');

        div.innerHTML = `<h6>Tablero modo ${mode}</h6>`;
        var table = document.createElement("TABLE");
        table.innerHTML = `<tr><td>Usuario</td><td>WPM</td><td>ACC</td></tr>`;
        

        let i = 0;
        sessions.forEach(function(top) {
            if (i === 0 && username === JSON.parse(top).user) {
                highscore[0] = JSON.parse(top).wpm;
                highscore[1] = JSON.parse(top).acc;
            }
            table.innerHTML += `<tr><td>${JSON.parse(top).user}</td><td>${JSON.parse(top).wpm}</td><td>${JSON.parse(top).acc}%</td></tr>`;
            i++;
        })
        div.append(table);

        func(value)
    });
}

function postResults() {

    
    if (!(acc >= 75 && wpm <= 300 && terminado === 1 && !isStudying())) {
        if (isStudying()) {
            submittingResults()
        } else {
            getSessions(results, false)
        }
        
        
    } else {
        submittingResults()    
    }
    
}

function submittingResults() {
    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        `/sessions/${mode}/`,
        {headers: {'X-CSRFToken': csrftoken}}
    );

    var sent_fingers = '';
    fingers.forEach(function(finger) {
        sent_fingers += `${finger},`
    })

    console.log(sent_fingers);
    fetch(request, {
        method: 'POST',
        mode: 'same-origin',
        body: JSON.stringify({
            mode: mode,
            wpm: wpm,
            acc: acc,
            time: timer,
            fingers: sent_fingers,
            text_id: text_id,
            answered_correctly: answered_correctly,
            leitner: leitner
        })
    })
    .then(function(response) {
        console.log(response)
        getSessions(results, true)})
    .catch(error => {
        console.log(error);
    });
}

function question() {
    console.log('wtf')
    document.getElementById('question').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    document.getElementById('text-block').style.display = 'none';
    document.getElementById('form').style.display = 'none';

}

function isStudying() {
    return mode.includes('Glosario') && study_mode === 'true';
}

function questionEvent(event) {
    event.preventDefault();
    if (!(event.ctrlKey || event.key === "Shift" || event.altKey || event.isComposing || event.key === "Dead" || event.key === "OS")) {
        console.log(event.keyCode)
        if (event.keyCode === 13) {
            let form_value = document.getElementById('question-input').value;
            console.log(`Frm: ${form_value}`)
            checkAnswer(form_value);
        } else if (event.keyCode === 8) {   
            
            document.getElementById('question-input').value = document.getElementById('question-input').value.slice(0, -1)
    
        } else {
            document.getElementById('question-input').value += event.key
        }
    }
}

function checkAnswer(answer) {
    if (answer === correct_answer) {
        answered_correctly = true;
    } else {
        answered_correctly = false;
    }
    has_answered = true;
    console.log(correct_answer)
    console.log(answered_correctly, leitner)
    postResults();
}