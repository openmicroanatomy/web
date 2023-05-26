import { AnnotationAnswerTypes, parseAnswerData } from "lib/helpers";
import { Annotation } from "types";
import AnnotationQuiz from "./AnnotationQuiz";
import PopupLarge from "./PopupLarge";
import React from "react";

interface Props {
    annotation: Annotation;

    /**
     * Optional; Function to be used as the Renderer; defaults to a hyperlink.
     * @param text to display.
     * @param disabled true if this annotation has no action (i.e. click to show answer).
     */
    renderer?: (text: string, clickable: boolean) => React.JSX.Element;
}

function AnnotationPopup({ annotation, renderer }: Props) {
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
            activator={renderer ? renderer(text, disabled) : <p className="cursor-pointer">{text}</p>}
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
