import { selectedAnnotationState } from "lib/atoms";
import { useRecoilState } from "recoil";
import { Annotation } from "types";
import AnnotationPopup from "./AnnotationPopup";
import { sha1 } from "object-hash";

type Props = {
    annotations?: Annotation[];
}

export default function Annotations({ annotations }: Props) {
    const [selectedAnnotation, setSelectedAnnotation] = useRecoilState(selectedAnnotationState);

    if (!annotations) {
        return <p className="p-2 font-bold text-center">Loading ...</p>;
    }

    if (annotations.length == 0) {
        return <p className="p-2 font-bold text-center">No annotations</p>;
    }

    /**
     * Check if given annotation is same as the currently selected annotation.
     */
    const isSelectedAnnotation = (annotation: Annotation) => {
        return JSON.stringify(annotation) == JSON.stringify(selectedAnnotation);
    }

    return (
        <div className="pt-2 bg-gray-50">
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
                        className={`bg-white p-2 mb-2 shadow-sm border-b border-t cursor-pointer border-l-4 hover:border-l-blue-300 ${isSelectedAnnotation(annotation) ? "!border-l-blue-400" : "border-l-transparent" }`}
                        key={sha1(annotation)}
                        onClick={() => setSelectedAnnotation(annotation)}
                    >
                        <div
                            className={`cursor-pointer ${isSelectedAnnotation(annotation) && "font-bold"}`}
                        >
                            {`${index + 1}. ${annotation.properties.name || "Unnamed annotation"}`}
                        </div>
                    </div>
                ))
            }

            <div className="hidden lg:block sticky bottom-0 border-b text-center text-white font-bold text-lg">
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
