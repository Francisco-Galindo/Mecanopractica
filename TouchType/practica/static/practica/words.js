var total_presses = 0;
var correct_presses = 0;
var incorrect_presses = 0;
var raw_spaces = 0;
var playing = false;
var playing_timer = 0;
var timer = 0;
var acc;
var raw_wpm;
document.addEventListener('DOMContentLoaded', function() {

    words('1000');

    setInterval(function(){
        if (playing == true) {
            timer ++;
            playing_timer --;
            if (timer === 60 || playing_timer === 0) {
                results();
            }
            show_vel();
            console.log(timer, raw_wpm, acc);
        }
    }, 1000)

    //Timer para contar el tiempo restante y saber si el usuario esta afk

});
//Hay que crear una funcion para que inicie el juego, que llame a words y ponga playing en true

// Catalogo de los grupos

function words(words) {

    fetch('practica/' + words)
    .then(response => response.json())
    .then(words => {
        const div = document.querySelector('#text');
        div.innerHTML = ""
        console.log(words);
        words.forEach(function(word) {
            const letters = JSON.stringify(word.word);
            const n = letters.length;
            for(let i = 1; i < n-1; i++) {
                div.innerHTML += `<span class="unwritten">${letters.charAt(i)}</span>`;
            }
            div.innerHTML += `<span class="unwritten"> </span>`;
        });
    })
    .catch(error => {
        console.log('Error: ', error);
    });
}

// Función que obtiene la primer letra no escrita entre los spans, ¨n¨ es un offset para obtener algún otro span.
function getUnwrittenKey(n) {

    // Obteniendo un array de todos los spans que son hijos del div con el texto
    const spans = document.querySelector('#text').children;
    const span_list = Array.from(spans);
    
    let i = 0;
    while (span_list[i].className != "unwritten")
    {
        i++;
    }
    var index;
    index = i + n;
    if (index < 0) {
        index = 0;
    }

    return span_list[index];
}

function deleteKey() {
    key_to_delete = getUnwrittenKey(-1);
    key_to_delete.className = "unwritten";
}

// La función de escribir debe terminar la prueba cuando el tiempo acabe o (se escriba correctamente la última palabra, o se presione espacio en la última palabra), esto depende del modo en el que este el programa
function checkKeyPresses(key) {
    // checa solamente la u;tima letra de la forma y comparala con la letra correspondiente en los spans
    let a = getUnwrittenKey(-1);
    // Línea para evitar que el shift sea detectado de manera incorrecta
    if (key !== "Shift"){
        // Obtener el span con el cual comparar lo que ha sido tecleado
        const other_key = getUnwrittenKey(0);
        if (key === " ") {
            raw_spaces ++;
        }
        // Si coincide el contenido del span con la tecla oprimida, marcar el span como correct
        if (key === other_key.innerHTML) {
            other_key.className = "correct";
            correct_presses ++;
        }
        else {
            other_key.className = "incorrect";
            incorrect_presses ++;
        }
        total_presses ++;
    }
    
}

// Esta función es llamada cuando se presiona una tecla en el modo de practica
//Se ocupa de tomar la decision de llamar la función correspondiente dependiendo de si fue presionado el Backspace u otra tecla
function keyPressed(event) {
    const key = event.key;
    if (key == "Backspace") {
        deleteKey();
    }
    else {
        checkKeyPresses(key);
    }
    playing = true;
    playing_timer = 15;
}

// asd
function calc_vel_acc(){
    raw_wpm = Math.round((raw_spaces / timer) * 60);
    acc = Math.round((correct_presses / total_presses) * 100);
}

function show_vel(){
    calc_vel_acc()
    div = document.querySelector('#left_info');
    div.innerHTML = `acc: ${acc}%, wpm: ${raw_wpm}`
}

function results() {
    playing = false;
    document.querySelector('#text').style.display = 'none';
    document.querySelector('#form').style.display = 'none';
    document.querySelector('#results').style.display = 'block';
    div = document.querySelector('#results');
    div.innerHTML += `Resultados`;
    div.innerHTML += `</br> <span style="font-size: 100px;"> wpm: ${raw_wpm}</span>`;
    div.innerHTML += `</br>acc: ${acc}%`;
}