import { AnnotationAnswerTypes, Answer, MultiChoiceOption, Slide, SlideTourEntry } from "types";

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

export function parseSlideTourEntries(slide: Slide): SlideTourEntry[] {
    try {
        if (slide.slideTour && slide.slideTour.length > 0) {
            const data = Array.isArray(slide.slideTour) ? legacyBase64Decode(slide.slideTour) : base64DecodeUnicode(slide.slideTour);

            return JSON.parse(data) as SlideTourEntry[];
        }
    } catch (e) {
        console.error("Error while loading slide tour", e);
    }

    return [];
}

/**
 * @Deprecated to be removed in version 1.1
 */
export function legacyBase64Decode(data: number[]) {
    try {
        return atob(data.map(byte => String.fromCharCode(byte)).join(''));
    } catch {
        return new TextDecoder("utf-8").decode(new Uint8Array(data));
    }
}

/**
 * Slide tours were previously saved with incorrect character encoding, causing issues with umlauts.
 * This function fixes any weird characters caused by incorrect encoding.
 * @Deprecated to be removed in version 1.1
 */
export function fixLegacyStringEncoding(str: string) {
    try {
        return decodeURIComponent(escape(str));
    } catch {
        return str;
    }
}

