let timerID = '';
let questionIdx = 0;
const maxCountdown = 11;
let questionTime = maxCountdown;
const numQuestions = 3;
const numChoices = 4;

let choiceElements = document.querySelectorAll('.choice');
const quizBtn = document.querySelector('.quiz-btn');
const nextQuestionBtn = document.querySelector('.next-btn');
const quizContainer = document.querySelector('.quiz-container');
const resultsContainer = document.querySelector('.results-container');
resultsContainer.classList.add('show');

// button events
nextQuestionBtn.addEventListener('click', event => {
    // disable next question if no answer has been given
    if (document.querySelector('.correct') === null){
        event.target.blur();
        return;
    }
    event.target.classList.remove('active');
    choiceElements.forEach(choice => {
        choice.className = 'choice';
    })
    nextQuestion();
});

quizBtn.addEventListener('click', async event => {
    await loadTestData();
    await startQuiz();
});

const testData = {
    answers: [],
    choices: [],
    // scores are t/f
    scoreCard: [],
    timeElapsed: 0,
    getStats(stats) {
        const score = stats.querySelector('.score-value');
        const time = stats.querySelector('.time-value');
        time.textContent = this.timeElapsed + 's';
        const correctCount = this.scoreCard.filter(x => x).length;
        score.innerHTML = `${correctCount}/${numQuestions}`;
    },
    displayLineup(lineup) {
        if (this.scoreCard.length < numQuestions) {
            return;
        }
        lineup.innerHTML = '';

        for (let answerIdx = 0; answerIdx < this.scoreCard.length; answerIdx++) {
            const answer = this.answers[answerIdx];
            const show = this.scoreCard[answerIdx] ? 'show' : '';
            let img = `<img src="${answer.img}" class="pokemon-img ${show}">`;
            lineup.innerHTML += img;
        }
        console.log(lineup.innerHTML);
    }
};

// since using for to array idx, add one for pokemon. ex: 151 limit
function getRng(n) {
    return Math.floor(Math.random() * n);
}

async function getPokemon(id) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    const data = await response.json();
    return data;
}

async function getAnswers() {
    const answers = [];
    for (let i = 0; i < numQuestions; i++) {
        let pokemon = await getPokemon(getRng(151));
        pokemon = {
            name: pokemon.name,
            img: pokemon.sprites.other['official-artwork'].front_default,
        };
        answers.push(pokemon);
    }
    return answers;
}

async function getChoices(pokemonAnswerNames) {
    const outerArray = [];
    let innerArray = [];
    for (let a = 0; a < numQuestions; a++) {
        innerArray = [];
        let answerIdx = getRng(numChoices);
        for (let b = 0; b < numChoices; b++) {
            if (b === answerIdx) {
                console.log('push: ', pokemonAnswerNames[a]);
                innerArray.push(pokemonAnswerNames[a]);
            } else {
                let pokemon = await getPokemon(getRng(151));
                innerArray.push(pokemon.name);
            }
        }
        outerArray.push(innerArray);
    }
    return outerArray;
}

async function loadTestData(){
    testData.scoreCard = [];
    testData.timeElapsed = 0;
    testData.answers = await getAnswers();
    testData.choices = await getChoices(testData.answers.map(x => x.name));
    console.log('data loaded')
}

async function startQuiz() {
    await nextQuestion();
    quizContainer.classList.add('show');
    resultsContainer.classList.remove('show');
}

async function nextQuestion() {
    console.log(testData);
    clearInterval(timerID)
    if (questionIdx === numQuestions) {
        endQuiz();
        return;
    }
    timerDisplay();
    const liveScore = document.querySelector('.live-score');
    liveScore.textContent = `${testData.scoreCard.filter(x => x).length} / ${numQuestions}`;
    const answerName = testData.answers[questionIdx].name;
    // load hidden img
    const pokemonImg = document.querySelector('.pokemon-img');
    pokemonImg.classList.remove('show');
    pokemonImg.src = testData.answers[questionIdx].img;

    // assign value to each choice
    choiceElements.forEach((choice, choiceIdx) => {
        choice.textContent = testData.choices[questionIdx][choiceIdx];
    });
    // handle user choice
    choiceElements.forEach(choice => {
        choice.onclick = function (e) {
            // cancel choice if user has already answered
            if (document.querySelector('.correct') !== null){
                choice.blur();
                return;
            }
            showAnswer(answerName, pokemonImg);
            if (e.target.textContent !== answerName) {
                testData.scoreCard.push(false);
                e.target.classList.add('incorrect');
            } else {
                testData.scoreCard.push(true);
            }
            
        };
    });
    choiceElements[0].focus();
    questionIdx++;
}

function showAnswer(answerName, answerImg) {
    choiceElements = document.querySelectorAll('.choice');
    let correctChoice = [...choiceElements].filter(choice => choice.textContent === answerName)[0];
    correctChoice.classList.add('correct');
    answerImg.classList.add('show');
    nextQuestionBtn.classList.add('active');
}

// show score
// show pokemon answers lineup
// if pokemon guess was right, show in color
// else show without 
function endQuiz() {
    questionIdx = 0;
    quizContainer.classList.remove('show');
    resultsContainer.classList.add('show');
    quizBtn.textContent = 'Replay';
    const stats = document.querySelector('.stats');
    const lineup = document.querySelector('.lineup');
    stats.classList.add('show');
    lineup.classList.add('show');

    testData.getStats(stats);
    testData.displayLineup(lineup);

}

//10s timer

// if runs out and questionidx === numQuestions
//  then end quiz
// if runs out 
//  then show question
function timerDisplay() {
    questionTime = maxCountdown;
    const liveCountdown = document.querySelector('.live-countdown');
    timerID = setInterval(() =>{
        questionTime -= 1;
        testData.timeElapsed += 1;
        liveCountdown.textContent = `Time Left: ${questionTime}s`
        // if time runs out, reveal answer
        if (questionTime <= 0){
            clearInterval(timerID);
            testData.scoreCard.push(false);
            const answerName = testData.answers[questionIdx - 1].name;
            const pokemonImg = document.querySelector('.pokemon-img');
            showAnswer(answerName, pokemonImg)
        }
    }, 1000)
}

