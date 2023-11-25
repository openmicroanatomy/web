import { Project } from "types";

type Props = {
    data: Project | null
}

export default function ProjectInformation({ data }: Props) {
    const styles = `<link rel="stylesheet" href="ckeditor.css" />`;

    if (!data) {
        return <p className="flex h-full items-center justify-center font-bold">Loading ...</p>;
    }

    return (
        <div className="p-2 h-full">
            {data.projectInformation ? (
                <iframe srcDoc={styles + data.projectInformation} className="w-full h-full"></iframe>
            ) : (
                <p className="flex h-full items-center justify-center font-bold">No additional information available for this lesson.</p>
            )}
        </div>
    );
}
