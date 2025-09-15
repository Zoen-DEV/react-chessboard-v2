import { Fragment } from 'react';
import { useChessboard } from "../context/chessboard-context";
import { getRelativeCoords } from './utils';
import { defaultArrowOptions } from './defaults';

export function Arrows() {
  const {
    id,
    arrows,
    arrowOptions,
    boardOrientation,
    internalArrows,
    newArrowStartSquare,
    newArrowOverSquare,
  } = useChessboard();

  const arrowOptionsData = !arrowOptions ? defaultArrowOptions : arrowOptions;

  const chessboardColumns = 8;
  const chessboardRows = 8;

  const viewBoxWidth = 2048;
  const viewBoxHeight = viewBoxWidth * (chessboardRows / chessboardColumns);

  const currentlyDrawingArrow =
    newArrowStartSquare &&
    newArrowOverSquare &&
    newArrowStartSquare !== newArrowOverSquare.square
      ? {
          startSquare: newArrowStartSquare,
          endSquare: newArrowOverSquare.square,
          color: newArrowOverSquare.color,
        }
      : null;

  const arrowsToDraw = currentlyDrawingArrow
    ? [...arrows, ...internalArrows, currentlyDrawingArrow]
    : [...arrows, ...internalArrows];

  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      style={{
        position: 'absolute',
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        pointerEvents: 'none',
        zIndex: '20', // place above pieces
      }}
    >
      {arrowsToDraw.map((arrow, i) => {
        const arrowData = Array.isArray(arrow) ? {
          startSquare: arrow[0],
          endSquare: arrow[1],
          color: arrow[2] ?? "green",
        } : arrow;

        const from = getRelativeCoords(
          boardOrientation,
          viewBoxWidth,
          chessboardColumns,
          chessboardRows,
          arrowData.startSquare,
        );
        const to = getRelativeCoords(
          boardOrientation,
          viewBoxWidth,
          chessboardColumns,
          chessboardRows,
          arrowData.endSquare,
        );

        // we want to shorten the arrow length so the tip of the arrow is more central to the target square instead of running over the center
        const squareWidth = viewBoxWidth / chessboardColumns;
        let ARROW_LENGTH_REDUCER =
          squareWidth / arrowOptionsData.arrowLengthReducerDenominator;

        const isArrowActive =
          currentlyDrawingArrow && i === arrowsToDraw.length - 1;

        // if there are different arrows targeting the same square make their length a bit shorter
        if (
          arrowsToDraw.some(
            (restArrow) => {
              const restArrowData = Array.isArray(restArrow) ? {
                startSquare: restArrow[0],
                endSquare: restArrow[1],
                color: restArrow[2] ?? "green",
              } : restArrow;
              return restArrowData.startSquare !== arrowData.startSquare &&
              restArrowData.endSquare === arrowData.endSquare;
            },
          ) &&
          !isArrowActive
        ) {
          ARROW_LENGTH_REDUCER =
            squareWidth / arrowOptionsData.sameTargetArrowLengthReducerDenominator;
        }

        // Calculate the difference in x and y coordinates between start and end points
        const dx = to.x - from.x;
        const dy = to.y - from.y;

        // Calculate the total distance between points using Pythagorean theorem
        // This gives us the length of the arrow if it went from center to center
        const r = Math.hypot(dy, dx);

        let pathD: string;

        // Is Knight move
        if (r === Math.hypot(1, 2) * squareWidth) {
          // The mid point is only used in Knight move drawing
          // and here we prioritise drawing along the long edge
          // by defining the midpoint depending on which is bigger X or Y
          const mid =
            Math.abs(dx) < Math.abs(dy)
              ? {
                  x: from.x,
                  y: to.y,
                }
              : {
                  x: to.x,
                  y: from.y,
                };

          // Calculate the difference in x and y coordinates between mid and end points
          const dxEnd = to.x - mid.x;
          const dyEnd = to.y - mid.y;

          // End arrow distance is always one squareWidth for Knight moves
          const rEnd = squareWidth;

          // Calculate the new end point for the arrow
          // We subtract ARROW_LENGTH_REDUCER from the end line distance to make the arrow
          // stop before reaching the center of the target square
          const end = {
            // Calculate new end x coordinate by:
            // 1. Taking the mid->end x direction (dxEnd)
            // 2. Scaling it by (rEnd - ARROW_LENGTH_REDUCER) / rEnd to shorten it
            // 3. Adding to the mid x coordinate
            x: mid.x + (dxEnd * (rEnd - ARROW_LENGTH_REDUCER)) / rEnd,
            // Same calculation for y coordinate
            y: mid.y + (dyEnd * (rEnd - ARROW_LENGTH_REDUCER)) / rEnd,
          };

          pathD = `M${from.x},${from.y} L${mid.x},${mid.y} L${end.x},${end.y}`;
        } else {
          // Calculate the new end point for the arrow
          // We subtract ARROW_LENGTH_REDUCER from the total distance to make the arrow
          // stop before reaching the center of the target square
          const end = {
            // Calculate new end x coordinate by:
            // 1. Taking the original x direction (dx)
            // 2. Scaling it by (r - ARROW_LENGTH_REDUCER) / r to shorten it
            // 3. Adding to the starting x coordinate
            x: from.x + (dx * (r - ARROW_LENGTH_REDUCER)) / r,
            // Same calculation for y coordinate
            y: from.y + (dy * (r - ARROW_LENGTH_REDUCER)) / r,
          };

          pathD = `M${from.x},${from.y} L${end.x},${end.y}`;
        }

        return (
          <Fragment
            key={`${id}-arrow-${arrowData.startSquare}-${arrowData.endSquare}${
              isArrowActive ? '-active' : ''
            }`}
          >
            <marker
              id={`${id}-arrowhead-${i}-${arrowData.startSquare}-${arrowData.endSquare}`}
              markerWidth="2"
              markerHeight="2.5"
              refX="1.25"
              refY="1.25"
              orient="auto"
            >
              <polygon points="0.3 0, 2 1.25, 0.3 2.5" fill={arrowData.color} />
            </marker>
            <path
              d={pathD}
              fill="none"
              opacity={
                isArrowActive
                  ? arrowOptionsData.activeOpacity
                  : arrowOptionsData.opacity
              }
              stroke={arrowData.color}
              strokeWidth={
                isArrowActive
                  ? arrowOptionsData.activeArrowWidthMultiplier *
                    (squareWidth / arrowOptionsData.arrowWidthDenominator)
                  : squareWidth / arrowOptionsData.arrowWidthDenominator
              }
              markerEnd={`url(#${id}-arrowhead-${i}-${arrowData.startSquare}-${arrowData.endSquare})`}
            />
          </Fragment>
        );
      })}
    </svg>
  );
}

// import { Fragment} from "react";

// import { getRelativeCoords } from "../functions";
// import { useChessboard } from "../context/chessboard-context";
// import { Arrow } from "../types";

// export const Arrows = () => {
//   const {
//     arrows,
//     newArrow,
//     boardOrientation,
//     boardWidth,

//     customArrowColor: primaryArrowCollor,
//   } = useChessboard();
//   const arrowsList = [...arrows, newArrow].filter(Boolean) as Arrow[];

//   console.log({arrowsList})

//   return (
//     <svg
//       width={boardWidth}
//       height={boardWidth}
//       style={{
//         position: "absolute",
//         top: "0",
//         left: "0",
//         pointerEvents: "none",
//         zIndex: "10",
//       }}
//     >
//       {arrowsList.map((arrow, i) => {
//         const [arrowStartField, arrowEndField, arrowColor] = arrow;
//         if (arrowStartField === arrowEndField) return null;
//         const from = getRelativeCoords(
//           boardOrientation,
//           boardWidth,
//           arrowStartField
//         );
//         const to = getRelativeCoords(
//           boardOrientation,
//           boardWidth,
//           arrowEndField
//         );
//         let ARROW_LENGTH_REDUCER = boardWidth / 32;

//         const isArrowActive = i === arrows.length;
//         // if there are different arrows targeting the same square make their length a bit shorter
//         if (
//           arrows.some(
//             (restArrow) =>
//               restArrow[0] !== arrowStartField && restArrow[1] === arrowEndField
//           ) &&
//           !isArrowActive
//         ) {
//           ARROW_LENGTH_REDUCER = boardWidth / 16;
//         }
//         const dx = to.x - from.x;
//         const dy = to.y - from.y;

//         const r = Math.hypot(dy, dx);

//         const end = {
//           x: from.x + (dx * (r - ARROW_LENGTH_REDUCER)) / r,
//           y: from.y + (dy * (r - ARROW_LENGTH_REDUCER)) / r,
//         };

//         return (
//           <Fragment
//             key={`${arrowStartField}-${arrowEndField}${
//               isArrowActive ? "-active" : ""
//             }`}
//           >
//             <marker
//               id={`arrowhead-${i}`}
//               markerWidth="2"
//               markerHeight="2.5"
//               refX="1.25"
//               refY="1.25"
//               orient="auto"
//             >
//               <polygon
//                 points="0.3 0, 2 1.25, 0.3 2.5"
//                 fill={arrowColor ?? primaryArrowCollor}
//               />
//             </marker>
//             <line
//               x1={from.x}
//               y1={from.y}
//               x2={end.x}
//               y2={end.y}
//               opacity={isArrowActive ? "0.5" : "0.65"}
//               stroke={arrowColor ?? primaryArrowCollor}
//               strokeWidth={
//                 isArrowActive ? (0.9 * boardWidth) / 40 : boardWidth / 40
//               }
//               markerEnd={`url(#arrowhead-${i})`}
//             />
//           </Fragment>
//         );
//       })}
//     </svg>
//   );
// };
