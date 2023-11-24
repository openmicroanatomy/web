import { useEffect, useState } from "react";
import { MultiChoiceOption } from "types";

interface QuizProps {
    choices: MultiChoiceOption[];
    name: string;
    description: string | null | undefined;
}

function AnnotationQuiz({ choices, name, description }: QuizProps) {
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
                    onChange={e => setCurrentChoice(e.target.value)}
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
            </div>
        </div>
    );
}

export default AnnotationQuiz;
