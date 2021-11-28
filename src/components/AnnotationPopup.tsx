import { validateEduAnswer } from "lib/helpers";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { Annotation } from "types";
import AnnotationQuiz from "./AnnotationQuiz";
import { PopupActions } from "reactjs-popup/dist/types";

interface AnnotationProps {
    annotation: Annotation;
}

enum AnnotationAnswerTypes {
    QUIZ = "Show quiz",
    TEXT = "Show answer",
    UNDEFINED = "No answer"
}

function AnnotationPopup({ annotation }: AnnotationProps) {
    const eduAnswers = validateEduAnswer(annotation.properties.metadata?.EDU_ANSWER);
    const annotationDescription = annotation.properties.metadata?.ANNOTATION_DESCRIPTION;

    let answerType: AnnotationAnswerTypes;
    if (eduAnswers.json) {
        answerType = AnnotationAnswerTypes.QUIZ;
    } else if (eduAnswers.data) {
        answerType = AnnotationAnswerTypes.TEXT;
    } else {
        answerType = AnnotationAnswerTypes.UNDEFINED;
    }

    return (
        <Popup
            trigger={<div className="cursor-pointer">{answerType}</div>}
            position="right center"
            modal
            disabled={answerType == AnnotationAnswerTypes.UNDEFINED}
            arrowStyle={{ color: "#ddd" }}
            contentStyle={{ width: 300, backgroundColor: "#ddd" }}
        >
            {(close: PopupActions["close"]) => (
                <div className="flex justify-center flex-col">
                    <div className="text-right">
                        <a onClick={close} className="button-close-dialog">&times;</a>
                    </div>

                    <div className="p-4">
                            <AnnotationQuiz eduAnswers={answer.data} annotationName={annotation.properties.name} description={description} close={close}  />
                        ) : (
                            <>
                                {eduAnswers.data ? (
                                    <>
                                        <p>{eduAnswers.data}</p>
                                        <p>{annotationDescription}</p>
                                    </>
                                ) : (
                                    <p className="pt-4 blur-3xl">{annotationDescription}</p>
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
