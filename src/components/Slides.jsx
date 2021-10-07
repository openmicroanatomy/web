import React from "react";

function Slides({ slides, OnSlideChange }) {
    return (
        <div id="Slides">
            {slides ?
                <>
                    <p class="text-xl p-4">Slides</p>

                    {slides.map(slide => (
                        <div class="grid grid-cols-6 p-2 border-b border-t mb-2 cursor-pointer" onClick={() => OnSlideChange(slide.serverBuilder.uri)}>
                            <div class="col-span-1">
                                <img src={"data:image/png;base64," + slide.thumbnail} width="64px" alt="" />
                            </div>

                            <div class="col-span-5">
                                <p>{slide.imageName}</p>
                                <p class="font-light text-xs">{slide.description}</p>
                            </div>
                        </div>
                    ))}
                </>
            :
                <p>No slides</p>
            }
        </div>
    );
};

export default Slides;
