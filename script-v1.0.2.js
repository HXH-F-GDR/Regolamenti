(function () {
var wrap = document.getElementById('reg-wrap');
if (!wrap) { return; }
var content = document.getElementById('reg-content');
var sidebar = document.getElementById('reg-sidebar');
var overlay = document.getElementById('reg-overlay');
var menuBtn = document.getElementById('reg-menu-btn');

function leggiLink(href) {
var out = {pag: '', sez: '', sub: ''};
if (!href) { return out; }
var cancelletto = href.indexOf('#');
var query = cancelletto > -1 ? href.substring(0, cancelletto) : href;
var hash = cancelletto > -1 ? href.substring(cancelletto + 1) : '';
var trovato = query.match(/[?&]pag=([^&]*)/);
if (trovato) { out.pag = trovato[1]; }
var parti = hash.split('--');
out.sez = parti[0] || '';
out.sub = parti[1] || '';
return out;
}

var accenti = new RegExp('[' + String.fromCharCode(768) + '-' + String.fromCharCode(879) + ']', 'g');
var puntino = String.fromCharCode(183);

function creaSlug(testo) {
var s = testo.toLowerCase();
if (s.normalize) { s = s.normalize('NFD').replace(accenti, ''); }
s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
return s;
}

function pulisci(testo) {
var s = testo.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
return s;
}

var pagina = wrap.getAttribute('data-pagina') || leggiLink(window.location.search).pag;

var sezioni = {};
var primaHtml = '';
var trovate = content.querySelectorAll('.reg-section');
for (var i = 0; i < trovate.length; i++) {
var sec = trovate[i];
var nome = sec.getAttribute('data-sezione');
var titoli = sec.querySelectorAll('.reg-h2');
for (var t = 0; t < titoli.length; t++) {
if (!titoli[t].getAttribute('data-anchor')) { titoli[t].setAttribute('data-anchor', creaSlug(titoli[t].textContent)); }
}
sezioni[nome] = sec;
if (!primaHtml) { primaHtml = nome; }
sec.parentNode.removeChild(sec);
}

var voci = [];
var tutte = wrap.querySelectorAll('.reg-nav-item');
for (var i = 0; i < tutte.length; i++) {
var info = leggiLink(tutte[i].getAttribute('href'));
var testata = tutte[i].parentNode.parentNode.querySelector('.reg-group-header');
info.el = tutte[i];
info.href = tutte[i].getAttribute('href');
info.testo = pulisci(tutte[i].textContent);
info.gruppo = testata ? pulisci(testata.textContent) : '';
voci.push(info);
}

var primaSezione = '';
for (var i = 0; i < voci.length; i++) {
if (voci[i].pag === pagina && sezioni[voci[i].sez]) { primaSezione = voci[i].sez; break; }
}
if (!primaSezione) { primaSezione = primaHtml; }

for (var i = 0; i < voci.length - 1; i++) {
var v = voci[i];
if (v.pag !== pagina || !sezioni[v.sez]) { continue; }
var dopo = voci[i + 1];
var stessa = dopo.pag === pagina;
var btn = document.createElement('a');
btn.className = 'reg-next';
btn.setAttribute('href', dopo.href);
var testi = document.createElement('span');
var etichetta = document.createElement('span');
etichetta.className = 'reg-next-label';
etichetta.textContent = stessa ? 'Sezione successiva' : 'Pagina successiva';
var titolo = document.createElement('span');
titolo.className = 'reg-next-title';
titolo.textContent = stessa ? dopo.testo : dopo.gruppo + ' ' + puntino + ' ' + dopo.testo;
testi.appendChild(etichetta);
testi.appendChild(titolo);
var freccia = document.createElement('span');
freccia.className = 'reg-next-arrow';
btn.appendChild(testi);
btn.appendChild(freccia);
sezioni[v.sez].appendChild(btn);
}

function apriGruppo(gruppo, alterna) {
var eraAperto = gruppo ? gruppo.classList.contains('reg-open') : false;
var gruppi = wrap.querySelectorAll('.reg-group');
for (var g = 0; g < gruppi.length; g++) { gruppi[g].classList.remove('reg-open'); }
if (gruppo && !(alterna && eraAperto)) { gruppo.classList.add('reg-open'); }
}

function chiudiMenu() {
if (sidebar) { sidebar.classList.remove('reg-sidebar-open'); }
if (overlay) { overlay.classList.remove('reg-sidebar-open'); }
}

function attivaSpoiler(radice) {
var toggles = radice.querySelectorAll('.reg-spoiler-toggle');
for (var t = 0; t < toggles.length; t++) {
(function (toggle) {
toggle.onclick = function () {
var corpo = toggle.parentNode.querySelector('.reg-spoiler-body');
var aperto = corpo.classList.contains('reg-open');
if (aperto) { corpo.classList.remove('reg-open'); } else { corpo.classList.add('reg-open'); }
toggle.textContent = aperto ? 'Mostra spoiler' : 'Nascondi spoiler';
};
}(toggles[t]));
}
}

function attivaCodice(radice) {
var blocchi = radice.querySelectorAll('.reg-code[data-code]');
for (var b = 0; b < blocchi.length; b++) {
var blocco = blocchi[b];
blocco.textContent = blocco.getAttribute('data-code');
var involucro = document.createElement('div');
involucro.className = 'reg-code-wrap';
blocco.parentNode.insertBefore(involucro, blocco);
involucro.appendChild(blocco);
var copia = document.createElement('div');
copia.className = 'reg-code-copy';
copia.textContent = 'Copia';
involucro.appendChild(copia);
(function (bottone, sorgente) {
bottone.onclick = function () {
var area = document.createElement('textarea');
area.value = sorgente.getAttribute('data-code');
document.body.appendChild(area);
area.select();
document.execCommand('copy');
document.body.removeChild(area);
bottone.textContent = 'Copiato';
setTimeout(function () { bottone.textContent = 'Copia'; }, 1500);
};
}(copia, blocco));
}
}

function mostra(sez, sub) {
if (!sezioni[sez]) { sez = primaSezione; sub = ''; }
if (!sez || !sezioni[sez]) { return; }
var clone = sezioni[sez].cloneNode(true);
clone.classList.add('reg-visible');
content.scrollTop = 0;
while (content.firstChild) { content.removeChild(content.firstChild); }
content.appendChild(clone);
attivaSpoiler(clone);
attivaCodice(clone);
content.style.display = 'none';
var ridisegna = content.offsetHeight;
content.style.display = '';
content.scrollTop = 0;
if (sub) {
var bersaglio = clone.querySelector('[data-anchor="' + creaSlug(sub) + '"]');
if (bersaglio) { content.scrollTop = bersaglio.getBoundingClientRect().top - content.getBoundingClientRect().top - 16; }
}
for (var i = 0; i < voci.length; i++) {
if (voci[i].pag === pagina && voci[i].sez === sez) {
voci[i].el.classList.add('reg-active');
apriGruppo(voci[i].el.parentNode.parentNode, false);
} else {
voci[i].el.classList.remove('reg-active');
}
}
chiudiMenu();
}

wrap.onclick = function (evento) {
evento = evento || window.event;
var nodo = evento.target || evento.srcElement;
while (nodo && nodo !== wrap && nodo.nodeName !== 'A') { nodo = nodo.parentNode; }
if (!nodo || nodo === wrap) { return; }
var href = nodo.getAttribute('href');
if (href === null) { return; }
if (href === '') { evento.preventDefault(); return; }
var info = leggiLink(href);
var interno = info.pag === pagina || (info.pag === '' && href.charAt(0) === '#');
if (!interno || !sezioni[info.sez]) { return; }
evento.preventDefault();
mostra(info.sez, info.sub);
var nuovoHash = '#' + info.sez + (info.sub ? '--' + info.sub : '');
if (window.history && window.history.pushState) { window.history.pushState(null, '', nuovoHash); }
};

var testate = wrap.querySelectorAll('.reg-group-header');
for (var i = 0; i < testate.length; i++) {
testate[i].onclick = function () { apriGruppo(this.parentNode, true); };
}

if (menuBtn) {
menuBtn.onclick = function () {
if (sidebar) { sidebar.classList.add('reg-sidebar-open'); }
if (overlay) { overlay.classList.add('reg-sidebar-open'); }
};
}
if (overlay) { overlay.onclick = chiudiMenu; }

window.addEventListener('popstate', function () {
var info = leggiLink(window.location.hash);
mostra(info.sez, info.sub);
});

var iniziale = leggiLink(window.location.hash);
mostra(iniziale.sez, iniziale.sub);
}());

setTimeout(function () {
var tabs = document.querySelector('ul.tabs.right.no_rotate');
var contenitore = document.querySelector('.container');
if (tabs && contenitore && tabs.parentElement !== contenitore) { contenitore.appendChild(tabs); }
}, 1);
