import { validateEduAnswer } from "lib/helpers";
import { useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import { Annotation } from "types";
import AnnotationQuiz from "./AnnotationQuiz";

interface AnnotationProps {
    annotation: Annotation;
}

function AnnotationPopup({ annotation }: AnnotationProps) {
    const eduAnswers = validateEduAnswer(annotation.properties?.metadata?.EDU_ANSWER);
    const annotationDescription = annotation.properties?.metadata?.ANNOTATION_DESCRIPTION;

    const [answerVisible, setAnswerVisible] = useState(false);
    const [quizVisible, setQuizVisible] = useState(false);

    const handleShowAnswer = () => {
        setQuizVisible(false);
        setAnswerVisible(!answerVisible);
    };

    const handleShowQuiz = () => {
        setAnswerVisible(false);
        setQuizVisible(!quizVisible);
    };

    return (
        <Popup
            trigger={
                <button>
                    {annotation.geometry.type}
                    {annotation.properties.name && `: ${annotation.properties.name}`}
                </button>
            }
            position="right center"
            modal
            arrowStyle={{ color: "#ddd" }}
            contentStyle={{ width: 300, height: 200, backgroundColor: "#ddd" }}
        >
            <div className="p-4 flex justify-center flex-col">
                {eduAnswers.json ? (
                    <>
                        {quizVisible ? (
                            <AnnotationQuiz eduAnswers={eduAnswers.data} handleShowQuiz={handleShowQuiz} />
                        ) : (
                            <button className="button3d mr-4 w-28" onClick={() => handleShowQuiz()}>
                                Show quiz
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        {annotationDescription ? (
                            <div className="">
                                <button className="button3d w-36" onClick={() => handleShowAnswer()}>
                                    {answerVisible ? "Hide" : "Show"} answer
                                </button>
                                <br />
                                {answerVisible && <p className="pt-4 blur-3xl">{annotationDescription}</p>}
                            </div>
                        ) : (
                            <>
                                <button className="button" disabled>
                                    No answer defined
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </Popup>
    );
}

export default AnnotationPopup;
