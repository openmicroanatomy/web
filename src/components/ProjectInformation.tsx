import { ProjectData } from "types";

interface ProjectInformationProps {
    data: ProjectData | null
}

function ProjectInformation({ data }: ProjectInformationProps) {
    const styles = `<link rel="stylesheet" href="ckeditor.css" />`;

    return (
        <div className="p-2 h-full">
            {data ? 
                (data.projectInformation ? 
                    <iframe srcDoc={styles + data.projectInformation} className="w-full h-full"></iframe>
                : 
                    <p>No additional information available for this project.</p>
                )
            : 
                <p>No project open</p>
            }
        </div>
    );
}

export default ProjectInformation;
