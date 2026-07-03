import re

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductPassport.tsx', 'r') as f:
    content = f.read()

# Add import
import_statement = "import ProductHeroHeader from '../../components/ProductHeroHeader';\n"
content = content.replace("import API_BASE_URL from '../../config/api';", "import API_BASE_URL from '../../config/api';\n" + import_statement)

# Replace the block
old_block = """      {/* Dark Blue Header Section */}
      <div className="bg-[#001466] text-white pt-8 pb-12 px-5 relative">
        {/* Top Nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} strokeWidth={2.5} />
          </button>
          <h1 className="text-[15px] font-bold tracking-wide">Product Passport</h1>
          <button className="p-1 -mr-1 rounded-full hover:bg-white/10 transition-colors">
            <Share size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Product Header Content */}
        <div className="flex gap-4 items-center mb-4">
          <div className="w-[120px] h-[140px] flex-shrink-0 relative flex items-center justify-center bg-transparent -ml-2">
            <img
              src={data.productImage || "https://res.cloudinary.com/dx4i1w3uf/image/upload/v1782620446/ChatGPT_Image_Jun_27_2026_09_46_43_PM_r45ybg.png"}
              alt={data.productName}
              className="w-full h-full object-contain drop-shadow-2xl mix-blend-normal"
            />
          </div>
          <div className="flex flex-col flex-1 pt-0">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#1A3385] border border-[#2B47A1] rounded-lg mb-2 self-start">
              <ShieldCheck size={10} className="text-blue-300" />
              <span className="text-[8px] font-bold tracking-wide text-white uppercase">100% Authentic</span>
            </div>

            <div
              className="flex items-center gap-1.5 mb-1.5 cursor-pointer active:opacity-70 transition-opacity"
              onClick={() => {
                const bId = data.brandId?._id || data.brandId || data.product?.brandId || data.productId?.brandId;
                if (bId) navigate(`/brand-portfolio/${bId}`);
              }}
            >
              <span className="text-[12px] font-bold tracking-wider text-white flex items-center gap-1.5">
                {data.companyName && (
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shrink-0 overflow-hidden text-[#001466] font-black text-[8px]">
                    {data.companyName.charAt(0).toUpperCase()}
                  </div>
                )}
                {data.companyName || 'Brand'}
              </span>
              <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle2 size={10} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <h2 className="text-[18px] font-bold leading-[1.1] mb-1 tracking-tight text-white">{data.productName}</h2>
            <p className="text-blue-100/90 text-[12px] mb-2 font-medium">{data.brand || 'Variant'}</p>

            <div className="flex flex-wrap gap-2">
              {data.variants?.slice(0, 3).map((v: any, idx: number) => (
                <span key={idx} className="px-2 py-0.5 bg-white text-[#001466] text-[9px] font-bold rounded">
                  {v.value}
                </span>
              ))}
              {!data.variants?.length && data.category && (
                <span className="px-2 py-0.5 bg-white text-[#001466] text-[9px] font-bold rounded">
                  {data.category}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>"""

new_block = """      <ProductHeroHeader title="Product Passport" data={data} />"""

content = content.replace(old_block, new_block)

with open('/Users/charankumarkamasani/Projects/authentik/frontend/src/pages/mobile/ProductPassport.tsx', 'w') as f:
    f.write(content)

