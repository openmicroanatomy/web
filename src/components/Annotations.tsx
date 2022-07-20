import { selectedAnnotationState } from "lib/atoms";
import "reactjs-popup/dist/index.css";
import { useRecoilState } from "recoil";
import { Annotation } from "types";
import AnnotationPopup from "./AnnotationPopup";
import { sha1 } from "object-hash";

interface AnnotationsProps {
    annotations?: Annotation[];
}

function Annotations({ annotations }: AnnotationsProps) {
    const [selectedAnnotation, setSelectedAnnotation] = useRecoilState(selectedAnnotationState);

    return (
        <div id="Annotations" className="py-2">
            {annotations && annotations?.length > 0 ? (
                <>
                    {annotations.map((annotation) => (
                        <div
                            className="grid grid-cols-4 p-2 border-b border-t mb-2 cursor-pointer"
                            key={sha1(annotation)}
                        >
                            <div className={`col-span-4 ${selectedAnnotation == annotation && "font-bold"}`} onClick={() => setSelectedAnnotation(annotation)}>
                                {annotation.properties.name || "Unnamed annotation"}
                            </div>
                        </div>
                    ))}

                    <div className="border-b text-center bg-blue-500 text-white font-bold text-xl pt-2 pb-2">
                        {selectedAnnotation ? (
                            <AnnotationPopup annotation={selectedAnnotation} />
                        ) : (
                            <p>No annotation selected</p>
                        )}
                    </div>
                </>
            ) : (
                <p className="text-center font-bold">No annotations</p>
            )}
        </div>
    );
}

export default Annotations;
