import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '../services/loggerService';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.critical('App', 'React Component Crash', {
            error: error.message,
            stack: errorInfo.componentStack
        });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100 text-center">
                        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
                        <p className="text-gray-500 mb-6">
                            El sistema ha registrado este error y ha notificado al equipo técnico.
                        </p>

                        <div className="bg-gray-50 p-4 rounded-lg text-left text-xs font-mono text-gray-700 mb-6 overflow-auto max-h-32 border border-gray-200">
                            {this.state.error?.message || 'Error desconocido'}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Recargar aplicación
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
