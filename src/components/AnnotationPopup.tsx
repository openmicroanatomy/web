import { AnnotationAnswerTypes, validateEduAnswer } from "lib/helpers";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { Annotation } from "types";
import AnnotationQuiz from "./AnnotationQuiz";
import { PopupActions } from "reactjs-popup/dist/types";

interface AnnotationProps {
    annotation: Annotation;
}

function AnnotationPopup({ annotation }: AnnotationProps) {
    const answer = validateEduAnswer(annotation.properties.metadata?.Answer);
    const description = annotation.properties.metadata?.ANNOTATION_DESCRIPTION;

    let text;

    switch (answer.type) {
        case AnnotationAnswerTypes.QUIZ:
            text = "Show quiz";
            break;
        case AnnotationAnswerTypes.TEXT:
            text = "Show answer";
            break;
        case AnnotationAnswerTypes.UNDEFINED:
            if (description) {
                text = description;
            } else {
                text = "No description";
            }
    }

    return (
        <Popup
            trigger={<div className="cursor-pointer">{text}</div>}
            position="right center"
            modal
            arrowStyle={{ color: "#ddd" }}
            contentStyle={{ width: 300, backgroundColor: "#ddd" }}
            disabled={answer.type == AnnotationAnswerTypes.UNDEFINED}
        >
            {(close: PopupActions["close"]) => (
                <div className="flex justify-center flex-col">
                    <div className="text-right">
                        <a onClick={close} className="button-close-dialog">
                            &times;
                        </a>
                    </div>

                    <div className="p-4">
                        {answer.type == AnnotationAnswerTypes.QUIZ ? (
                            <AnnotationQuiz
                                eduAnswers={answer.data}
                                annotationName={annotation.properties.name}
                                description={description}
                                close={close}
                            />
                        ) : (
                            <>
                                {answer.type == AnnotationAnswerTypes.TEXT ? (
                                    <>
                                        <p>{answer.data}</p>
                                        <p>{description}</p>
                                    </>
                                ) : (
                                    <p className="pt-4 blur-3xl">{description}</p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </Popup>
    );
}

export default AnnotationPopup;
