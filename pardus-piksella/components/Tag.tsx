
import React from 'react';

interface TagProps {
    label: string;
}

const Tag: React.FC<TagProps> = ({ label }) => (
    <span className="inline-block bg-pardus-light-dark text-pardus-text text-xs font-medium mr-2 mb-2 px-2.5 py-1 rounded-full">
        {label}
    </span>
);

export default Tag;