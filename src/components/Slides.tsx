import { Image } from "types";
import { useRecoilState } from "recoil";
import { currentSlideState } from "../lib/atoms";
import SortIcon from "./icons/SortIcon";
import { useEffect, useState } from "react";

interface SlidesProps {
    slides?: Image[];
}

export type SlideGroup = {
    [key: string]: Image[]
}

function Slides({ slides }: SlidesProps) {
    const [slide, setSlide] = useRecoilState(currentSlideState);
    const [sortKey, setSortKey] = useState<string>();
    const [grouped, setGrouped] = useState<SlideGroup>();

    const SortingKeys = [...new Set(slides?.flatMap(slide => Object.keys(slide.metadata)) || [])];

    /**
     * Check if given slide is the same as the currently open slide.
     */
    const isCurrentSlide = (that: Image) => {
        return that.entryID == slide?.entryID;
    }

    const Group = (toSort: Image[]) => {
        setSortKey(SortingKeys[SortingKeys.indexOf(sortKey || "") + 1]);

        return toSort.reduce((group: SlideGroup, image) => {
            const { metadata } = image;

            group[metadata[sortKey || ""]] = group[metadata[sortKey || ""]] ?? [];
            group[metadata[sortKey || ""]].push(image);
            return group;
        }, {})
    }

    useEffect(() => {
        if (!slides) return;

        setGrouped(Group(slides));
    }, [slides]);

    if (!slides || slides.length == 0) {
        return <p className="text-center font-bold p-2">No slides</p>;
    }

    const SortMenu = () => {
        setGrouped(Group(slides));
    }

    return (
        <div className="lg:py-2 bg-gray-50">
            <div
                className="flex flex-row justify-end cursor-pointer font-bold"
                onClick={SortMenu}
            >
                Sort <SortIcon />
            </div>

            {Object.entries(grouped || {})
                .map((group, index) => {
                    const [ header, slides ] = group;

                    return (
                        <div className="">
                            { header !== "undefined" && <div className="p-2 font-bold border-blue-400 border-b-2">{header}</div>}

                            {slides.sort((a, b) => {
                                    return a.imageName.localeCompare(b.imageName, undefined, { numeric: true, sensitivity: 'base' });
                                })
                                .map(slide => (
                                    <div
                                        key={slide.entryID}
                                        className={`bg-white p-2 mb-2 shadow-sm border-y cursor-pointer border-l-4 ${isCurrentSlide(slide) ? "border-l-blue-400" : "border-l-transparent" }`}
                                        onClick={() => setSlide(slide)}
                                    >
                                        <p className="font-bold">{`${index + 1}. ${slide.imageName}`}</p>
                                        <p className="font-light text-xs">{slide.description}</p>
                                    </div>
                                )
                            )}
                        </div>
                    )
                })
            }
        </div>
    );
}

export default Slides;
