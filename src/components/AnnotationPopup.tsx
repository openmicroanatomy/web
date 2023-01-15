import { AnnotationAnswerTypes, parseAnswerData } from "lib/helpers";
import { Annotation } from "types";
import AnnotationQuiz from "./AnnotationQuiz";
import PopupLarge from "./PopupLarge";

interface AnnotationProps {
    annotation: Annotation;
}

function AnnotationPopup({ annotation }: AnnotationProps) {
    const answer = parseAnswerData(annotation.properties.metadata?.Answer);
    const description = annotation.properties.metadata?.ANNOTATION_DESCRIPTION;
    const disabled = answer.type === AnnotationAnswerTypes.UNDEFINED && !description;

    const text = (() => {
        switch (answer.type) {
            case AnnotationAnswerTypes.QUIZ:
                return "Show quiz";
            case AnnotationAnswerTypes.TEXT:
                return "Show answer";
            case AnnotationAnswerTypes.UNDEFINED:
                return description ? "Show description" : "No description";
        }
    })();

    return (
        <PopupLarge
            activator={
                <p className="cursor-pointer">{text}</p>
            }
            disabled={disabled}
        >
            {answer.type == AnnotationAnswerTypes.QUIZ ? (
                <AnnotationQuiz
                    choices={answer.data}
                    name={annotation.properties.name || "Unnamed annotation"}
                    description={description}
                />
            ) : (
                <>
                    <p className="font-bold">{annotation.properties.name}</p>
                    <p>{answer.data}</p>
                    <p className="italic">{description}</p>
                </>
            )}
        </PopupLarge>
    );
}

export default AnnotationPopup;
