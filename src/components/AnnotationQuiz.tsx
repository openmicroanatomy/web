import { useEffect, useState } from "react";
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
    const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState<boolean | null>(null);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

    const choices = eduAnswers.map((answer) => answer.choice);
    const answers = eduAnswers.map((answer) => {
        if (answer.isAnswer) { // .isAnswer is actually .isCorrectAnsewr
            return answer.choice;
        }
    });

    useEffect(() => {
        setIsCorrectAnswer(answers.includes(currentChoice ?? undefined));
    }, [currentChoice]);

    return (
        <div>
            {hasSubmittedAnswer ? (
                <div>
                    {isCorrectAnswer ? (
                        <p className="font-bold">Correct answer!</p>
                    ) : (
                        <>
                            <p className="font-bold">Wrong answer!</p>
                            <p className="italic">Right answers: {answers}</p>
                        </>
                    )}

                    <p>{description}</p>

                    <button className="button mt-4" onClick={close}>
                        Close
                    </button>
                </div>
            ) : (
                <>
                    <p className="font-bold">{annotationName}</p>
                    <form>
                        <select
                            className="form-select w-full shadow-sm rounded-sm border border-blue-500"
                            name="Answer"
                            onChange={(e) => setCurrentChoice(e.target.value)}
                        >
                            <option>Select ...</option>
                            {choices.map((option, i) => (
                                <option key={i}>{option}</option>
                            ))}
                        </select>
                    </form>

                    <div className="flex gap-2 mt-4">
                        <button className="button" onClick={() => setHasSubmittedAnswer(true)} disabled={!currentChoice}>
                            OK
                        </button>

                        <button className="button button-red" onClick={close}>
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default AnnotationQuiz;
