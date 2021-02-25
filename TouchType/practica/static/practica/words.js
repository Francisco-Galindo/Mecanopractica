var mode;
var total_presses = 0;
var correct_presses = 0;
var incorrect_presses = 0;
var raw_spaces = 0;
var correct_spaces = 0;
var playing = false;
var playing_timer = 0;
var timer = 0;
var acc;
var wpm;
var terminado;
var fingers = [];
var finger_letters = [['q', 'a', 'á', 'z', '1', '!'], 
                        ['w', 's', 'x', '2', '\"'], 
                        ['e', 'é', 'd', 'c', '3', '#'], 
                        ['r', 'f', 'v', '4', '$', 't', 'g', 'b'], 
                        ['u', 'ú', 'j', 'm', '7', '/', 'y', 'h', 'n'], 
                        ['i', 'í', 'k', ',', '(', '8'], 
                        ['o', 'ó', 'l', '.', '9', ')'], 
                        ['p', 'ñ', '-', '=', '0']];

var wpm_list = [];
var acc_list = [];
var spans = []

document.addEventListener('DOMContentLoaded', page());

function page() {
    total_presses = 0;
    correct_presses = 0;
    incorrect_presses = 0;
    raw_spaces = 0;
    correct_spaces = 0;
    playing = false;
    playing_timer = 0;
    timer = 0;
    terminado = 0;
    fingers = [];
    fingers.length = 16;
    for (let i=0; i<16; ++i) fingers[i] = 0;
    wpm_list = [];
    acc_list = [];
    
    var lol = `lol `;
    lol += 'ahora';
    console.log(lol);

    mode = localStorage.getItem('mode');
    fetchWords(mode);

    loop = setInterval(function(){
        if (playing === true) {
            timer += 0.5;
            playing_timer -= 0.5;
            console.log(playing_timer)
            if (timer === 60 || playing_timer <= 0) {
                playing = false;
                results();
                clearInterval(loop);
            }
            showVel();
            //console.log(correct_spaces, timer, raw_wpm, acc, playing_timer);
        } else if (playing === false && timer > 0){
            clearInterval(loop); 
            postResults();
   
        }
    }, 500)

    document.querySelector('#results').style.display = 'none';
    document.querySelector('#text').style.display = 'block';
    document.querySelector('#form').style.display = 'block';
}

function refreshPage(){
    window.location.reload();
} 

function fetchWords(words) {

    fetch('/practica/' + words)
    .then(response => response.json())
    .then(words => {
        console.log(words);
        const div = document.querySelector('#text');
        div.innerHTML = "";
        words.forEach(function(word) {
            const letters = JSON.stringify(word.word);
            const n = letters.length;
            for(let i = 1; i < n-1; i++) {
                const letter = document.createElement("span");
                letter.innerHTML = `${letters.charAt(i)}`
                letter.classList.add("unwritten");
                div.append(letter);
            }
            const space = document.createElement("span");
            space.innerHTML = ` `;
            space.classList.add("unwritten");
            space.classList.add("space");
            div.append(space);
        });
    })
    .then(function(){ 
        const div = document.querySelector('#text')
        spans = div.children
        spans[0].style.borderLeft = "3px dotted #d5ced9"

    })
    .catch(error => {
        const div = document.querySelector('#text');
        div.innerHTML = "";
        console.log('Error: ', error);
    });
}

function searchSpan(span_class, offset, index_or_element, first_last) {

    const all_leters = spans.length - 1;

    let i = 0;
    if (first_last === "first") {
        while (i < all_leters && spans[i].className != span_class)  {
            i++;
        }
    } else {
        for (let j = 0; j < all_leters; j++)
        {
            if (spans[j].className == span_class) {
                i = j;
            }
        }
    }
        
    var index;
    index = i + offset;
    if (index < 0) {
        index = 0;
    } else if (index >= all_leters) {
        return null;
    }

    if (index_or_element === "index") {
        return index;
    }
    return spans[index];
}


function checkCorrectWord(mark) {
    var is_correct = true;

    var word = [];

    var first_letter = searchSpan("written space", 1, "index", "last");
    if (first_letter === 1) {
        first_letter = 0;
    }
    const last_letter = searchSpan("unwritten space", -1, "index", "first");
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
    }

    return is_correct;
}
function checkWhatFinger(key, finger_array) {
    var which_finger = -1;
    finger_array.forEach(function(finger) {
        if (finger.includes(key)) {
            //console.log(finger);
            which_finger = finger_array.indexOf(finger);
        }
    })
    return which_finger;
}
function deleteKey() {
    const key_to_delete = searchSpan("unwritten", -1, "element", "first"); 
    const previous_key_to_delete = searchSpan("unwritten", -2, "element", "first");
    console.log(key_to_delete, previous_key_to_delete);

    if (key_to_delete.className !== "written space" && key_to_delete.className !== "unwritten space") {
        key_to_delete.className = "unwritten";

    } else if (key_to_delete.className === "unwritten space"){
        // Para cuando se borra la última letra de una palabra
        if (previous_key_to_delete.className === "extra-letter") {
            var text = document.querySelector('#text');
            const previous_other_key_index = searchSpan("unwritten", -2, "index", "first");
            text.removeChild(text.childNodes[previous_other_key_index]);
        } else {
        previous_key_to_delete.className = "unwritten";
        }
    }
}

// La función de escribir debe terminar la prueba cuando el tiempo acabe o (se escriba correctamente la última palabra, o se presione espacio en la última palabra), esto depende del modo en el que este el programa
function checkKeyPresses(key) {

    // Obtener el span con el cual comparar lo que ha sido tecleado
    const other_key = searchSpan("unwritten", 0, "element", "first");
    if (other_key !== null) {
        const previous_other_key = searchSpan("unwritten", -1, "element", "first");

        
        if (previous_other_key.innerHTML === " " && previous_other_key.className === "unwritten space") {
            const previous_other_key_index = searchSpan("unwritten", -1, "index", "first");
            var text = document.querySelector('#text');
            var letter = document.createElement("span");
            letter.innerHTML = `<span>${key}</span>`;
            letter.classList.add("extra-letter");

            text.insertBefore(letter, text.childNodes[previous_other_key_index]);
            incorrect_presses ++;
        }
        // Si coincide el contenido del span con la tecla oprimida, marcar el span como correct0
        else {
            var index_finger = checkWhatFinger(other_key.innerHTML, finger_letters);
            if (key === other_key.innerHTML) {
                other_key.className = "written correct";
                correct_presses ++;
                fingers[2*index_finger] ++;
            } else {
                other_key.className = "written incorrect";
                incorrect_presses ++;
                fingers[2*index_finger + 1] ++;
            }
        }
    }
    // Haciendo un chequeo de la palabra automaticamente si se trata de la ultima palabra del juego 
    if (searchSpan("unwritten", 1, "element", "first") === null && checkCorrectWord(false)) {
        checkCorrectWord(true);
        playing = false;    
        terminado = 1;
    }
}


// Esta función es llamada cuando se presiona una tecla en el modo de practica
//Se ocupa de tomar la decision de llamar la función correspondiente dependiendo de si fue presionado el Backspace u otra tecla
function keyPressed(event) {
    const key = event.key;
    if (!(event.ctrlKey || event.shiftKey || event.altKey || event.isComposing || key === "Dead" || key === "OS")) {
        playing = true;
        playing_timer = 15;

        var cursor = searchSpan("unwritten", 0, "index", "first");
        var cursor_minus = searchSpan("unwritten", -1, "index", "first");
        if (spans[cursor_minus].className === "unwritten space") {
            cursor --;
        }
        if (spans[cursor] !== undefined) {
            spans[cursor].style.setProperty('border-left', 'initial');
        }
        if (key == "Backspace") {
            deleteKey();
        } else if (key === " ") {
            var form = document.querySelector("#form")
            form.value = ""
            if(!checkCorrectWord(true) && searchSpan("unwritten", 0, "element", "first") === null) {
                playing = false;
                terminado = 1;
            }
            total_presses ++;
        } else {
            checkKeyPresses(key);
            total_presses ++;
        }
        cursor = searchSpan("unwritten", 0, "index", "first");
        cursor_minus = searchSpan("unwritten", -1, "index", "first");
        if (spans[cursor_minus].className === "unwritten space") {
            cursor --;
        }
        if (spans[cursor] !== undefined) {
        spans[cursor].style.borderLeft = "3px dotted #d5ced9";
        }
    }  
}

// asd 
function calcVel(){
    wpm = Math.trunc(((correct_spaces / timer) * 60) * 100) / 100;
    acc = Math.trunc(((correct_presses / total_presses) * 100) * 100) / 100;
    wpm_list.push(wpm);
    acc_list.push(acc);
}

function showVel(){
    calcVel();
    const div = document.querySelector('#left_info');
    div.innerHTML = `acc: ${Math.round(acc)}%, wpm: ${Math.round(wpm)}`;

}

function results(valid) {
    playing = false;
    console.log(acc_list, wpm_list);
    document.querySelector('#text').style.display = 'none';
    document.querySelector('#form').style.display = 'none';
    const div = document.querySelector('#results');
    div.innerHTML = `Resultados`;
    if (valid === false) {
        div.innerHTML += `</br> <span style="font-size: 35px; color: red;">Esta partida no es válida</span>`;
    }
    div.innerHTML += `</br> <span style="font-size: 75px;"> wpm: ${wpm}</span>`;
    div.innerHTML += `</br>acc: ${acc}%`;
    div.innerHTML += `</br><button type="button" onClick="refreshPage()" class="btn btn-primary btn-sm">Volver a intentar</button>`
    div.style.display = 'block';
    console.log("resultados")
}


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
        console.log(sessions);
        const div = document.querySelector('#left');

        div.innerHTML = `<h6>Tablero modo ${mode}</h6>`;
        var table = document.createElement("TABLE");
        table.innerHTML = `<tr><td>Usuario</td><td>WPM</td><td>ACC</td></tr>`;
        
        sessions.forEach(function(top) {
            table.innerHTML += `<tr><td>${JSON.parse(top).user}</td><td>${JSON.parse(top).wpm}</td><td>${JSON.parse(top).acc}%</td></tr>`;
        })
        div.append(table);
        console.log("sesiones")
        func(value)
    });
}

function postResults() {

    const csrftoken = getCookie('csrftoken');
    const request = new Request(
        `/sessions/${mode}/`,
        {headers: {'X-CSRFToken': csrftoken}}
    );
    if (acc >= 75 && wpm <= 300 && terminado === 1) {
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
                fingers: sent_fingers
            })
        })
        .then(response => response.json())
        .then(getSessions(results, true))
        .catch(error => {
            console.log(error);
        });
    } else {
        getSessions(results, false)
    }
    
}