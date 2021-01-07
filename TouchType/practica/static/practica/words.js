document.addEventListener('DOMContentLoaded', function() {

    // Botones para pedir cada tipo de palabras
    document.querySelector('#doscientos').addEventListener('click', () => words('200'));
});

function words(words) {

    fetch('practica/' + words)
    .then(response => response.json())
    .then(words => {
        console.log(words);
    })
    .catch(error => {
        console.log('Error: ', error);
    });
}