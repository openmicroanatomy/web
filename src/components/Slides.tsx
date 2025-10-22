import { Slide } from "types";
import { useStore } from "../lib/StateStore";

export default function Slides() {
    const [ displaySlideNumbers, project, slide, setSlide ] = useStore(state => [
        state.displaySlideNumbers, state.project, state.slide, state.setSlide
    ]);

    if (!project) {
        return <p className="flex h-full items-center justify-center font-bold text-slate-600">No lesson selected</p>;
    }

    if (!project.images) {
        return <p className="flex h-full items-center justify-center font-bold text-slate-600">Loading ...</p>;
    }

    if (project.images.length == 0) {
        return <p className="flex h-full items-center justify-center font-bold text-slate-600">No slides</p>;
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
        <div className="flex flex-col min-h-full gap-2 bg-white border-l border-gray-300 ml-2 py-2 pr-2">
            {project.images
                .sort((a, b) => {
                    return a.imageName.localeCompare(b.imageName, undefined, { numeric: true, sensitivity: 'base' });
                })
                .map((slide, index) => (
                    <div
                        key={slide.entryID}
                        className="flex items-center"
                    >
                        <div className="flex min-w-[10px] h-[1px] bg-gray-300" />
                        <div
                            className={`flex flex-col flex-grow ${isCurrentSlide(slide) && "bg-gray-100" } p-2 rounded hover:bg-gray-100 cursor-pointer`}
                            onClick={() => setSlide(slide)}
                        >
                            <p className="text-slate-700 font-semibold">{getDisplayName(slide.imageName, index)}</p>
                        </div>
                    </div>
                ))
            }
        </div>
    );
}
