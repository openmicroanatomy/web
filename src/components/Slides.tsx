import { Image } from "types";

interface SlidesProps {
    images?: Image[];
    onSlideChange: (newSlide: string) => void;
}

function Slides({ images, onSlideChange }: SlidesProps) {
    return (
        <div id="Slides" className="py-2">
            {images && images.length > 0 ? (
                <>
                    {images.map((slide) => (
                        <div
                            key={slide.entryID}
                            className="grid grid-cols-6 p-2 border-b border-t mb-2 cursor-pointer"
                            onClick={() => onSlideChange(slide.serverBuilder.uri)}
                        >
                            <div className="col-span-6">
                                <p className="font-bold">{slide.imageName}</p>
                                <p className="font-light text-xs">{slide.description}</p>
                            </div>
                        </div>
                    ))}
                </>
            ) : (
                <p className="text-center font-bold">No slides</p>
            )}
        </div>
    );
}

export default Slides;
