import re

file_path = '/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/admin/GenerateQrs.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Import Truck
if 'Truck' not in content:
    content = content.replace("ShieldCheck, Info } from 'lucide-react';", "ShieldCheck, Info, Truck } from 'lucide-react';")

# 2. Add supplyChain state
if 'const [supplyChain, setSupplyChain]' not in content:
    state_to_add = """  // Supply Chain fields
  const [supplyChain, setSupplyChain] = useState({
    manufacturerName: '',
    manufacturingUnit: '',
    manufacturingLocation: '',
    manufacturingDate: '',
    batchNumber: '',
    skuCode: '',
    productionQuantity: '',
    productionQuantityUnit: 'Units',
    countryOfManufacture: '',
    rawMaterialSource: '',
    countryOfOrigin: '',
    supplierName: '',
    certifications: '',
    processingLocation: '',
    packagingUnit: '',
    packagingLocation: '',
    packagingDate: '',
    packagingType: '',
    packSize: '',
    numberOfUnitsPacked: '',
    numberOfUnitsPackedUnit: 'Units',
    dispatchLocation: '',
    distributorName: '',
    distributionLocation: '',
    modeOfTransport: '',
    expectedDeliveryDate: '',
    notes: '',
    supportingDocument: null,
  });
"""
    content = content.replace("  // Loyalty Points fields", state_to_add + "\n  // Loyalty Points fields")

# 3. Add to edit order
if 'setSupplyChain(order.supplyChain)' not in content:
    edit_to_add = """      if (order.supplyChain) {
        setSupplyChain(order.supplyChain);
      }
"""
    content = content.replace("    }\n    }\n  }, [location.state]);", edit_to_add + "    }\n    }\n  }, [location.state]);")

# 4. Add to orderData
if 'supplyChain: supplyChain' not in content:
    content = content.replace("        } : undefined,\n      };\n\n      return orderData;", "        } : undefined,\n        supplyChain: supplyChain,\n      };\n\n      return orderData;")

# 5. Update steps array
steps_old = """  const steps = [
    { id: 1, title: 'Product Basics', icon: Package },
    { id: 2, title: 'Variants & Specs', icon: LayoutGrid },
    { id: 3, title: 'Dates & Expiry', icon: Calendar },
    { id: 4, title: 'Rewards & Offers', icon: Gift },
    { id: 5, title: 'Warranty', icon: Shield },
    { id: 6, title: 'QR Quantity', icon: Package },
    { id: 7, title: 'Review', icon: CheckCircle2 }
  ];"""
steps_new = """  const steps = [
    { id: 1, title: 'Product Basics', icon: Package },
    { id: 2, title: 'Variants & Specs', icon: LayoutGrid },
    { id: 3, title: 'Dates & Expiry', icon: Calendar },
    { id: 4, title: 'Supply Chain', icon: Truck },
    { id: 5, title: 'Rewards & Offers', icon: Gift },
    { id: 6, title: 'Warranty', icon: Shield },
    { id: 7, title: 'QR Setup', icon: Package },
    { id: 8, title: 'Review', icon: CheckCircle2 }
  ];"""
content = content.replace(steps_old, steps_new)

# 6. Shift step IDs in the HTML
content = content.replace('id="step-7"', 'id="step-8"')
content = content.replace('currentStep === 7 ?', 'currentStep === 8 ?')
content = content.replace('STEP 7: Review', 'STEP 8: Review')

content = content.replace('id="step-6"', 'id="step-7"')
content = content.replace('currentStep === 6 ?', 'currentStep === 7 ?')
content = content.replace('STEP 6: QR Quantity', 'STEP 7: QR Setup')

content = content.replace('id="step-5"', 'id="step-6"')
content = content.replace('currentStep === 5 ?', 'currentStep === 6 ?')
content = content.replace('STEP 5: Warranty', 'STEP 6: Warranty')

content = content.replace('id="step-4"', 'id="step-5"')
content = content.replace('currentStep === 4 ?', 'currentStep === 5 ?')
content = content.replace('STEP 4: Rewards & Offers', 'STEP 5: Rewards & Offers')

# 7. Add step 4 html
step_4_html = """
        {/* STEP 4: Supply Chain Details */}
        <div id="step-4" className={`col-span-2 flex flex-col gap-8 ${currentStep === 4 ? 'block' : 'hidden'}`}>
          
          {/* 1. Manufacturing Details */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h4 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">1</span>
              Manufacturing Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Manufacturer / Brand</label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Enter manufacturer name" value={supplyChain.manufacturerName} onChange={(e) => setSupplyChain({...supplyChain, manufacturerName: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Manufacturing Unit / Plant <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" value={supplyChain.manufacturingUnit} onChange={(e) => setSupplyChain({...supplyChain, manufacturingUnit: e.target.value})}>
                  <option value="">Select unit / plant</option>
                  <option value="Unit 1">Unit 1</option>
                  <option value="Unit 2">Unit 2</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Manufacturing Location <span className="text-red-500">*</span></label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Enter city / state" value={supplyChain.manufacturingLocation} onChange={(e) => setSupplyChain({...supplyChain, manufacturingLocation: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Manufacturing Date <span className="text-red-500">*</span></label>
                <input type="date" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" value={supplyChain.manufacturingDate} onChange={(e) => setSupplyChain({...supplyChain, manufacturingDate: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Batch / Lot Number <span className="text-red-500">*</span></label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Enter batch / lot number" value={supplyChain.batchNumber} onChange={(e) => setSupplyChain({...supplyChain, batchNumber: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">SKU / Product Code <span className="text-red-500">*</span></label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Enter SKU / product code" value={supplyChain.skuCode} onChange={(e) => setSupplyChain({...supplyChain, skuCode: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Production Quantity <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input type="number" className="w-2/3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Enter quantity" value={supplyChain.productionQuantity} onChange={(e) => setSupplyChain({...supplyChain, productionQuantity: e.target.value})} />
                  <select className="w-1/3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" value={supplyChain.productionQuantityUnit} onChange={(e) => setSupplyChain({...supplyChain, productionQuantityUnit: e.target.value})}>
                    <option value="Units">Units</option>
                    <option value="Kg">Kg</option>
                    <option value="Liters">Liters</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Country of Manufacture <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" value={supplyChain.countryOfManufacture} onChange={(e) => setSupplyChain({...supplyChain, countryOfManufacture: e.target.value})}>
                  <option value="">Select country</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="China">China</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Raw Material / Source Details */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h4 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">2</span>
              Raw Material / Source Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Raw Material Source <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" value={supplyChain.rawMaterialSource} onChange={(e) => setSupplyChain({...supplyChain, rawMaterialSource: e.target.value})}>
                  <option value="">Select source</option>
                  <option value="Farm A">Farm A</option>
                  <option value="Supplier B">Supplier B</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Country of Origin <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" value={supplyChain.countryOfOrigin} onChange={(e) => setSupplyChain({...supplyChain, countryOfOrigin: e.target.value})}>
                  <option value="">Select country</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Supplier / Manufacturer</label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Enter supplier name" value={supplyChain.supplierName} onChange={(e) => setSupplyChain({...supplyChain, supplierName: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Certifications (Optional)</label>
                <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" value={supplyChain.certifications} onChange={(e) => setSupplyChain({...supplyChain, certifications: e.target.value})}>
                  <option value="">e.g., ISO, GMP, Organic</option>
                  <option value="ISO 9001">ISO 9001</option>
                  <option value="GMP">GMP</option>
                  <option value="Organic">Organic</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Processing & Packaging Details */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h4 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">3</span>
              Processing & Packaging Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Processing Location (If different)</label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Enter city / state" value={supplyChain.processingLocation} onChange={(e) => setSupplyChain({...supplyChain, processingLocation: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Packaging Unit <span className="text-red-500">*</span></label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Enter packaging unit" value={supplyChain.packagingUnit} onChange={(e) => setSupplyChain({...supplyChain, packagingUnit: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Packaging Location <span className="text-red-500">*</span></label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Enter city / state" value={supplyChain.packagingLocation} onChange={(e) => setSupplyChain({...supplyChain, packagingLocation: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Packaging Date <span className="text-red-500">*</span></label>
                <input type="date" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" value={supplyChain.packagingDate} onChange={(e) => setSupplyChain({...supplyChain, packagingDate: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Packaging Type</label>
                <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" value={supplyChain.packagingType} onChange={(e) => setSupplyChain({...supplyChain, packagingType: e.target.value})}>
                  <option value="">Select type</option>
                  <option value="Box">Box</option>
                  <option value="Bottle">Bottle</option>
                  <option value="Pouch">Pouch</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Pack Size / Configuration</label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="e.g., 500g, 30 capsules" value={supplyChain.packSize} onChange={(e) => setSupplyChain({...supplyChain, packSize: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Number of Units Packed</label>
                <div className="flex gap-2">
                  <input type="number" className="w-2/3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Enter quantity" value={supplyChain.numberOfUnitsPacked} onChange={(e) => setSupplyChain({...supplyChain, numberOfUnitsPacked: e.target.value})} />
                  <select className="w-1/3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" value={supplyChain.numberOfUnitsPackedUnit} onChange={(e) => setSupplyChain({...supplyChain, numberOfUnitsPackedUnit: e.target.value})}>
                    <option value="Units">Units</option>
                    <option value="Cases">Cases</option>
                    <option value="Pallets">Pallets</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Distribution Details */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h4 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">4</span>
              Distribution Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Dispatch Location <span className="text-red-500">*</span></label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Enter city / state" value={supplyChain.dispatchLocation} onChange={(e) => setSupplyChain({...supplyChain, dispatchLocation: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Distributor (If applicable)</label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Enter distributor name" value={supplyChain.distributorName} onChange={(e) => setSupplyChain({...supplyChain, distributorName: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Distribution Location / Region</label>
                <input type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" placeholder="Enter city / state / region" value={supplyChain.distributionLocation} onChange={(e) => setSupplyChain({...supplyChain, distributionLocation: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Mode of Transport</label>
                <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" value={supplyChain.modeOfTransport} onChange={(e) => setSupplyChain({...supplyChain, modeOfTransport: e.target.value})}>
                  <option value="">Select mode</option>
                  <option value="Road">Road</option>
                  <option value="Air">Air</option>
                  <option value="Sea">Sea</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 ml-1">Expected Delivery / Distribution Date</label>
                <input type="date" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium" value={supplyChain.expectedDeliveryDate} onChange={(e) => setSupplyChain({...supplyChain, expectedDeliveryDate: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1.5 col-span-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Notes (Optional)</label>
                <textarea className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium min-h-[80px]" placeholder="Enter any additional information" value={supplyChain.notes} onChange={(e) => setSupplyChain({...supplyChain, notes: e.target.value})}></textarea>
              </div>
            </div>
          </div>

          {/* 5. Supporting Document */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h4 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs">5</span>
              Supporting Document (Optional)
            </h4>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 ml-1">Upload supporting document</label>
              <p className="text-xs text-slate-500 ml-1 mb-2">COA, Invoice, Certificate, etc.</p>
              <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
                <span className="text-sm text-slate-500">{supplyChain.supportingDocument ? supplyChain.supportingDocument.name : 'No file chosen'}</span>
                <label className="cursor-pointer bg-white border border-indigo-200 text-indigo-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center gap-2">
                  Upload File
                  <input type="file" className="hidden" onChange={(e) => setSupplyChain({...supplyChain, supportingDocument: e.target.files[0]})} />
                </label>
              </div>
            </div>
          </div>

        </div>
"""

# add it before the step-5 (which was step-4)
content = content.replace('{/* STEP 5: Rewards & Offers */}', step_4_html + '\n        {/* STEP 5: Rewards & Offers */}')

# 8. Update Continue button condition
content = content.replace('currentStep < 7 ? (', 'currentStep < 8 ? (')

with open(file_path, 'w') as f:
    f.write(content)

print("Done")
