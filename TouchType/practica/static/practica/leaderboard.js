document.addEventListener('DOMContentLoaded', function() {
    
    fetchSessions();
});

function fetchSessions() {
    const tablero = document.getElementById('tablero');
    let tabla = document.createElement("TABLE");
    tabla.innerHTML = `<tr><td>Lugar</td><td>Usuario</td><td>WPM</td><td>ACC</td><td>Fecha</td></tr>`;
    mode = localStorage.getItem('mode');
    document.getElementById('title').innerHTML = `Tablero del modo ${mode}`
    fetch(`/sessions/` + mode)
    .then(response => response.json())
    .then(sessions => {
        let i = 1;
        sessions.forEach(function(top) {
            tabla.innerHTML += `<tr><td>${i}</td><td>${JSON.parse(top).user}</td><td>${JSON.parse(top).wpm}</td><td>${JSON.parse(top).acc}%</td><td>${JSON.parse(top).timestamp}</td></tr>`;

            i++;
        })
        tablero.append(tabla);

    });
}