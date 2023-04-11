function searching() {
    var searchInput = document.getElementById('searchInput');
    searchInput.style.display = 'inline-block';

    var submitInput = document.getElementById('submitInput');
    submitInput.style.display = 'inline-block';

    var navPlugs = document.getElementsByClassName('navPlugs');
    for (var i = 0; i < navPlugs.length; i++) {
        navPlugs[i].style.display = 'none'
    }

    var searchAria = document.getElementById('searchAria');
    searchAria.style.border = '2px solid #C3C1C2';
    searchAria.style.borderRadius = '7px';
    searchAria.style.backgroundColor = '#C3C1C2';
}

function offsearch() {

    var submitInput = document.getElementById('submitInput');
    submitInput.style.display = 'none';

    var searchInput = document.getElementById('searchInput');
    searchInput.style.display = 'none';


    var navPlugs = document.getElementsByClassName('navPlugs');
    for (var i = 0; i < navPlugs.length; i++) {
        navPlugs[i].style.display = 'inline-block'
    }

    var searchAria = document.getElementById('searchAria');
    searchAria.style = 'none'
}

document.onclick = function () {
    var activeElement = document.activeElement;
    var parent = activeElement.parentElement;
    if (parent.id != 'searchAria'){
        offsearch();
    }
};