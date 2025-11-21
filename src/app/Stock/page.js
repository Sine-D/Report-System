/*##################################################################################################################################################
####################################################################################################################################################
###########################################################         SINETH DINSARA           #######################################################
###########################################################           22/10/2025             #######################################################
####################################################################################################################################################
####################################################################################################################################################*/

'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import LowStockAlerts from '../../components/LowStockAlerts';

export default function StockPage() {
    // Stock Data States
    const [stockItems, setStockItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Search and Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [customThreshold, setCustomThreshold] = useState(10);
    
    // Stock Statistics
    const [totalItems, setTotalItems] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);
    const [outOfStockCount, setOutOfStockCount] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    

    // Load custom threshold from localStorage on component mount
    useEffect(() => {
        const savedThreshold = localStorage.getItem('stockThreshold');
        if (savedThreshold) {
            setCustomThreshold(parseInt(savedThreshold));
        }
    }, []);

    // Save custom threshold to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('stockThreshold', customThreshold.toString());
    }, [customThreshold]);

    // Fetch stock items on component mount
    useEffect(() => {
        fetchStockItems();
    }, []);

    // Filter and search items
    useEffect(() => {
        let filtered = [...stockItems];
        
        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.ItemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.SysID.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.ItemCode.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Category filter
        if (filterCategory !== 'all') {
            if (filterCategory === 'low') {
                filtered = filtered.filter(item => item.GoodQty > 0 && item.GoodQty <= customThreshold);
            } else if (filterCategory === 'out') {
                filtered = filtered.filter(item => item.GoodQty === 0);
            } else if (filterCategory === 'good') {
                filtered = filtered.filter(item => item.GoodQty > customThreshold);
            }
        }
        
        // Sort items
        filtered.sort((a, b) => {
            let aValue, bValue;
            switch (sortBy) {
                case 'name':
                    aValue = a.ItemName.toLowerCase();
                    bValue = b.ItemName.toLowerCase();
                    break;
                case 'quantity':
                    aValue = a.GoodQty;
                    bValue = b.GoodQty;
                    break;
                case 'price':
                    aValue = a.SellingPrice;
                    bValue = b.SellingPrice;
                    break;
                default:
                    aValue = a.ItemName.toLowerCase();
                    bValue = b.ItemName.toLowerCase();
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        setFilteredItems(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    }, [stockItems, searchTerm, filterCategory, sortBy, sortOrder, customThreshold]);

    // Calculate statistics
    useEffect(() => {
        if (stockItems.length > 0) {
            setTotalItems(stockItems.length);
            setLowStockCount(stockItems.filter(item => item.GoodQty > 0 && item.GoodQty <= customThreshold).length);
            setOutOfStockCount(stockItems.filter(item => item.GoodQty === 0).length);
            setTotalValue(stockItems.reduce((sum, item) => sum + (item.GoodQty * item.SellingPrice), 0));
        }
    }, [stockItems, customThreshold]);

    // Fetch stock items from API
    const fetchStockItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/items');
            const data = await response.json();
            setStockItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching stock items:', err);
            setError('Failed to fetch stock items');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch stock items',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(false);
        }
    };



    // Get paginated items
    const getPaginatedItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredItems.slice(startIndex, endIndex);
    };

    // Get total pages
    const getTotalPages = () => {
        return Math.ceil(filteredItems.length / itemsPerPage);
    };

    // Get stock status
    const getStockStatus = (quantity) => {
        if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
        if (quantity <= customThreshold) return { text: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-100' };
        return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
            
            <div className="relative max-w-7xl mx-auto p-4 sm:p-6">
                {/* Hero Header with Enhanced Design */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-10 mb-8 overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
                        <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                            <div className="relative">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent mb-2">
                                    Stock Management
                                </h1>
                                
                                <div className="flex items-center space-x-4 mt-3">
                                    <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-200 shadow-sm">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-semibold">System Online</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 w-full lg:w-auto">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 shadow-sm">
                                <div className="text-sm text-gray-500 font-medium mb-1">Total Items</div>
                                <div className="text-lg font-bold text-gray-900">{totalItems}</div>
                            </div>
                            
                            
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-500 font-medium mb-1">In Stock</div>
                                    <div className="text-2xl font-bold text-green-600">{totalItems - lowStockCount - outOfStockCount}</div>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-500 font-medium mb-1">Low Stock</div>
                                    <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
                                </div>
                                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 border border-red-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-500 font-medium mb-1">Out of Stock</div>
                                    <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-gray-500 font-medium mb-1">Categories</div>
                                    <div className="text-2xl font-bold text-purple-600">{new Set(stockItems.map(item => item.ItemCode?.slice(0, 3))).size}</div>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter Section */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-10 mb-8 overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-20 translate-x-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full translate-y-16 -translate-x-16"></div>
                    
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                        <div className="mb-4 sm:mb-0">
                            <div className="flex items-center space-x-4 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Search & Filter</h2>
                                    <p className="text-sm sm:text-base text-gray-600 font-medium">Find and manage your inventory items</p>
                                </div>
                            </div>
                        </div>
                        
                        
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
                        <div className="sm:col-span-2 lg:col-span-2">
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <span>Search Items</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name, code, or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white hover:border-gray-300 text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <span>Low Stock Threshold</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    value={customThreshold}
                                    onChange={(e) => setCustomThreshold(parseInt(e.target.value) || 0)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white hover:border-gray-300 text-gray-900 text-base font-medium shadow-sm hover:shadow-md"
                                    placeholder="Threshold"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                    </svg>
                                </div>
                                <span>Filter</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                    </svg>
                                </div>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white hover:border-gray-300 text-gray-900 text-base font-medium shadow-sm hover:shadow-md"
                                >
                                    <option value="all">All Items</option>
                                    <option value="good">In Stock</option>
                                    <option value="low">Low Stock</option>
                                    <option value="out">Out of Stock</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </div>
                                <span>Sort By</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </div>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white hover:border-gray-300 text-gray-900 text-base font-medium shadow-sm hover:shadow-md"
                                >
                                    <option value="name">Name</option>
                                    <option value="quantity">Quantity</option>
                                    <option value="price">Price</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stock Table */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-10 mb-8 overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full -translate-y-20 translate-x-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full translate-y-16 -translate-x-16"></div>
                    
                    <div className="relative">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Stock Items</h2>
                                    <p className="text-sm sm:text-base text-gray-600 font-medium">Showing {getPaginatedItems().length} of {filteredItems.length} items</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-4 py-2 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                    <span>{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                                <span className="ml-4 text-gray-600 font-medium">Loading stock items...</span>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Stock</h3>
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={fetchStockItems}
                                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : getPaginatedItems().length === 0 ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Items Found</h3>
                                <p className="text-gray-600 mb-4">No stock items match your current search and filter criteria.</p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterCategory('all');
                                    }}
                                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden lg:block overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Item Details</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Code</th>
                                                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Quantity</th>
                                                <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Status</th>
                                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {getPaginatedItems().map((item, index) => {
                                                const status = getStockStatus(item.GoodQty);
                                                return (
                                                    <tr key={item.SysID} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                                                                    <span className="text-indigo-600 font-bold text-sm">{item.ItemName.slice(0, 2).toUpperCase()}</span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-gray-900">{item.ItemName}</div>
                                                                    <div className="text-sm text-gray-500 font-mono">{item.SysID}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-mono text-sm text-gray-600">{item.ItemCode}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-lg font-bold text-gray-900">{item.GoodQty}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                                {status.text}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="font-semibold text-gray-900">Rs.{item.SellingPrice}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="lg:hidden space-y-4">
                                    {getPaginatedItems().map((item) => {
                                        const status = getStockStatus(item.GoodQty);
                                        return (
                                            <div key={item.SysID} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                                                            <span className="text-indigo-600 font-bold text-sm">{item.ItemName.slice(0, 2).toUpperCase()}</span>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">{item.ItemName}</h3>
                                                            <p className="text-sm text-gray-500 font-mono">{item.SysID}</p>
                                                            <p className="text-xs text-gray-400">{item.ItemCode}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                        {status.text}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 rounded-xl p-3">
                                                        <div className="text-sm text-gray-500 mb-1">Quantity</div>
                                                        <div className="text-lg font-bold text-gray-900">{item.GoodQty}</div>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-xl p-3">
                                                        <div className="text-sm text-gray-500 mb-1">Price</div>
                                                        <div className="text-lg font-bold text-gray-900">Rs.{item.SellingPrice}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {getTotalPages() > 1 && (
                                    <div className="flex items-center justify-between mt-8">
                                        <div className="text-sm text-gray-500">
                                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Previous
                                            </button>
                                            <div className="flex items-center space-x-1">
                                                {Array.from({ length: Math.min(5, getTotalPages()) }, (_, i) => {
                                                    const page = i + 1;
                                                    return (
                                                        <button
                                                            key={page}
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                                                currentPage === page
                                                                    ? 'bg-indigo-500 text-white'
                                                                    : 'text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, getTotalPages()))}
                                                disabled={currentPage === getTotalPages()}
                                                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-10">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Low Stock Alerts</h2>
                            <p className="text-sm sm:text-base text-gray-600 font-medium">Monitor items that need restocking</p>
                        </div>
                    </div>
                    <LowStockAlerts threshold={customThreshold} showNotification={true} />
                </div>
            </div>

            
        </div>
    );
}
