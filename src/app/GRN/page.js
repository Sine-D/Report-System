/*##################################################################################################################################################
####################################################################################################################################################
###########################################################         SINETH DINSARA           #######################################################
###########################################################           11/11/2025             #######################################################
####################################################################################################################################################
####################################################################################################################################################*/

'use client'

import { useMemo, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

export default function GRNPage() {
	const router = useRouter()
		const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), [])
	const [header, setHeader] = useState({
		invoiceNo: '',
		location: '',
		date: new Date().toISOString().slice(0, 10),
		supplier: '',
		staff: '',
		remark: '',
	})
	const [items, setItems] = useState([
		{ id: 1, itemCode: '', itemName: '', quantity: '', purchasedPrice: '' },
	])
	const [locations, setLocations] = useState([])
	const [suppliers, setSuppliers] = useState([])
	const [staffList, setStaffList] = useState([])
	const [allItems, setAllItems] = useState([]) // Store all items for dropdowns
	const [itemDropdowns, setItemDropdowns] = useState({}) // Track dropdown visibility per row
	const [showLocationDropdown, setShowLocationDropdown] = useState(false)
	const [showSupplierDropdown, setShowSupplierDropdown] = useState(false)
	const [showStaffDropdown, setShowStaffDropdown] = useState(false)

	// Fetch locations from database on component mount
	useEffect(() => {
		const fetchLocations = async () => {
			try {
				const response = await fetch('/api/location')
				if (!response.ok) {
					console.error('Failed to fetch locations:', response.status, response.statusText)
					setLocations([])
					return
				}
				const data = await response.json()
				console.log('Fetched locations data:', data)
				setLocations(Array.isArray(data) ? data : [])
			} catch (err) {
				console.error('Error fetching locations:', err)
				setLocations([])
			}
		}
		fetchLocations()
	}, [])

	// Fetch suppliers from database on component mount
	useEffect(() => {
		const fetchSuppliers = async () => {
			try {
				console.log('Fetching suppliers from /api/supplier...')
				const response = await fetch('/api/supplier')
				console.log('Supplier API response status:', response.status, response.statusText)
				
				if (!response.ok) {
					console.error('Failed to fetch suppliers:', response.status, response.statusText)
					const errorData = await response.json().catch(() => ({}))
					console.error('Error data:', errorData)
					setSuppliers([])
					return
				}
				
				const data = await response.json()
				console.log('Fetched suppliers data:', data)
				console.log('Suppliers count:', Array.isArray(data) ? data.length : 0)
				
				if (Array.isArray(data)) {
					setSuppliers(data)
					console.log('Suppliers state updated with', data.length, 'items')
				} else {
					console.warn('Suppliers data is not an array:', typeof data, data)
					setSuppliers([])
				}
			} catch (err) {
				console.error('Error fetching suppliers:', err)
				console.error('Error stack:', err.stack)
				setSuppliers([])
			}
		}
		fetchSuppliers()
	}, [])

	// Fetch staff from database on component mount
	useEffect(() => {
		const fetchStaff = async () => {
			try {
				console.log('Fetching staff from /api/staff...')
				const response = await fetch('/api/staff')
				console.log('Staff API response status:', response.status, response.statusText)
				
				if (!response.ok) {
					console.error('Failed to fetch staff:', response.status, response.statusText)
					const errorData = await response.json().catch(() => ({}))
					console.error('Error data:', errorData)
					setStaffList([])
					return
				}
				
				const data = await response.json()
				console.log('Fetched staff data:', data)
				console.log('Staff count:', Array.isArray(data) ? data.length : 0)
				
				if (Array.isArray(data)) {
					if (data.length > 0) {
						console.log('First staff item:', data[0])
						console.log('Staff item keys:', Object.keys(data[0]))
					}
					setStaffList(data)
					console.log('Staff state updated with', data.length, 'items')
				} else {
					console.warn('Staff data is not an array:', typeof data, data)
					setStaffList([])
				}
			} catch (err) {
				console.error('Error fetching staff:', err)
				console.error('Error stack:', err.stack)
				setStaffList([])
			}
		}
		fetchStaff()
	}, [])

	// Fetch all items from database on component mount
	useEffect(() => {
		const fetchAllItems = async () => {
			try {
				console.log('Fetching all items from /api/items...')
				const response = await fetch('/api/items')
				if (!response.ok) {
					console.error('Failed to fetch items:', response.status, response.statusText)
					setAllItems([])
					return
				}
				const data = await response.json()
				console.log('Fetched items data:', data.length, 'items')
				setAllItems(Array.isArray(data) ? data : [])
			} catch (err) {
				console.error('Error fetching items:', err)
				setAllItems([])
			}
		}
		fetchAllItems()
	}, [])

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!event.target.closest('.item-dropdown-container')) {
				setItemDropdowns({})
			}
			if (!event.target.closest('.custom-dropdown-container')) {
				setShowLocationDropdown(false)
				setShowSupplierDropdown(false)
				setShowStaffDropdown(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('touchstart', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('touchstart', handleClickOutside)
		}
	}, [])

	const handleHeaderChange = (event) => {
		const { name, value } = event.target
		// Prevent future dates for date field
		if (name === 'date') {
			const clamped = value && value > todayStr ? todayStr : value
			setHeader((prev) => ({ ...prev, [name]: clamped }))
			return
		}
		setHeader((prev) => ({ ...prev, [name]: value }))
	}

	const handleLocationSelect = (locId) => {
		setHeader((prev) => ({ ...prev, location: locId }))
		setShowLocationDropdown(false)
	}

	const handleSupplierSelect = (supId) => {
		setHeader((prev) => ({ ...prev, supplier: supId }))
		setShowSupplierDropdown(false)
	}

	const handleStaffSelect = (staffId) => {
		setHeader((prev) => ({ ...prev, staff: staffId }))
		setShowStaffDropdown(false)
	}

	const getLocationName = (locId) => {
		if (!locId) return ''
		const loc = locations.find((l) => (l.LocId || '') === locId)
		return loc ? (loc.LocName || loc.LocDiscrip || loc.LocId || '') : ''
	}

	const getSupplierName = (supId) => {
		if (!supId) return ''
		const sup = suppliers.find((s) => (s.SysID || s.SuppCode || '') === supId)
		return sup ? (sup.SuppName || sup.SuppCode || sup.SysID || '') : ''
	}

	const getStaffName = (staffId) => {
		if (!staffId) return ''
		const staff = staffList.find((s) => (s.SysId || s.StaffCode || '') === staffId)
		return staff ? (staff.StaffName || staff.StaffCode || staff.SysId || '') : ''
	}

	const handleItemChange = (id, field, value) => {
		setItems((prev) =>
			prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
		)
		// Show dropdown when typing in item code or item name
		if (field === 'itemCode' || field === 'itemName') {
			setItemDropdowns((prev) => ({ ...prev, [`${id}-${field}`]: true }))
		}
	}

	// Handle item selection from dropdown
	const handleItemSelect = (id, item) => {
		setItems((prev) =>
			prev.map((row) =>
				row.id === id
					? {
							...row,
							itemCode: item.SysID || item.ItemCode || '',
							itemName: item.ItemName || '',
							purchasedPrice: item.PurPrice || item.PurchasedPrice || row.purchasedPrice,
						}
					: row,
			),
		)
		// Close all dropdowns for this row
		setItemDropdowns((prev) => {
			const newState = { ...prev }
			Object.keys(newState).forEach((key) => {
				if (key.startsWith(`${id}-`)) {
					delete newState[key]
				}
			})
			return newState
		})
	}

	// Filter items based on search - show FULL dataset from item master (scrollable dropdown)
	const getFilteredItems = (id, field, searchValue) => {
		// When no search provided, show the complete item list
		if (!searchValue) return allItems

		const search = String(searchValue).toLowerCase()
		return allItems.filter((item) => {
			if (field === 'itemCode') {
				return (
					(item.SysID && String(item.SysID).toLowerCase().includes(search)) ||
					(item.ItemCode && String(item.ItemCode).toLowerCase().includes(search))
				)
			}
			return item.ItemName && String(item.ItemName).toLowerCase().includes(search)
		})
	}

	const addRow = () => {
		const nextId = (items[items.length - 1]?.id || 0) + 1
		setItems((prev) => [
			...prev,
			{ id: nextId, itemCode: '', itemName: '', quantity: '', purchasedPrice: '' },
		])
	}

	const removeRow = (id) => {
		setItems((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev))
	}

	const rowTotal = (row) => {
		const qty = Number(row.quantity) || 0
		const price = Number(row.purchasedPrice) || 0
		return qty * price
	}

	const { grossTotal, totalQuantity, filledItemCount } = useMemo(() => {
		const totals = items.reduce(
			(acc, row) => {
				const qty = Number(row.quantity) || 0
				const total = rowTotal(row)
				return {
					grossTotal: acc.grossTotal + total,
					totalQuantity: acc.totalQuantity + qty,
					filledItemCount:
						acc.filledItemCount + (row.itemCode || row.itemName || qty || total ? 1 : 0),
				}
			},
			{ grossTotal: 0, totalQuantity: 0, filledItemCount: 0 },
		)
		return totals
	}, [items])

	const clearAll = () => {
		setHeader({
			invoiceNo: '',
			location: '',
			date: new Date().toISOString().slice(0, 10),
			supplier: '',
			staff: '',
			remark: '',
		})
		setItems([{ id: 1, itemCode: '', itemName: '', quantity: '', purchasedPrice: '' }])
	}

	const onSave = async () => {
		try {
			// Basic validation
		if (!header.location) {
			await Swal.fire({
				icon: 'warning',
				title: 'Location required',
				text: 'Please select a location before saving the GRN.',
				confirmButtonColor: '#10b981',
			})
			return
		}
		if (!header.supplier) {
			await Swal.fire({
				icon: 'warning',
				title: 'Supplier required',
				text: 'Please select a supplier before saving the GRN.',
				confirmButtonColor: '#10b981',
			})
			return
		}
			const validItems = items.filter(
				(r) => (r.itemCode || r.itemName) && Number(r.quantity) > 0 && Number(r.purchasedPrice) >= 0,
			)
		if (validItems.length === 0) {
			await Swal.fire({
				icon: 'warning',
				title: 'No items to save',
				text: 'Add at least one item with quantity greater than zero.',
				confirmButtonColor: '#10b981',
			})
			return
		}
			const response = await fetch('/api/grn', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					header,
					items: validItems,
				}),
			})
			const data = await response.json()
		if (!response.ok) {
			throw new Error(data?.error || 'Failed to save GRN')
		}
		await Swal.fire({
			icon: 'success',
			title: 'GRN saved successfully',
			text: data?.grnNo ? `GRN No: ${data.grnNo}` : 'Your GRN has been stored.',
			confirmButtonColor: '#10b981',
		})
		clearAll()
	} catch (err) {
		console.error('Save GRN failed:', err)
		await Swal.fire({
			icon: 'error',
			title: 'Save failed',
			text: err?.message || 'Unable to save the GRN right now. Please try again.',
			confirmButtonColor: '#ef4444',
		})
	}
	}

	const formatCurrency = (value) =>
		`Rs. ${(Number(value) || 0).toLocaleString('en-LK', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`

	return (
		<div className="px-4 py-6 md:px-6 lg:px-10">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Hero Header */}
				<section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500 text-white shadow-xl">
					<div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.45),_transparent_55%)]" />
					<div className="relative px-6 py-8 sm:px-10 sm:py-10">
						<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
							<div className="flex items-start gap-5">
								<div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-lg ring-1 ring-white/20">
									<svg
										className="w-8 h-8 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M3 7h18M5 11h14M9 15h6M10 19h4"
										/>
									</svg>
								</div>
								<div className="space-y-2">
									<p className="text-sm uppercase tracking-[0.35em] font-semibold text-white/80">
										Good Received Note
									</p>
									<h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
										New GRN Entry
									</h1>
									<p className="text-sm sm:text-base text-white/85 max-w-2xl">
										Capture supplier deliveries with clean, organized controls. Match the
										visual language of invoices while keeping the focus on inventory accuracy.
									</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4 sm:gap-5 min-w-[220px]">
								<div className="rounded-2xl bg-white/15 backdrop-blur-lg p-4 shadow-lg ring-1 ring-white/20">
									<p className="text-xs uppercase tracking-wide text-white/70 font-medium">
										Gross Total
									</p>
									<p className="text-lg sm:text-xl font-semibold">
										{formatCurrency(grossTotal)}
									</p>
								</div>
								<div className="rounded-2xl bg-white/15 backdrop-blur-lg p-4 shadow-lg ring-1 ring-white/20">
									<p className="text-xs uppercase tracking-wide text-white/70 font-medium">
										Items Added
									</p>
									<p className="text-lg sm:text-xl font-semibold">
										{filledItemCount || 0}
									</p>
								</div>
								<div className="rounded-2xl bg-white/15 backdrop-blur-lg p-4 shadow-lg ring-1 ring-white/20">
									<p className="text-xs uppercase tracking-wide text-white/70 font-medium">
										Quantity
									</p>
									<p className="text-lg sm:text-xl font-semibold">
										{totalQuantity || 0}
									</p>
								</div>
								<div className="rounded-2xl bg-white/15 backdrop-blur-lg p-4 shadow-lg ring-1 ring-white/20">
									<p className="text-xs uppercase tracking-wide text-white/70 font-medium">
										Status
									</p>
									<p className="text-lg sm:text-xl font-semibold">Draft</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Supplier + Document Details */}
				<section className="rounded-3xl bg-white border border-emerald-100 shadow-[0_25px_60px_-35px_rgba(16,185,129,0.55)]">
					<div className="px-6 py-6 sm:px-8 sm:py-8 space-y-6">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M9 17v2m6-2v2m-7 0h8m-4-6l4-8H8l4 8zm0 0v6"
										/>
									</svg>
								</div>
								<div>
									<h2 className="text-xl font-semibold text-gray-900">Receipt Details</h2>
									<p className="text-sm text-gray-500 font-medium">
										Aligns with invoice styling for a seamless workflow.
									</p>
								</div>
							</div>
							
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							{[
								{
									label: 'Invoice No',
									name: 'invoiceNo',
									placeholder: 'GRN-0001',
									icon: (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									),
									type: 'text',
								},
								{
									label: 'Location',
									name: 'location',
									placeholder: 'Main Warehouse',
									icon: (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M17.657 16.657L13.414 20.9a1.995 1.995 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
										/>
									),
									type: 'text',
								},
								{
									label: 'Date',
									name: 'date',
									placeholder: '',
									icon: (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M8 7V3m8 4V3m-9 8h10m-9 4h4m5-11h1a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h1"
										/>
									),
									type: 'date',
								},
								{
									label: 'Supplier',
									name: 'supplier',
									placeholder: 'Supplier Name',
									icon: (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M16 14a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0A4 4 0 016 14m10-5a4 4 0 10-8 0 4 4 0 008 0z"
										/>
									),
									type: 'text',
								},
								{
									label: 'Staff',
									name: 'staff',
									placeholder: 'Handled By',
									icon: (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M16 11V7a4 4 0 10-8 0v4m-4 4h16M5 15v2a3 3 0 003 3h8a3 3 0 003-3v-2"
										/>
									),
									type: 'text',
								},
								{
									label: 'Remark',
									name: 'remark',
									placeholder: 'Internal note',
									icon: (
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 20h9"
										/>
									),
									type: 'text',
								},
							].map(({ label, name, placeholder, icon, type }) => (
								<div key={name} className="space-y-3">
									<label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
										<span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md">
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												{icon}
											</svg>
										</span>
										{label}
									</label>
									<div className="relative group custom-dropdown-container">
										{name === 'location' ? (
											<>
												<button
													type="button"
													onClick={() => {
														setShowLocationDropdown(!showLocationDropdown)
														setShowSupplierDropdown(false)
														setShowStaffDropdown(false)
													}}
													className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition duration-200 text-gray-900 shadow-sm hover:shadow group-hover:border-emerald-200 flex items-center justify-between text-left"
												>
													<div className="flex items-center gap-3 flex-1 min-w-0">
														<svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.995 1.995 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
														</svg>
														<span className={header[name] ? 'text-gray-900' : 'text-gray-400'}>
															{header[name] ? getLocationName(header[name]) : 'Select Location'}
														</span>
													</div>
													<svg className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
													</svg>
												</button>
												{showLocationDropdown && (
													<div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
														{locations.map((loc) => {
															const locId = loc.LocId || '';
															const locName = loc.LocName || loc.LocDiscrip || loc.LocId || 'Unknown';
															return (
																<button
																	key={locId}
																	type="button"
																	onClick={() => handleLocationSelect(locId)}
																	className="w-full px-4 py-3 text-left hover:bg-emerald-50 active:bg-emerald-100 transition-colors border-b border-gray-100 last:border-b-0 text-gray-900"
																>
																	{locName}
																</button>
															);
														})}
													</div>
												)}
											</>
										) : name === 'supplier' ? (
											<>
												<button
													type="button"
													onClick={() => {
														setShowSupplierDropdown(!showSupplierDropdown)
														setShowLocationDropdown(false)
														setShowStaffDropdown(false)
													}}
													className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition duration-200 text-gray-900 shadow-sm hover:shadow group-hover:border-emerald-200 flex items-center justify-between text-left"
												>
													<div className="flex items-center gap-3 flex-1 min-w-0">
														<svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 14a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0A4 4 0 016 14m10-5a4 4 0 10-8 0 4 4 0 008 0z" />
														</svg>
														<span className={header[name] ? 'text-gray-900' : 'text-gray-400'}>
															{header[name] ? getSupplierName(header[name]) : 'Select Supplier'}
														</span>
													</div>
													<svg className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
													</svg>
												</button>
												{showSupplierDropdown && (
													<div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
														{suppliers && suppliers.length > 0 ? (
															suppliers.map((sup, index) => {
																const supId = sup.SysID || sup.SuppCode || `supplier-${index}`;
																const supName = sup.SuppName || sup.SuppCode || sup.SysID || 'Unknown';
																return (
																	<button
																		key={supId}
																		type="button"
																		onClick={() => handleSupplierSelect(supId)}
																		className="w-full px-4 py-3 text-left hover:bg-emerald-50 active:bg-emerald-100 transition-colors border-b border-gray-100 last:border-b-0 text-gray-900"
																	>
																		{supName}
																	</button>
																);
															})
														) : (
															<div className="px-4 py-3 text-gray-500 text-sm">No suppliers available</div>
														)}
													</div>
												)}
											</>
										) : name === 'staff' ? (
											<>
												<button
													type="button"
													onClick={() => {
														setShowStaffDropdown(!showStaffDropdown)
														setShowLocationDropdown(false)
														setShowSupplierDropdown(false)
													}}
													className="w-full px-4 py-3.5 rounded-2xl border-2 border-orange-200 bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-400/20 transition duration-200 text-gray-900 shadow-sm hover:shadow group-hover:border-orange-300 flex items-center justify-between text-left"
												>
													<div className="flex items-center gap-3 flex-1 min-w-0">
														<svg className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 10-8 0v4m-4 4h16M5 15v2a3 3 0 003 3h8a3 3 0 003-3v-2" />
														</svg>
														<span className={header[name] ? 'text-gray-900' : 'text-gray-400'}>
															{header[name] ? getStaffName(header[name]) : 'Select Staff'}
														</span>
													</div>
													<svg className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
													</svg>
												</button>
												{showStaffDropdown && (
													<div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-64 overflow-y-auto">
														{staffList && staffList.length > 0 ? (
															staffList.map((staff, index) => {
																const staffId = staff.SysId || staff.StaffCode || `staff-${index}`;
																const staffName = staff.StaffName || staff.StaffCode || staff.SysId || 'Unknown';
																return (
																	<button
																		key={staffId}
																		type="button"
																		onClick={() => handleStaffSelect(staffId)}
																		className="w-full px-4 py-3 text-left hover:bg-orange-50 active:bg-orange-100 transition-colors border-b border-gray-100 last:border-b-0 text-gray-900"
																	>
																		{staffName}
																	</button>
																);
															})
														) : (
															<div className="px-4 py-3 text-gray-500 text-sm">No staff available</div>
														)}
													</div>
												)}
											</>
										) : (
											<input
												type={type}
												name={name}
												value={header[name]}
												onChange={handleHeaderChange}
												placeholder={placeholder}
												max={name === 'date' ? todayStr : undefined}
												className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 bg-gray-50/60 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition duration-200 text-gray-900 shadow-sm hover:shadow group-hover:border-emerald-200"
											/>
										)}
										
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Item Ledger */}
				<section className="rounded-3xl bg-white border border-gray-100 shadow-[0_18px_50px_-30px_rgba(30,64,175,0.45)] overflow-hidden">
					<div className="relative px-6 py-6 sm:px-10 sm:py-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 border-b border-gray-100">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
							<div className="flex items-start gap-4">
								<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
										/>
									</svg>
								</div>
								<div className="space-y-1">
									<p className="text-xs uppercase tracking-[0.25em] font-semibold text-gray-500">
										Item Ledger
									</p>
									<h3 className="text-xl sm:text-2xl font-bold text-gray-900">Add Items to GRN</h3>
									<p className="text-sm sm:text-base text-gray-600 font-medium max-w-xl">
										Search and capture received stock lines with the same polished experience as invoices.
									</p>
								</div>
							</div>
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-4">
								<div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm">
									<svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M7 8h10M7 12h6M7 16h10"
										/>
									</svg>
									<span>{items.length} {items.length === 1 ? 'line' : 'lines'}</span>
								</div>
								<div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 shadow-sm">
									<svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M3 3v18h18M7 13l4 4L21 7"
										/>
									</svg>
									<span>{totalQuantity || 0} qty</span>
								</div>
								<button
									type="button"
									onClick={addRow}
									className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-transform hover:-translate-y-0.5"
								>
									<span className="text-lg leading-none">＋</span>
									Add Item Row
								</button>
							</div>
						</div>
					</div>

					<div className="hidden md:block">
						<div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
							<table className="min-w-full divide-y divide-gray-100">
								<thead>
									<tr className="bg-gray-50 text-sm uppercase tracking-wide text-gray-500">
										<th className="px-4 sm:px-6 py-4 text-left font-semibold">Item Code</th>
										<th className="px-4 sm:px-6 py-4 text-left font-semibold">Item Name</th>
										<th className="px-4 sm:px-6 py-4 text-right font-semibold">Quantity</th>
										<th className="px-4 sm:px-6 py-4 text-right font-semibold">Purchased Price</th>
										<th className="px-4 sm:px-6 py-4 text-right font-semibold">Total Price</th>
										<th className="px-4 sm:px-6 py-4 text-right font-semibold" />
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{items.map((row) => (
										<tr key={row.id} className="group hover:bg-emerald-50/40 transition">
											<td className="px-4 sm:px-6 py-3.5 align-top">
												<div className="flex flex-col gap-1 item-dropdown-container relative">
													<div className="relative group">
														<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
															<svg className="h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
															</svg>
														</div>
														<input
															type="text"
															value={row.itemCode}
															onChange={(event) =>
																handleItemChange(row.id, 'itemCode', event.target.value)
															}
															onFocus={() => setItemDropdowns((prev) => ({ ...prev, [`${row.id}-itemCode`]: true }))}
															placeholder="Enter item code"
															className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all hover:border-gray-300 shadow-sm hover:shadow-md"
														/>
													</div>
													{itemDropdowns[`${row.id}-itemCode`] && getFilteredItems(row.id, 'itemCode', row.itemCode).length > 0 && (
														<div className="absolute z-50 w-full sm:w-auto sm:min-w-full mt-2 left-0 right-0 sm:right-auto bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-[280px] sm:max-h-64 overflow-y-auto overscroll-contain">
															{getFilteredItems(row.id, 'itemCode', row.itemCode).map((item, index) => (
																<div
																	key={item.SysID}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleItemSelect(row.id, item);
																	}}
																	onTouchStart={(e) => {
																		e.currentTarget.classList.add('active:bg-emerald-100');
																	}}
																	className="px-4 sm:px-6 py-3 sm:py-4 active:bg-emerald-50 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all hover:shadow-sm group touch-manipulation"
																	style={{ animationDelay: `${index * 30}ms` }}
																>
																	<div className="flex items-center space-x-3 sm:space-x-4">
																		<div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:from-emerald-600 group-hover:to-teal-700 transition-colors shadow-md flex-shrink-0">
																			<span className="text-white font-bold text-xs sm:text-sm">{(item.SysID || item.ItemCode || '').slice(-2)}</span>
																		</div>
																		<div className="flex-1 min-w-0">
																			<div className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-emerald-900 transition-colors mb-0.5 sm:mb-1 truncate">{item.SysID || item.ItemCode}</div>
																			<div className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors mb-1.5 sm:mb-2 line-clamp-1">{item.ItemName}</div>
																			<div className="flex flex-wrap items-center gap-x-3 sm:gap-x-5 gap-y-1 text-xs text-gray-500">
																				<span className="flex items-center space-x-1 sm:space-x-1.5">
																					<svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
																					</svg>
																					<span className="font-medium">Stock: {item.GoodQty || item.AvlQty || 0}</span>
																				</span>
																				<span className="flex items-center space-x-1 sm:space-x-1.5">
																					<svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
																					</svg>
																					<span className="font-medium">Rs.{item.PurPrice || item.PurchasedPrice || 0}</span>
																				</span>
																			</div>
																		</div>
																	</div>
																</div>
															))}
														</div>
													)}
												</div>
											</td>
											<td className="px-4 sm:px-6 py-3.5">
												<div className="item-dropdown-container relative">
													<div className="relative group">
														<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
															<svg className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
															</svg>
														</div>
														<input
															type="text"
															value={row.itemName}
															onChange={(event) =>
																handleItemChange(row.id, 'itemName', event.target.value)
															}
															onFocus={() => setItemDropdowns((prev) => ({ ...prev, [`${row.id}-itemName`]: true }))}
															placeholder="Enter item name"
															className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/20 transition-all hover:border-gray-300 shadow-sm hover:shadow-md"
														/>
													</div>
													{itemDropdowns[`${row.id}-itemName`] && getFilteredItems(row.id, 'itemName', row.itemName).length > 0 && (
														<div className="absolute z-50 w-full sm:w-auto sm:min-w-full mt-2 left-0 right-0 sm:right-auto bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-[280px] sm:max-h-64 overflow-y-auto overscroll-contain">
															{getFilteredItems(row.id, 'itemName', row.itemName).map((item, index) => (
																<div
																	key={item.SysID}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleItemSelect(row.id, item);
																	}}
																	onTouchStart={(e) => {
																		e.currentTarget.classList.add('active:bg-purple-100');
																	}}
																	className="px-4 sm:px-6 py-3 sm:py-4 active:bg-purple-50 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all hover:shadow-sm group touch-manipulation"
																	style={{ animationDelay: `${index * 30}ms` }}
																>
																	<div className="flex items-center space-x-3 sm:space-x-4">
																		<div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:from-purple-600 group-hover:to-pink-700 transition-colors shadow-md flex-shrink-0">
																			<span className="text-white font-bold text-xs sm:text-sm">{(item.ItemName || '').slice(0, 2).toUpperCase()}</span>
																		</div>
																		<div className="flex-1 min-w-0">
																			<div className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-purple-900 transition-colors mb-0.5 sm:mb-1 line-clamp-2">{item.ItemName}</div>
																			<div className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-700 transition-colors mb-1.5 sm:mb-2">Code: {item.SysID || item.ItemCode}</div>
																			<div className="flex flex-wrap items-center gap-x-3 sm:gap-x-5 gap-y-1 text-xs text-gray-500">
																				<span className="flex items-center space-x-1 sm:space-x-1.5">
																					<svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
																					</svg>
																					<span className="font-medium">Stock: {item.GoodQty || item.AvlQty || 0}</span>
																				</span>
																				<span className="flex items-center space-x-1 sm:space-x-1.5">
																					<svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
																					</svg>
																					<span className="font-medium">Rs.{item.PurPrice || item.PurchasedPrice || 0}</span>
																				</span>
																			</div>
																		</div>
																	</div>
																</div>
															))}
														</div>
													)}
												</div>
											</td>
											<td className="px-4 sm:px-6 py-3.5">
												<input
													type="number"
													min="0"
													value={row.quantity}
													onChange={(event) =>
														handleItemChange(row.id, 'quantity', event.target.value)
													}
													placeholder="0"
													className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-right text-gray-900 placeholder:text-gray-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition"
												/>
											</td>
											<td className="px-4 sm:px-6 py-3.5">
												<input
													type="number"
													min="0"
													step="0.01"
													value={row.purchasedPrice}
													onChange={(event) =>
														handleItemChange(row.id, 'purchasedPrice', event.target.value)
													}
													placeholder="0.00"
													className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-right text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition"
												/>
											</td>
											<td className="px-4 sm:px-6 py-3.5">
												<div className="text-right text-sm font-semibold text-gray-900">
													{formatCurrency(rowTotal(row))}
												</div>
											</td>
											<td className="px-4 sm:px-6 py-3.5 text-right">
												<button
													type="button"
													onClick={() => removeRow(row.id)}
													className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
														items.length > 1
															? 'border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300'
															: 'border-gray-200 text-gray-300 cursor-not-allowed'
													}`}
													disabled={items.length <= 1}
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="2"
															d="M18 12H6"
														/>
													</svg>
													Remove
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					<div className="md:hidden px-5 py-6 space-y-5 bg-white">
						{items.map((row, index) => (
							<div key={row.id} className="rounded-2xl border border-gray-100 bg-gray-50/80 backdrop-blur-sm p-4 shadow-sm">
								<div className="flex items-center justify-between gap-3">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow">
											<span className="text-sm font-semibold">#{index + 1}</span>
										</div>
										<div>
											<p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">GRN Line</p>
											<p className="text-sm font-semibold text-gray-900">{row.itemName || 'Pending details'}</p>
										</div>
									</div>
									<button
										type="button"
										onClick={() => removeRow(row.id)}
										className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition ${
											items.length > 1
												? 'border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300'
												: 'border-gray-200 text-gray-300 cursor-not-allowed'
										}`}
										disabled={items.length <= 1}
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12H6" />
										</svg>
									</button>
								</div>

								<div className="mt-5">
									<div className="overflow-x-auto overflow-y-visible -mx-4 px-1 pb-2 scrollbar-thin scrollbar-thumb-gray-300/70 scrollbar-track-transparent">
										<div className="flex gap-4 min-w-[720px]">
											<div className="flex-1 min-w-[170px]">
												<label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
													<div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
														<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
														</svg>
													</div>
													Item Code
												</label>
												<div className="item-dropdown-container relative group">
													<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
														<svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
														</svg>
													</div>
													<input
														type="text"
														value={row.itemCode}
														onChange={(event) => handleItemChange(row.id, 'itemCode', event.target.value)}
														onFocus={() => setItemDropdowns((prev) => ({ ...prev, [`${row.id}-itemCode`]: true }))}
														placeholder="Enter item code"
														className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all bg-white text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md"
													/>
													{itemDropdowns[`${row.id}-itemCode`] && getFilteredItems(row.id, 'itemCode', row.itemCode).length > 0 && (
														<div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
															{getFilteredItems(row.id, 'itemCode', row.itemCode).map((item, index) => (
																<div
																	key={item.SysID}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleItemSelect(row.id, item);
																	}}
																	className="px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all"
																	style={{ animationDelay: `${index * 40}ms` }}
																>
																	<div className="flex items-start gap-3">
																		<div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
																			<span className="text-blue-600 font-bold text-xs">{(item.SysID || item.ItemCode || '').slice(-2)}</span>
																		</div>
																		<div className="flex-1">
																			<p className="font-semibold text-gray-900">{item.SysID || item.ItemCode}</p>
																			<p className="text-xs text-gray-600 mt-0.5">{item.ItemName}</p>
																			<div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 mt-1">
																				<span>Stock: {item.GoodQty || item.AvlQty || 0}</span>
																				<span>Rs.{item.PurPrice || item.PurchasedPrice || 0}</span>
																			</div>
																		</div>
																	</div>
																</div>
															))}
														</div>
													)}
												</div>
											</div>

											<div className="flex-1 min-w-[190px]">
												<label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
													<div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
														<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
														</svg>
													</div>
													Item Name
												</label>
												<div className="item-dropdown-container relative group">
													<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
														<svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
														</svg>
													</div>
													<input
														type="text"
														value={row.itemName}
														onChange={(event) => handleItemChange(row.id, 'itemName', event.target.value)}
														onFocus={() => setItemDropdowns((prev) => ({ ...prev, [`${row.id}-itemName`]: true }))}
														placeholder="Enter item name"
														className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all bg-white text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md"
													/>
													{itemDropdowns[`${row.id}-itemName`] && getFilteredItems(row.id, 'itemName', row.itemName).length > 0 && (
														<div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-2xl max-h-60 overflow-y-auto">
															{getFilteredItems(row.id, 'itemName', row.itemName).map((item, index) => (
																<div
																	key={item.SysID}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleItemSelect(row.id, item);
																	}}
																	className="px-5 py-4 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all"
																	style={{ animationDelay: `${index * 40}ms` }}
																>
																	<div className="flex items-start gap-3">
																		<div className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
																			<span className="text-purple-600 font-bold text-xs">{(item.ItemName || '').slice(0, 2).toUpperCase()}</span>
																		</div>
																		<div className="flex-1">
																			<p className="font-semibold text-gray-900">{item.ItemName}</p>
																			<p className="text-xs text-gray-600 mt-0.5">Code: {item.SysID || item.ItemCode}</p>
																			<div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 mt-1">
																				<span>Stock: {item.GoodQty || item.AvlQty || 0}</span>
																				<span>Rs.{item.PurPrice || item.PurchasedPrice || 0}</span>
																			</div>
																		</div>
																	</div>
																</div>
															))}
														</div>
													)}
												</div>
											</div>

											<div className="w-[150px] flex-shrink-0">
												<label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
													<div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg flex items-center justify-center text-white">
														<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v18a1 1 0 01-1 1H6a1 1 0 01-1-1V2a1 1 0 011-1h8v2z" />
														</svg>
													</div>
													Quantity
												</label>
												<div className="relative group">
													<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
														<svg className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011 1v18a1 1 0 01-1 1H6a1 1 0 01-1-1V2a1 1 0 011-1h8v2z" />
														</svg>
													</div>
													<input
														type="number"
														min="0"
														value={row.quantity}
														onChange={(event) => handleItemChange(row.id, 'quantity', event.target.value)}
														placeholder="0"
														className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all bg-white text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md"
													/>
												</div>
											</div>

											<div className="w-[170px] flex-shrink-0">
												<label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
													<div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
														<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
														</svg>
													</div>
													Purchased Price
												</label>
												<div className="relative group">
													<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
														<svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
														</svg>
													</div>
													<input
														type="number"
														min="0"
														step="0.01"
														value={row.purchasedPrice}
														onChange={(event) => handleItemChange(row.id, 'purchasedPrice', event.target.value)}
														placeholder="0.00"
														className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all bg-white text-gray-900 placeholder-gray-500 text-base font-medium shadow-sm hover:shadow-md"
													/>
												</div>
											</div>

											<div className="w-[180px] flex-shrink-0">
												<label className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-2">
													<div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white">
														<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13L9 5m3 3l3-3" />
														</svg>
													</div>
													Line Total
												</label>
												<div className="flex h-full items-center justify-between bg-white border border-emerald-100 rounded-2xl px-4 py-3 shadow-sm">
													<div>
														<p className="text-xs uppercase text-emerald-500 font-semibold tracking-wide">Amount</p>
														<p className="text-base font-bold text-emerald-600">{formatCurrency(rowTotal(row))}</p>
													</div>
													<div className="text-[11px] text-gray-500 text-right">
														<p>Qty {row.quantity || 0}</p>
														<p>Rs.{Number(row.purchasedPrice || 0).toFixed(2)}</p>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					<div className="px-6 py-5 bg-gradient-to-r from-white via-white to-gray-50 border-t border-gray-100 mt-6 md:mt-12">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 shadow-sm flex items-center justify-between">
								<div>
									<p className="text-xs uppercase text-emerald-600 font-semibold tracking-wide">
										Gross Total
									</p>
									<p className="text-xl font-semibold text-emerald-700">
										{formatCurrency(grossTotal)}
									</p>
								</div>
								<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
										/>
									</svg>
								</div>
							</div>
							<div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 shadow-sm flex items-center justify-between">
								<div>
									<p className="text-xs uppercase text-blue-600 font-semibold tracking-wide">
										Total Quantity
									</p>
									<p className="text-xl font-semibold text-blue-700">{totalQuantity || 0}</p>
								</div>
								<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M3 3v18h18M7 13l4 4L21 7"
										/>
									</svg>
								</div>
							</div>
							<div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 shadow-sm flex items-center justify-between">
								<div>
									<p className="text-xs uppercase text-indigo-600 font-semibold tracking-wide">
										Lines Entered
									</p>
									<p className="text-xl font-semibold text-indigo-700">{items.length}</p>
								</div>
								<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow">
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M7 8h10M7 12h4m-4 4h10"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* CTA Buttons */}
				<section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
					<div className="flex flex-wrap items-center gap-3">
						
						
					</div>
					<div className="flex flex-col sm:flex-row gap-3">
						<button
							type="button"
							onClick={onSave}
							className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-transform hover:-translate-y-0.5"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M5 13l4 4L19 7"
								/>
							</svg>
							Save GRN
						</button>
						<button
							type="button"
							onClick={clearAll}
							className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							Clear All
						</button>
						
					</div>
				</section>
			</div>
		</div>
	)
}



