document.addEventListener('DOMContentLoaded', function() {

    // Botones para pedir cada tipo de palabras
    //document.querySelector('#doscientos').addEventListener('click', () => words('200'));
    //document.querySelector('#mil').addEventListener('click', () => words('1000'));
    //document.querySelector('#diez_mil').addEventListener('click', () => words('10000'));

    words('1000');
});

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
    
    // Línea para evitar que el shift sea detectado de manera incorrecta
    if (key !== "Shift"){
        // Obtener el span con el cual comparar lo que ha sido tecleado
        const other_key = getUnwrittenKey(0);
        // Si coincide el contenido del span con la tecla oprimida, marcar el span como correcto
        if (key === other_key.innerHTML) {
            other_key.className = "correct";
        }
        else {
            other_key.className = "incorrect";
        }
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
}