import { create } from "zustand";
import { Annotation, EduOrganization, EduServer, EduWorkspace, Project, Slide, SlideTourState } from "../types";

type State = {
	/* Host Related */

	server: EduServer | null;
	initializeServer: (server: EduServer | null, organizations: EduOrganization[], workspaces: EduWorkspace[]) => void;

	organizations: EduOrganization[];
	setOrganizations: (organizations: EduOrganization[]) => void;

	workspaces: EduWorkspace[];
	setWorkspaces: (workspaces: EduWorkspace[]) => void;

	organization: EduOrganization | null;
	setOrganization: (organization: EduOrganization | null) => void;

	/* Project Related */

	project: Project | null,
	setProject: (project: Project | null) => void;

	selectedAnnotation: Annotation | null,
	setSelectedAnnotation: (annotation: Annotation | null) => void;

	slide: Slide | null,
	setSlide: (slide: Slide | null) => void;

	slideTour: SlideTourState,
	setSlideTour: (slideTour: SlideTourState) => void;

	/* User Interface */

	displaySlideNumbers: boolean,
	setDisplaySlideNumbers: (display: boolean) => void;

	sidebarVisible: boolean,
	setSidebarVisible: (visibility: boolean) => void;
}

export const useStore = create<State>((set) => ({
	/* Host Related */

	server: null,
	initializeServer: (server: EduServer | null, organizations: EduOrganization[], workspaces: EduWorkspace[]) => set(() => ({
		server: server,
		organizations: organizations,
		workspaces: workspaces
	})),

	organizations: [],
	setOrganizations: (organizations: EduOrganization[]) => set(() => ({ organizations: organizations })),

	workspaces: [],
	setWorkspaces: (workspaces: EduWorkspace[]) => set(() => ({ workspaces: workspaces })),

	organization: null,
	setOrganization: (organization: EduOrganization | null) => set(() => ({ organization: organization })),

	/* Project Related */

	project: null as Project | null,
	setProject: (project: Project | null) => set(() => ({
		project: project,
		slide: null,
		slideTour: { active: false, index: 0, entries: [] },
	})),

	selectedAnnotation: null as Annotation | null,
	setSelectedAnnotation: (annotation: Annotation | null) => set(() => ({ selectedAnnotation: annotation })),

	slide: null as Slide | null,
	setSlide: (slide: Slide | null) => set(() => ({ slide: slide })),

	slideTour: { active: false, index: 0, entries: [] } as SlideTourState,
	setSlideTour: (slideTour: SlideTourState) => set(() => ({ slideTour: slideTour })),

	/* UI Related */

	displaySlideNumbers: false,
	setDisplaySlideNumbers: (display: boolean) => set(() => ({ displaySlideNumbers: display })),

	sidebarVisible: true,
	setSidebarVisible: (visibility: boolean) => set(() => ({ sidebarVisible: visibility })),
}));
