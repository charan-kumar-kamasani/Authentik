from PIL import Image

img = Image.open('frontend/src/pages/web/desings/Home.png')

crops = [
    ("home_hero.png", (430, 60, 857, 430)),
    ("trusted_brands.png", (20, 500, 830, 580)),
    ("how_it_works_graphic.png", (400, 1000, 850, 1300)),
    ("dashboard_mockup.png", (250, 1350, 830, 1650)),
    ("security_shield.png", (30, 1720, 180, 1870)),
    ("industries_strip.png", (20, 1920, 830, 2030))
]

for name, box in crops:
    cropped = img.crop(box)
    cropped.save('frontend/public/assets/' + name)
    print(f"Saved {name}")
