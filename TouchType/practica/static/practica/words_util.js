if (!localStorage.getItem('mode')) {
    localStorage.setItem('mode', '10000')
}

function dropdown() {
    document.getElementById("modes").classList.toggle("show");   
}

function changeMode(mode) {
    localStorage.setItem('mode', mode);
    console.log(localStorage.getItem('mode'), mode);

    refreshPage();
}


function refreshPage(){
    window.location.reload();
} 

function drawNextFinger(spans_list) {
    if (localStorage.getItem('mode') === 'Fácil') {
        let finger = searchSpan("unwritten", undefined, 0, "element", "first").innerHTML;
        finger = checkWhatFinger(finger, undefined);
        finger = fingerToString(finger);
        drawFingerImage('hand-center', finger)
    }
}

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

function fingerToString(finger) {

    if (finger === 0) {
        finger = "Menique izquierdo"
    } else if (finger === 1) {
        finger = "Anular izquierdo"
    } else if (finger === 2) {
        finger = "Medio izquierdo"
    } else if (finger === 3) {
        finger = "indice izquierdo"
    } else if (finger === 4) {
        finger = "indice derecho"
    } else if (finger === 5) {
        finger = "Medio derecho"
    } else if (finger === 6) {
        finger = "Anular derecho"
    } else if (finger ===7) {
        finger = "Menique derecho"
    } else if (finger === 8) {
        finger = "Pulgar derecho"
    }

    return finger;
}



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
                        min: 0
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
                        min: 75
                    }
                        
                }]
            }
        }
    });
}