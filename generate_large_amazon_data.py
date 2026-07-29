import json
import random
import uuid

def generate_products(count=1000):
    brands_by_category = {
        "Proteins": ["MuscleBlaze", "AS-IT-IS", "BigMuscles", "Nakpro", "Optimum Nutrition India", "MyProtein", "GNC India", "HealthKart", "Avatar", "Fast&Up", "Dymatize India", "MuscleTech India"],
        "Nutraceuticals": ["HealthKart", "Himalaya", "Carbamide Forte", "Neuherbs", "WOW Life Science", "Zenith Nutrition", "TrueBasics", "Supradyn", "Revital", "Gynoveda", "Nature's Velvet", "Nutraj"],
        "Pharmaceuticals (OTC)": ["Sun Pharma", "GSK", "Cipla", "Zandu", "Dr. Reddy's", "Lupin", "Mankind", "Torrent Pharma", "Abbott India", "Pfizer India", "Cadila", "Piramal"]
    }
    
    brand_emails = {
        "MuscleBlaze": "info@muscleblaze.com",
        "AS-IT-IS": "info@asitisnutrition.com",
        "BigMuscles": "info@bigmusclesnutrition.com",
        "Nakpro": "info@nakpro.com",
        "Optimum Nutrition India": "consumer@optimumnutrition.com",
        "MyProtein": "feedback@myprotein.co.in",
        "GNC India": "hello@guardian.in",
        "HealthKart": "care@healthkart.com",
        "Avatar": "info@avatarnutrition.com",
        "Fast&Up": "info@fastandup.in",
        "Dymatize India": "customercare@dymatize.co.in",
        "MuscleTech India": "customercare@muscletech.co.in",
        "Himalaya": "contactus@himalayawellness.com",
        "Carbamide Forte": "info@novuslifesciences.com",
        "Neuherbs": "wecare@neuherbs.com",
        "WOW Life Science": "support@buywow.in",
        "Zenith Nutrition": "info@zenithnutrition.com",
        "TrueBasics": "customercare@truebasics.com",
        "Supradyn": "consumerhealthindia@bayer.com",
        "Revital": "secretarial@sunpharma.com",
        "Gynoveda": "care@gynoveda.com",
        "Nature's Velvet": "info@naturesvelvet.in",
        "Nutraj": "customercare@nutraj.com",
        "Sun Pharma": "secretarial@sunpharma.com",
        "GSK": "askus@gsk.com",
        "Cipla": "contactus@cipla.com",
        "Zandu": "customercare@emamigroup.com",
        "Dr. Reddy's": "customerservices@drreddys.com",
        "Lupin": "customercare@lupin.com",
        "Mankind": "contact@mankindpharma.com",
        "Torrent Pharma": "customercare@torrentpharma.com",
        "Abbott India": "webmasterindia@abbott.com",
        "Pfizer India": "contactus.india@pfizer.com",
        "Cadila": "info@zyduslife.com",
        "Piramal": "customercare@piramal.com"
    }
    
    product_types = {
        "Proteins": [
            ("Biozyme Performance Whey", "25g Protein, 5.5g BCAA, Enhanced Absorption"),
            ("Whey Protein Concentrate 80%", "Raw and Unflavoured, Muscle Recovery"),
            ("Premium Gold Whey", "Whey Isolate Blend, Zero Sugar"),
            ("Platinum Whey Protein Isolate", "Fast Digesting, Low Carb"),
            ("Mass Gainer XXL", "High Calorie, Complex Carbs, Muscle Mass"),
            ("BCAA Energy Drink", "7g BCAA, Electrolytes for Hydration"),
            ("Plant Protein Powder", "Pea & Brown Rice Protein, Vegan Friendly"),
            ("Casein Protein", "Slow Digesting, Night Time Recovery")
        ],
        "Nutraceuticals": [
            ("Multivitamin for Men & Women", "Immunity, Energy, and Stamina"),
            ("Ashwagandha Extract", "Stress Relief, Natural Energy Rejuvenation"),
            ("Deep Sea Fish Oil Omega 3", "Heart Health, Joint Support, Brain Function"),
            ("Chelated Magnesium Glycinate", "Muscle Recovery, Bone Health, Sleep Aid"),
            ("Biotin 10000mcg", "Hair Growth, Glowing Skin, Strong Nails"),
            ("Vitamin C with Zinc", "Immunity Booster, Antioxidant Support"),
            ("Curcumin Extract 95%", "Anti-inflammatory, Joint Support"),
            ("Melatonin 10mg Sleep Support", "Regulates Sleep Cycle, Deep Rest")
        ],
        "Pharmaceuticals (OTC)": [
            ("Pain Relief Balm", "Fast relief from Headache and Body Ache"),
            ("Antacid Fruit Salt", "Relief from Acidity in 6 Seconds"),
            ("Daily Health Supplement Capsule", "Vitamins & Minerals for Stamina"),
            ("Nicotine Chewing Gum 2mg", "Helps Quit Smoking, Controls Cravings"),
            ("Cough Syrup", "Relief from Dry & Wet Cough"),
            ("Paracetamol 500mg Tablet", "Fever Reducer, Mild Pain Relief"),
            ("Digestive Enzyme Syrup", "Improves Digestion, Reduces Bloating"),
            ("Antiseptic Liquid", "First Aid, Skin Healing, Disinfectant")
        ]
    }
    
    flavors = ["Chocolate", "Vanilla", "Strawberry", "Unflavoured", "Mango", "Cookies & Cream", "Coffee", "Lemon"]
    sellers = ["Cloudtail India", "RetailNet", "Appario Retail Private Ltd", "KAYKAY RETAIL", "Medizen Labs", "Direct to Consumer", "PharmEasy", "Tata 1mg", "HealthKart Direct"]

    products = []
    categories = list(brands_by_category.keys())

    for i in range(count):
        cat = random.choice(categories)
        brand = random.choice(brands_by_category[cat])
        prod_type, desc = random.choice(product_types[cat])
        
        # Construct product name
        name = f"{brand} {prod_type}"
        if cat == "Proteins":
            name += f" - {random.choice(['1kg', '2kg', '500g', '2lbs'])}"
        elif cat == "Nutraceuticals":
            name += f" - {random.choice(['60 Tablets', '90 Capsules', '120 Softgels'])}"
            
        # Pricing logic
        if cat == "Proteins":
            price = random.randint(1200, 4500)
        elif cat == "Nutraceuticals":
            price = random.randint(300, 1500)
        else:
            price = random.randint(50, 500)
            
        product = {
            "id": str(uuid.uuid4()),
            "category": cat,
            "brand": brand,
            "product_name": name,
            "seller": random.choice(sellers),
            "price_inr": price,
            "rating": round(random.uniform(3.5, 4.9), 1),
            "review_count": random.randint(100, 75000),
            "contact_info": {
                "official_email": brand_emails.get(brand, "info@brand.com")
            },
            "details": {
                "description": desc
            },
            "url": f"https://www.amazon.in/dp/B0{random.randint(10000000, 99999999)}"
        }
        
        if cat == "Proteins":
            product["details"]["flavor"] = random.choice(flavors)
            product["details"]["protein_per_serving"] = f"{random.randint(20, 30)}g"
            
        products.append(product)
        
    return products

if __name__ == "__main__":
    count = 1000
    data = generate_products(count)
    with open('amazon_india_products_1000.json', 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Successfully generated {count} products in amazon_india_products_1000.json")
