import { MultiChoiceOption } from "types";

export enum AnnotationAnswerTypes {
    QUIZ,
    TEXT,
    UNDEFINED,
}

export type Answer = {
    data: MultiChoiceOption[];
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
                return { data: parsed as MultiChoiceOption[], type: AnnotationAnswerTypes.QUIZ };
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

/**
 * @see: https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
 */
export function base64DecodeUnicode(input: string) {
    return decodeURIComponent(atob(input).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

/**
 * @Deprecated to be removed in version 1.1
 */
export function legacyBase64Decode(data: number[]) {
    try {
        return atob(data.map(byte => String.fromCharCode(byte)).join(''));
    } catch (e) {
        return new TextDecoder("utf-8").decode(new Uint8Array(data));
    }
}

export function setCSSVariable(key: string, value: string) {
    document.documentElement.style.setProperty(`--${key}`, value);
}

export function getCSSVariable(key: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(`--${key}`);
}
