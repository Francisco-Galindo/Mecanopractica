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
    wpms = []
    accs = []
    dates = []
    mode = localStorage.getItem('mode');
    fetch('/usuario/data/' + mode)
    .then(response => response.json())
    .then(data => {

        JSON.parse(data).sessions.forEach(element => {
            wpms.push(JSON.parse(element).wpm)
            accs.push(JSON.parse(element).acc)
            dates.push(JSON.parse(element).timestamp)
        });
        var sessions = JSON.parse(data).sessions
        console.log(sessions[0])
        if (sessions[0] === undefined) {
            var ctx = document.getElementById("graph")
            ctx.innerHTML = `   <div class="alert alert-warning" role="alert">
                                    No tienes ninugna partida en este modo...
                                </div>  `
        } else {
            tablaWpm(wpms, accs, dates);
        }

    });
}