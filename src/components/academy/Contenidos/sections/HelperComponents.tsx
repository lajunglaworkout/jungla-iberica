import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div
            className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
        <div className="text-right text-xs text-gray-500 mt-1">{Math.round(progress)}% Completado</div>
    </div>
);

export const CollapsibleSection = ({
    title,
    children,
    icon,
    defaultExpanded = true,
    rightElement
}: {
    title: string,
    children: React.ReactNode,
    icon?: React.ReactNode,
    defaultExpanded?: boolean,
    rightElement?: React.ReactNode
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className={`border rounded-xl mb-5 bg-white shadow-sm overflow-hidden transition-all duration-300
            ${expanded ? 'border-emerald-500/30 ring-4 ring-emerald-50/50' : 'border-gray-100 hover:border-emerald-200'}`}>
            <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-emerald-50/30 transition-colors"
                onClick={async () => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg transition-colors ${expanded ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-500'}`}>
                        {icon}
                    </div>
                    <h3 className={`font-bold text-base transition-colors ${expanded ? 'text-emerald-950' : 'text-gray-700'}`}>
                        {title}
                    </h3>
                </div>
                <div className="flex items-center gap-3">
                    {rightElement}
                    <div className={`p-1 rounded-full transition-all duration-300 ${expanded ? 'bg-emerald-100 rotate-180' : 'bg-transparent'}`}>
                        <ChevronDown className={`h-5 w-5 transition-colors ${expanded ? 'text-emerald-600' : 'text-gray-400'}`} />
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="p-5 border-t border-emerald-50/50 animate-in slide-in-from-top-2 duration-300 bg-white">
                    {children}
                </div>
            )}
        </div>
    );
};
