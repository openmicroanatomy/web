import { EduAnswer } from "types";

export type ValidatedEduAnswer =
    | {
          data: EduAnswer[];
          json: true;
      }
    | {
          data?: string | null;
          json: false;
      };

/*
 * Validates eduAnswer between json, string and null.
 * Used by: AnnotationPropsMetaData.EDU_ANSWER in types.ts
 */
export const validateEduAnswer = (input?: string | null): ValidatedEduAnswer => {
    try {
        if (input) {
            const parsed = JSON.parse(input);
            if (parsed && typeof parsed === "object") {
                return { data: parsed, json: true };
            }
        }

        return { data: input, json: false };
    } catch {
        return { data: input, json: false };
    }
};
