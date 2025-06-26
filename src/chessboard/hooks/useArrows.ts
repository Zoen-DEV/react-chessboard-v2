import { useState, useEffect } from "react";
import { Square, Arrow } from "../types";

type Arrows = Arrow[];

export const useArrows = (
  customArrows?: Arrows,
  areArrowsAllowed: boolean = true,
  onArrowsChange?: (arrows: Arrows) => void,
  customArrowColor?: string,
) => {
  // arrows passed programatically to `ChessBoard` as a react prop
  const [customArrowsSet, setCustomArrows] = useState<Arrows | null>([]);

  // arrows drawn with mouse by user on the board
  const [arrows, setArrows] = useState<Arrows>([]);

  // active arrow which user draws while dragging mouse
  const [newArrow, setNewArrow] = useState<Arrow>();

  // handle external `customArrows` props changes
  useEffect(() => {
    if (Array.isArray(customArrows)) {
      // so that custom arrows overwrite temporary arrows
      // clearArrows();
      setCustomArrows(
        //filter out arrows which starts and ends in the same square
        customArrows?.filter((arrow) => arrow[0] !== arrow[1]),
      );
      setArrows(
        //filter out arrows which starts and ends in the same square
        customArrows?.filter((arrow) => arrow[0] !== arrow[1]),
      );
    } else {
      // clearArrows();
      setCustomArrows(null);
    }
  }, [customArrows]);

  // callback when arrows changed after user interaction
  useEffect(() => {
    onArrowsChange?.(arrows);
  }, [arrows]);

  // function clears all arrows drawed by user
  function clearArrows() {
    setArrows([]);
    setNewArrow(undefined);
  }

  const drawNewArrow = (fromSquare: Square, toSquare: Square) => {
    if (!areArrowsAllowed) return;

    setNewArrow([fromSquare, toSquare, customArrowColor]);
  };

  const allBoardArrows = customArrowsSet
    ? [...new Set([...arrows, ...customArrowsSet])]
    : [...arrows];
    
  const removeDuplicateArrows = (data: Arrow[]) => {
    const result: Arrow[] = [];
    const seen: string[] = [];

    for (let i = data.length - 1; i >= 0; i--) {
      const [from, to] = data[i];
      const key = `${from}-${to}`;

      if (!seen.includes(key)) {
        result.unshift(data[i]);
        seen.push(key);
      }
    }

    return result;
  }

  const onArrowDrawEnd = (fromSquare: Square, toSquare: Square) => {
    if (fromSquare === toSquare || !areArrowsAllowed) return;

    let arrowsCopy;
    const newArrow: Arrow = [fromSquare, toSquare, customArrowColor];

    const isNewArrowUnique = allBoardArrows.every(([arrowFrom, arrowTo, color]) => {
      return !(arrowFrom === fromSquare && arrowTo === toSquare && color === customArrowColor);
    });

    // add the newArrow to arrows array if it is unique
    if (isNewArrowUnique) {
      arrowsCopy = [...arrows, newArrow];
    }
    // remove it from the board if we already have same arrow in arrows array
    else {
      arrowsCopy = arrows.filter(([arrowFrom, arrowTo]) => {
        return !(arrowFrom === fromSquare && arrowTo === toSquare);
      });
    }

    console.log({arrowsCopy2: removeDuplicateArrows(arrowsCopy)});

    setNewArrow(undefined);
    setArrows(removeDuplicateArrows(arrowsCopy));
  };

  return {
    arrows: allBoardArrows,
    newArrow,
    clearArrows,
    drawNewArrow,
    setArrows,
    onArrowDrawEnd,
  };
};
