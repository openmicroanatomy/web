import { Image } from "types";
import { useRecoilState } from "recoil";
import { currentSlideState } from "../lib/atoms";

interface SlidesProps {
    slides?: Image[];
}

function Slides({ slides }: SlidesProps) {
    const [slide, setSlide] = useRecoilState(currentSlideState);

    if (!slides || slides.length == 0) {
        return <p className="text-center font-bold p-2">No slides</p>;
    }

    return (
        <div className="lg:py-2">
            {slides.map((slide, index) => (
                <div
                    key={slide.entryID}
                    className="grid grid-cols-6 p-2 border-y mb-2 cursor-pointer"
                    onClick={() => onSlideChange(slide)}
                >
                    <div className="col-span-6">
                        <p className="font-bold">{`${index + 1}. ${slide.imageName}`}</p>
                        <p className="font-light text-xs">{slide.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Slides;
