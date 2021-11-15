import "reactjs-popup/dist/index.css";
import { Annotation } from "types";
import AnnotationPopup from "./AnnotationPopup";

interface AnnotationsProps {
    annotations?: Annotation[];
}

function Annotations({ annotations }: AnnotationsProps) {
    return (
        <div id="Annotations">
            {annotations ? (
                <>
                    {annotations.map((annotation) => (
                        <div key={annotation.properties.name} className="grid grid-cols-4 p-2 border-b border-t mb-2">
                            <div>
                                <AnnotationPopup annotation={annotation} />
                            </div>
                        </div>
                    ))}
                </>
            ) : (
                <p>No annotations</p>
            )}
        </div>
    );
}

export default Annotations;
