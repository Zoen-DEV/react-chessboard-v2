import { ReactNode, useEffect, useRef } from "react";
import { useDrop } from "react-dnd";

import { useChessboard } from "../context/chessboard-context";
import { BoardOrientation, Coords, Piece, Square as Sq } from "../types";
import { kingIsInCheck } from "../functions";

type SquareProps = {
  children: ReactNode;
  setSquares: React.Dispatch<React.SetStateAction<{ [square in Sq]?: Coords }>>;
  square: Sq;
  squareColor: "white" | "black";
  squareHasPremove: boolean;
};

export function Square({
  square,
  squareColor,
  setSquares,
  squareHasPremove,
  children,
}: SquareProps) {
  const squareRef = useRef<HTMLElement>(null);
  const {
    tagToDisplay,
    autoPromoteToQueen,
    boardWidth,
    boardOrientation,
    clearArrows,
    currentPosition,
    currentRightClickDown,
    customBoardStyle,
    customDarkSquareStyle,
    customDropSquareStyle,
    customLightSquareStyle,
    customPremoveDarkSquareStyle,
    customPremoveLightSquareStyle,
    customSquare: CustomSquare,
    customSquareStyles,
    drawNewArrow,
    handleSetPosition,
    handleSparePieceDrop,
    isWaitingForAnimation,
    lastPieceColour,
    lastSquareDraggedOver,
    onArrowDrawEnd,
    onDragOverSquare,
    onMouseOutSquare,
    onMouseOverSquare,
    onPieceDrop,
    onLeftClickDown,
    onPromotionCheck,
    onRightClickDown,
    onRightClickUp,
    onSquareClick,
    setLastSquareDraggedOver,
    setPromoteFromSquare,
    setPromoteToSquare,
    setShowPromoteDialog,

    onLeftClickUp,
    isAltKeyDown,
    isShiftKeyDown,
    customArrowColor,
    isShiftAltKeyDown,
    setCurrentArrowColor,
    currentLeftClickDown,
    altLeftClickArrowColor,
    shiftLeftClickArrowColor,
    shiftRightClickArrowColor,
    shiftAltLeftClickArrowColor,
    shiftAltRightClickArrowColor,
    displayedMoveData,
    fenString,
  } = useChessboard();

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "piece",
      drop: handleDrop,
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [
      square,
      currentPosition,
      onPieceDrop,
      isWaitingForAnimation,
      lastPieceColour,
    ],
  );

  type BoardPiece = {
    piece: Piece;
    readonly isSpare: false;
    square: Sq;
    id: number;
  };
  type SparePiece = { piece: Piece; readonly isSpare: true; id: number };

  function handleDrop(item: BoardPiece | SparePiece) {
    if (item.isSpare) {
      handleSparePieceDrop(item.piece, square);
      return;
    }
    if (onPromotionCheck(item.square, square, item.piece)) {
      if (autoPromoteToQueen) {
        handleSetPosition(
          item.square,
          square,
          item.piece[0] === "w" ? "wQ" : "bQ",
        );
      } else {
        setPromoteFromSquare(item.square);
        setPromoteToSquare(square);
        setShowPromoteDialog(true);
      }
    } else {
      handleSetPosition(item.square, square, item.piece, true);
    }
  }

  useEffect(() => {
    if (squareRef.current) {
      const { x, y } = squareRef.current.getBoundingClientRect();
      setSquares((oldSquares) => ({ ...oldSquares, [square]: { x, y } }));
    }
  }, [boardWidth, boardOrientation]);

  const defaultSquareStyle = {
    ...borderRadius(square, boardOrientation, customBoardStyle),
    ...(squareColor === "black"
      ? customDarkSquareStyle
      : customLightSquareStyle),
    ...(squareHasPremove &&
      (squareColor === "black"
        ? customPremoveDarkSquareStyle
        : customPremoveLightSquareStyle)),
    ...(isOver && customDropSquareStyle),
    position: "relative",
  } as React.CSSProperties;

  const isCheckSquare = kingIsInCheck(fenString ?? "", currentPosition);

  return (
    <div
      ref={drop}
      style={defaultSquareStyle}
      data-square-color={squareColor}
      data-square={square}
      onTouchMove={(e) => {
        // Handle touch events on tablet and mobile not covered by onMouseOver/onDragEnter
        const touchLocation = e.touches[0];
        const touchElement = document.elementsFromPoint(
          touchLocation.clientX,
          touchLocation.clientY,
        );
        const draggedOverSquare = touchElement
          ?.find((el) => el.getAttribute("data-square"))
          ?.getAttribute("data-square") as Sq;
        if (draggedOverSquare && draggedOverSquare !== lastSquareDraggedOver) {
          setLastSquareDraggedOver(draggedOverSquare);
          onDragOverSquare(draggedOverSquare);
        }
      }}
      onMouseOver={(e) => {
        // noop if moving from child of square into square.

        if (e.buttons === 2 && currentRightClickDown) {
          drawNewArrow(currentRightClickDown, square);
        }

        if (e.buttons === 1 && currentLeftClickDown) {
          drawNewArrow(currentLeftClickDown, square);
        }

        if (
          e.relatedTarget &&
          e.currentTarget.contains(e.relatedTarget as Node)
        ) {
          return;
        }

        onMouseOverSquare(square);
      }}
      onMouseOut={(e) => {
        // noop if moving from square into a child of square.
        if (
          e.relatedTarget &&
          e.currentTarget.contains(e.relatedTarget as Node)
        )
          return;
        onMouseOutSquare(square);
      }}
      onMouseDown={(e) => {
        if (e.button === 2) {
          if (isAltKeyDown) setCurrentArrowColor(altLeftClickArrowColor);

          if (isShiftKeyDown) setCurrentArrowColor(shiftRightClickArrowColor);

          if (isShiftAltKeyDown)
            setCurrentArrowColor(shiftAltRightClickArrowColor);

          onRightClickDown(square);
        }

        if (
          e.button === 0 &&
          (isAltKeyDown || isShiftKeyDown || isShiftAltKeyDown)
        ) {
          if (isAltKeyDown) setCurrentArrowColor(altLeftClickArrowColor);

          if (isShiftKeyDown) setCurrentArrowColor(shiftLeftClickArrowColor);

          if (isShiftAltKeyDown)
            setCurrentArrowColor(shiftAltLeftClickArrowColor);

          onLeftClickDown(square);
          return;
        }
      }}
      onMouseUp={(e) => {
        if (e.button === 2) {
          if (currentRightClickDown)
            onArrowDrawEnd(currentRightClickDown, square);

          onRightClickUp(square);
        }

        if (e.button === 0) {
          if (currentLeftClickDown)
            onArrowDrawEnd(currentLeftClickDown, square);

          onLeftClickUp(square);
        }

        setCurrentArrowColor(customArrowColor);
      }}
      onDragEnter={() => onDragOverSquare(square)}
      onClick={() => {
        const piece = currentPosition[square];
        onSquareClick(square, piece);

        if (!isShiftKeyDown && !isShiftAltKeyDown) {
          clearArrows();
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      {(displayedMoveData?.fromSquare === square ||
        displayedMoveData?.toSquare === square) && (
        <div
          style={{
            position: "absolute",
            top: "0px",
            bottom: "0px",
            left: "0px",
            right: "0px",
            backgroundColor: "rgba(155, 199, 0, .41)",
          }}
        ></div>
      )}
      {isCheckSquare && isCheckSquare === square && (
        <div
          style={{
            position: "absolute",
            top: "0px",
            bottom: "0px",
            left: "0px",
            right: "0px",
            backgroundColor: "rgba(255, 0, 0, 0.3)",
            zIndex: 1,
          }}
        ></div>
      )}
      {tagToDisplay && displayedMoveData?.toSquare === square && tagToDisplay}
      {typeof CustomSquare === "string" ? (
        <CustomSquare
          // Type is too complex to properly evaluate, so ignore this line.
          // @ts-ignore
          ref={squareRef as any}
          style={{
            ...size(boardWidth),
            ...center,
            ...(!squareHasPremove && customSquareStyles?.[square]),
          }}
        >
          {children}
        </CustomSquare>
      ) : (
        <CustomSquare
          ref={squareRef}
          square={square}
          squareColor={squareColor}
          style={{
            ...size(boardWidth),
            ...center,
            ...(!squareHasPremove && customSquareStyles?.[square]),
          }}
        >
          {children}
        </CustomSquare>
      )}
    </div>
  );
}

const center = {
  display: "flex",
  justifyContent: "center",
};

const size = (width: number) => ({
  width: width / 8,
  height: width / 8,
});

const borderRadius = (
  square: Sq,
  boardOrientation: BoardOrientation,
  customBoardStyle?: Record<string, string | number>,
) => {
  if (!customBoardStyle?.borderRadius) return {};

  if (square === "a1") {
    return boardOrientation === "white"
      ? { borderBottomLeftRadius: customBoardStyle.borderRadius }
      : { borderTopRightRadius: customBoardStyle.borderRadius };
  }
  if (square === "a8") {
    return boardOrientation === "white"
      ? { borderTopLeftRadius: customBoardStyle.borderRadius }
      : { borderBottomRightRadius: customBoardStyle.borderRadius };
  }
  if (square === "h1") {
    return boardOrientation === "white"
      ? { borderBottomRightRadius: customBoardStyle.borderRadius }
      : { borderTopLeftRadius: customBoardStyle.borderRadius };
  }
  if (square === "h8") {
    return boardOrientation === "white"
      ? { borderTopRightRadius: customBoardStyle.borderRadius }
      : { borderBottomLeftRadius: customBoardStyle.borderRadius };
  }

  return {};
};
