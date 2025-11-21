/*##################################################################################################################################################
####################################################################################################################################################
################################################################    LOGIC WRITTEN BY KAVIJA DULMITH    #############################################
###############################################################   FRONT-END WRITTEN BY SINETH DINSARA   ############################################ 
################################################################             02/09/2025                #############################################
####################################################################################################################################################
####################################################################################################################################################*/

'use client'
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import Link from 'next/link';
import Image from 'next/image';


const AddItems = () => {
  const [itemName, setItemName] = useState('');
  const [sinhalaName, setSinhalaName] = useState('');
  const [itemSubgroup, setItemSubgroup] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemGroup, setItemGroup] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purPrice, setPurPrice] = useState('0.00');
  const [markedPrice, setMarkedPrice] = useState('0.00');
  const [cashPrice, setCashPrice] = useState('0.00');
  const [creditPrice, setCreditPrice] = useState('0.00');
  const [wholesalePrice, setWholesalePrice] = useState('0.00');
  const [specialPrice, setSpecialPrice] = useState('0.00');
  const [groups, setGroups] = useState([]); // To keep the all groups ** We dont need this array anymore but I keep this for future references
  const [subGrps, setSubGrps] = useState([]); // To keep the all subgroups
  const [mainGrps, setMainGrps] = useState([]); // To keep the all main groups
  const [loading, setLoading] = useState(false);


  async function logout() {
    await fetch('./api/logout', { method: 'POST' })
    window.location.href = '/auth/Login'
  }
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!itemName || !quantity || !markedPrice || !cashPrice || !creditPrice) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const formEl = e.currentTarget;
      const formData = new FormData(formEl);

      const response = await fetch('/api/items', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Item Added!',
          text: `${itemName} has been successfully added to inventory`,
          confirmButtonColor: '#28a745',
          confirmButtonText: 'OK'
        });

        // Reset
        setItemName('');
        setSinhalaName('');
        setItemSubgroup('');
        setItemGroup('');
        setQuantity('');
        setMarkedPrice('0.00');
        setCashPrice('0.00');
        setCreditPrice('0.00');
        setWholesalePrice('0.00');
        setSpecialPrice('0.00');
        // refresh next item code
        try {
          const resultItemCode = await fetch('/api/items/itemCode');
          if (resultItemCode.ok) {
            const itemCodeData = await resultItemCode.json();
            setItemCode(itemCodeData);
          }
        } catch {}
        formEl.reset();
      } else {
        const { error, message } = await response.json().catch(() => ({ }));
        Swal.fire({
          icon: 'error',
          title: 'Insert Failed',
          text: error || message || 'Failed to insert item',
          confirmButtonColor: '#d33',
          confirmButtonText: 'OK'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Network Error',
        text: 'Unable to reach server. Please try again.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK'
      });
    }
  };
  
  useEffect(() => {

    const fetchData = async () => {
      try {
        setLoading(true);
        const resultsGroups = await fetch("/api/group");
        if (!resultsGroups.ok) throw new Error("Failed to fetch groups");
        const groupData = await resultsGroups.json();
        setGroups(Array.isArray(groupData) ? groupData : []);

        for (let i = 0; i < groupData.length; i++) {
          if (groupData[i].CateId === 'ITMSUBGR') {
            setSubGrps(prev => [...prev, groupData[i]]);
          } else if (groupData[i].CateId === 'ITEMGROU') {
            setMainGrps(prev => [...prev, groupData[i]]);
          }
        }

        const resultItemCode = await fetch("/api/items/itemCode");
        if (!resultItemCode.ok) throw new Error("Failed to fetch item code");
        const itemCodeData = await resultItemCode.json();
        setItemCode(itemCodeData);
        setLoading(false);
      } catch (err) {
        console.error("Fetch failed:", err);
      }
    };

    const delayDebounce = setTimeout(fetchData, 300);
    return () => clearTimeout(delayDebounce);

  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      <div className="relative max-w-7xl mx-auto p-4 sm:p-6">
      {/* Navigation Sidebar (disabled, using global Sidebar) */}
      <div className="hidden w-64 min-h-screen bg-gray-400 shadow-lg lg:rounded-r-2xl p-4 lg:p-6 order-2 lg:order-1">
          {/* Desktop Title - Hidden on mobile */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-2xl font-bold text-gray-800">GLOBAL POS</h1>
          </div>

          <nav className="flex lg:flex-col justify-center lg:justify-start space-x-4 lg:space-x-0 lg:space-y-4">
            <Link href="/" >
              <div className="flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h7v7H3V7zm11 0h7v7h-7V7zM3 16h7v5H3v-5zm11 0h7v5h-7v-5z" />
                </svg>
                <span className="text-sm lg:text-base text-gray-600 font-medium">Stock</span>
              </div>
            </Link>

            <Link href="/Reports/DailySummary" >
            <div
              className="flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6h6v6M9 7h6m4 12H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm lg:text-base text-gray-600">Reports</span>
            </div>
            </Link>
            
            <Link href="/Add">
              <div className="flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg bg-green-100 cursor-pointer">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm lg:text-base text-green-700">Add Items</span>
              </div>
            </Link>

            <div
              className=" bg-[#b23b3b] flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg hover:bg-[#8a0c03] cursor-pointer transition-colors"
              
              role="button"
              tabIndex={0}
              >
              <div className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500">
                <Image src="/logout.png" width={5} height={5} className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500" alt="logout"/>
              </div>
              <button className="text-sm lg:text-base text-white" onClick={logout}>Log Out</button>
            </div>


          </nav>
        </div>

        {/* Main */}
        <div className="flex-1 p-3 sm:p-6 lg:p-8 order-1 lg:order-2 min-h-[calc(100dvh-48px)] md:min-h-0 pb-20 md:pb-0">
          {/* Modern Form Card */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden text-[#000000]">
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full translate-y-12 -translate-x-12"></div>

            {/* Modern Header */}
            <div className="relative px-6 sm:px-10 py-6 sm:py-8 bg-white/60">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">Add New Item</h2>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">Please fill in all required fields to add the item</p>
                </div>
                <div className="ml-auto hidden sm:flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-200 shadow-sm">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">System Online</span>
                </div>
              </div>
            </div>

            {/* Modern Form */}
            <form onSubmit={handleSubmit} className="relative p-6 sm:p-10 space-y-10">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg inline-flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h7v7H3V7zm11 0h7v7h-7V7zM3 16h7v5H3v-5zm11 0h7v5h-7v-5z" />
                    </svg>
                  </span>
                  <span>General Item Information</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="flex text-sm font-bold text-gray-700 mb-2 items-center"> 
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="itmName"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="Enter item name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white hover:border-gray-300 text-sm shadow-sm hover:shadow-md"
                        required/>
                    </div>

                    <div>
                      <label className="flex text-sm font-bold text-gray-700 mb-2 items-center">
                        
                        Sinhala Name
                      </label>
                      <input
                        type="text"
                        name='sinName'
                        value={sinhalaName}
                        onChange={(e) => setSinhalaName(e.target.value)}
                        placeholder="සිංහල නම"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white hover:border-gray-300 text-sm shadow-sm hover:shadow-md"/>
                    </div>

                    <div>
                      <label className="flex text-sm font-bold text-gray-700 mb-2 items-center">
                        Item Subgroup
                      </label>
                      <select
                        value={itemSubgroup}
                        name='subGrp'
                        onChange={(e) => setItemSubgroup(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white hover:border-gray-300 text-sm shadow-sm hover:shadow-md">
                        {loading ? (
                          <option>Loading Sub Groups...</option>
                        ):(
                          subGrps.map((group) => (
                            <option key={group.SysId} value={group.SysId}>{group.GrpName}</option>
                        )))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="flex text-sm font-bold text-gray-700 mb-2 items-center">
                        Item Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name='itemCode'
                        defaultValue={itemCode}
                        placeholder="Enter item code"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white hover:border-gray-300 text-sm shadow-sm hover:shadow-md"
                        required
                        />
                    </div>

                    <div>
                      <label className="flex text-sm font-bold text-gray-700 mb-2 items-center">
                        Item Group <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={itemGroup}
                        name='mainGrp'
                        onChange={(e) => setItemGroup(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white hover:border-gray-300 text-sm shadow-sm hover:shadow-md"
                        required>
                        {loading ? (
                          <option>Loading Groups...</option>
                        ):(
                          mainGrps.map((group) => (
                            <option key={group.SysId} value={group.SysId}>{group.GrpName}</option>
                        )))}
                      </select>
                    </div>

                    <div>
                      <label className="flex text-sm font-bold text-gray-700 mb-2 items-center">  
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name='qty'
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        min="0"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white hover:border-gray-300 text-sm shadow-sm hover:shadow-md"
                        required/>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing*/}
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                  <span className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg inline-flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </span>
                  <span>Pricing Information</span>
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  <div>
                    <label className="flex text-sm font-bold text-gray-700 mb-2 items-center">  
                      Purchased Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={purPrice}
                      name='purchasePrice'
                      onChange={(e) => setPurPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white hover:border-gray-300 text-sm shadow-sm hover:shadow-md"
                      required/>
                  </div>

                  <div>
                    <label className="flex text-sm font-bold text-gray-700 mb-2 items-center">  
                      Marked Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={markedPrice}
                      name='markPrice'
                      onChange={(e) => setMarkedPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white hover:border-gray-300 text-sm shadow-sm hover:shadow-md"
                      required/>
                  </div>

                  <div>
                    <label className="flex text-sm font-bold text-gray-700 mb-2 items-center"> 
                      Cash Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name='cashPrice'
                      value={cashPrice}
                      onChange={(e) => setCashPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white hover:border-gray-300 text-sm shadow-sm hover:shadow-md"
                      required/>
                  </div>

                  <div>
                    <label className="flex text-sm font-bold text-gray-700 mb-2 items-center">
                      Credit Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name='creditPrice'
                      value={creditPrice}
                      onChange={(e) => setCreditPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white hover:border-gray-300 text-sm shadow-sm hover:shadow-md"
                      required/>
                  </div>

                  <div>
                    <label className="flex text-sm font-bold text-gray-700 mb-2 items-center">
                      Wholesale Price
                    </label>
                    <input
                      type="number"
                      name='wholePrice'
                      value={wholesalePrice}
                      onChange={(e) => setWholesalePrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white hover:border-gray-300 text-sm shadow-sm hover:shadow-md" />
                  </div>

                  <div>
                    <label className="flex text-sm font-bold text-gray-700 mb-2 items-center">
                      Special Price
                    </label>
                    <input
                      type="number"
                      name='specPrice'
                      value={specialPrice}
                      onChange={(e) => setSpecialPrice(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white hover:border-gray-300 text-sm shadow-sm hover:shadow-md"/>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setItemName('');
                    setSinhalaName('');
                    setItemSubgroup('');
                    setItemGroup('');
                    setQuantity('');
                    setMarkedPrice('0.00');
                    setCashPrice('0.00');
                    setCreditPrice('0.00');
                    setWholesalePrice('0.00');
                    setSpecialPrice('0.00');
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 sm:px-10 py-4 rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 cursor-pointer">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span>Clear</span>
                  </div>
                </button>
                
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white px-8 sm:px-10 py-4 rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 cursor-pointer">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span>Add Item</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Nav (disabled, using global Sidebar) */}
      <div className="hidden" />
    </div>
  );
};

export default AddItems;
