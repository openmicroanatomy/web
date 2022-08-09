import { AnnotationAnswerTypes, parseAnswerData } from "lib/helpers";
import Popup from "reactjs-popup";
import { Annotation } from "types";
import AnnotationQuiz from "./AnnotationQuiz";
import { PopupActions } from "reactjs-popup/dist/types";

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
        <Popup
            trigger={<div className={`cursor-pointer py-2 ${disabled ? "bg-gray-500" : "bg-blue-500" }`}>{text}</div>}
            position="right center"
            modal
            arrowStyle={{ color: "#ddd" }}
            contentStyle={{ width: 400 }}
            disabled={disabled}
        >
            {(close: PopupActions["close"]) => (
                <div className="flex justify-center flex-col rounded-sm shadow-md bg-gray-200 p-4">
                    <div className="text-right">
                        <a onClick={close} className="cursor-pointer text-center font-bold text-lg absolute right-2 top-0">&times;</a>
                    </div>

                    {answer.type == AnnotationAnswerTypes.QUIZ ? (
                        <AnnotationQuiz
                            choices={answer.data}
                            name={annotation.properties.name}
                            description={description}
                            close={close}
                        />
                    ) : (
                        <>
                            <p className="font-bold">{annotation.properties.name}</p>
                            <p>{answer.data}</p>
                            <p className="italic">{description}</p>
                        </>
                    )}
                </div>
            )}
        </Popup>
    );
}

export default AnnotationPopup;
