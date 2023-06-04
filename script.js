// TODO: 
    // declare global var
    // showQuestion
    // handle question answer
    // handle next click
let timerID = '';
// let pokemonChoices = [];
// let pokemonAnswers = [];
let questionIdx = 0;
const numQuestions = 3;
const numChoices = 4;
let choiceElements = document.querySelectorAll('.choice');
const nextQuestionBtn = document.querySelector('.next-btn');
const quizContainer = document.querySelector('.quiz-container');
const resultsContainer = document.querySelector('.results-container');
nextQuestionBtn.addEventListener('click', event => {
    event.target.classList.remove('active');
    event.target.setAttribute('disabled', 'true');
    choiceElements.forEach(choice => {
        choice.className = 'choice';
        choice.removeAttribute('disabled', 'true')
    })
})

const testData = {
    answers: [],
    choices: [],
    // scores are t/f
    scoreCard: [],
    getScore(){
        const score = document.querySelector('.score');
        const correctCount = this.scoreCard.filter(x => x).length;
        score.innerHTML = `${correctCount}/${numQuestions}`
    },
    displayLineup(){
        if (this.scoreCard.length < numQuestions){
            return;
        }
        const lineup = document.querySelector('.lineup');
        lineup.innerHTML = '';

        for (let answerIdx = 0; answerIdx < this.scoreCard.length; answerIdx++){
            const answer = this.answers[answerIdx];
            const show = this.scoreCard[answerIdx] ? 'show' : '';
            let img = `<img src="${answer.img}" class="pokemon-img ${show}">`
            lineup.innerHTML += img;
        }
        console.log(lineup.innerHTML)
    }
}

// since using for to array idx, add one for pokemon. ex: 151 limit
function getRng(n){
    return Math.floor(Math.random() * n)
}

async function getPokemon(id){
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    const data = await response.json();
    return data;
}

async function getAnswers(){
    const answers = [];
    for(let i = 0; i < numQuestions; i++){
        let pokemon = await getPokemon(getRng(151))
        pokemon = {
            name: pokemon.name,
            img: pokemon.sprites.other['official-artwork'].front_default,
        }
        answers.push(pokemon)
    }
    return answers;
}

async function getChoices(pokemonAnswerNames){
    const outerArray = [];
    let innerArray = [];
    for (let a = 0; a < numQuestions; a++){
        innerArray = [];
        let answerIdx = getRng(numChoices);
        for (let b= 0; b < numChoices; b++){
            if (b === answerIdx){
                console.log('push: ', pokemonAnswerNames[a])
                innerArray.push(pokemonAnswerNames[a])
            } else{
                let pokemon = await getPokemon(getRng(151));
                innerArray.push(pokemon.name);
            }
        }
        outerArray.push(innerArray)
    }
    return outerArray;
}

async function startQuiz(){
    testData.answers = await getAnswers();
    testData.choices = await getChoices(testData.answers.map(x => x.name));

    quizContainer.classList.add('show');

    nextQuestion()
    nextQuestionBtn.addEventListener('click', e => nextQuestion());
    console.log(nextQuestionBtn)
}

async function nextQuestion(){;
    if (questionIdx === numQuestions){
        endQuiz();
    }
    const answerName = testData.answers[questionIdx].name;
    // load hidden img
    const pokemonImg = document.querySelector('.pokemon-img');
    pokemonImg.classList.remove('show');
    pokemonImg.src = testData.answers[questionIdx].img;

    // assingn value to each choice
    choiceElements.forEach((choice, choiceIdx) => {
        choice.textContent = testData.choices[questionIdx][choiceIdx];
    })
    // handle user choice
    choiceElements.forEach(choice => {
        choice.onclick = function (e){
            nextQuestionBtn.focus();
            showAnswer(answerName, pokemonImg);
            if (e.target.textContent !== answerName){
                testData.scoreCard.push(false);
                e.target.classList.add('incorrect');
            } else{
                testData.scoreCard.push(true);
            }
            choiceElements.forEach(choiceBtn => {
                choiceBtn.setAttribute('disabled', 'true')
            })
            
        }
    })
    questionIdx++;
}

function showAnswer(answerName, answerImg){
    choiceElements = document.querySelectorAll('.choice');
    let correctChoice = [...choiceElements].filter(choice => choice.textContent === answerName)[0];
    correctChoice.classList.add('correct');
    answerImg.classList.add('show');
    nextQuestionBtn.removeAttribute('disabled', 'true');
    nextQuestionBtn.classList.add('active');
}

// show score
// show pokemon answers lineup
// if pokemon guess was right, show in color
// else show without 
function endQuiz(){
    quizContainer.classList.remove('show');   
    resultsContainer.classList.add('show');
    
    testData.getScore();
    testData.displayLineup();
    // 
}

//10s timer

// if runs out and questionidx === numQuestions
//  then end quiz
// if runs out 
//  then show question
function timer(){

}

startQuiz();
