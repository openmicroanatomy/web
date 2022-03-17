import { ProjectData } from "types";

interface ProjectInformationProps {
    data: ProjectData
}

function ProjectInformation({ data }: ProjectInformationProps) {
    return (
        <div className="p-4">
            {data ? 
                (data.projectInformation ? 
                    <div dangerouslySetInnerHTML={{ __html: data.projectInformation}} />
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
