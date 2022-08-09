import { useEffect, useState } from "react";
import { PopupActions } from "reactjs-popup/dist/types";
import { EduAnswer } from "types";

interface QuizProps {
    choices: EduAnswer[];
    name: string;
    close: PopupActions["close"];
    description: string | null | undefined;
}

function AnnotationQuiz({ choices, close, name, description }: QuizProps) {
    const [currentChoice, setCurrentChoice] = useState<string>("");
    const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState<boolean>(false);
    const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

    const correctAnswers = choices
        .filter(answer => answer.isAnswer)
        .map(answer => answer.choice);

    useEffect(() => {
        setIsCorrectAnswer(correctAnswers.includes(currentChoice));
    }, [currentChoice]);

    if (hasSubmittedAnswer) {
        return (
            <div>
                <p className="font-bold">{isCorrectAnswer ? "Correct answer!" : "Wrong answer!"}</p>

                {(!isCorrectAnswer || correctAnswers.length > 1) && (
                    <p><span className="italic">All the right answers:</span> {correctAnswers}</p>
                )}

                <p>{description}</p>

                <button className="button mt-4" onClick={close}>
                    Close
                </button>
            </div>
        )
    }

    return (
        <div>
            <p className="font-bold">{name}</p>

            <form>
                <select
                    className="form-select w-full shadow-sm rounded-sm border border-blue-500"
                    name="Answer"
                    onChange={(e) => setCurrentChoice(e.target.value)}
                >
                    <option>Select ...</option>
                    {choices.map((option, i) => (
                        <option key={i}>{option.choice}</option>
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
        </div>
    );
}

export default AnnotationQuiz;
