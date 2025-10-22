import { EduServer } from "../types";
import { useStore } from "../lib/StateStore";
import ServerSelector from "./ServerSelector";
import OrganizationSelector from "./OrganizationSelector";
import ProjectSelector from "./ProjectSelector";
import { useEffect, useRef } from "react";

type Props = {
	servers: EduServer[];
}

export function LessonSelectorModal({ servers }: Props) {
	const dialog = useRef<HTMLDialogElement>(null);

    const [ lessonSelectorModalVisible, setLessonSelectorModalVisible, server, organization ] = useStore(state => [
		state.lessonSelectorModalVisible, state.setLessonSelectorModalVisible, state.server, state.organization
	]);

    useEffect(() => {
        const element = dialog.current;

        if (!element) return;

        const handleClose = () => {
            setLessonSelectorModalVisible(false)
        }

        const handleClick = (e: MouseEvent) => {
            if (e.target === e.currentTarget) {
                setLessonSelectorModalVisible(false);
            }
        }

        dialog.current?.addEventListener("close", handleClose);
        dialog.current?.addEventListener("click", handleClick);

        return () => {
            dialog.current?.removeEventListener("close", handleClose);
            dialog.current?.removeEventListener("click", handleClick);
        }
    }, []);

    useEffect(() => {
        if (lessonSelectorModalVisible) {
            dialog.current?.showModal();
        } else {
            dialog.current?.close();
        }
    }, [lessonSelectorModalVisible]);

	return (
		<dialog
            ref={dialog}
            className="m-auto w-full md:w-[820px] h-full md:h-[720px] md:border border-gray-300 rounded-lg bg-white overflow-hidden"
        >
            <div className="flex flex-col h-full">
                <div className="flex flex-col">
                    <div className="p-4 flex flex-col gap-4 bg-white">
                        <header className="my-4">
                            <h1 className="font-serif text-2xl text-center sm:text-4xl">OpenMicroanatomy</h1>
                        </header>

                        <ServerSelector servers={servers} />

                        { server && <OrganizationSelector /> }
                    </div>
                </div>

                <hr />

                <div className="flex-grow overflow-y-auto scrollbar">
                    {(server && organization) ? (
                        <ProjectSelector />
                    ) : (
                        <p className="h-full flex items-center justify-center font-bold text-slate-600">Select organization to continue</p>
                    )}
                </div>
            </div>
		</dialog>
	);
}
