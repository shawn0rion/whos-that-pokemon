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

// since using for to array idx, add one for pokemon. ex: 151 limit
function getRng(n){
    return Math.floor(Math.random() * n)
}

async function getPokemon(id){
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    const data = await response.json();
    return data;
}

async function getQuestions(){
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
        innerArray.length = 0;
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
    const pokemonAnswers = await getQuestions();
    const pokemonChoices = await getChoices(pokemonAnswers.map(x => x.name));
    // logs choices !
    console.log(pokemonChoices)
}

startQuiz();
