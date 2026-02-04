import React from 'react';
import { Home, ListTodo, MoreVertical, QrCode } from 'lucide-react';

interface MobileBottomNavProps {
    currentModule: string | null;
    onNavigate: (module: string) => void;
    userRole: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentModule, onNavigate, userRole }) => {
    // Only show for non-admin roles usually, but logic is handled in App.tsx
    // This component purely renders the nav bar

    const navItems = [
        { id: 'main-dashboard', label: 'Inicio', icon: Home },
        { id: 'my-tasks', label: 'Tareas', icon: ListTodo },
        { id: 'center-management', label: 'Mi Centro', icon: QrCode }, // Quick access to center/clock-in
        { id: 'more', label: 'Menú', icon: MoreVertical, isAction: true } // Toggle sidebar action
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center z-50 md:hidden safe-area-bottom shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;

                return (
                    <button
                        key={item.id}
                        onClick={() => item.isAction ? onNavigate('toggle-sidebar') : onNavigate(item.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-16 ${isActive
                                ? 'text-emerald-600 bg-emerald-50'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium mt-1">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
