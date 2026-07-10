const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/web/WebAboutUs.jsx', 'utf8');

const heroRegex = /\{\/\* Hero Section \/ Why Authentiks Exists \*\/\}(.*?)<div className="relative z-10 hidden lg:block">/s;

let newHero = `{/* Hero Banner */}
      <section className="relative w-full">
        <div className="relative w-full h-[250px] md:h-[400px] lg:h-[600px] overflow-hidden bg-slate-100">
          <img
            src={aboutHeroImage}
            alt="About Us"
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      </section>

      {/* Why Authentiks Exists */}
      <section className="pt-20 pb-16 overflow-hidden relative bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-4 text-center">Why Authentiks Exists</h3>
            <h1 className="text-4xl md:text-[42px] font-bold text-slate-900 leading-[1.1] mb-8 tracking-tight text-center">
              Brands own the product—but not the <span className="text-blue-600">consumer relationship</span>. Authentiks changes that.
            </h1>
            <div className="text-lg text-slate-600 mb-12 leading-relaxed space-y-4">
              <p>
                Modern businesses invest heavily in acquiring customers, building products, and growing distribution. Yet once a product reaches the consumer, brands often lose visibility and ownership of the relationship.
              </p>
              <ul className="list-disc pl-6 space-y-1 font-medium text-slate-700">
                <li>Marketplaces own customer data.</li>
                <li>Retailers own the transaction.</li>
                <li>Distributors own the supply chain.</li>
              </ul>
              <p>
                Our Consumer Intelligence Platform transforms every physical product into a secure digital identity, enabling brands to authenticate products, register consumers, collect first-party data, deliver engaging post-purchase experiences, and make smarter business decisions through real-time insights.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-12 mt-12 pt-12 border-t border-slate-100">
              <div className="flex flex-col gap-4 items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h4>
                  <p className="text-base text-slate-600 leading-relaxed">
                    To help every brand build trusted, data-driven relationships with consumers by transforming physical products into connected digital assets.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-4 items-center text-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                  <Eye size={32} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-3">Our Vision</h4>
                  <p className="text-base text-slate-600 leading-relaxed">
                    A future where every physical product has a secure digital identity, every consumer can trust what they buy, and every brand truly owns its customer relationship.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>`;

// Doing exact replace for About Us
const oldHero = content.substring(
  content.indexOf('{/* Hero Section / Why Authentiks Exists */}'),
  content.indexOf('      {/* Why Brands Choose Authentiks */}')
);
content = content.replace(oldHero, newHero + '\n\n');
fs.writeFileSync('frontend/src/pages/web/WebAboutUs.jsx', content);
