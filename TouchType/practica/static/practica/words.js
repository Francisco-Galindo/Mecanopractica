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
        document.querySelector('#text').innerHTML = "";
        console.log(words);
        const div = document.createElement("div");
        words.forEach(function(word) {
            const letters = JSON.stringify(word.word);
            const n = letters.length;
            for(let i = 1; i < n-1; i++) {
                div.innerHTML += `<span>${letters.charAt(i)}</span>`;
            }
            div.innerHTML += "<span> </span>";
        });
        document.querySelector('#text').append(div);
    })
    .catch(error => {
        console.log('Error: ', error);
    });
}