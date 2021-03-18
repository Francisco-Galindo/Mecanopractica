document.addEventListener('DOMContentLoaded', function() {
    
    fetchSessions();
});

function fetchSessions() {
    const tablero = document.getElementById('tablero');
    let tabla = document.createElement("TABLE");
    tabla.innerHTML = `<tr><td>Usuario</td><td>WPM</td><td>ACC</td></tr>`;
    mode = localStorage.getItem('mode');
    document.getElementById('title').innerHTML = `Tablero del modo ${mode}`
    fetch(`/sessions/` + mode)
    .then(response => response.json())
    .then(sessions => {

        sessions.forEach(function(top) {
            tabla.innerHTML += `<tr><td>${JSON.parse(top).user}</td><td>${JSON.parse(top).wpm}</td><td>${JSON.parse(top).acc}%</td></tr>`;
        })
        tablero.append(tabla);

    });
}