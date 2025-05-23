import { COLUMNS } from "../consts";
import { useChessboard } from "../context/chessboard-context";

type NotationProps = {
  row: number;
  col: number;
};

export function Notation({ row, col }: NotationProps) {
  const {
    boardOrientation,
    boardWidth,
    customDarkSquareStyle,
    customLightSquareStyle,
    customNotationStyle,
  } = useChessboard();

  const whiteColor = customLightSquareStyle.backgroundColor;
  const blackColor = customDarkSquareStyle.backgroundColor;

  const isRow = col === 0;
  const isColumn = row === 7;

  const isLastRow = col === 7;
  const isFirstRow = col === 0;

  const isLastColumn = row === 7;
  const isFirstColumn = row === 0;

  const isTopRightSquare = isLastRow && isFirstColumn;
  const isTopLeftSquare = isFirstRow && isFirstColumn;
  const isBottomRightSquare = isLastRow && isLastColumn;
  const isBottomLeftSquare = isFirstRow && isLastColumn;

  function getRow() {
    return boardOrientation === "white" ? 8 - row : row + 1;
  }

  function getColumn() {
    return boardOrientation === "black" ? COLUMNS[7 - col] : COLUMNS[col];
  }

  function renderTopLeft() {
    return (
      <>
        <div
          style={{
            zIndex: 3,
            position: "absolute",
            ...{ color: whiteColor },
            ...numericStyle(boardWidth, customNotationStyle),
            left: "-20px",
            top: "50%",
          }}
        >
          {getRow()}
        </div>
        <div
          style={{
            zIndex: 3,
            position: "absolute",
            ...{ color: whiteColor },
            ...alphaStyle(boardWidth, customNotationStyle),
            top: "-30px",
          }}
        >
          {getColumn()}
        </div>
      </>
    );
  }

  function renderTopRight() {
    return (
      <>
        <div
          style={{
            zIndex: 3,
            position: "absolute",
            ...{ color: whiteColor },
            ...numericStyle(boardWidth, customNotationStyle),
            right: "-20px",
            top: "50%",
          }}
        >
          {getRow()}
        </div>
        <div
          style={{
            zIndex: 3,
            position: "absolute",
            ...{ color: whiteColor },
            ...alphaStyle(boardWidth, customNotationStyle),
            top: "-30px",
          }}
        >
          {getColumn()}
        </div>
      </>
    );
  }

  function renderBottomLeft() {
    return (
      <>
        <div
          style={{
            zIndex: 3,
            position: "absolute",
            ...{ color: whiteColor },
            ...numericStyle(boardWidth, customNotationStyle),
            left: "-20px",
            top: "50%",
          }}
        >
          {getRow()}
        </div>
        <div
          style={{
            zIndex: 3,
            position: "absolute",
            ...{ color: whiteColor },
            ...alphaStyle(boardWidth, customNotationStyle),
            bottom: "-30px",
          }}
        >
          {getColumn()}
        </div>
      </>
    );
  }

  function renderBottomRight() {
    return (
      <>
        <div
          style={{
            zIndex: 3,
            position: "absolute",
            ...{ color: whiteColor },
            ...numericStyle(boardWidth, customNotationStyle),
            right: "-20px",
            top: "50%",
          }}
        >
          {getRow()}
        </div>
        <div
          style={{
            zIndex: 3,
            position: "absolute",
            ...{ color: whiteColor },
            ...alphaStyle(boardWidth, customNotationStyle),
            bottom: "-30px",
          }}
        >
          {getColumn()}
        </div>
      </>
    );
  }

  function renderBottomLetters() {
    return (
      <div
        style={{
          userSelect: "none",
          zIndex: 3,
          position: "absolute",
          ...{ color: col % 2 !== 0 ? blackColor : whiteColor },
          ...alphaStyle(boardWidth, customNotationStyle),
          bottom: "-30px",
        }}
      >
        {getColumn()}
      </div>
    );
  }

  function renderTopLetters() {
    return (
      <div
        style={{
          userSelect: "none",
          zIndex: 3,
          position: "absolute",
          ...{ color: col % 2 !== 0 ? blackColor : whiteColor },
          ...alphaStyle(boardWidth, customNotationStyle),
          top: "-30px",
        }}
      >
        {getColumn()}
      </div>
    );
  }

  function renderLeftNumbers() {
    return (
      <div
        style={{
          userSelect: "none",
          zIndex: 3,
          position: "absolute",
          ...(boardOrientation === "black"
            ? { color: row % 2 === 0 ? blackColor : whiteColor }
            : { color: row % 2 === 0 ? blackColor : whiteColor }),
          ...numericStyle(boardWidth, customNotationStyle),
          left: "-20px",
          top: "50%",
        }}
      >
        {getRow()}
      </div>
    );
  }

  function renderRightNumbers() {
    return (
      <div
        style={{
          userSelect: "none",
          zIndex: 3,
          position: "absolute",
          ...(boardOrientation === "black"
            ? { color: row % 2 === 0 ? blackColor : whiteColor }
            : { color: row % 2 === 0 ? blackColor : whiteColor }),
          ...numericStyle(boardWidth, customNotationStyle),
          right: "-20px",
          top: "50%",
        }}
      >
        {getRow()}
      </div>
    );
  }

  if (isBottomRightSquare) {
    return renderBottomRight();
  }

  if (isTopRightSquare) {
    return renderTopRight();
  }

  if (isTopLeftSquare) {
    return renderTopLeft();
  }

  if (isBottomLeftSquare) {
    return renderBottomLeft();
  }

  if (isColumn) {
    return renderBottomLetters();
  }

  if (isFirstColumn) {
    return renderTopLetters();
  }

  if (isRow) {
    return renderLeftNumbers();
  }

  if (isLastRow) {
    return renderRightNumbers();
  }

  return null;
}

const alphaStyle = (
  width: number,
  customNotationStyle?: Record<string, string | number>,
) => ({
  alignSelf: "flex-end",
  paddingLeft: width / 8 - width / 48,
  fontSize: width / 24,
  ...customNotationStyle,
});

const numericStyle = (
  width: number,
  customNotationStyle?: Record<string, string | number>,
) => ({
  alignSelf: "flex-start",
  paddingRight: width / 8 - width / 48,
  fontSize: width / 24,
  marginTop: -(width / 48),
  ...customNotationStyle,
});
