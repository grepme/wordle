import tw, { styled } from "twin.macro";
import React, { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import words from "../5words";
import { useKeyPressEvent } from "react-use";
const confetti = require("canvas-confetti");

const LetterBoxInput = tw.div`
  text-white
  font-bold
  text-5xl
  width[2ch]
  min-height[1.8ch]
  text-center
  capitalize
`;

const LetterBoxWrapper = styled.div({
  ...tw`border-purple-500 border-2 p-2`,
  variants: {
    color: {
      green: {
        ...tw`bg-green-300`,
      },
      gray: {
        ...tw`bg-gray-700`,
      },
      yellow: {
        ...tw`bg-yellow-300`,
      },
    },
  },
});

const LetterBox = ({ letter, bg }) => {
  return (
    <LetterBoxWrapper color={bg}>
      <LetterBoxInput>{letter}</LetterBoxInput>
    </LetterBoxWrapper>
  );
};

const Row = ({ onEnter, attempt }) => {
  const [currentWord, setCurrentWord] = useState(attempt.gussedWord);
  const [currentLine, setCurrentLine] = useState(0);

  const handleKeyPress = (key) => {
    if (attempt.active) {
      console.log(key);
      if (chars.includes(key.key) && currentWord.length < 5) {
        setCurrentWord(currentWord.concat(key.key));
      } else if (key.key == "Backspace") {
        setCurrentWord(currentWord.slice(0, -1));
      } else if (key.key == "Enter" && currentWord.length == 5) {
        onEnter(currentWord);
      }
    }
  };
  useKeyPressEvent([], handleKeyPress);

  return (
    <>
      {[0, 1, 2, 3, 4].map((letterPosition, index) => (
        <LetterBox
          bg={
            attempt.colors.length > letterPosition
              ? attempt.colors[letterPosition]
              : null
          }
          key={index}
          letter={
            currentWord.length > letterPosition
              ? currentWord[letterPosition]
              : ""
          }
        />
      ))}
    </>
  );
};

// we can't use keyCodes or charAt because it's deprecated
const chars = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const Canvas = styled.canvas({
  ...tw`h-screen absolute top-0`,
  width: "100vw",
  maxWidth: "100vw",
});

class CanvasConfetti extends React.Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.confetti = null;
  }

  componentDidMount() {
    this.confetti = confetti.create(this.canvas.current, { resize: true });
    // this.confetti({ particleCount: 500, spread: 120 });
  }

  render() {
    if (this.props.on) {
      this.confetti({ particleCount: 500, spread: 120 });
    }
    return <Canvas ref={this.canvas} />;
  }
}

const GameOverWord = ({ word }) => {
  return (
    <div tw="text-white text-center">
      The word was <strong>{word}</strong>.
    </div>
  );
};

export default function Home() {
  const [word, setWord] = useState(
    words[Math.floor(Math.random() * words.length)]
  );
  const [gameOver, setGameOver] = useState(false);
  const [attempt, setAttempt] = useState([
    { active: true, gussedWord: "", colors: [] },
    { active: false, gussedWord: "", colors: [] },
    { active: false, gussedWord: "", colors: [] },
    { active: false, gussedWord: "", colors: [] },
    { active: false, gussedWord: "", colors: [] },
    { active: false, gussedWord: "", colors: [] },
  ]);

  const checkGuess = (submittedWord) => {
    const colors = [];
    for (const [index, letter] of submittedWord.split("").entries()) {
      if (word[index] == letter) {
        colors.push("green");
      } else if (word.split("").includes(letter)) {
        colors.push("yellow");
      } else {
        colors.push("gray");
      }
    }
    let newGameState = [...attempt];
    let activeIndex = null;
    newGameState = newGameState.map((gameAttempt, index) => {
      if (gameAttempt.active) {
        gameAttempt.gussedWord = submittedWord;
        gameAttempt.colors = colors;
        gameAttempt.active = false;
        activeIndex = index + 1;
      } else if (activeIndex == index) {
        gameAttempt.active = true;
      }
      return gameAttempt;
    });
    if (submittedWord == word) {
      setGameOver("win");
    } else if (activeIndex >= attempt.length) {
      setGameOver("lose");
    }
    setAttempt(newGameState);
  };

  return (
    <div tw="bg-black w-screen h-screen">
      <Head>
        <title>Wordle</title>
        <meta name="description" content="Wordle, random" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div tw="p-20">
        {[0, 1, 2, 3, 4, 5].map((attemptRow) => {
          return (
            <div tw="flex justify-center" key={attemptRow}>
              <Row attempt={attempt[attemptRow]} onEnter={checkGuess} />
            </div>
          );
        })}
      </div>
      <div tw="flex justify-center w-full">
        <CanvasConfetti on={gameOver == "win"} />
      </div>
      {gameOver == "lose" ? <GameOverWord word={word} /> : null}
    </div>
  );
}
