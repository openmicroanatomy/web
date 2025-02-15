/*
 * Types prefixed with <code>Edu</code> are types returned by the OpenMicroanatomy Server.
 * See "Schemas" at the bottom of https://demo.edu.qupath.yli-hallila.fi/swagger
 */

export type EduServerConfiguration = {
    version: string;
    guestLoginEnabled: boolean;
    simpleLoginEnabled: boolean;
    microsoftLoginEnabled: boolean;
}

export type EduServer = {
    id: string;
    name: string;
    host: string;
    img: string;
}

export type EduOwner = {
    id: string;
    name: string;
}

enum EduRoles {
    ANYONE,
    ADMIN,
    MODERATOR,
    MANAGE_USERS,
    MANAGE_SLIDES,
}

export type EduUser = EduOwner & {
    email: string;
    organization: EduOrganization;
    roles: EduRoles[];
}

export type EduOrganization = EduOwner & {
    logoUrl: string;
}

export type EduSlide = {
    id: string;
    name: string;
    owner: EduOwner;
    parameters: unknown;
}

export type EduProject = {
    id: string;
    name: string;
    description: string;
    subject: EduSubject;
    createdAt: number;
    modifiedAt: number;
    hidden: boolean;
    owner: string;
}

export type EduSubject = {
    id: string;
    name: string;
    workspace: EduWorkspace;
    projects: EduProject[];
}

export type EduWorkspace = {
    id: string;
    name: string;
    owner: EduOwner;
    subjects: EduSubject[];
    write: EduOwner[];
    read: EduOwner[];
}

/* QuPath Edu Types */

export type Project = {
    id: string;
    version: string;
    createTimestamp: number;
    modifyTimestamp: number;
    images: Slide[];
    projectInformation: string;
}

export type Slide = {
    serverBuilder: ServerBuilder;
    entryID: number;
    randomizedName: string;
    description: string;
    imageName: string;
    thumbnail: string;
    imageData: string;
    slideTour: string;
    annotations: string;
}

export type ServerBuilder = {
    uri: string;
    builderType: string;
    providerClassName: string;
    args: string[];
    metadata: unknown;
}

export type Annotation = {
    type: string;
    geometry: Geometry;
    properties: AnnotationProperties;
}

type AnnotationProperties = {
    object_type: string;
    name: string | undefined;
    color: number[];
    isLocked: boolean;
    metadata?: AnnotationMetadata;
}

type AnnotationMetadata = {
    ANNOTATION_DESCRIPTION?: string | null;
    EDU_ANSWER?: string | null;
    Answer?: string | null;

    /**
     * <p> <code>&lt;</code> = arrow start
     * <p> <code>&gt;</code> = arrow end
     * <p> <code>&lt;&gt;</code> = double arrow
     *
     * @see https://github.com/qupath/qupath/blob/864ac71893a8749ff226c99e51642a5e10ea89ea/qupath-gui-fx/src/main/java/qupath/lib/gui/viewer/tools/handlers/PathToolEventHandlers.java#L40-L50
     */
    arrowhead?: "<" | ">" | "<>" | null;
    [key: string]: unknown;
}

export type SlideTourEntry = {
    text: string;
    x: number;
    y: number;
    magnification: number;
    rotation: number;
    annotations: Annotation[];
}

export type SlideTourState = {
    active: boolean;
    index: number;
    entries: SlideTourEntry[]
}

export type MultiChoiceOption = {
    choice: string;

    /**
     * Poorly named, is actually `isCorrectAnswer`.
     */
    isAnswer: boolean;
}

export type Geometry = {
    type: string;
    coordinates: MultiPolygon | Polygon | LineString;
}

export type Polygon = number[][][];
export type MultiPolygon = number[][][][];
export type LineString = number[][];
