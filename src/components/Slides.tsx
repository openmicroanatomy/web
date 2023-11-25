import { Slide } from "types";
import { useRecoilState, useRecoilValue } from "recoil";
import { currentSlideState, displaySlideNumbersState } from "../lib/atoms";

type Props = {
    slides?: Slide[];
}

export default function Slides({ slides }: Props) {
    const [slide, setSlide] = useRecoilState(currentSlideState);
    const displaySlideNumbers = useRecoilValue(displaySlideNumbersState);

    if (!slides) {
        return <p className="text-center font-bold p-2">Loading ...</p>;
    }

    if (slides.length == 0) {
        return <p className="text-center font-bold p-2">No slides</p>;
    }

    /**
     * Check if given slide is the same as the currently open slide.
     */
    const isCurrentSlide = (that: Slide) => {
        return that.entryID == slide?.entryID;
    }

    function getDisplayName(name: string, index: number) {
        if (displaySlideNumbers) {
            return `${index + 1}. ${name}`;
        }

        return name;
    }

    return (
        <div className="lg:py-2 bg-gray-50">
            {slides
                .sort((a, b) => {
                    return a.imageName.localeCompare(b.imageName, undefined, { numeric: true, sensitivity: 'base' });
                })
                .map((slide, index) => (
                    <div
                        key={slide.entryID}
                        className={`bg-white p-2 mb-2 shadow-sm border-y cursor-pointer border-l-4 hover:border-l-blue-300 ${isCurrentSlide(slide) ? "!border-l-blue-400" : "border-l-transparent" }`}
                        onClick={() => setSlide(slide)}
                    >
                        <p className="font-bold">{getDisplayName(slide.imageName, index)}</p>
                        <p className="text-sm">{slide.description}</p>
                    </div>
                ))
            }
        </div>
    );
}
