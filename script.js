let secretword;
let givenword = "";
let rownumber = 1;
let gameInProgress = true;
const ANSWER_LENGTH = 5;
const loadingDiv = document.querySelector(".info-bar");

async function getword() {
  let isLoading = true;
  setLoading(isLoading);
  //   const promise = await fetch("https://words.dev-apis.com/word-of-the-day");
  //   const processpromise = await promise.json();
  //   secretword = processpromise.word.toUpperCase();
  const response = await fetch("./get.json");
  const wordList = await response.json();

  secretword = getRandomWord(wordList);
  isLoading = false;
  setLoading(isLoading);
  console.log("helo", secretword);

  document.addEventListener("keydown", (key) => {
    if (!gameInProgress) return;
    if (isKey(key.key)) {
      key = key["key"];
      word(key);
      rerender(givenword);
    } else if (key.key === "Backspace") {
      if (givenword.length !== 0) {
        givenword = givenword.slice(0, -1);
        rerender(givenword);
      }
    } else if (givenword.length === ANSWER_LENGTH && key.key === "Enter") {
      if (givenword === secretword) {
        alert(`You won`);
        stopGame(true);
        return;
      }
      check(givenword);
    }
  });
  async function check(word) {
    isLoading = true;
    setLoading(isLoading);
    let bool = await valid(givenword);
    isLoading = false;
    setLoading(isLoading);
    if (bool) {
      let secrettemp = secretword.split("");
      let giventemp = word.split("");
      let mapped = map(secretword);
      for (let i = 0; i < 5; i++) {
        if (
          secrettemp.includes(giventemp[i]) &&
          secrettemp[i] === giventemp[i]
        ) {
          changediv(i + 1, 1);
          mapped[giventemp[i]]--;
        }
      }
      for (let i = 0; i < 5; i++) {
        console.log(secrettemp, secrettemp[i], giventemp[i]);
        if (
          secrettemp.includes(giventemp[i], i) &&
          secrettemp[i] === giventemp[i]
        ) {
          // do nothing
        } else if (
          secrettemp.includes(giventemp[i]) &&
          mapped[giventemp[i]] > 0
        ) {
          changediv(i + 1, 2);
          mapped[giventemp[i]]--;
        } else {
          changediv(i + 1, 3);
        }
      }
      if (rownumber == 6) {
        alert(`The Word was ${secretword}`);
        stopGame(false);
        return;
      } else {
        rownumber += 1;
        givenword = "";
      }
    } else {
      changediv(null, 4);
    }
  }
  function stopGame(isWinner) {
    gameInProgress = false; // Set the flag to indicate that the game has concluded

    if (isWinner) {
      console.log("bye");
      changediv(1, 1);
      changediv(2, 1);
      changediv(3, 1);
      changediv(4, 1);
      changediv(5, 1);
      document.querySelector(".brand").classList.add("winner");
    }
    return;
  }
}
getword();

function isKey(key) {
  return /^[a-zA-Z]$/.test(key);
}
function getRandomWord(wordsArray) {
  const randomIndex = Math.floor(Math.random() * wordsArray.length);
  return wordsArray[randomIndex].toUpperCase();
}

function word(letter) {
  if (givenword.length === 5) {
    givenword = givenword.replace(/.$/, letter.toUpperCase());
  } else {
    givenword += letter.toUpperCase();
  }
}

function rerender(word) {
  for (let i = 1; i <= 5; i++) {
    let div = document.querySelector(`.row${rownumber} .cell:nth-child(${i})`);
    if (word[i - 1] === undefined) {
      div.innerText = null;
    } else {
      div.innerText = word[i - 1].toUpperCase();
    }
  }
}

function changediv(div, state) {
  if (state === 4) {
    let element = document.querySelectorAll(`.row${rownumber} .cell`);
    for (let i = 0; i < 5; i++) {
      element[i].classList.add("invalid");
    }
  } else {
    let element = document.querySelector(
      `.row${rownumber} .cell:nth-child(${div})`
    );
    switch (state) {
      case 3:
        element.classList.remove("invalid");
        element.classList.add("wrong");
        break;
      case 2:
        element.classList.remove("invalid");
        element.classList.add("lose");
        break;
      case 1:
        console.log(element);
        element.classList.remove("invalid");
        element.classList.add("correct");
        break;
    }
  }
}

async function valid(word) {
  const promise = await fetch("https://words.dev-apis.com/validate-word", {
    method: "POST",
    body: JSON.stringify({ word: `${word}` }),
  });
  const processpromise = await promise.json();
  return processpromise.validWord === true;
}

function map(word) {
  let obj = {};
  for (let i = 0; i < word.length; i++) {
    if (obj[word[i]]) {
      obj[word[i]]++;
    } else {
      obj[word[i]] = 1;
    }
  }
  return obj;
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}
