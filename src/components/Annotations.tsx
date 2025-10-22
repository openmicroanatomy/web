import { Annotation } from "types";
import AnnotationPopup from "./AnnotationPopup";
import { useStore } from "../lib/StateStore";
import { useMemo } from "react";

export default function Annotations() {
    const [ slide, selectedAnnotation, setSelectedAnnotation ] = useStore(state => [
        state.slide, state.selectedAnnotation, state.setSelectedAnnotation
    ]);

    const annotations = useMemo(() => {
        return JSON.parse(slide?.annotations || "[]") as Annotation[]
    }, [slide]);

    if (!annotations) {
        return <p className="flex h-full items-center justify-center font-bold text-slate-600">Loading ...</p>;
    }

    if (!slide) {
        return <p className="flex h-full items-center justify-center font-bold text-slate-600">No slide selected</p>;
    }

    if (annotations.length == 0) {
        return <p className="flex h-full items-center justify-center font-bold text-slate-600">No annotations</p>;
    }

    /**
     * Check if given annotation is same as the currently selected annotation.
     */
    const isSelectedAnnotation = (annotation: Annotation) => {
        return JSON.stringify(annotation) == JSON.stringify(selectedAnnotation);
    }

    return (
        <div className="flex flex-col h-full bg-white overflow-y-hidden">
            <div className="p-4 max-h-[33vh] overflow-y-auto scrollbar">
                <p className="text-slate-800">{slide.description}</p>
            </div>

            <hr />

            <div className="flex flex-col flex-grow gap-2 items-baseline overflow-y-auto scrollbar border-l ml-2 py-2 pr-2">
                {annotations
                    .sort((a, b) => {
                        // Check that both annotations have a name.
                        if (!a.properties.name || !b.properties.name) {
                            return 0;
                        }

                        return a.properties.name.localeCompare(b.properties.name, undefined, { numeric: true, sensitivity: 'base' });
                    })
                    .map((annotation, index) => (
                        <div
                            key={annotation.id}
                            className="flex items-center w-full"
                        >
                            <div className="flex min-w-[10px] h-[1px] bg-gray-300" />
                            <div
                                className={`flex flex-grow ${isSelectedAnnotation(annotation) && "bg-gray-100" } hover:bg-gray-100 p-2 rounded cursor-pointer`}
                                onClick={() => setSelectedAnnotation(annotation)}
                            >
                                <p className="text-slate-700 font-semibold">{`${index + 1}. ${annotation.properties.name || "Unnamed annotation"}`}</p>
                            </div>
                        </div>
                    ))
                }
            </div>

            <div className="hidden lg:block sticky bottom-0 border-b text-center text-white font-semibold text-lg">
                {selectedAnnotation ? (
                    <AnnotationPopup
                        annotation={selectedAnnotation}
                        renderer={(text, disabled) => (
                            <div className={`${disabled ? "bg-gray-500" : "cursor-pointer bg-blue-500"} py-2`}>
                                {text}
                            </div>
                        )}
                    />
                ) : (
                    <div className="bg-gray-500 py-2">
                        <p>No annotation selected</p>
                    </div>
                )}
            </div>
        </div>
    );
}
