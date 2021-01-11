document.addEventListener('DOMContentLoaded', function() {

    // Botones para pedir cada tipo de palabras
    document.querySelector('#doscientos').addEventListener('click', () => words('200'));
    document.querySelector('#mil').addEventListener('click', () => words('1000'));
    document.querySelector('#diez_mil').addEventListener('click', () => words('10000'));
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
        //document.querySelector('#text').append(div);
    })
    .catch(error => {
        console.log('Error: ', error);
    });
}

function getUnwrittenKey(n) {
    const spans = document.querySelector('#text').children;
    const span_list = Array.from(spans);
    let i = 0;
    while (span_list[i].className != "unwritten")
    {
        i++;
    }
    let index = i + n;
    if (index < 0) {
        const index = 0;
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
    if (key !== "Shift"){
        const other_key = getUnwrittenKey(0);

    if (key === other_key.innerHTML) {
        other_key.className = "correct";
    }
    else {
        other_key.className = "incorrect";
    }
    }
    
}

function keyPressed(event) {
    const key = event.key;
    if (key == "Backspace") {
        deleteKey();
    }
    else {
        checkKeyPresses(key);
    }
}