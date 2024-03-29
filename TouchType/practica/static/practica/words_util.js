document.addEventListener('DOMContentLoaded', function() {   
    // Selecciona el modo fácil en caso de que no haya ninguno guardado anteriormente.
    if (!localStorage.getItem('mode')) {
        localStorage.setItem('mode', 'Fácil')
    }

    // Inicializando el modo de estudio
    if (!localStorage.getItem('study-mode')) {
        localStorage.setItem('study-mode', 'false')
    }  
});




function changeMode(mode) {
    localStorage.setItem('mode', mode);
    refreshPage();
}



function changeStudyMode(study_mode) {

    localStorage.setItem('study-mode', study_mode);
    refreshPage();
}


function refreshPage(){
    window.location.reload();
} 

// Dibuja el dedo correspondiente a la siguiente letra del juego.
function drawNextFinger(spans_list) {
    if (localStorage.getItem('mode') === 'Fácil') {

        try {
            let finger = searchSpan("unwritten", undefined, 0, "element", "first").innerHTML;

            finger = checkWhatFinger(finger, undefined);
            finger = fingerToString(finger);
            drawFingerImage('hand-center', finger);
        } catch {
            return;
        }


    }
}

// Dependiendo del dedo dado, dibujar la imagen correspondiente.
function drawFingerImage(selector, finger) {
    let div = document.getElementById(selector);
    div.style.transform = 'rotateY(0deg)'

    if (finger === undefined) {
        finger = div.innerHTML.toLowerCase();
    }

    let words = finger.split(' ');


    if (words[1] === 'izquierdo') {
        div.style.transform = 'rotateY(180deg)'
    }

    let size = selector === 'hand-center' ? 20 : 10;

    div.innerHTML = `<img style="height: ${size}vh;" src="/static/practica/media/dedos/${words[0]}.svg"/>`;

}

// Aquí nos encargamos de convertir los números de dedo a su dedo correspondiente.
function fingerToString(finger) {

    if (finger === 0) {
        finger = "menique izquierdo"
    } else if (finger === 1) {
        finger = "anular izquierdo"
    } else if (finger === 2) {
        finger = "medio izquierdo"
    } else if (finger === 3) {
        finger = "indice izquierdo"
    } else if (finger === 4) {
        finger = "indice derecho"
    } else if (finger === 5) {
        finger = "medio derecho"
    } else if (finger === 6) {
        finger = "anular derecho"
    } else if (finger ===7) {
        finger = "menique derecho"
    } else if (finger === 8) {
        finger = "pulgar derecho"
    }

    return finger;
}


// Se crea un gráfico que para representar la velocidad del jugador a lo largo de la partida, con el uso de Chart.js
function crearTabla(lista_de_wpm, lista_de_acc, j) {
    var lista_labels = [];

    for (let i = 0; i < j; i++) {
        lista_labels.push(i.toString());
    }
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
                borderColor: 'rgba(150, 224, 114, 0.5)'
            },
            {
                label: "Precisión (%)",
                yAxisID: '%',
                data: lista_de_acc,
                fill: false,
                borderColor: 'rgba(238, 93, 67, 0.5)'
            }]
        },
        options: {
            animation: {
                duration: 1000
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    gridLines: {
                        color: "#FFFFFF"
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Tiempo (s)'
                    }
                }],
                yAxes: [{
                    gridLines: {
                        color: '#FFFFFF'
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'WPM'
                    },
                    id: 'WPM',
                    type: 'linear',
                    position: 'left',
                    ticks: {
                        beginAtZero: true,
                        min: 0
                    }
                }, 
                {
                    gridLines: {
                        color: '#FFFFFF'
                    },
                    scaleLabel: {
                        display: true,
                        labelString: '%'
                    },
                    id: '%',
                    type: 'linear',
                    position: 'right',
                    ticks: {
                        beginAtZero: true,
                        min: 75
                    }
                        
                }]
            }
        }
    });
}