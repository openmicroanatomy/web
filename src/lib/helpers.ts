import { EduAnswer } from "types";

export enum AnnotationAnswerTypes {
    QUIZ,
    TEXT,
    UNDEFINED,
}

export type Answer = {
    data: EduAnswer[];
    type: AnnotationAnswerTypes.QUIZ;
} | {
    data: string;
    type: AnnotationAnswerTypes.TEXT;
} | {
    data: null;
    type: AnnotationAnswerTypes.UNDEFINED;
};

/*
 * Parses the answer data into objects easily understood by TypeScript.
 */
export const parseAnswerData = (input?: string | null | undefined): Answer => {
    if (input) {
        try {
            const parsed = JSON.parse(input);

            if (parsed && typeof parsed === "object") {
                return { data: parsed as EduAnswer[], type: AnnotationAnswerTypes.QUIZ };
            }
        } catch {
            return { data: input, type: AnnotationAnswerTypes.TEXT };
        }
    }

    return { data: null, type: AnnotationAnswerTypes.UNDEFINED };
};

/**
 * Clamps a number between two numbers.
 * 
 * @param num Number to clamp.
 * @param min Smallest possible number.
 * @param max Highest possible number.
 * @returns Number between min and max.
 */
export const clamp = (num: number, min: number, max: number) => {
    return Math.min(Math.max(num, min), max);
}
