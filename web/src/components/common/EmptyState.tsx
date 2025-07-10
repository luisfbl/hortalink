import React from 'react';
import './EmptyState.scss';

interface EmptyStateProps {
    message: string;
    icon?: string;
    className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
    message, 
    icon = "📦", 
    className = "" 
}) => {
    return (
        <div className={`empty-state ${className}`}>
            <div className="empty-state-icon">{icon}</div>
            <p className="empty-state-message">{message}</p>
        </div>
    );
};

export default EmptyState;