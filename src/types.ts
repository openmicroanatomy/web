export interface Host {
    id: string;
    name: string;
    host: string;
    img: string;
}

export interface Organization {
    id: string;
    name: string;
    logoUrl: string;
}

enum Roles {
    ANYONE,
    ADMIN,
    MODERATOR,
    MANAGE_USERS,
    MANAGE_SLIDES,
}

export interface User {
    id: string;
    name: string;
    email: string;
    organization: Organization;
    roles: Roles;
}

export interface Owner {
    id: string;
    name: string;
}

export interface Slide {
    id: string;
    name: string;
    owner: Owner;
    parameters: unknown;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    subject: Subject;
    createdAt: number;
    modifiedAt: number;
    hidden: boolean;
    owner: string;
}

export interface ProjectData {
    id: string;
    version: string;
    createTimestamp: number;
    modifyTimestamp: number;
    images: Image[];
}

export interface Subject {
    id: string;
    name: string;
    workspace: Workspace;
    projects: Project[];
}

export interface Workspace {
    id: string;
    name: string;
    owner: Owner;
    subjects: Subject[];
    write?: Owner[];
    read?: Owner[];
    // writePermissions?: Owner[];
    // readPermissions?: Owner[];
}

export interface Image {
    serverBuilder: ServerBuilder;
    entryID: number;
    randomizedName: string;
    description: string;
    imageName: string;
    thumbnail: string;
    imageData: string; // Serialized Java fuckery
    annotations: string;
}

// Commented out unused props
export interface ServerBuilder {
    uri: string;
    // builderType: string
    // providerClassName: string
    // args: string[]
}

// Annotation
export interface Annotation {
    type: string;
    geometry: Geometry;
    properties: AnnotationProps;
}

interface AnnotationProps {
    object_type: string;
    name: string;
    color: number[];
    isLocked: boolean;
    metadata?: AnnotationPropsMetaData;
}

interface AnnotationPropsMetaData {
    ANNOTATION_DESCRIPTION?: string | null;
    EDU_ANSWER?: string | null;
}

export interface EduAnswer {
    choice: string;
    isAnswer: boolean;
}

export interface Geometry {
    type: string;
    coordinates: Polygon | LineString;
}

export type Polygon = number[][][];
export type LineString = number[][];
