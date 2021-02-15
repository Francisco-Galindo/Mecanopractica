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
var wpm_list = [];
var acc_list = [];

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
    wpm_list = [];
    acc_list = [];
    
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
    .catch(error => {
        const div = document.querySelector('#text');
        div.innerHTML = "";
        console.log('Error: ', error);
    });
}

function searchSpan(span_class, offset, index_or_element, first_last) {

    const spans = document.querySelector('#text').children;
    const span_list = Array.from(spans);

    const all_leters = span_list.length - 1;

    let i = 0;
    if (first_last === "first") {
        while (i < all_leters && span_list[i].className != span_class)  {
            i++;
        }
    } else {
        for (let j = 0; j < all_leters; j++)
        {
            if (span_list[j].className == span_class) {
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
    return span_list[index];
}


function checkCorrectWord() {
    var is_correct = true;
    const spans = document.querySelector('#text').children;
    const span_list = Array.from(spans);
    var word = [];

    var first_letter = searchSpan("written space", 1, "index", "last");
    if (first_letter === 1) {
        first_letter = 0;
    }
    const last_letter = searchSpan("unwritten space", -1, "index", "first");
    span_list[last_letter + 1].className = "written space";

    for (var i = first_letter; i <= last_letter; i++) {
        word.push(span_list[i]);
    }
    word.forEach(function(span) {
        if (span.className == "written incorrect" || span.className == "unwritten") {
            if (span.className == "unwritten") {
                span.className = "writtten";
            }
            is_correct = false;
        }
    });

    if (is_correct === false) {
        word.forEach(function(span) {
            span.style = "border-bottom: 2px solid #ee5d43;";
        });
    } else {
        correct_spaces ++;
        correct_presses ++;
    }

    return is_correct;
}


function deleteKey() {
    const key_to_delete = searchSpan("unwritten", -1, "element", "first"); 
    const previous_key_to_delete = searchSpan("unwritten", -2, "element", "first");

    if (key_to_delete.className !== "written space" && key_to_delete.className !== "unwritten space") {
        key_to_delete.className = "unwritten";

    } else if (key_to_delete.className === "unwritten space"){
        previous_key_to_delete.className = "unwritten";
    }
}

// La función de escribir debe terminar la prueba cuando el tiempo acabe o (se escriba correctamente la última palabra, o se presione espacio en la última palabra), esto depende del modo en el que este el programa
function checkKeyPresses(key) {

    // Obtener el span con el cual comparar lo que ha sido tecleado
    const other_key = searchSpan("unwritten", 0, "element", "first");
    if (other_key !== null) {
        const previous_other_key = searchSpan("unwritten", -1, "element", "first");

        // Si coincide el contenido del span con la tecla oprimida, marcar el span como correct
        if (previous_other_key.innerHTML === " " && previous_other_key.className === "unwritten space") {
            incorrect_presses ++;
        }
        else if (key === other_key.innerHTML) {
            other_key.className = "written correct";
            correct_presses ++;
        } else {
            other_key.className = "written incorrect";
            incorrect_presses ++;
        }
    } else {
        playing = false;
    }
}


// Esta función es llamada cuando se presiona una tecla en el modo de practica
//Se ocupa de tomar la decision de llamar la función correspondiente dependiendo de si fue presionado el Backspace u otra tecla
function keyPressed(event) {
    const key = event.key;
    if (!(event.ctrlKey || event.shiftKey || event.altKey || event.isComposing || key === "Dead" || key === "OS")) {
        playing = true;
        playing_timer = 15;
    
        if (key == "Backspace") {
            deleteKey();
        } else if (key === " ") {
            var form = document.querySelector("#form")
            form.value = ""
            console.log(checkCorrectWord());
            total_presses ++;
            raw_spaces++;
        } else {
            checkKeyPresses(key);
            total_presses ++;
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
    div.innerHTML += `Resultados`;
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
    if (acc >= 75 && wpm <= 300) {
        fetch(request, {
            method: 'POST',
            mode: 'same-origin',
            body: JSON.stringify({
                mode: mode,
                wpm: wpm,
                acc: acc,
                time: timer
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