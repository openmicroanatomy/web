import { useState } from "react";
import { PopupActions } from "reactjs-popup/dist/types";
import { EduAnswer } from "types";

interface QuizProps {
    eduAnswers: EduAnswer[];
    annotationName: string;
    close: PopupActions["close"];
    description: string | null | undefined;
}

function AnnotationQuiz({ eduAnswers, close, annotationName, description }: QuizProps) {
    const [currentChoice, setCurrentChoice] = useState<string | null>(null);
    const [correctAnswer, setCorrectAnswer] = useState<boolean | null>(null);

    const choices = eduAnswers.map((answer) => answer.choice);
    const answers = eduAnswers.map((answer) => {
        if (answer.isAnswer) {
            return answer.choice;
        }
    });

    const onSubmitAnswer = () => {
        if (!currentChoice) {
            setCorrectAnswer(null);
            return;
        }

        if (answers.includes(currentChoice)) {
            setCorrectAnswer(true);
        } else {
            setCorrectAnswer(false);
        }
    };

    return (
        <div className="mt-8">
            {correctAnswer === null ? (
                <>
                    <p>{annotationName}</p>
                    <form>
                        <select
                            className="form-select w-full mb-4"
                            name="Answer"
                            onChange={(e) => setCurrentChoice(e.target.value)}
                        >
                            <option></option>
                            {choices.map((option, i) => (
                                <option key={i}>{option}</option>
                            ))}
                        </select>
                    </form>

                    <button className="button3d mr-4" onClick={() => onSubmitAnswer()} disabled={!currentChoice}>
                        OK
                    </button>

                    <button className="button3d mr-4" onClick={close}>
                        Cancel
                    </button>
                </>
            ) : (
                <div className="mt-4">
                    {correctAnswer ? (
                        <p>Correct answer!</p>
                    ) : (
                        <>
                            <p>Wrong answer!</p>
                            <p>Right answers: {answers}</p>
                        </>
                    )}

                    <p>{description}</p>

                    <button className="button3d mr-4 mt-4" onClick={close}>
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}

export default AnnotationQuiz;
