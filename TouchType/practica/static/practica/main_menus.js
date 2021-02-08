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