import { Image } from "types";

interface SlidesProps {
    images?: Image[];
    onSlideChange: (newSlide: string) => void;
}

function Slides({ images, onSlideChange }: SlidesProps) {
    return (
        <div id="Slides">
            {images ? (
                <>
                    {images.map((slide) => (
                        <div
                            key={slide.entryID}
                            className="grid grid-cols-6 p-2 border-b border-t mb-2 cursor-pointer"
                            onClick={() => onSlideChange(slide.serverBuilder.uri)}
                        >
                            <div className="col-span-1">
                                {slide.thumbnail && (
                                    <img src={`data:image/png;base64,${slide.thumbnail}`} width="64px" alt="" />
                                )}
                            </div>

                            <div className="col-span-5">
                                <p>{slide.imageName}</p>
                                <p className="font-light text-xs">{slide.description}</p>
                            </div>
                        </div>
                    ))}
                </>
            ) : (
                <p>No slides</p>
            )}
        </div>
    );
}

export default Slides;
