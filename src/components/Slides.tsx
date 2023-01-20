import { Image } from "types";
import { useRecoilState } from "recoil";
import { currentSlideState } from "../lib/atoms";

interface SlidesProps {
    slides?: Image[];
}

function Slides({ slides }: SlidesProps) {
    const [slide, setSlide] = useRecoilState(currentSlideState);

    if (!slides) {
        return <p className="text-center font-bold p-2">Loading ...</p>;
    }

    if (slides.length == 0) {
        return <p className="text-center font-bold p-2">No slides</p>;
    }

    /**
     * Check if given slide is the same as the currently open slide.
     */
    const isCurrentSlide = (that: Image) => {
        return that.entryID == slide?.entryID;
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
                        className={`bg-white p-2 mb-2 shadow-sm border-y cursor-pointer border-l-4 ${isCurrentSlide(slide) ? "border-l-blue-400" : "border-l-transparent" }`}
                        onClick={() => setSlide(slide)}
                    >
                        <p className="font-bold">{`${index + 1}. ${slide.imageName}`}</p>
                        <p className="font-light text-xs">{slide.description}</p>
                    </div>
                ))
            }
        </div>
    );
}

export default Slides;
