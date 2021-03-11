document.addEventListener('DOMContentLoaded', function() {
    getUserStats();
});


function tablaWpm(lista_de_wpm, lista_de_acc, lista_fechas) {
    var lista_labels = [];

    lista_fechas.forEach(fecha => {
        lista_labels.push(fecha);
    })

    var ctx = document.getElementById("histo").getContext("2d");

    var grafica = new Chart(ctx, {
        type: 'line',
        data: {
            labels: lista_labels,
            datasets: [{
                label: "Velocidad (WPM)",
                yAxisID: 'WPM',
                data: lista_de_wpm,
                fill: false,
                borderColor: 'rgba(0, 255, 0, 0.1)'
            },
            {
                label: "Precisión (%)",
                yAxisID: '%',
                data: lista_de_acc,
                fill: false,
                borderColor: 'rgba(255, 0, 0, 0.1)'
            }]
        },
        options: {
            animation: {
                duration: 1000
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'WPM'
                    },
                    id: 'WPM',
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        beginAtZero: true,
                        min: Math.min.apply(Math, lista_de_wpm)
                    }
                }, 
                {
                    scaleLabel: {
                        display: true,
                        labelString: '%'
                    },
                    id: '%',
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        beginAtZero: true,
                        min: 0
                    }
                        
                }]
            }
        }
    });
}

function getUserStats() {
    let wpms = []
    let accs = []
    let dates = []
    let iterations = 10
    mode = localStorage.getItem('mode');
    fetch('/usuario/data/' + mode)
    .then(response => response.json())
    .then(data => {

        let i = 1;
        let sum_wpm = 0;
        let recent_sum_wpm = 0;
        let sum_acc = 0;
        let recent_sum_acc = 0;
        JSON.parse(data).sessions.forEach(element => {
            wpms.push(JSON.parse(element).wpm)
            sum_wpm += JSON.parse(element).wpm;

            accs.push(JSON.parse(element).acc)
            sum_acc += JSON.parse(element).acc;

            dates.push(JSON.parse(element).timestamp)
            i++;
        });


        let avg_wpm = Math.trunc(((sum_wpm / i)) * 100) / 100;
        let avg_acc = Math.trunc(((sum_acc / i)) * 100) / 100;

        document.getElementById("promedio-general").innerHTML = `</br> Velocidad general (WPM): ${avg_wpm} </br> Precisión general: ${avg_acc}%`

        var sessions = JSON.parse(data).sessions
        
        if (sessions[0] === undefined) {
            var ctx = document.getElementById("graph")
            ctx.innerHTML = `   <div class="alert alert-warning" role="alert">
                                    No tienes ninugna partida en este modo...
                                </div>  `
        } else {
            /*
            sessions = sessions.reverse();
            console.log(sessions)
            for (let j = 1; j <= i; j++) {
                console.log(JSON.parse(sessions[i-1]));
                recent_sum_acc += JSON.parse(sessions[i-1]).acc;
                recent_sum_wpm += JSON.parse(sessions[i-1]).wpm;
            }
            */


            tablaWpm(wpms, accs, dates);
            ordered_sessions = JSON.parse(data).sessions.sort((a, b) => JSON.parse(b).wpm - JSON.parse(a).wpm);
            createTop(ordered_sessions, iterations);


        }

    });
}

function createTop(sessions, num_sessions) {
    var tabla = document.getElementById("tablero");
    tabla.innerHTML = `Mejores ${num_sessions} partidas en el modo ${localStorage.getItem('mode')}`
    tabla.innerHTML += `</br>`
    let tablerito =  document.createElement("TABLE");
    tablerito.innerHTML += `<tr> <td>Velocidad</td> <td>WPM</td> <td>Fecha</td> </tr>`
    let i = 0;
    while (i < num_sessions && sessions[i] !== undefined) {
        tablerito.innerHTML += `<tr><td>${JSON.parse(sessions[i]).wpm}</td><td>${JSON.parse(sessions[i]).acc}</td><td>${JSON.parse(sessions[i]).timestamp}</td></tr>`

        i++;
    }
    tablerito.innerHTML += `</table>`

    tabla.append(tablerito)
}