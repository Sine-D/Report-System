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

export default function InvoicePage() {
    // Customer and Invoice Details
    const [customer, setCustomer] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString('en-GB'));
    const [referenceNo, setReferenceNo] = useState('');
    const [priceCategory, setPriceCategory] = useState('');
    const [staff, setStaff] = useState('');
    
    // Item Search and Selection
    const [items, setItems] = useState([]);
    const [allItems, setAllItems] = useState([]); // Store all items
    const [customers, setCustomers] = useState([]);
    const [priceCategories, setPriceCategories] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [searchItemName, setSearchName] = useState("");
    const [searchItemCode, setSearchCode] = useState("");
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [grossTotal, setGrossTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showItemCodeDropdown, setShowItemCodeDropdown] = useState(false);
    const [showItemNameDropdown, setShowItemNameDropdown] = useState(false);
    
    // Invoice Items
    const [invoiceItems, setInvoiceItems] = useState([]);
    
    // Payment Details
    const [subTotal, setSubTotal] = useState(0);
    const [extraDiscount, setExtraDiscount] = useState(0);
    const [netTotal, setNetTotal] = useState(0);
    const [cashPaid, setCashPaid] = useState(0);
    const [balance, setBalance] = useState(0);
    
    // Credit Payment Details
    const [itemDiscount, setItemDiscount] = useState(0);
    const [noOfItems, setNoOfItems] = useState(0);
    const [totalOfItems, setTotalOfItems] = useState(0);
    const [creditAmount, setCreditAmount] = useState(0);
    
    // Card Payment Details
    const [cardNo, setCardNo] = useState('');
    const [bank, setBank] = useState('');
    const [cardType, setCardType] = useState('');
    const [cardAmount, setCardAmount] = useState(0);
    
    // Loading states
    const [customerLoading, setCustomerLoading] = useState(false);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    
    // Amount of invoices
    const [amountOfInvoices, setAmountOfInvoices] = useState('');
    
    // Fetch customers and price categories on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch customers
                const customerRes = await fetch("/api/customer");
                const customerData = await customerRes.ok ? await customerRes.json() : [];
                console.log('Fetched customers:', customerData.length, customerData);
                setCustomers(Array.isArray(customerData) ? customerData : []);

                // Fetch price categories
                const priceRes = await fetch("/api/invoice?action=priceCategories");
                const priceData = await priceRes.ok ? await priceRes.json() : [];
                setPriceCategories(Array.isArray(priceData) ? priceData : []);

                // Fetch staff list
                const staffRes = await fetch("/api/staff");
                const staffData = await staffRes.ok ? await staffRes.json() : [];
                setStaffList(Array.isArray(staffData) ? staffData : []);
                
                // Get invoice count
                const invoiceCountRes = await fetch("/api/invoice?action=count");
                const invoiceCount = await invoiceCountRes.ok ? await invoiceCountRes.json() : { count: 0 };
                setAmountOfInvoices(invoiceCount.count || '');

                // Fetch all items for dropdowns
                await fetchAllItems();
            } catch (err) {
                console.error("Error fetching data:", err);
                // Ensure arrays are set even on error
                setCustomers([]);
                setPriceCategories([]);
                setStaffList([]);
                setAmountOfInvoices('');
                setAllItems([]);
            }
        };
        fetchData();
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.relative')) {
                setShowItemCodeDropdown(false);
                setShowItemNameDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch items when searching
    useEffect(() => {
        const fetchData = async () => {
        if (!searchItemName && !searchItemCode) {
            setItems([]);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(
            `/api/invoice?action=searchItems&searchItemName=${encodeURIComponent(searchItemName)}&searchItemCode=${encodeURIComponent(searchItemCode)}&priceCategory=${encodeURIComponent(priceCategory)}`
            );
            const data = await res.json();
            // Ensure data is always an array
            if (Array.isArray(data)) {
                setItems(data);
            } else if (data && Array.isArray(data.items)) {
                setItems(data.items);
            } else {
                setItems([]);
            }
        } catch (err) {
            console.error("Error fetching items:", err);
            setItems([]);
        }
        setLoading(false);
        };

        const delayDebounce = setTimeout(fetchData, 300);
        return () => clearTimeout(delayDebounce);
    }, [searchItemName, searchItemCode, priceCategory]);

    // Recalculate gross total when quantity or unit price changes
    useEffect(() => {
        const qty = Number(quantity) || 0;
        const price = Number(unitPrice) || 0;
        setGrossTotal(qty * price);
    }, [quantity, unitPrice]);

    // Calculate totals whenever invoice items change
    useEffect(() => {
        const total = invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setSubTotal(total);
        setNoOfItems(invoiceItems.length);
        setTotalOfItems(invoiceItems.reduce((sum, item) => sum + item.quantity, 0));
    }, [invoiceItems]);

    // Calculate net total and balance
    useEffect(() => {
        const net = subTotal - extraDiscount;
        setNetTotal(net);
        setBalance(net - cashPaid - creditAmount - cardAmount);
    }, [subTotal, extraDiscount, cashPaid, creditAmount, cardAmount]);

    // Handle price category change - fetch new price for selected item
    useEffect(() => {
        if (selectedItem && priceCategory) {
            fetchItemPrice(selectedItem.SysID, priceCategory);
        }
    }, [priceCategory, selectedItem]);

    const handleSelect = (itemCode) => {
        if (!Array.isArray(items)) return;
        const found = items.find((i) => i.SysID === itemCode);
        if (!found) return;
        setSelectedItem(found);
        setSearchName(found.ItemName);
        setSearchCode(found.SysID);
        setUnitPrice(found.SellingPrice || 0);
        // Also fetch price based on current price category if available
        if (priceCategory) {
            fetchItemPrice(found.SysID, priceCategory);
        }
    };

    // Handle item selection from dropdowns
    const handleItemCodeSelect = (itemCode) => {
        const found = allItems.find((item) => item.SysID === itemCode);
        if (found) {
            setSelectedItem(found);
            setSearchName(found.ItemName);
            setSearchCode(found.SysID);
            setShowItemCodeDropdown(false);
            // Set default price first, then fetch price based on category
            setUnitPrice(found.SellingPrice || 0);
            // Fetch price based on current price category if available
            if (priceCategory) {
                fetchItemPrice(found.SysID, priceCategory);
            }
        }
    };

    const handleItemNameSelect = (itemName) => {
        const found = allItems.find((item) => item.ItemName === itemName);
        if (found) {
            setSelectedItem(found);
            setSearchName(found.ItemName);
            setSearchCode(found.SysID);
            setShowItemNameDropdown(false);
            // Set default price first, then fetch price based on category
            setUnitPrice(found.SellingPrice || 0);
            // Fetch price based on current price category if available
            if (priceCategory) {
                fetchItemPrice(found.SysID, priceCategory);
            }
        }
    };

    // Fetch item price based on price category
    const fetchItemPrice = async (itemCode, priceCategory) => {
        try {
            const response = await fetch(`/api/invoice?action=getItemPrice&itemCode=${encodeURIComponent(itemCode)}&priceCategory=${encodeURIComponent(priceCategory)}`);
            const data = await response.json();
            if (data.price && data.price > 0) {
                setUnitPrice(data.price);
            } else {
                // Fallback to item's default price if API doesn't return a valid price
                const found = allItems.find((item) => item.SysID === itemCode);
                if (found && found.SellingPrice) {
                    setUnitPrice(found.SellingPrice);
                }
            }
        } catch (error) {
            console.error('Error fetching item price:', error);
            // Fallback to item's default price on error
            const found = allItems.find((item) => item.SysID === itemCode);
            if (found && found.SellingPrice) {
                setUnitPrice(found.SellingPrice);
            }
        }
    };

    // Filter items based on search
    const filteredItemCodes = allItems.filter(item => 
        item.SysID.toLowerCase().includes(searchItemCode.toLowerCase()) ||
        item.ItemCode.toLowerCase().includes(searchItemCode.toLowerCase())
    );

    const filteredItemNames = allItems.filter(item => 
        item.ItemName.toLowerCase().includes(searchItemName.toLowerCase())
    );

    const addToInvoice = (e) => {
        e.preventDefault();
        if (!selectedItem) {
            Swal.fire({
                icon: 'warning',
                title: 'No Item Selected',
                text: 'Please select an item before adding to invoice',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        if (!quantity || quantity <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Quantity',
                text: 'Please enter a valid quantity',
                confirmButtonColor: '#f59e0b'
            });
        return;
        }

        const newItem = {
            id: Date.now(),
            code: selectedItem.SysID,
            name: selectedItem.ItemName,
            quantity: Number(quantity),
            price: Number(unitPrice) || 0,
            grossPrice: Number(grossTotal) || 0
        };

        setInvoiceItems(prev => [...prev, newItem]);

        // Reset form
        setSearchCode("");
        setSearchName("");
        setQuantity("");
        setUnitPrice("");
        setGrossTotal(0);
        setItems([]);
        setSelectedItem(null);
    };

    const removeItem = (id) => {
        setInvoiceItems(prev => prev.filter(item => item.id !== id));
    };

    // Fetch all items for dropdowns
    const fetchAllItems = async () => {
        try {
            const response = await fetch('/api/items');
            const data = await response.json();
            setAllItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching all items:', error);
            setAllItems([]);
        }
    };

    // Fetch customers from server
    const fetchCustomers = async () => {
        setCustomerLoading(true);
        try {
            const response = await fetch('/api/customer');
            const data = await response.json();
            setCustomers(Array.isArray(data) ? data : []);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Fetched ${data.length} customers`,
                confirmButtonColor: '#10b981'
            });
        } catch (error) {
            console.error('Error fetching customers:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch customers',
                confirmButtonColor: '#ef4444'
            });
        }
        setCustomerLoading(false);
    };

    // Fetch items from server
    const fetchItems = async () => {
        setItemsLoading(true);
        try {
            const response = await fetch('/api/items');
            const data = await response.json();
            setAllItems(Array.isArray(data) ? data : []);
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: `Fetched ${data.length} items`,
                confirmButtonColor: '#10b981'
            });
        } catch (error) {
            console.error('Error fetching items:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch items',
                confirmButtonColor: '#ef4444'
            });
        }
        setItemsLoading(false);
    };

    // Upload invoices to server
    const uploadInvoices = async () => {
        setUploadLoading(true);
        try {
            const response = await fetch('/api/invoice?action=upload', {
                method: 'POST'
            });
            const data = await response.json();
            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: data.message,
                    confirmButtonColor: '#10b981'
                });
                setAmountOfInvoices('0');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error,
                    confirmButtonColor: '#ef4444'
                });
            }
        } catch (error) {
            console.error('Error uploading invoices:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to upload invoices',
                confirmButtonColor: '#ef4444'
            });
        }
        setUploadLoading(false);
    };

    const handlePlaceInvoice = async (e) => {
        e.preventDefault();

        if (invoiceItems.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Items',
                text: 'Please add at least one item to the invoice',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        if (!customer) {
            Swal.fire({
                icon: 'warning',
                title: 'No Customer',
                text: 'Please select a customer',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        if (!priceCategory) {
            Swal.fire({
                icon: 'warning',
                title: 'No Price Category',
                text: 'Please select a price category',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        if (!staff) {
            Swal.fire({
                icon: 'warning',
                title: 'No Staff Selected',
                text: 'Please select a staff member',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        setInvoiceLoading(true);
        try {
            const formData = new FormData();
            formData.append('customer', customer);
            formData.append('referenceNo', referenceNo);
            formData.append('priceCategory', priceCategory);
            formData.append('staff', staff);
            formData.append('items', JSON.stringify(invoiceItems));
            formData.append('subTotal', subTotal);
            formData.append('extraDiscount', extraDiscount);
            formData.append('netTotal', netTotal);
            formData.append('cashPaid', cashPaid);
            formData.append('creditAmount', creditAmount);
            formData.append('cardAmount', cardAmount);

        const res = await fetch("/api/invoice", {
            method: "POST",
            body: formData,
        });

        const result = await res.json();
        if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Invoice Placed!',
                    text: `Invoice #${result.invoiceNumber} has been successfully created`,
                    confirmButtonColor: '#10b981'
                });
                // Reset form
                setInvoiceItems([]);
                setCustomer('');
                setReferenceNo('');
                setPriceCategory('');
                setStaff('');
                setCashPaid(0);
                setCreditAmount(0);
                setCardAmount(0);
                setExtraDiscount(0);
                setCardNo('');
                setBank('');
                setCardType('');
                setAmountOfInvoices(prev => (parseInt(prev) + 1).toString());
        } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed',
                    text: result.error || 'Failed to place invoice',
                    confirmButtonColor: '#ef4444'
                });
        }
        } catch (err) {
        console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Unexpected error placing invoice',
                confirmButtonColor: '#ef4444'
            });
        }
        setInvoiceLoading(false);
    };

    const handlePrintInvoice = () => {
        window.print();
    };
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
            
            <form className="relative max-w-7xl mx-auto p-4 sm:p-6">
                {/* Hero Header with Enhanced Design */}
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-10 mb-8 overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full translate-y-12 -translate-x-12"></div>
                    
                    <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
                        <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                            <div className="relative">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-2">
                                    Create Invoice
                                </h1>
                                
                                <div className="flex items-center space-x-4 mt-3">
                                    <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-200 shadow-sm">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-semibold">System Online</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-500">
                                        
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 w-full lg:w-auto">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200 shadow-sm">
                                <div className="text-sm text-gray-500 font-medium mb-1">Invoice Date</div>
                                <div className="text-lg font-bold text-gray-900">{invoiceDate}</div>
                            </div>
                            
                        </div>
                    </div>

                    {/* Customer and Invoice Details - Enhanced Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
                        <div className="sm:col-span-2 lg:col-span-2">
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span>Customer Information</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <select
                                    value={customer}
                                    onChange={(e) => setCustomer(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white hover:border-gray-300 text-gray-900 text-base font-medium shadow-sm hover:shadow-md"
                                >
                                    <option value="" className="text-gray-900">Select Customer</option>
                                    {customers.map((cust) => (
                                        <option key={cust.SysID} value={cust.SysID} className="text-gray-900">
                                            {cust.CusName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <span>Reference Number</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={referenceNo}
                                    onChange={(e) => setReferenceNo(e.target.value)}
                                    placeholder="Enter reference"
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white hover:border-gray-300 text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <span>Price Category</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <select
                                    value={priceCategory}
                                    onChange={(e) => setPriceCategory(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white hover:border-gray-300 text-gray-900 text-base font-medium shadow-sm hover:shadow-md"
                                >
                                    <option value="" className="text-gray-900">Choose Cate:</option>
                                    {priceCategories.map((category) => (
                                        <option key={category['PriceCate Type']} value={category['PriceCate Type']} className="text-gray-900">
                                            {category.PriceCategory} ({category['PriceCate Type']})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <span>Staff</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <select
                                    value={staff}
                                    onChange={(e) => setStaff(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all bg-white hover:border-gray-300 text-gray-900 text-base font-medium shadow-sm hover:shadow-md"
                                >
                                    <option value="" className="text-gray-900">Select Staff</option>
                                    {staffList.map((staffMember) => (
                                        <option key={staffMember.SysId} value={staffMember.SysId} className="text-gray-900">
                                            {staffMember.StaffName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Item Entry Section */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-10 mb-8 overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full -translate-y-20 translate-x-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-green-400/10 to-blue-400/10 rounded-full translate-y-16 -translate-x-16"></div>
                    
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                        <div className="mb-4 sm:mb-0">
                            <div className="flex items-center space-x-4 mb-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add Items to Invoice</h2>
                                    <p className="text-sm sm:text-base text-gray-600 font-medium">Search and select items to build your invoice</p>
                                </div>
                            </div>
                        </div>
                        
                    </div>

                    {/* Enhanced Search Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
                        <div className="sm:col-span-2 lg:col-span-2">
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <span>Item Code</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter item code"
                                    value={searchItemCode}
                                    onChange={(e) => {
                                        setSearchCode(e.target.value);
                                        setShowItemCodeDropdown(true);
                                    }}
                                    onFocus={() => setShowItemCodeDropdown(true)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white hover:border-gray-300 text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                                />
                                
                                {/* Enhanced Item Code Dropdown */}
                                {showItemCodeDropdown && filteredItemCodes.length > 0 && (
                                    <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                                        {filteredItemCodes.map((item, index) => (
                                            <div
                                                key={item.SysID}
                                                onClick={() => handleItemCodeSelect(item.SysID)}
                                                className="px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all hover:shadow-sm group"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                                                        <span className="text-blue-600 font-bold text-xs">{item.SysID.slice(-2)}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">{item.SysID}</div>
                                                        <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">{item.ItemName}</div>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                                            <span className="flex items-center space-x-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                </svg>
                                                                <span>Stock: {item.GoodQty}</span>
                                                            </span>
                                                            <span className="flex items-center space-x-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                                </svg>
                                                                <span>Rs.{item.SellingPrice}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="sm:col-span-2 lg:col-span-2">
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <span>Item Name</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter item name"
                                    value={searchItemName}
                                    onChange={(e) => {
                                        setSearchName(e.target.value);
                                        setShowItemNameDropdown(true);
                                    }}
                                    onFocus={() => setShowItemNameDropdown(true)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white hover:border-gray-300 text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                                />
                                
                                {/* Enhanced Item Name Dropdown */}
                                {showItemNameDropdown && filteredItemNames.length > 0 && (
                                    <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                                        {filteredItemNames.map((item, index) => (
                                            <div
                                                key={item.SysID}
                                                onClick={() => handleItemNameSelect(item.ItemName)}
                                                className="px-6 py-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all hover:shadow-sm group"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                                                        <span className="text-purple-600 font-bold text-xs">{item.ItemName.slice(0, 2).toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900 group-hover:text-purple-900 transition-colors">{item.ItemName}</div>
                                                        <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">Code: {item.SysID}</div>
                                                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                                            <span className="flex items-center space-x-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                </svg>
                                                                <span>Stock: {item.GoodQty}</span>
                                                            </span>
                                                            <span className="flex items-center space-x-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                                </svg>
                                                                <span>Rs.{item.SellingPrice}</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Item Selection and Quantity */}
            {Array.isArray(items) && items.length > 0 && (
                        <div className="mb-4 sm:mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Select Item</label>
                <select
                onChange={(e) => handleSelect(e.target.value)}
                defaultValue=""
                                className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:border-gray-300 text-gray-900 text-sm sm:text-base"
                >
                                <option value="" disabled className="text-gray-900">
                                    {loading ? "Loading..." : "Select Item from Search Results"}
                </option>
                {Array.isArray(items) && items.map((item) => (
                                    <option key={item.SysID} value={item.SysID} className="text-gray-900">
                                        {item.SysID} - {item.ItemName} | Stock: {item.GoodQty} | Price: Rs.{item.SellingPrice}
                    </option>
                ))}
                </select>
                        </div>
                    )}

                    {/* Enhanced Quantity and Pricing Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-8">
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v18a1 1 0 01-1 1H6a1 1 0 01-1-1V2a1 1 0 011-1h8v2z" />
                                    </svg>
                                </div>
                                <span>Quantity</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v18a1 1 0 01-1 1H6a1 1 0 01-1-1V2a1 1 0 011-1h8v2z" />
                                    </svg>
                                </div>
                                <input
                                    type="number"
                                    placeholder="Enter quantity"
                                    min="0"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white hover:border-gray-300 text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <span>Sell Price</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <input
                                    type="number"
                                    placeholder="Enter unit price"
                                    min="0"
                                    value={unitPrice}
                                    onChange={(e) => setUnitPrice(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white hover:border-gray-300 text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span>Gross Total</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={grossTotal.toFixed(2)}
                                    readOnly
                                    className="w-full pl-12 pr-4 py-4 border-2 border-purple-200 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 text-purple-900 text-base font-bold shadow-sm"
                                />
                            </div>
                        </div>
                        
                        <div className="sm:col-span-2 lg:col-span-2 flex items-end">
                            <button
                                onClick={addToInvoice}
                                type="button"
                                className="w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white py-4 px-8 rounded-2xl font-bold hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-base group"
                            >
                                <div className="flex items-center justify-center space-x-3">
                                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <span>Add to Invoice</span>
                                    <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Modern Invoice Items Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
                        <div className="mb-3 sm:mb-0">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Invoice Items</h2>
                            <p className="text-sm sm:text-base text-gray-600">{invoiceItems.length} item(s) added to invoice</p>
                        </div>
                        {invoiceItems.length > 0 && (
                            <div className="text-left sm:text-right">
                                <div className="text-xs sm:text-sm text-gray-500">Subtotal</div>
                                <div className="text-xl sm:text-2xl font-bold text-gray-900">Rs.{subTotal.toFixed(2)}</div>
                </div>
            )}
                    </div>

                    {invoiceItems.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                            {invoiceItems.map((item, index) => (
                                <div key={item.id} className="bg-gray-50 rounded-xl p-4 sm:p-6 border border-gray-200 hover:border-gray-300 transition-all">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                                        <div className="flex-1 w-full sm:w-auto">
                                            <div className="flex items-center space-x-3 sm:space-x-4">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="text-blue-600 font-semibold text-xs sm:text-sm">{index + 1}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{item.name}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-500">Code: {item.code}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4 sm:space-x-6 lg:space-x-8">
                                            <div className="text-center">
                                                <div className="text-xs sm:text-sm text-gray-500">Qty</div>
                                                <div className="font-semibold text-gray-900 text-sm sm:text-base">{item.quantity}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs sm:text-sm text-gray-500">Price</div>
                                                <div className="font-semibold text-gray-900 text-sm sm:text-base">Rs.{item.price.toFixed(2)}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs sm:text-sm text-gray-500">Total</div>
                                                <div className="font-bold text-sm sm:text-lg text-gray-900">Rs.{item.grossPrice.toFixed(2)}</div>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                                            >
                                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No items added yet</h3>
                            <p className="text-gray-500">Start by searching and adding items to your invoice</p>
                        </div>
                    )}
                </div>

                {/* Enhanced Payment Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 mb-8">
                    {/* Payment Summary */}
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-10 overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/10 to-green-400/10 rounded-full translate-y-12 -translate-x-12"></div>
                        
                        <div className="relative flex items-center space-x-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Summary</h2>
                                <p className="text-sm text-gray-600 font-medium">Review and adjust payment details</p>
                            </div>
                        </div>
                        
                        <div className="relative space-y-6">
                            <div className="flex justify-between items-center py-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl px-6 border border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-700 font-semibold text-base">Sub Total</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">Rs.{subTotal.toFixed(2)}</span>
                            </div>
                            
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <span>Extra Discount</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <input
                                        type="number"
                                        value={extraDiscount}
                                        onChange={(e) => setExtraDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                                        onFocus={(e) => { if (Number(e.target.value) === 0) setExtraDiscount(''); }}
                                        onBlur={(e) => { if (e.target.value === '') setExtraDiscount(0); }}
                                        placeholder="0.00"
                                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white hover:border-gray-300 text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center py-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl px-6 border border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-700 font-semibold text-base">Net Total</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">Rs.{netTotal.toFixed(2)}</span>
                            </div>
                            
                            <div>
                                <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                    <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <span>Cash Paid</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="number"
                                        value={cashPaid}
                                        onChange={(e) => setCashPaid(e.target.value === '' ? '' : Number(e.target.value))}
                                        onFocus={(e) => { if (Number(e.target.value) === 0) setCashPaid(''); }}
                                        onBlur={(e) => { if (e.target.value === '') setCashPaid(0); }}
                                        placeholder="0.00"
                                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white hover:border-gray-300 text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center py-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl px-6 border-2 border-green-200 shadow-lg">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${balance >= 0 ? 'bg-gradient-to-r from-green-100 to-emerald-100' : 'bg-gradient-to-r from-red-100 to-pink-100'}`}>
                                        <svg className={`w-4 h-4 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-800 font-bold text-lg">Balance</span>
                                </div>
                                <span className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Rs.{balance.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Credit & Card Payments */}
                    <div className="space-y-6 sm:space-y-8">
                        {/* Credit Payments */}
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-10 overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-14 translate-x-14"></div>
                            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-400/10 to-blue-400/10 rounded-full translate-y-10 -translate-x-10"></div>
                            
                            <div className="relative flex items-center space-x-4 mb-8">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Credit Payments</h2>
                                    <p className="text-sm text-gray-600 font-medium">Manage credit transactions and discounts</p>
                                </div>
                            </div>
                            
                            <div className="relative space-y-6">
                                <div>
                                    <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                        <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <span>Item Discount</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <input
                                            type="number"
                                            value={itemDiscount}
                                            onChange={(e) => setItemDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                                            onFocus={(e) => { if (Number(e.target.value) === 0) setItemDiscount(''); }}
                                            onBlur={(e) => { if (e.target.value === '') setItemDiscount(0); }}
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all bg-white hover:border-gray-300 text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v18a1 1 0 01-1 1H6a1 1 0 01-1-1V2a1 1 0 011-1h8v2z" />
                                                </svg>
                                            </div>
                                            <span>No of Items</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v18a1 1 0 01-1 1H6a1 1 0 01-1-1V2a1 1 0 011-1h8v2z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                value={noOfItems}
                                                readOnly
                                                className="w-full pl-12 pr-4 py-4 border-2 border-blue-200 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 text-base font-bold shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                            <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span>Total Items</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                value={totalOfItems}
                                                readOnly
                                                className="w-full pl-12 pr-4 py-4 border-2 border-indigo-200 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-900 text-base font-bold shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-3">
                                        <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <span>Credit Amount</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="number"
                                            value={creditAmount}
                                            onChange={(e) => setCreditAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                            onFocus={(e) => { if (Number(e.target.value) === 0) setCreditAmount(''); }}
                                            onBlur={(e) => { if (e.target.value === '') setCreditAmount(0); }}
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white hover:border-gray-300 text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md group-focus-within:shadow-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Card Payments */}
                        <div className="relative bg-gradient-to-br from-orange-400 via-red-400 to-pink-400 rounded-3xl shadow-2xl p-6 sm:p-10 text-white overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
                            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            
                            <div className="relative flex items-center space-x-4 mb-8">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h18v2H3V4zm0 4h18v8H3V8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white">Card Payments</h2>
                                    <p className="text-sm text-orange-100 font-medium">Process card transactions securely</p>
                                </div>
                            </div>
                            
                            <div className="relative space-y-6">
                                <div>
                                    <label className="flex items-center space-x-2 text-sm font-bold text-orange-100 mb-3">
                                        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <span>Card Number</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-orange-200 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={cardNo}
                                            onChange={(e) => setCardNo(e.target.value)}
                                            placeholder="Enter card number"
                                            className="w-full pl-12 pr-4 py-4 border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all bg-white/10 backdrop-blur-sm text-white placeholder-orange-200 text-base font-medium shadow-lg hover:shadow-xl group-focus-within:shadow-2xl"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="flex items-center space-x-2 text-sm font-bold text-orange-100 mb-3">
                                            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <span>Bank</span>
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-orange-200 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <select
                                                value={bank}
                                                onChange={(e) => setBank(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all bg-white/10 backdrop-blur-sm text-white text-base font-medium shadow-lg hover:shadow-xl group-focus-within:shadow-2xl"
                                            >
                                                <option value="" className="text-gray-900">Choose Bank...</option>
                                                <option value="commercial" className="text-gray-900">Commercial Bank</option>
                                                <option value="peoples" className="text-gray-900">People's Bank</option>
                                                <option value="sampath" className="text-gray-900">Sampath Bank</option>
                                                <option value="hatton" className="text-gray-900">Hatton National Bank</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="flex items-center space-x-2 text-sm font-bold text-orange-100 mb-3">
                                            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                            </div>
                                            <span>Card Type</span>
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-orange-200 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                            </div>
                                            <select
                                                value={cardType}
                                                onChange={(e) => setCardType(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all bg-white/10 backdrop-blur-sm text-white text-base font-medium shadow-lg hover:shadow-xl group-focus-within:shadow-2xl"
                                            >
                                                <option value="" className="text-gray-900">Choose Card...</option>
                                                <option value="visa" className="text-gray-900">Visa</option>
                                                <option value="mastercard" className="text-gray-900">Mastercard</option>
                                                <option value="amex" className="text-gray-900">American Express</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="flex items-center space-x-2 text-sm font-bold text-orange-100 mb-3">
                                        <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <span>Amount</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-orange-200 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <input
                                            type="number"
                                            value={cardAmount}
                                            onChange={(e) => setCardAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                            onFocus={(e) => { if (Number(e.target.value) === 0) setCardAmount(''); }}
                                            onBlur={(e) => { if (e.target.value === '') setCardAmount(0); }}
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-4 py-4 border-2 border-white/30 rounded-2xl focus:ring-4 focus:ring-white/20 focus:border-white/50 transition-all bg-white/10 backdrop-blur-sm text-white placeholder-orange-200 text-base font-medium shadow-lg hover:shadow-xl group-focus-within:shadow-2xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-10 overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-400/10 to-emerald-400/10 rounded-full -translate-y-20 translate-x-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-400/10 to-indigo-400/10 rounded-full translate-y-16 -translate-x-16"></div>
                    
                    <div className="relative flex flex-col sm:flex-row justify-center gap-6 sm:gap-8">
                        <button
                            type="submit"
                            onClick={handlePlaceInvoice}
                            disabled={invoiceLoading}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg group"
                        >
                            <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                                {invoiceLoading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white"></div>
                                ) : (
                                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                )}
                                <span>{invoiceLoading ? 'Processing...' : 'Place Invoice'}</span>
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={handlePrintInvoice}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-base sm:text-lg group"
                        >
                            <div className="flex items-center justify-center space-x-3 sm:space-x-4">
                                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                </div>
                                <span>Print Invoice</span>
                                <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
                            </div>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}