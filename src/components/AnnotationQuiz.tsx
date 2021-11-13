import { useState } from "react";
import { EduAnswer } from "types";

interface QuizProps {
    eduAnswers: EduAnswer[];
    handleShowQuiz: () => void;
}

function AnnotationQuiz({ eduAnswers, handleShowQuiz }: QuizProps) {
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
                    <p>Name of the annotation</p>
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

                    <button className="button3d mr-4" onClick={() => handleShowQuiz()}>
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

                    <button className="button3d mr-4 mt-4" onClick={() => handleShowQuiz()}>
                        OK
                    </button>
                </div>
            )}
        </div>
    );
}

export default AnnotationQuiz;
