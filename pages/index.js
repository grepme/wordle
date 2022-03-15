import tw, { styled } from "twin.macro";
import React, { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { cloneDeep } from "lodash-es";
import words from "../5words";
import { useKeyPressEvent } from "react-use";
const confetti = require("canvas-confetti");

const re = /[a-zA-Z]+/g;

const LetterBoxInput = tw.div`
  text-white
  font-bold
  width[2ch]
  max-width[calc(min(10ch, 100%))]
  min-height[1.8ch]
  text-center
  text-3xl
  capitalize
  lg:(text-5xl)
`;

const RetryButton = styled.button({
  ...tw`bg-purple-500 rounded-lg p-3 text-white text-2xl cursor-pointer`,
});

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

const Row = ({ onEnter, attempt, onToggleFocus }) => {
  const inputRef = useRef(null);
  const [currentWord, setCurrentWord] = useState(attempt.gussedWord);

  const handleKeyPress = (key) => {
    if (attempt.active) {
      if (key.key == "Enter" && currentWord.length == 5) {
        onEnter(currentWord);
      }
    }
  };

  const updateValue = (value) => {
    const match = value.match(re) || [""];
    if (value.length <= 5) {
      setCurrentWord(match[0]);
    }
  };

  const handleInput = (event) => {
    updateValue(event.target.value);
  };

  useEffect(() => {
    if (inputRef.current !== null) {
      onToggleFocus(inputRef.current);
    }
  }, []);

  useKeyPressEvent([], handleKeyPress);
  return (
    <>
      {attempt.active && (
        <input
          type="text"
          value={currentWord}
          autoFocus={true}
          ref={inputRef}
          autoComplete="off"
          style={{ position: "fixed", top: 0, width: 0, height: 0 }}
          onChange={handleInput}
        />
      )}
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
    this.onClick = props.onClick;
  }

  componentDidMount() {
    this.confetti = confetti.create(this.canvas.current, { resize: true });
  }

  render() {
    if (this.props.on) {
      this.confetti({ particleCount: 500, spread: 120 });
    }
    return <Canvas ref={this.canvas} onClick={this.onClick} />;
  }
}

const GameOverWord = ({ word }) => {
  return (
    <div tw="text-white text-center mb-2">
      The word was <strong>{word}</strong>.
    </div>
  );
};

const Rows = ({ attempts, checkGuess, setActiveInput }) => {
  return attempts.map((attemptRow) => {
    return (
      <div tw="flex justify-center" key={attemptRow.index}>
        <Row
          attempt={attemptRow}
          onEnter={checkGuess}
          onToggleFocus={setActiveInput}
        />
      </div>
    );
  });
};

const newGameState = () => {
  return [
    { index: 1, active: true, gussedWord: "", colors: [] },
    { index: 2, active: false, gussedWord: "", colors: [] },
    { index: 3, active: false, gussedWord: "", colors: [] },
    { index: 4, active: false, gussedWord: "", colors: [] },
    { index: 5, active: false, gussedWord: "", colors: [] },
    { index: 6, active: false, gussedWord: "", colors: [] },
  ];
};

export default function Home() {
  const [word, setWord] = useState("");
  const [attempt, setAttempt] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [gameID, setGameID] = useState("");

  const randomWord = () => words[Math.floor(Math.random() * words.length)];

  const resetGame = () => {
    setGameID(Math.random().toString());
    setWord(randomWord());
    setAttempt(newGameState());
    setGameOver(false);
  };

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

  const toggleFocusOnActiveInput = () => {
    if (activeInput) {
      activeInput.focus();
    }
  };

  useEffect(() => {
    resetGame();
  }, []);

  return (
    <div
      tw="bg-black w-screen h-screen"
      onClick={() => toggleFocusOnActiveInput()}
    >
      <Head>
        <title>Wordle</title>
        <meta name="description" content="Wordle, random" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div tw="lg:(p-20) p-2">
        <Rows
          key={gameID}
          attempts={attempt}
          checkGuess={checkGuess}
          setActiveInput={setActiveInput}
        />
      </div>
      <div tw="flex justify-center w-full cursor-not-allowed pointer-events-none">
        <CanvasConfetti on={gameOver == "win"} />
      </div>
      {gameOver == "lose" ? (
        <>
          <GameOverWord word={word} />
          <div tw="flex justify-center w-full">
            <RetryButton onClick={resetGame}>Retry</RetryButton>
          </div>
        </>
      ) : null}
    </div>
  );
}
