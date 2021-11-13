import "reactjs-popup/dist/index.css";
import { Annotation } from "types";
import { useState } from "react";
import AnnotationPopup from "./AnnotationPopup";

interface AnnotationsProps {
    annotations?: Annotation[];
}

function Annotations({ annotations }: AnnotationsProps) {
    const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation>();

    return (
        <div id="Annotations">
            {annotations ? (
                <>
                    {annotations.map((annotation) => (
                        <div key={annotation.properties.name} className="grid grid-cols-4 p-2 border-b border-t mb-2 cursor-pointer">
                            <div className="col-span-4" onClick={() => setSelectedAnnotation(annotation)}>
                                {annotation.geometry.type}
                                {annotation.properties.name && `: ${annotation.properties.name}`}
                            </div>
                        </div>
                    ))}

                    <div className="border-b text-center bg-blue-500 text-white font-bold text-xl pt-2 pb-2">
                        {selectedAnnotation ? (
                            <AnnotationPopup annotation={selectedAnnotation} />
                        ) :
                            <p>No annotation selected</p>
                        }
                    </div>

                    { /* TODO: Add description of annotations without answers here */ }
                </>
            ) : (
                <p>No annotations</p>
            )}
        </div>
    );
}

export default Annotations;
