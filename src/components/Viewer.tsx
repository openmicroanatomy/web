import { fetchSlide } from "lib/api";
import { selectedAnnotationState } from "lib/atoms";
import EduViewer from "lib/EduViewer";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRecoilState } from "recoil";
import "styles/Viewer.css";
import { Annotation, Image } from "types";

interface ViewerProps {
    slide?: Image | null;
    annotations?: Annotation[];
}

function Viewer({ slide, annotations }: ViewerProps) {
    const [selectedAnnotation, setSelectedAnnotation] = useRecoilState(selectedAnnotationState);
    const [viewer, setViewer] = useState<EduViewer>();

    useEffect(() => {
        if (selectedAnnotation && viewer) {
            viewer.ZoomAndPanToAnnotation(selectedAnnotation);
            viewer.HighlightAnnotation(selectedAnnotation);
        }
    }, [selectedAnnotation]);

    useEffect(() => {
        setViewer(new EduViewer(window.OpenSeadragon({
            id: "Viewer",
            defaultZoomLevel: 0,
            //debugMode: process.env.NODE_ENV !== "production",
            showNavigator: true,
            navigatorSizeRatio: 0.15,
            navigatorAutoFade: false,
            showNavigationControl: false,
            zoomPerScroll: 1.4,
            gestureSettingsMouse: {
                clickToZoom: false,
                dblClickToZoom: true,
            }
        }), setSelectedAnnotation));
    }, [])

    useEffect(() => {
        if (!slide) return;

        const slideId = new URL(slide.serverBuilder.uri).pathname.substr(1);

        fetchSlide(slideId)
            .then((data) => {
                viewer?.LoadSlide(data);

                viewer?.ClearAnnotations();

                if (annotations) {
                    viewer?.DrawAnnotations(annotations);
                }
            }).catch((error) => {
                toast.error(error.message);
                console.error(error);
            });
    }, [slide, viewer]);
    // This hook needs to also run when Viewer changes because the setViewer() function is
    // async and has not finished unless the user has already opened the Viewer tab.

    return <div id="Viewer" className="h-full flex-grow bg-black" />;
}

export default Viewer;
