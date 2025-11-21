'use client'
import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function InitPage() {
    const [loading, setLoading] = useState(false);
    
    const initializeDatabase = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/init', {
                method: 'POST'
            });
            const result = await response.json();
            
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Database Initialized!',
                    text: `Successfully created ${result.data.customers} customers, ${result.data.items} items, and ${result.data.prices} price entries`,
                    confirmButtonColor: '#10b981'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Initialization Failed',
                    text: result.error || 'Failed to initialize database',
                    confirmButtonColor: '#ef4444'
                });
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Unexpected error during initialization',
                confirmButtonColor: '#ef4444'
            });
        }
        setLoading(false);
    };
    
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Database Setup</h1>
                    <p className="text-gray-600 mb-8">
                        Initialize your invoicing database with sample data including customers, items, and pricing information.
                    </p>
                    
                    <button
                        onClick={initializeDatabase}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Initializing...</span>
                            </div>
                        ) : (
                            'Initialize Database'
                        )}
                    </button>
                    
                    <div className="mt-6 text-sm text-gray-500">
                        <p>This will create:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Database tables for invoicing</li>
                            <li>5 sample customers</li>
                            <li>5 sample items with pricing</li>
                            <li>Terminal configuration</li>
                        </ul>
                    </div>
                    
                    <div className="mt-8">
                        <a 
                            href="/Invoice" 
                            className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Go to Invoice Page →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
