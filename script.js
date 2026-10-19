// ===== Réglages globaux =====
// Utilité : Définit les constantes pour l'équilibrage du jeu (prix de départ, taille du classement, clés de stockage local).
const PRIX_BASE_CLIC = 50;  
const PRIX_BASE_AUTO = 100; 
const TAILLE_CLASSEMENT = 10;
const CLE_CLASSEMENT = 'classement-clicker';

// Succès du Jeu 1 (Clicker) : Basés sur l'argent total généré au fil de la partie
const SUCCES_CLICKER = [
  { seuil: 1000,   nom: 'Couronne de bronze (Clic)', couleur: '#b87333', type: 'clicker' },
  { seuil: 10000,  nom: "Couronne d'argent (Clic)",  couleur: '#8d98a5', type: 'clicker' },
  { seuil: 100000, nom: "Couronne d'or (Clic)",      couleur: '#d99a00', type: 'clicker' }
];

// Succès du Jeu 2 (Aim Lab) : Basés sur le meilleur score de cibles touchées en une session
const SUCCES_AIM = [
  { seuil: 5,   nom: 'Couronne de bronze (Aim)', couleur: '#b87333', type: 'aim' },
  { seuil: 10,  nom: "Couronne d'argent (Aim)",  couleur: '#8d98a5', type: 'aim' },
  { seuil: 15,  nom: "Couronne d'or (Aim)",      couleur: '#d99a00', type: 'aim' }
];

// Succès du Casino : Basés sur le montant total gagné en un seul pari réussi
const SUCCES_CASINO = [
  { seuil: 1000,   nom: 'Couronne de bronze (Casino)', couleur: '#b87333', type: 'casino' },
  { seuil: 10000,  nom: "Couronne d'argent (Casino)",  couleur: '#8d98a5', type: 'casino' },
  { seuil: 100000, nom: "Couronne d'or (Casino)",      couleur: '#d99a00', type: 'casino' }
];

// Modèle SVG vectoriel standardisé pour dessiner les couronnes
const SVG_COURONNE =
  '<svg viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M3 18h18v2H3zM3 7l4.5 4L12 4l4.5 7L21 7l-2 9H5z"/></svg>';

// ===== État global du jeu =====
// Utilité : Mémorise les variables de manière dynamique pour la progression du joueur
let argent = 0;
let totalGenere = 0; 
let achatsClic = 0;
let achatsAuto = 0;

// Variables statistiques pour le Profil
let clicsTotaux = 0;
let nombreParis = 0;
let essaisAimLab = 0;

// Variables spécifiques au mini-jeu Aim Lab
let aimMeilleurScore = 0;
let aimPartieEnCours = false;
let aimTimeout = null;
let aimIntervalCible = null;

// ===== Gestion des onglets et du profil =====
// Utilité : Permet de basculer l'affichage entre les différentes pages de l'application (y compris le profil)
const boutonsOnglets = document.querySelectorAll('.bouton-onglet, #btn-profil');
const conteneursPages = document.querySelectorAll('.conteneur-page');

boutonsOnglets.forEach(element => {
  element.addEventListener('click', () => {
    const cibleId = element.getAttribute('data-cible');

    // Met à jour les onglets actifs de la barre de navigation si concerné
    document.querySelectorAll('.bouton-onglet').forEach(b => {
      if (b.getAttribute('data-cible') === cibleId) {
        b.classList.add('actif');
      } else {
        b.classList.remove('actif');
      }
    });

    conteneursPages.forEach(p => p.classList.remove('actif'));
    document.getElementById(cibleId).classList.add('actif');

    // Actualise les données du profil à l'ouverture
    if (cibleId === 'page-profil') {
      mettreAJourProfil();
    }
  });
});

// ===== Calculs des bonus et multiplicateurs =====
// Utilité : Compte les couronnes et applique le bonus global de +10% par couronne (marche sur tout les gains)
function nombreCouronnesTotales() {
  const c1 = SUCCES_CLICKER.filter(s => s.debloque).length;
  const c2 = SUCCES_AIM.filter(s => s.debloque).length;
  const c3 = SUCCES_CASINO.filter(s => s.debloque).length;
  return c1 + c2 + c3;
}

function pourcentageBonus() {
  return nombreCouronnesTotales() * 10;
}

function multiplicateurCouronnes() {
  return 1 + (pourcentageBonus() / 100);
}

function gainParClic() {
  const base = 1 + achatsClic;
  return base * multiplicateurCouronnes();
}

function gainParSeconde() {
  const base = achatsAuto;
  return base * multiplicateurCouronnes();
}

function prixClic() {
  return PRIX_BASE_CLIC * Math.pow(2, achatsClic);
}

function prixAuto() {
  return PRIX_BASE_AUTO * Math.pow(2, achatsAuto);
}

function formater(n) {
  return Number(n.toFixed(1)).toLocaleString('fr-FR');
}

// ===== Sélection des éléments du DOM =====
// Utilité : Fait le lien entre les variables JavaScript et les éléments graphiques HTML
const bouton = document.getElementById('bouton');
const compteur = document.getElementById('compteur');
const revenu = document.getElementById('revenu');
const total = document.getElementById('total');
const bonusPourcentage = document.getElementById('bonus-pourcentage');
const niveauClic = document.getElementById('niveau-clic');
const niveauAuto = document.getElementById('niveau-auto');
const acheterClic = document.getElementById('acheter-clic');
const acheterAuto = document.getElementById('acheter-auto');
const heure = document.getElementById('heure');
const pseudo = document.getElementById('pseudo');
const enregistrer = document.getElementById('enregistrer');
const vider = document.getElementById('vider');
const message = document.getElementById('message');
const listeClassement = document.getElementById('liste-classement');
const zoneCouronnesClic = document.getElementById('couronnes');
const zoneCouronnesAim = document.getElementById('couronnes-aim');
const zoneCouronnesCasino = document.getElementById('couronnes-casino');
const listeSucces = document.getElementById('liste-succes');
const messageSucces = document.getElementById('message-succes');

// Éléments du Profil dans le DOM
const statPseudo = document.getElementById('stat-pseudo');
const statClics = document.getElementById('stat-clics');
const statTotalGenere = document.getElementById('stat-total-genere');
const statParis = document.getElementById('stat-paris');
const statEssaisAim = document.getElementById('stat-essais-aim');
const statCouronnes = document.getElementById('stat-couronnes');

// Éléments spécifiques Aim Lab
const aimPlateau = document.getElementById('aim-plateau');
const aimStartBtn = document.getElementById('aim-start');
const aimScoreEl = document.getElementById('aim-score');
const aimRecordEl = document.getElementById('aim-record');

// Éléments spécifiques Casino
const montantPariInput = document.getElementById('montant-pari');
const parierPileBtn = document.getElementById('parier-pile');
const parierFaceBtn = document.getElementById('parier-face');
const resultatCasinoEl = document.getElementById('resultat-casino');
const pieceEl = document.getElementById('piece');

// ===== Construction dynamique des succès =====
// Utilité : Initialise l'affichage des couronnes et des lignes de succès dans le DOM
function construireSucces() {
  const tousSucces = [...SUCCES_CLICKER, ...SUCCES_AIM, ...SUCCES_CASINO];

  tousSucces.forEach((s) => {
    s.debloque = false;

    s.elCouronne = document.createElement('span');
    s.elCouronne.className = 'couronne';
    s.elCouronne.style.setProperty('--couleur', s.couleur);
    s.elCouronne.title = s.nom + ' (+10% de bonus)';
    s.elCouronne.innerHTML = SVG_COURONNE;
    
    if (s.type === 'clicker') {
      zoneCouronnesClic.appendChild(s.elCouronne);
    } else if (s.type === 'aim') {
      zoneCouronnesAim.appendChild(s.elCouronne);
    } else {
      zoneCouronnesCasino.appendChild(s.elCouronne);
    }

    s.elLigne = document.createElement('li');
    s.elLigne.className = 'succes';

    const icone = document.createElement('span');
    icone.className = 'couronne';
    icone.style.setProperty('--couleur', s.couleur);
    icone.innerHTML = SVG_COURONNE;

    const texte = document.createElement('div');
    texte.className = 'succes-texte';
    const titre = document.createElement('strong');
    titre.textContent = s.nom + ' (+10% de bonus)';
    const description = document.createElement('span');
    
    if (s.type === 'clicker') {
      description.textContent = 'Générer ' + formater(s.seuil) + ' € au total';
    } else if (s.type === 'aim') {
      description.textContent = 'Atteindre un score de ' + s.seuil + ' cibles en une seule session';
    } else {
      description.textContent = 'Gagner ' + formater(s.seuil) + ' € en un seul pari';
    }

    texte.appendChild(titre);
    texte.appendChild(description);

    s.elEtat = document.createElement('span');
    s.elEtat.className = 'etat';
    s.elEtat.textContent = 'Verrouillé';

    s.elLigne.appendChild(icone);
    s.elLigne.appendChild(texte);
    s.elLigne.appendChild(s.elEtat);
    listeSucces.appendChild(s.elLigne);

    s.elIcone = icone;
  });
}

// ===== Vérification des succès =====
// Utilité : Valide les conditions d'obtention des succès et débloque les bonus associés
function verifierSucces(montantGainActuel = 0) {
  const tousSucces = [...SUCCES_CLICKER, ...SUCCES_AIM, ...SUCCES_CASINO];
  tousSucces.forEach((s) => {
    if (!s.debloque) {
      if (s.type === 'clicker' && totalGenere >= s.seuil) {
        validerSucces(s);
      } else if (s.type === 'aim' && aimMeilleurScore >= s.seuil) {
        validerSucces(s);
      } else if (s.type === 'casino' && montantGainActuel >= s.seuil) {
        validerSucces(s);
      }
    }
  });
}

function validerSucces(s) {
  s.debloque = true;
  s.elCouronne.classList.add('debloque');
  s.elIcone.classList.add('debloque');
  s.elLigne.classList.add('debloque');
  s.elEtat.textContent = 'Débloqué';
  messageSucces.textContent = 'Succès débloqué : ' + s.nom + ' ! (+10% de revenus)';
}

function gagner(montant) {
  argent += montant;
  totalGenere += montant;
  verifierSucces();
}

// ===== Logique du Casino (Pile ou Face) =====
// Utilité : Gère la mise, le tirage aléatoire, l'animation de la pièce et le gain/perte
function jouerCasino(choixJoueur) {
  const montantPari = parseInt(montantPariInput.value, 10);

  if (isNaN(montantPari) || montantPari <= 0) {
    resultatCasinoEl.textContent = 'Veuillez entrer un montant de pari valide.';
    return;
  }

  if (argent < montantPari) {
    resultatCasinoEl.textContent = "Vous n'avez pas assez d'argent pour ce pari !";
    return;
  }

  nombreParis++; // Incrémente le compteur de paris pour le profil

  parierPileBtn.disabled = true;
  parierFaceBtn.disabled = true;

  argent -= montantPari;
  mettreAJourAffichage();

  resultatCasinoEl.textContent = 'La pièce tourne...';
  pieceEl.textContent = '...';
  
  pieceEl.classList.remove('animation-rotation');
  void pieceEl.offsetWidth; 
  pieceEl.classList.add('animation-rotation');

  setTimeout(() => {
    const tirage = Math.random() < 0.5 ? 'pile' : 'face';
    pieceEl.textContent = tirage === 'pile' ? 'PILE' : 'FACE';

    if (tirage === choixJoueur) {
      const gain = montantPari * 2;
      gagner(gain);
      verifierSucces(gain);
      resultatCasinoEl.textContent = `C'est tombé sur ${tirage.toUpperCase()} ! Gagné ! (+${formater(gain)} €)`;
    } else {
      resultatCasinoEl.textContent = `C'est tombé sur ${tirage.toUpperCase()}. Perdu ! (-${formater(montantPari)} €)`;
    }

    parierPileBtn.disabled = false;
    parierFaceBtn.disabled = false;
    mettreAJourAffichage();
  }, 600);
}

parierPileBtn.addEventListener('click', () => jouerCasino('pile'));
parierFaceBtn.addEventListener('click', () => jouerCasino('face'));

// ===== Logique du mini-jeu Aim Lab =====
// Utilité : Gère l'apparition aléatoire des cibles cliquables pendant un temps imparti de 15 secondes
function demarrerAimLab() {
  if (aimPartieEnCours) return;
  aimPartieEnCours = true;
  essaisAimLab++; // Incrémente le compteur d'essais pour le profil
  aimStartBtn.style.display = 'none';

  let ciblesToucheesSession = 0;
  aimScoreEl.textContent = 'Score : 0 cibles touchées';

  function spawnCible() {
    if (!aimPartieEnCours) return;
    
    const vieilleCible = aimPlateau.querySelector('.cible');
    if (vieilleCible) vieilleCible.remove();

    const cible = document.createElement('div');
    cible.className = 'cible';

    const maxX = aimPlateau.clientWidth - 40;
    const maxY = aimPlateau.clientHeight - 40;
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    cible.style.left = randomX + 'px';
    cible.style.top = randomY + 'px';

    cible.addEventListener('click', (e) => {
      e.stopPropagation();
      ciblesToucheesSession++;
      aimScoreEl.textContent = 'Score : ' + ciblesToucheesSession + ' cibles touchées';
      
      if (ciblesToucheesSession > aimMeilleurScore) {
        aimMeilleurScore = ciblesToucheesSession;
        aimRecordEl.textContent = 'Meilleur score : ' + aimMeilleurScore;
      }

      cible.remove();
      verifierSucces();
      mettreAJourAffichage();
    });

    aimPlateau.appendChild(cible);
  }

  spawnCible();
  aimIntervalCible = setInterval(spawnCible, 800);

  aimTimeout = setTimeout(() => {
    aimPartieEnCours = false;
    clearInterval(aimIntervalCible);
    clearTimeout(aimTimeout);

    const vieilleCible = aimPlateau.querySelector('.cible');
    if (vieilleCible) vieilleCible.remove();

    aimStartBtn.style.display = 'inline-block';
    aimStartBtn.textContent = 'Rejouer (Fin de partie : ' + ciblesToucheesSession + ' cibles)';
  }, 15000);
}

aimStartBtn.addEventListener('click', demarrerAimLab);

// ===== Mise à jour de l'affichage du profil =====
// Utilité : Actualise les statistiques affichées dans la page de profil
function mettreAJourProfil() {
  const nomSaisi = pseudo.value.trim();
  statPseudo.textContent = nomSaisi !== '' ? nomSaisi : 'Anonyme';
  statClics.textContent = formater(clicsTotaux);
  statTotalGenere.textContent = formater(totalGenere) + ' €';
  statParis.textContent = formater(nombreParis);
  statEssaisAim.textContent = formater(essaisAimLab);
  statCouronnes.textContent = nombreCouronnesTotales() + ' / 9';
}

// ===== Mise à jour de l'affichage global =====
// Utilité : Rafraîchit les textes, compteurs et états des boutons de l'interface en temps réel
function mettreAJourAffichage() {
  compteur.textContent = 'Argent : ' + formater(argent) + ' €';
  revenu.textContent = 'Revenu : ' + formater(gainParSeconde()) + ' € par seconde';
  total.textContent = 'Total généré : ' + formater(totalGenere) + ' €';
  bouton.textContent = 'Cliquer ici (+' + formater(gainParClic()) + ' €)';

  bonusPourcentage.textContent = '+' + pourcentageBonus() + '% de gain supplémentaire';

  niveauClic.textContent = 'Gain actuel : ' + formater(gainParClic()) + ' € par clic';
  acheterClic.textContent = '+1 € par clic (' + formater(prixClic()) + ' €)';
  acheterClic.disabled = argent < prixClic();

  niveauAuto.textContent = 'Gain actuel : ' + formater(gainParSeconde()) + ' € par seconde';
  acheterAuto.textContent = '+1 € par seconde (' + formater(prixAuto()) + ' €)';
  acheterAuto.disabled = argent < prixAuto();
}

// ===== Actions du jeu 1 (Clicker & Boutique) =====
// Utilité : Gère l'action de clic manuel et les achats d'améliorations de la boutique
bouton.addEventListener('click', () => {
  clicsTotaux++; // Incrémente le compteur de clics totaux
  gagner(gainParClic());
  mettreAJourAffichage();
});

acheterClic.addEventListener('click', () => {
  const prix = prixClic();
  if (argent >= prix) {
    argent -= prix;
    achatsClic++;
    mettreAJourAffichage();
  }
});

acheterAuto.addEventListener('click', () => {
  const prix = prixAuto();
  if (argent >= prix) {
    argent -= prix;
    achatsAuto++;
    mettreAJourAffichage();
  }
});

// Boucle principale du revenu passif (exécutée chaque seconde)
setInterval(() => {
  if (gainParSeconde() > 0) {
    gagner(gainParSeconde());
    mettreAJourAffichage();
  }
}, 1000);

// ===== Gestion du classement local (LocalStorage) =====
// Utilité : Sauvegarde, trie et affiche les meilleurs scores des joueurs
function chargerClassement() {
  try {
    const donnees = JSON.parse(localStorage.getItem(CLE_CLASSEMENT));
    return Array.isArray(donnees) ? donnees : [];
  } catch (e) {
    return [];
  }
}

function sauvegarderClassement(liste) {
  try {
    localStorage.setItem(CLE_CLASSEMENT, JSON.stringify(liste));
    return true;
  } catch (e) {
    return false;
  }
}

function afficherClassement() {
  const liste = chargerClassement()
    .sort((a, b) => b.score - a.score)
    .slice(0, TAILLE_CLASSEMENT);

  listeClassement.textContent = '';

  if (liste.length === 0) {
    const vide = document.createElement('li');
    vide.className = 'vide';
    vide.textContent = 'Aucun score enregistré pour le moment.';
    listeClassement.appendChild(vide);
    return;
  }

  liste.forEach((entree) => {
    const li = document.createElement('li');
    const nom = document.createElement('span');
    const score = document.createElement('span');
    nom.textContent = entree.pseudo;
    score.textContent = formater(entree.score) + ' €';
    score.className = 'score';
    li.appendChild(nom);
    li.appendChild(score);
    listeClassement.appendChild(li);
  });
}

function enregistrerScore() {
  const nom = pseudo.value.trim().slice(0, 20);
  if (nom === '') {
    message.textContent = 'Entrez un pseudo pour enregistrer votre score.';
    return;
  }

  const liste = chargerClassement();
  const existant = liste.find((e) => e.pseudo.toLowerCase() === nom.toLowerCase());

  if (existant) {
    if (totalGenere > existant.score) {
      existant.score = totalGenere;
      message.textContent = 'Nouveau record pour ' + existant.pseudo + ' !';
    } else {
      message.textContent = 'Votre meilleur score reste ' + formater(existant.score) + ' €.';
    }
  } else {
    liste.push({ pseudo: nom, score: totalGenere });
    message.textContent = 'Score enregistré.';
  }

  if (!sauvegarderClassement(liste)) {
    message.textContent = "Impossible de sauvegarder : le stockage du navigateur est bloqué.";
  }
  afficherClassement();
}

enregistrer.addEventListener('click', enregistrerScore);

pseudo.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') enregistrerScore();
});

vider.addEventListener('click', () => {
  if (confirm('Effacer tout le classement ?')) {
    sauvegarderClassement([]);
    message.textContent = 'Classement effacé.';
    afficherClassement();
  }
});

// ===== Horloge en temps réel =====
// Utilité : Met à jour l'affichage de l'heure courante chaque seconde
function afficherHeure() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const s = now.getSeconds().toString().padStart(2, '0');
  heure.textContent = 'Heure actuelle : ' + h + ':' + m + ':' + s;
}

// ===== Initialisation au démarrage =====
// Utilité : Exécute les fonctions de configuration de la page au chargement initial
construireSucces();
mettreAJourAffichage();
afficherClassement();
afficherHeure();
setInterval(afficherHeure, 1000);