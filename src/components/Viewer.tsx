import { fetchSlide, fetchSlideOmero } from "lib/api";
import { selectedAnnotationState, slideTourState } from "lib/atoms";
import EduViewer, { SlideRepository } from "lib/EduViewer";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import "styles/Viewer.css";
import { Annotation, Image } from "types";
import "openseadragon/openseadragon-scalebar";
import "openseadragon/openseadragon-svg-overlay";
import OpenSeadragon from "openseadragon";

interface Props {
    slide?: Image | null;
}

function Viewer({ slide }: Props) {
    const [selectedAnnotation, setSelectedAnnotation] = useRecoilState(selectedAnnotationState);
    const [viewer, setViewer] = useState<EduViewer>();
    const [cachedAnnotations, setCachedAnnotations] = useState<Annotation[]>([]);

    const slideTour = useRecoilValue(slideTourState);

    useEffect(() => {
        if (selectedAnnotation && viewer) {
            viewer.ZoomAndPanToAnnotation(selectedAnnotation);
            viewer.HighlightAnnotation(selectedAnnotation);
        }
    }, [selectedAnnotation]);

    useEffect(() => {
        setViewer(new EduViewer(OpenSeadragon({
            id: "Viewer",
            defaultZoomLevel: 0,
            //debugMode: import.meta.env.PROD,
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

        if (slide.serverBuilder.providerClassName.includes("OmeroWebImageServerBuilder")) {
            const slideId = slide.serverBuilder.uri.split("?show=image-")[1];

            fetchSlideOmero(slideId)
                .then((data) => {
                    const annotations = JSON.parse(slide.annotations || "[]");

                    viewer?.SetSlideRepository(SlideRepository.OMERO);
                    viewer?.LoadSlide(data);
                    viewer?.ClearAnnotations();
                    viewer?.DrawAnnotations(annotations || []);

                    setCachedAnnotations(annotations || []);
                }).catch((error) => {
                    toast.error(error.message);
                    console.error(error);
                });
        } else if (slide.serverBuilder.providerClassName.includes("EduServerBuilder")) {
            const slideId = new URL(slide.serverBuilder.uri).pathname.substr(1);

            fetchSlide(slideId)
                .then((data) => {
                    const annotations = JSON.parse(slide.annotations || "[]");

                    viewer?.SetSlideRepository(SlideRepository.OpenMicroanatomy);
                    viewer?.LoadSlide(data);
                    viewer?.ClearAnnotations();
                    viewer?.DrawAnnotations(annotations || []);

                    setCachedAnnotations(annotations || []);
                }).catch((error) => {
                    toast.error(error.message);
                    console.error(error);
                });
        } else {
            toast.error("Unknown server builder, please retry...");
        }
    }, [slide, viewer]);
    // This hook needs to also run when Viewer changes because the setViewer() function is
    // async and has not finished unless the user has already opened the Viewer tab.

    /**
     * Draw any annotations for this slide tour entry and pan & zoom to correct position.
     */
    function DrawCurrentSlideTourEntry() {
        if (slideTour.entries.length == 0) return;

        const entry = slideTour.entries[slideTour.index];
        const annotations = entry.annotations;

        viewer?.PanTo(entry.x, entry.y);
        viewer?.ZoomTo(entry.magnification);
        viewer?.SetRotation(entry.rotation);

        viewer?.ClearAnnotations();
        viewer?.DrawAnnotations(annotations || []);
    }

    useEffect(() => {
        viewer?.ClearAnnotations();

        if (slideTour.active) {
            DrawCurrentSlideTourEntry();
        } else {
            viewer?.SetRotation(0);
            viewer?.DrawAnnotations(cachedAnnotations);
        }
    }, [slideTour]);

    return <div id="Viewer" className="h-full flex-grow bg-black" />;
}

export default Viewer;
