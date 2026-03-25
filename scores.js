// ===== GESTION DES SCORES =====

// Récupérer tous les scores
function getAllScores() {
    const scores = localStorage.getItem('jmb_scores');
    return scores ? JSON.parse(scores) : [];
}

// Sauvegarder un score de simulation
function saveSimulationScore(numero, correctAnswers, points) {
    const scores = getAllScores();
    const newScore = {
        id: Date.now(),
        date: new Date().toLocaleDateString('fr-FR'),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        numero: numero,
        correctAnswers: correctAnswers,
        totalQuestions: 3,
        points: points,
        percentage: Math.round((correctAnswers / 3) * 100)
    };
    
    scores.push(newScore);
    localStorage.setItem('jmb_scores', JSON.stringify(scores));
    
    // Vérifier les badges
    checkBadges();
}

// Calculer le score total
function getTotalScore() {
    const scores = getAllScores();
    return scores.reduce((total, score) => total + score.points, 0);
}

// Calculer le taux de réussite
function getSuccessRate() {
    const scores = getAllScores();
    if (scores.length === 0) return 0;
    
    const totalCorrect = scores.reduce((sum, score) => sum + score.correctAnswers, 0);
    const totalQuestions = scores.length * 3;
    
    return Math.round((totalCorrect / totalQuestions) * 100);
}

// ===== SYSTÈME DE BADGES =====
const badges = [
    { id: 'first_sim', name: 'Première simulation', icon: '🎯', condition: (scores) => scores.length >= 1 },
    { id: 'five_sims', name: '5 simulations', icon: '🔥', condition: (scores) => scores.length >= 5 },
    { id: 'ten_sims', name: '10 simulations', icon: '💪', condition: (scores) => scores.length >= 10 },
    { id: 'perfect_score', name: 'Sans faute', icon: '🏆', condition: (scores) => scores.some(s => s.correctAnswers === 3) },
    { id: 'hundred_points', name: '100 points', icon: '⭐', condition: () => getTotalScore() >= 100 },
    { id: 'five_hundred_points', name: '500 points', icon: '🌟', condition: () => getTotalScore() >= 500 },
    { id: 'master', name: 'Maître du permis', icon: '👑', condition: (scores) => scores.length >= 20 && getSuccessRate() >= 80 }
];

function getUnlockedBadges() {
    const scores = getAllScores();
    const unlocked = localStorage.getItem('jmb_badges');
    const unlockedBadges = unlocked ? JSON.parse(unlocked) : [];
    
    badges.forEach(badge => {
        if (!unlockedBadges.includes(badge.id) && badge.condition(scores)) {
            unlockedBadges.push(badge.id);
        }
    });
    
    localStorage.setItem('jmb_badges', JSON.stringify(unlockedBadges));
    return unlockedBadges;
}

function checkBadges() {
    const previousBadges = localStorage.getItem('jmb_badges');
    const previousCount = previousBadges ? JSON.parse(previousBadges).length : 0;
    
    const currentBadges = getUnlockedBadges();
    
    if (currentBadges.length > previousCount) {
        // Nouveau badge débloqué !
        const newBadge = badges.find(b => b.id === currentBadges[currentBadges.length - 1]);
        if (newBadge) {
            showBadgeNotification(newBadge);
        }
    }
}

function showBadgeNotification(badge) {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = 'badge-notification';
    notification.innerHTML = `
        <div class="badge-notification-content">
            <div class="badge-icon-big">${badge.icon}</div>
            <h3>Nouveau badge débloqué !</h3>
            <p>${badge.name}</p>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== AFFICHAGE DES SCORES =====
function displayScores() {
    const scores = getAllScores();
    const totalPoints = getTotalScore();
    const successRate = getSuccessRate();
    const unlockedBadges = getUnlockedBadges();
    
    // Statistiques principales
    document.getElementById('totalPoints').textContent = totalPoints;
    document.getElementById('totalSimulations').textContent = scores.length;
    document.getElementById('successRate').textContent = successRate + '%';
    
    // Badges
    const badgesGrid = document.getElementById('badgesGrid');
    badgesGrid.innerHTML = '';
    
    badges.forEach(badge => {
        const isUnlocked = unlockedBadges.includes(badge.id);
        const badgeDiv = document.createElement('div');
        badgeDiv.className = `badge ${isUnlocked ? 'unlocked' : 'locked'}`;
        badgeDiv.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
        `;
        badgesGrid.appendChild(badgeDiv);
    });
    
    // Historique
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    if (scores.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--text-light);">Aucune simulation effectuée pour le moment.</p>';
    } else {
        // Afficher les 10 dernières simulations
        scores.slice(-10).reverse().forEach(score => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div>
                    <strong>Tirage n°${score.numero}</strong>
                    <br>
                    <small>${score.date} à ${score.time}</small>
                </div>
                <div style="text-align: right;">
                    <strong>${score.correctAnswers}/3</strong> (${score.percentage}%)
                    <br>
                    <small style="color: var(--success);">+${score.points} pts</small>
                </div>
            `;
            historyList.appendChild(historyItem);
        });
    }
}

// ===== EXPORT DES RÉSULTATS =====
function exportScores() {
    const scores = getAllScores();
    
    if (scores.length === 0) {
        alert('Aucune donnée à exporter.');
        return;
    }
    
    // Créer un CSV
    let csv = 'Date,Heure,Numéro tirage,Score,Pourcentage,Points\n';
    scores.forEach(score => {
        csv += `${score.date},${score.time},${score.numero},${score.correctAnswers}/3,${score.percentage}%,${score.points}\n`;
    });
    
    // Télécharger le fichier
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jmb_scores_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// ===== RÉINITIALISATION =====
function resetAllScores() {
    if (confirm('⚠️ Attention ! Cette action supprimera TOUS tes scores et badges. Es-tu sûr(e) ?')) {
        if (confirm('Vraiment sûr(e) ? Cette action est irréversible !')) {
            localStorage.removeItem('jmb_scores');
            localStorage.removeItem('jmb_badges');
            alert('✅ Tous les scores ont été réinitialisés.');
            location.reload();
        }
    }
}

// ===== ÉVÉNEMENTS =====
if (document.getElementById('exportBtn')) {
    document.getElementById('exportBtn').addEventListener('click', exportScores);
}

if (document.getElementById('resetBtn')) {
    document.getElementById('resetBtn').addEventListener('click', resetAllScores);
}
