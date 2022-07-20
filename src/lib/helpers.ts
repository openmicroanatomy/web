import OpenSeadragon from "openseadragon";
import { EduAnswer, Geometry, LineString, Polygon } from "types";

export enum AnnotationAnswerTypes {
    QUIZ,
    TEXT,
    UNDEFINED,
}

export type ValidatedEduAnswer =
    | {
          data: EduAnswer[];
          type: AnnotationAnswerTypes.QUIZ;
      }
    | {
          data: string;
          type: AnnotationAnswerTypes.TEXT;
      }
    | {
          data: null;
          type: AnnotationAnswerTypes.UNDEFINED;
      };

/*
 * Validates eduAnswer between json, string and null.
 * Used by: AnnotationPropsMetaData.EDU_ANSWER in types.ts
 */
export const validateEduAnswer = (input?: string | null | undefined): ValidatedEduAnswer => {
    if (input) {
        try {
            const parsed = JSON.parse(input);

            if (parsed && typeof parsed === "object") {
                return { data: parsed, type: AnnotationAnswerTypes.QUIZ };
            }
        } catch {
            return { data: input, type: AnnotationAnswerTypes.TEXT };
        }
    }

    return { data: null, type: AnnotationAnswerTypes.UNDEFINED };
};

export const area = (annotation: Geometry) => {
    if (annotation.type == "LineString") {
        // TODO: Implement
        return 0;
    } else if (annotation.type == "Polygon") {
        return calculate_area((annotation.coordinates as Polygon)[0]);
    } else {
        console.warn("No area for", annotation);
        return 0;
    }
}


export const centroid = (annotation: Geometry, slideWidth: number, slideHeight: number) => {
    // See Viewer.tsx#scaleY regarding the reason for y-factor
    const yFactor = slideHeight / slideWidth;

    if (annotation.type == "LineString") {
        const coordinates = annotation.coordinates as LineString;

        const x1 = coordinates[0][0] / slideWidth;
        const y1 = coordinates[0][1] / slideHeight;
        const x2 = coordinates[1][0] / slideWidth;
        const y2 = coordinates[1][1] / slideHeight;

        return new OpenSeadragon.Point((x1 + x2) / 2, ((y1 + y2) / 2) * yFactor);
    } else if (annotation.type == "Polygon") {
        const centroid = get_polygon_centroid(annotation.coordinates as Polygon);

        return new OpenSeadragon.Point(centroid.x / slideWidth, (centroid.y / slideHeight) * yFactor);
    } else {
        console.warn("No centroid available for {}", annotation);
        return new OpenSeadragon.Point(0, 0);
    }
};

// Based on https://stackoverflow.com/questions/9692448/how-can-you-find-the-centroid-of-a-concave-irregular-polygon-in-javascript
function get_polygon_centroid(pts: number[][][]) {
    const first = pts[0][0];
    const last = pts[0][pts[0].length - 1];

    // Polygon must be complete i.e. first and last point is the same
    if (first[0] != last[0] || first[1] != last[1]) {
        pts[0].push(first);
    }

    let twicearea = 0,
        x = 0,
        y = 0;
    const numPts = pts[0].length;
    let p1, p2, f;

    for (let i = 0, j = numPts - 1; i < numPts; j = i++) {
        p1 = pts[0][i];
        p2 = pts[0][j];

        f = p1[0] * p2[1] - p2[0] * p1[1];
        twicearea += f;
        x += (p1[0] + p2[0]) * f;
        y += (p1[1] + p2[1]) * f;
    }

    f = twicearea * 3;
    return { x: x / f, y: y / f };
}

// Based on: https://stackoverflow.com/questions/62323834/calculate-polygon-area-javascript
function calculate_area(coords: number[][]) {
    let area = 0;
  
    for (let i = 0; i < coords.length; i++) {
      const [x1, y1] = coords[i];
      const [x2, y2] = coords[(i + 1) % coords.length];
  
      area += x1 * y2 - x2 * y1
    }
  
    return Math.abs(area);
  }
