import requests
from bs4 import BeautifulSoup
import json
import time
import random

# NOTE: Amazon heavily protects against automated bots. 
# A standard requests script like this will often get blocked or asked for a CAPTCHA.
# For extracting "as much as possible" reliably, you MUST use a specialized API 
# like ScraperAPI (scraperapi.com), Apify (apify.com), or BrightData.

def scrape_amazon_in(search_term):
    # Rotate User-Agents to avoid immediate blocking
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0"
    ]
    
    headers = {
        'User-Agent': random.choice(user_agents),
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
    }

    url = f"https://www.amazon.in/s?k={search_term.replace(' ', '+')}"
    print(f"Scraping {url}...")
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 503:
            print("Amazon blocked the request (CAPTCHA required). Use a service like Apify or ScraperAPI.")
            return []
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        results = []
        # Amazon search result items usually have this data-component-type
        items = soup.find_all('div', {'data-component-type': 's-search-result'})
        
        for item in items:
            title_element = item.find('h2', {'class': 'a-size-mini'})
            price_element = item.find('span', {'class': 'a-price-whole'})
            rating_element = item.find('span', {'class': 'a-icon-alt'})
            link_element = item.find('a', {'class': 'a-link-normal s-no-outline'})
            
            if title_element:
                title = title_element.text.strip()
                price = price_element.text.replace(',', '').strip() if price_element else "N/A"
                rating = rating_element.text.strip().split(' ')[0] if rating_element else "N/A"
                url = "https://www.amazon.in" + link_element['href'] if link_element else "N/A"
                
                results.append({
                    "product_name": title,
                    "price_inr": price,
                    "rating": rating,
                    "url": url,
                    "category": search_term
                })
                
        return results

    except Exception as e:
        print(f"Error scraping {search_term}: {e}")
        return []

if __name__ == "__main__":
    search_terms = ["Whey Protein", "Multivitamin", "Paracetamol", "Ashwagandha"]
    all_products = []
    
    for term in search_terms:
        extracted = scrape_amazon_in(term)
        all_products.extend(extracted)
        # Sleep randomly to mimic human behavior
        time.sleep(random.uniform(2, 5))
        
    with open('scraped_amazon_india_products.json', 'w') as f:
        json.dump(all_products, f, indent=4)
        
    print(f"Successfully scraped {len(all_products)} products to scraped_amazon_india_products.json")
