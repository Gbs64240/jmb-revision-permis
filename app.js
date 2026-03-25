// ===== CHARGEMENT DES QUESTIONS =====
let allQuestions = [];
let currentCategory = 'installation';
let currentQuestionIndex = 0;
let filteredQuestions = [];

// Charger les questions depuis le JSON
async function loadQuestions() {
    try {
        const response = await fetch('js/questions.json');
        const data = await response.json();
        allQuestions = data.questions;
        filterQuestionsByCategory(currentCategory);
    } catch (error) {
        console.error('Erreur de chargement des questions:', error);
    }
}

// Filtrer les questions par catégorie
function filterQuestionsByCategory(category) {
    currentCategory = category;
    filteredQuestions = allQuestions.filter(q => q.chapitre === category);
    currentQuestionIndex = 0;
    displayFlashcard();
    updateProgress();
}

// ===== MODE RÉVISION =====
function displayFlashcard() {
    if (filteredQuestions.length === 0) return;

    const question = filteredQuestions[currentQuestionIndex];
    
    document.getElementById('cardNumber').textContent = `Question ${currentQuestionIndex + 1}/${filteredQuestions.length}`;
    document.getElementById('cardTitle').textContent = question.titre;
    document.getElementById('cardQuestion').textContent = question.question;
    document.getElementById('answerText').textContent = question.reponse;
    document.getElementById('tipText').textContent = question.astuce;
    
    // Afficher les erreurs fréquentes
    const errorsList = document.getElementById('errorsList');
    errorsList.innerHTML = '';
    question.erreurs.forEach(erreur => {
        const li = document.createElement('li');
        li.textContent = erreur;
        errorsList.appendChild(li);
    });

    // Cacher la réponse par défaut
    document.getElementById('cardAnswer').classList.add('hidden');
    document.getElementById('revealBtn').classList.remove('hidden');

    // Gestion des boutons de navigation
    document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
    document.getElementById('nextBtn').disabled = currentQuestionIndex === filteredQuestions.length - 1;
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    const percentage = ((currentQuestionIndex + 1) / filteredQuestions.length) * 100;
    progressFill.style.width = percentage + '%';
    progressText.textContent = `${currentQuestionIndex + 1}/${filteredQuestions.length}`;
}

// ===== GESTION DES ÉVÉNEMENTS - MODE RÉVISION =====
document.addEventListener('DOMContentLoaded', () => {
    // Charger les questions
    loadQuestions();

    // Sélecteur de chapitre
    const chapterButtons = document.querySelectorAll('.chapter-btn');
    chapterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            chapterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterQuestionsByCategory(btn.dataset.category);
        });
    });

    // Bouton révéler la réponse
    const revealBtn = document.getElementById('revealBtn');
    if (revealBtn) {
        revealBtn.addEventListener('click', () => {
            document.getElementById('cardAnswer').classList.remove('hidden');
            revealBtn.classList.add('hidden');
        });
    }

    // Navigation
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                displayFlashcard();
                updateProgress();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentQuestionIndex < filteredQuestions.length - 1) {
                currentQuestionIndex++;
                displayFlashcard();
                updateProgress();
            }
        });
    }
});

// ===== MODE SIMULATION =====
let simulationQuestions = [];
let currentSimulationIndex = 0;
let userAnswers = [];
let drawnNumber = null;

function startSimulation() {
    // Tirage au sort d'un numéro entre 1 et 100
    drawnNumber = Math.floor(Math.random() * 100) + 1;
    
    // Animation du tirage
    const tirageDisplay = document.querySelector('.tirage-number');
    let counter = 0;
    const interval = setInterval(() => {
        tirageDisplay.textContent = Math.floor(Math.random() * 100) + 1;
        counter++;
        if (counter > 20) {
            clearInterval(interval);
            tirageDisplay.textContent = drawnNumber;
            
            setTimeout(() => {
                // Sélectionner 3 questions aléatoires
                const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
                simulationQuestions = shuffled.slice(0, 3);
                currentSimulationIndex = 0;
                userAnswers = [];
                
                // Afficher la première question
                document.getElementById('tirageSection').classList.add('hidden');
                document.getElementById('quizSection').classList.remove('hidden');
                displaySimulationQuestion();
            }, 1000);
        }
    }, 100);
}

function displaySimulationQuestion() {
    const question = simulationQuestions[currentSimulationIndex];
    
    document.getElementById('currentQ').textContent = currentSimulationIndex + 1;
    document.getElementById('quizQuestion').textContent = question.question;
    document.getElementById('userAnswer').value = '';
    document.getElementById('feedback').classList.add('hidden');
    document.getElementById('submitAnswerBtn').classList.remove('hidden');
    document.getElementById('nextQuestionBtn').classList.add('hidden');
}

function submitAnswer() {
    const userAnswer = document.getElementById('userAnswer').value.trim();
    const question = simulationQuestions[currentSimulationIndex];
    
    if (userAnswer === '') {
        alert('Merci de saisir une réponse !');
        return;
    }

    // Vérification simple (contient des mots-clés de la réponse)
    const keywords = question.reponse.toLowerCase().split(' ').filter(word => word.length > 4);
    const userWords = userAnswer.toLowerCase().split(' ');
    const matchCount = keywords.filter(keyword => userWords.some(word => word.includes(keyword))).length;
    
    const isCorrect = matchCount >= Math.ceil(keywords.length * 0.4); // 40% de correspondance minimum

    userAnswers.push({
        question: question.question,
        userAnswer: userAnswer,
        correctAnswer: question.reponse,
        isCorrect: isCorrect,
        points: isCorrect ? question.points : 0
    });

    // Afficher le feedback
    const feedback = document.getElementById('feedback');
    const feedbackContent = document.getElementById('feedbackContent');
    const correctAnswer = document.getElementById('correctAnswer');
    
    feedback.classList.remove('hidden', 'correct', 'incorrect');
    feedback.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    feedbackContent.innerHTML = isCorrect 
        ? '✅ <strong>Bonne réponse !</strong> +' + question.points + ' points'
        : '❌ <strong>Réponse incomplète ou incorrecte</strong>';
    
    correctAnswer.innerHTML = '<strong>Réponse attendue :</strong><br>' + question.reponse;

    document.getElementById('submitAnswerBtn').classList.add('hidden');
    
    if (currentSimulationIndex < simulationQuestions.length - 1) {
        document.getElementById('nextQuestionBtn').classList.remove('hidden');
    } else {
        document.getElementById('nextQuestionBtn').textContent = 'Voir les résultats';
        document.getElementById('nextQuestionBtn').classList.remove('hidden');
    }
}

function nextSimulationQuestion() {
    currentSimulationIndex++;
    
    if (currentSimulationIndex < simulationQuestions.length) {
        displaySimulationQuestion();
    } else {
        showSimulationResults();
    }
}

function showSimulationResults() {
    const totalPoints = userAnswers.reduce((sum, answer) => sum + answer.points, 0);
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    
    // Sauvegarder le score
    saveSimulationScore(drawnNumber, correctCount, totalPoints);

    document.getElementById('quizSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.remove('hidden');
    
    document.getElementById('finalScore').textContent = `${correctCount}/3`;
    document.getElementById('pointsEarned').textContent = `+${totalPoints} points`;
    
    // Détails des réponses
    const resultsDetails = document.getElementById('resultsDetails');
    resultsDetails.innerHTML = '<h3>📋 Détail de tes réponses</h3>';
    
    userAnswers.forEach((answer, index) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.innerHTML = `
            <h4>${index + 1}. ${answer.question}</h4>
            <p><strong>Ta réponse :</strong> ${answer.userAnswer}</p>
            <p class="${answer.isCorrect ? 'correct' : 'incorrect'}">
                ${answer.isCorrect ? '✅ Correct' : '❌ Incorrect'}
            </p>
            ${!answer.isCorrect ? `<p><strong>Réponse attendue :</strong> ${answer.correctAnswer}</p>` : ''}
        `;
        resultsDetails.appendChild(div);
    });
}

function resetSimulation() {
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('tirageSection').classList.remove('hidden');
    document.querySelector('.tirage-number').textContent = '--';
}

// ===== GESTION DES ÉVÉNEMENTS - MODE SIMULATION =====
if (document.getElementById('startSimBtn')) {
    document.getElementById('startSimBtn').addEventListener('click', startSimulation);
}

if (document.getElementById('submitAnswerBtn')) {
    document.getElementById('submitAnswerBtn').addEventListener('click', submitAnswer);
}

if (document.getElementById('nextQuestionBtn')) {
    document.getElementById('nextQuestionBtn').addEventListener('click', nextSimulationQuestion);
}

if (document.getElementById('newSimBtn')) {
    document.getElementById('newSimBtn').addEventListener('click', resetSimulation);
}

// ===== MODE MÉMO RAPIDE =====
function loadMemoCards() {
    const memoGrid = document.getElementById('memoGrid');
    if (!memoGrid) return;

    memoGrid.innerHTML = '';

    allQuestions.forEach(question => {
        const card = document.createElement('div');
        card.className = 'memo-card';
        card.innerHTML = `
            <h3>${question.titre}</h3>
            <p><strong>Question :</strong> ${question.question}</p>
            <p><strong>Réponse :</strong> ${question.reponse}</p>
            <p class="memo-tip">💡 ${question.astuce}</p>
        `;
        memoGrid.appendChild(card);
    });
}

// Recherche dans le mémo
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.memo-card');
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });
}

// Charger les questions au démarrage pour le mémo
if (document.getElementById('memoGrid')) {
    loadQuestions().then(() => loadMemoCards());
}
