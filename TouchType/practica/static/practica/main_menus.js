if (!localStorage.getItem('mode')) {
    localStorage.setItem('mode', '10000')
}

function dropdown() {
    document.getElementById("modes").classList.toggle("show");
    
}

function changeMode(mode) {
    localStorage.setItem('mode', mode);
    console.log(localStorage.getItem('mode'));
    page();
}

function crearTabla(lista_de_wpm, lista_de_acc, j)
{
    var lista_labels = [];

    for (i = 0; i < j; i++) {
        lista_labels.push(i.toString());
    }
    var ctx = document.getElementById("histo").getContext("2d");
    var grafica = new Chart(ctx, {
        type: 'line',
        data: {
            labels: lista_labels,
            datasets: [{
                label: "Velocidad (WPM)",
                data: lista_de_wpm,
                fill: false,
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                borderColor: 'rgba(0, 255, 0, 0.1)'   
            },
            {
                label: "Precisión (%)",
                data: lista_de_acc,
                fill: false,
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                borderColor: 'rgba(255, 0, 0, 0.1)'                
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}