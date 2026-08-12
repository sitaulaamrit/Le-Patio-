export interface DetailedMenuItem {
  name: string;
  price: string; // Plain string representation (e.g. "Rs. 750" or "Rs. 550 / 700")
  description?: string;
  image?: string;
  isVegetarian?: boolean;
  isPopular?: boolean;
  isSignature?: boolean;
  spicyLevel?: 0 | 1 | 2 | 3;
}

export interface MenuSection {
  id: string;
  title: string;
  subtitle?: string;
  items: DetailedMenuItem[];
}

import meatPlatterImg from "./assets/images/meat_platter_1782578135182.jpg";
import chickenMomoImg from "./assets/images/chicken_momo_1782578148241.jpg";
import chickenMargheritaImg from "./assets/images/chicken_margherita_pizza_1782578164127.jpg";
import porkChopImg from "./assets/images/pork_chop_1782578177568.jpg";
import spicyGarlicPrawnImg from "./assets/images/spicy_garlic_prawn_1782578192277.jpg";
import cocktailsImg from "./assets/images/le_patio_cocktails_1782575824834.jpg";
import icedMochaImg from "./assets/images/iced_mocha_1782578206581.jpg";

export const detailedMenuData: MenuSection[] = [
  {
    id: "specials",
    title: "Le Patio Specials",
    subtitle: "House Masterpieces & Signature Sharing Platters",
    items: [
      {
        name: "Meat Platter",
        price: "Rs. 2,599",
        description: "An ultimate sharing feast! Chicken wings, pork belly, pork ribs, and tender meatballs cooked in a fragrant Thai red curry sauce with rich, aromatic herbs. Served hot with mixed nachos, fresh guacamole, and dynamic tomato salsa.",
        image: meatPlatterImg,
        isSignature: true,
        isPopular: true
      },
      {
        name: "Mezze Platter",
        price: "Rs. 1,350",
        description: "Mediterranean elegance: Silky hummus, vibrant beetroot hummus, classic smoky baba ghanoush, rich labneh balls, golden crisp falafel, roasted cauliflower, pickled olives, and warm toasted Turkish bread.",
        isVegetarian: true,
        isSignature: true
      },
      {
        name: "Goat Shanks",
        price: "Rs. 1,050",
        description: "The absolute king of all cuts. Premium goat shanks marinated with local Himalayan spices, flame-grilled and slow-braised for hours until meltingly tender in a rich, deeply flavored tomato and red wine reduction. Served with premium local Marsi rice and glazed garden vegetables.",
        isSignature: true
      },
      {
        name: "Herbs Crusted Goat Chop",
        price: "Rs. 1,250",
        description: "Simple, elegant, and packed with local flavor. Tender chops slow-cooked sous vide for 4 hours to lock in moisture, seasoned with Himalayan spices, grilled, dipped in rich mustard paste, and crusted in parmesan breadcrumbs, pistachio, dill, chives, coriander, mint, and thyme. Served with sauteed vegetables and mandarin-infused hung yogurt sauce.",
        isSignature: true
      },
      {
        name: "Buff Steak",
        price: "Rs. 950",
        description: "Local, juicy buff steak sourced from local farms, cooked precisely to your preferred doneness (rare to well-done) and smothered in an earth-shattering creamy sauce featuring a sauteed blend of fresh button mushrooms.",
        isPopular: true
      }
    ]
  },
  {
    id: "entrees",
    title: "Entrées & Starters",
    subtitle: "Delectable Small Plates & Crunchy Bites",
    items: [
      {
        name: "Vietnamese Spring Roll",
        price: "Rs. 550 / 700",
        description: "Delicate rice paper rolls packed with crunchy garden juliennes, vermicelli, fresh herbs, and served with house dipping sauce. Available in Vegetarian (550) or Non-Vegetarian with Prawn/Chicken (700).",
        isVegetarian: true,
        isPopular: true
      },
      {
        name: "Chicken Momo",
        price: "Rs. 300 / 400",
        description: "Kathmandu's favorite: hand-folded Nepalese dumplings stuffed with seasoned minced chicken (or local mixed greens), steamed to juicy perfection, and served with a rich sesame tomato chutney.",
        image: chickenMomoImg,
        isPopular: true
      },
      {
        name: "Spicy Chicken Wings",
        price: "Rs. 500",
        description: "Succulent wings tossed in our signature glazed chili reduction, finished with a sprinkle of sesame and chives.",
        spicyLevel: 2
      },
      {
        name: "Chicken Tenders",
        price: "Rs. 550",
        description: "Crisp golden breaded breast strips served with dynamic garlic-chili dipping mayonnaise.",
      },
      {
        name: "Spicy Fried Chicken (With Kimchi)",
        price: "Rs. 600",
        description: "Crispy Korean-style fried chicken tossed in sweet-spicy gochujang sauce, accompanied by tangy home-fermented kimchi.",
        spicyLevel: 2
      },
      {
        name: "Chicken Souvlaki (With Tzatziki)",
        price: "Rs. 550",
        description: "Greek-style skewered tender chicken thigh, marinated in lemon, garlic, and wild oregano, served with a cooling cucumber-mint tzatziki."
      },
      {
        name: "Cheesy Chicken Albondigas",
        price: "Rs. 550",
        description: "Succulent chicken meatballs stuffed with melting cheese, baked in a rich, basil-perfumed pomodoro reduction."
      },
      {
        name: "Spiced Pork (With Spicy Shrimp Sauce)",
        price: "Rs. 600",
        description: "Tender, twice-cooked pork belly pieces seasoned with five-spice, served alongside a savory spicy shrimp dipping sauce.",
        spicyLevel: 1
      },
      {
        name: "Salt & Pepper Calamari",
        price: "Rs. 750",
        description: "Wok-tossed, crispy squid rings seasoned with sea salt, crushed peppercorns, and spring onions, served with a tangy tartare dipping sauce."
      },
      {
        name: "Shredded Chicken",
        price: "Rs. 600",
        description: "Crispy fried shredded chicken strips tossed in a savory honey-soy glaze with tri-color bell peppers."
      },
      {
        name: "Butter Garlic Prawn",
        price: "Rs. 750",
        description: "Plump king prawns pan-seared in rich French butter, minced garlic, white wine splash, and fresh parsley, served with warm crusty bread slices."
      },
      {
        name: "Mushroom Arancini",
        price: "Rs. 450",
        description: "Crispy Italian rice balls stuffed with sautéed wild mushrooms and gooey mozzarella, served on a puddle of marinara sauce.",
        isVegetarian: true
      },
      {
        name: "Tangy Loaded Fries",
        price: "Rs. 400",
        description: "Golden fries piled high with spiced cheese sauce, pickled jalapeños, olives, and a drizzle of dynamic house sauce."
      },
      {
        name: "Nachos (With Guacamole & Salsa)",
        price: "Rs. 500",
        description: "Crispy corn tortilla chips loaded with hot cheese sauce, black beans, dynamic pico de gallo, fresh house guacamole, and sour cream.",
        isVegetarian: true
      },
      {
        name: "Assorted Tempura",
        price: "Rs. 550",
        description: "Crisp, feather-light battered seasonal vegetables and prawns, served with a traditional sweet soy dipping broth."
      },
      {
        name: "Potato Wedges / Cocktail Samosa",
        price: "Rs. 500",
        description: "Spiced skin-on wedges or crispy miniature pastry triangles filled with spiced potato and peas, served with refreshing mint chutney.",
        isVegetarian: true
      },
      {
        name: "Spicy Schezwan Paneer",
        price: "Rs. 550",
        description: "Cubes of fresh paneer cottage cheese wok-tossed in a fiery Schezwan chili-garlic paste with crisp onions and peppers.",
        isVegetarian: true,
        spicyLevel: 3
      },
      {
        name: "Stir Fried Veg",
        price: "Rs. 500",
        description: "A healthy, vibrant mix of seasonal local greens, broccoli, baby corn, and mushrooms quickly tossed with garlic oil and light soy.",
        isVegetarian: true
      }
    ]
  },
  {
    id: "twakka",
    title: "Twakka Snacks",
    subtitle: "Fiery, Authentic local Newari & Nepalese Bar Bites",
    items: [
      {
        name: "Choila (Chicken / Mutton / Duck)",
        price: "Rs. 550 / 950 / 950",
        description: "Traditional roasted meat spiced with roasted mustard oil, fenugreek, toasted garlic, and fiery red chilies. Unmatchable bar companion.",
        isPopular: true,
        spicyLevel: 3
      },
      {
        name: "Buff Sukuti Sadeko",
        price: "Rs. 550",
        description: "Traditional sun-dried marinated buff jerky, shallow-fried and tossed with chopped raw onions, green chilies, garlic, and fresh coriander juice.",
        spicyLevel: 2
      },
      {
        name: "Chicken Sadeko",
        price: "Rs. 550",
        description: "Shredded spiced chicken tossed with mustard oil, fresh lemon juice, dynamic red onion rings, ginger, and local herbs.",
        spicyLevel: 2
      },
      {
        name: "Mushroom Choila",
        price: "Rs. 500",
        description: "Sauted wild oyster mushrooms prepared in traditional hot-spiced Newari mustard marinade with burnt fenugreek.",
        isVegetarian: true,
        spicyLevel: 2
      },
      {
        name: "Aloo Sadeko / Peanuts Sadeko",
        price: "Rs. 450 / 350",
        description: "Boiled mountain potatoes or roasted crunchy peanuts dry-tossed in lemon juice, dynamic Sichuan pepper (Timmur), green chilies, and coriander.",
        isVegetarian: true,
        spicyLevel: 1
      },
      {
        name: "Masala Papad / Sadeko Platter Veg",
        price: "Rs. 390 / 950",
        description: "Crispy papadum discs topped with tangy onion-tomato mix or a giant compilation of Nepalese spicy bite platters.",
        isVegetarian: true
      }
    ]
  },
  {
    id: "pasta_pizza",
    title: "Pasta & Artisanal Pizza",
    subtitle: "Stone-Baked Crusts & Traditional Italian Comforts",
    items: [
      {
        name: "Chicken Margherita Pizza",
        price: "Rs. 750",
        description: "Classic hand-stretched crust topped with rich tomato sauce, creamy bocconcini cheese, dynamic seasoned shredded chicken, olive oil, and fresh basil.",
        image: chickenMargheritaImg,
        isPopular: true
      },
      {
        name: "Veg Le Patio Pasta",
        price: "Rs. 700",
        description: "Gourmet pasta tossed with sun-dried tomatoes, roasted bell peppers, char-grilled zucchini, artisanal basil pesto, rich napoli sauce, and fresh cream.",
        isVegetarian: true
      },
      {
        name: "Siciliana Pasta",
        price: "Rs. 700",
        description: "Spaghetti or Rigatoni with grilled eggplant, sweet green peas, garlic, Napolitana sauce, topped with local ricotta cheese and a touch of chili.",
        isVegetarian: true
      },
      {
        name: "Mushroom & Sun-Dried Tomato Aglio Olio",
        price: "Rs. 650",
        description: "Rigatoni or spaghetti drizzled with extra virgin olive oil, sizzling garlic, chili flakes, wild mushrooms, sun-dried tomato, and fresh parsley.",
        isVegetarian: true,
        spicyLevel: 1
      },
      {
        name: "Spicy Pork Pasta",
        price: "Rs. 800",
        description: "Stir-fried pork with shiitake mushrooms, peppery rocket leaves, crumbled salty feta cheese, olive oil, and fresh bird's eye chili.",
        spicyLevel: 2
      },
      {
        name: "Meat Ball Pasta",
        price: "Rs. 750",
        description: "Hearty house-made beef & pork meatballs simmered slowly in a rich sweet tomato pomodoro sauce served over spaghetti."
      },
      {
        name: "Seafood Marinara Pasta",
        price: "Rs. 950",
        description: "Luxurious spaghetti tossed with a premium mix of squid, prawns, fish chunks, splash of white wine, garlic, cherry tomatoes, and napoli.",
        isSignature: true
      },
      {
        name: "Primavera Pasta",
        price: "Rs. 650",
        description: "Fresh medley of broccoli, sweet green peas, bell peppers, sun-rise tomatoes, mushrooms, and artichoke hearts tossed in pure olive oil.",
        isVegetarian: true
      },
      {
        name: "Chicken Mushroom Pasta",
        price: "Rs. 850",
        description: "Gourmet cream-sauce spaghetti cooked with juicy chicken chunks, wild mushrooms, sun-dried tomatoes, chili flakes, and grated parmesan."
      },
      {
        name: "Caprese Pizza",
        price: "Rs. 600",
        description: "Classic mozzarella, fresh sliced heritage tomatoes, extra virgin olive oil, and organic garden basil.",
        isVegetarian: true
      },
      {
        name: "Spicy Paneer Pizza",
        price: "Rs. 750",
        description: "A delicious local fusion of soft marinated paneer cubes, chili flakes, sliced onions, and fresh coriander over dynamic mozzarella.",
        isVegetarian: true,
        spicyLevel: 1
      },
      {
        name: "Pepperoni Pizza",
        price: "Rs. 850",
        description: "A crowd-pleaser: loaded with dry-aged spicy salami, sliced black olives, rich tomato napoli, and mozzarella."
      },
      {
        name: "Vegetable Delight Pizza",
        price: "Rs. 700",
        description: "Charred eggplant, zucchini ribbons, bell peppers, sautéed mushrooms, napoli sauce, and gooey cheese.",
        isVegetarian: true
      },
      {
        name: "Capricciosa Pizza",
        price: "Rs. 850",
        description: "Traditional Italian layout featuring pork ham, wild mushrooms, marinated artichoke hearts, mozzarella, and napoli."
      },
      {
        name: "BBQ Chicken Pizza",
        price: "Rs. 800",
        description: "Smoky sweet BBQ-sauce glazed chicken, sliced red onion rings, pineapple chunks, and melted mozzarella."
      },
      {
        name: "Meat Lover Pizza",
        price: "Rs. 950",
        description: "The ultimate meat feast: crisp bacon, chicken strips, local sausage, spicy salami, ham, mozzarella, and wild coriander.",
        isPopular: true
      }
    ]
  },
  {
    id: "mains",
    title: "Mains & Entrées",
    subtitle: "Hearty Dishes & Comforting Entrées",
    items: [
      {
        name: "Pork Chop",
        price: "Rs. 950",
        description: "Juicy pork chops thick-cut and grilled to succulent perfection, glazed with a dark spiced honey marinade, served with crisp raw radish-salad.",
        image: porkChopImg,
        isPopular: true
      },
      {
        name: "Grilled Chicken",
        price: "Rs. 750",
        description: "Herbs-marinated chicken breast pan-grilled and served with a roasted whole head of caramelized garlic, steamed broccoli, baby corn, carrots, and a fragrant reduction.",
        isPopular: true
      },
      {
        name: "Spicy Garlic Prawn",
        price: "Rs. 900",
        description: "Plump, pan-roasted king prawns tossed in a thick fiery sweet garlic-chili glaze with sweet bell pepper rings, served around a dome of fluffy steamed rice.",
        image: spicyGarlicPrawnImg,
        isSignature: true,
        spicyLevel: 2
      },
      {
        name: "Kimchi Chicken",
        price: "Rs. 750",
        description: "Glazed pan-fried chicken chunks tossed in Korean gochujang, served over dynamic hot kimchi, steamed greens, and fresh carrot ribbons.",
        spicyLevel: 2
      },
      {
        name: "BBQ Pork Ribs",
        price: "Rs. 950",
        description: "Slow-roasted, fall-off-the-bone tender pork baby back ribs basted in our house hickory-smoked glaze, served with skin-on potato wedges."
      },
      {
        name: "Lasagna",
        price: "Rs. 750",
        description: "Baked sheets of pasta layered with rich minced meat ragu, creamy bechamel, mozzarella, and topped with fresh basil."
      },
      {
        name: "Kimchi Rice Bowl",
        price: "Rs. 750",
        description: "Spicy kimchi stir-fried rice topped with sesame chicken, pickled cucumber, a runny fried egg, and toasted nori."
      },
      {
        name: "Yasaitame Rice Bowl",
        price: "Rs. 800",
        description: "Vibrant Japanese-style stir-fried vegetables with soy, sesame oil, and ginger, served over hot jasmine rice.",
        isVegetarian: true
      },
      {
        name: "Tex Mex BBQ Paneer",
        price: "Rs. 850",
        description: "Grilled cubes of cottage cheese basted in sweet BBQ sauce, served with sautéed peppers, Spanish rice, and refried beans.",
        isVegetarian: true
      },
      {
        name: "Wine Glazed Chicken",
        price: "Rs. 850",
        description: "Pan-roasted chicken breast finished in a rich red-wine mushroom reduction, served over buttery mashed potatoes."
      },
      {
        name: "Baked Chicken Breast",
        price: "Rs. 750",
        description: "Juicy breast baked with Italian herbs, stuffed with spinach and mozzarella, served with garlic spaghetti."
      },
      {
        name: "Baked Eggplant",
        price: "Rs. 750",
        description: "Halved eggplants roasted and stuffed with seasoned Mediterranean vegetables, quinoa, napoli sauce, and melted parmesan.",
        isVegetarian: true
      },
      {
        name: "Fish & Chips",
        price: "Rs. 750",
        description: "Traditional British beer-battered cod fish fillets, crisp-fried and served with skin-on potato wedges and tartare sauce."
      },
      {
        name: "Ricotta & Spinach Cannelloni",
        price: "Rs. 650",
        description: "Tubes of pasta stuffed with wild spinach and ricotta cheese, baked under a bubbling blanket of tomato napoli and creamy cheese sauce.",
        isVegetarian: true
      }
    ]
  },
  {
    id: "soups_salads",
    title: "Soups & Salads",
    subtitle: "Fresh Green Delights & Warm Broths",
    items: [
      {
        name: "Caprese Salad",
        price: "Rs. 650",
        description: "Traditional Italian layout featuring rich bocconcini cheese, heirloom tomatoes, fresh sweet mandarin oranges, mixed organic lettuce, basil, and basil pesto dressing.",
        isVegetarian: true
      },
      {
        name: "Nicoise Salad",
        price: "Rs. 650",
        description: "Mixed leaves, boiled potatoes, green beans, sweet carrots, pickled radish & red onion, canned yellowfin tuna, soft-boiled quail eggs, drizzled with house French vinaigrette."
      },
      {
        name: "Quinoa Salad",
        price: "Rs. 600",
        description: "Superfood bowl: organic quinoa, mixed greens, sun-dried tomatoes, artichoke hearts, chickpeas, sweet mandarin slices, crunchy pumpkin seeds, and shaved parmesan.",
        isVegetarian: true
      },
      {
        name: "Beetroot Avocado Salad",
        price: "Rs. 600",
        description: "Earthy roasted beetroot chunks, creamy Hass avocado, crumbled feta cheese, and toasted walnuts over dynamic mixed greens with honey balsamic dressing.",
        isVegetarian: true
      },
      {
        name: "Nepali Salad",
        price: "Rs. 500",
        description: "Crispy local organic cucumber, sweet carrots, red radish, fresh mint leaves, and robust cos lettuce tossed in lime juice and mustard oil.",
        isVegetarian: true
      },
      {
        name: "Tom Yum Soup",
        price: "Rs. 600 / 750",
        description: "Classic Thai spicy and sour lemongrass broth with kaffir lime leaves, galangal, mushrooms, and cherry tomatoes. Available Veg (600) or Prawn (750).",
        spicyLevel: 2
      },
      {
        name: "Wild Mushroom Soup",
        price: "Rs. 500",
        description: "Rich, creamy, velvety soup crafted from slow-roasted wild forest mushrooms, finished with a dash of white truffle oil and fresh thyme.",
        isVegetarian: true
      },
      {
        name: "Spicy Sea Food Soup",
        price: "Rs. 650",
        description: "Fiery fish-bone broth loaded with squid, prawns, chopped fish fillets, bird's eye chili, and freshly squeezed lime.",
        spicyLevel: 2
      },
      {
        name: "Clear Soup",
        price: "Rs. 450 / 500",
        description: "Nourishing, light, clear broth infused with fresh ginger, garlic, and coriander. Available with garden vegetables (450) or shredded chicken (500)."
      }
    ]
  },
  {
    id: "sandwiches",
    title: "Club & Sandwiches",
    subtitle: "Artisanal Breads & Gourmet Fillings",
    items: [
      {
        name: "Club Sandwich",
        price: "Rs. 750",
        description: "Triple-layered toasted bread loaded with grilled chicken breast, crisp bacon strip, fried egg, cheddar, lettuce, tomato, and seasoned mayonnaise, served with fries.",
        isPopular: true
      },
      {
        name: "Veg Sandwich",
        price: "Rs. 450",
        description: "Toasted local brown bread filled with smashed avocado, grilled zucchini, bell peppers, fresh mozzarella, and a spread of rich basil pesto.",
        isVegetarian: true
      },
      {
        name: "Chicken Schnitzel Sandwich",
        price: "Rs. 550",
        description: "Crispy fried chicken breast schnitzel, shredded cabbage slaw, dill pickles, and house mustard mayo on a toasted soft brioche bun."
      }
    ]
  },
  {
    id: "kids",
    title: "Kid's Menu (Little Panda Selection)",
    subtitle: "Special Small Portions & Friendly Flavors for Little Guests",
    items: [
      {
        name: "Light Bites (Chicken Tenders / Fish Nuggets)",
        price: "Rs. 350",
        description: "Bite-sized, low-spiced crunchy favorites designed for little hands. Served with sweet tomato ketchup. Other options: Cheesy Meat Balls, Chicken Popcorn, Mini Grilled Sausages, Veg Wrap, Potato Croquettes, Fruits Bowl.",
        isPopular: true
      },
      {
        name: "Kids' Pasta & Pizza",
        price: "Rs. 450 / 550",
        description: "Choose between Mild Pasta Pomodoro (450), Creamy Chicken Pesto (450), Kids' Margherita Pizza (450), or Banana Pistachio Nutella Dessert Pizza (550).",
        isVegetarian: true
      },
      {
        name: "Sandwich & Sliders (Bread/Bun)",
        price: "Rs. 250 / 300 / 350",
        description: "Super friendly, kid-approved choices: Simple Melted Cheese (250), PBJ (Peanut Butter & Jam) (250), Crispy Chicken Slider (300), Avocado Egg Bun (300), or Mini Veg Burger (350)."
      },
      {
        name: "Kids' Main Meals",
        price: "Rs. 300 / 450",
        description: "Nourishing meals: Mini Grilled Fish & Chips (450), Mild Chicken & Egg Roll (350), Chicken Rice Bowl (450), or Veg Rice Bowl (300)."
      },
      {
        name: "Kids' Character Drinks",
        price: "Rs. 395",
        description: "Vibrant, low-sugar fun beverages: Mickey Mouse (Orange & Pineapple juice, Grenadine), Spongebob Squarepants (Mango, Lime, Pineapple juice with Sprite), Blue Cinderella (Pineapple, Fresh Cream, Coconut & Blue Curacao), or Spiderman (Cranberry, Apple, Cherry with Soda)."
      }
    ]
  },
  {
    id: "dessert",
    title: "Sweet Desserts",
    subtitle: "Delicate & Indulgent Ends",
    items: [
      {
        name: "Cheesecake",
        price: "Rs. 450",
        description: "Silky, rich baked cream cheese on a crunchy graham cracker crust, topped with sweet wild blueberry compote.",
        isPopular: true
      },
      {
        name: "Brownie with Ice Cream",
        price: "Rs. 550",
        description: "Warm, decadent chocolate fudge brownie packed with walnuts, served under a scoop of premium vanilla bean gelato and warm chocolate ganache.",
        isPopular: true
      },
      {
        name: "Ice Cream Selection",
        price: "Rs. 175",
        description: "Single scoop of our artisanal premium flavors (please ask your server for today's available selections)."
      }
    ]
  },
  {
    id: "beverages",
    title: "Beverages & Cocktails",
    subtitle: "Craft Cocktails, Fine Spirits, Single-Origin Espresso & Shakes",
    items: [
      {
        name: "Margarita",
        price: "Rs. 700",
        description: "Premium tequila, triple sec, freshly squeezed lime juice, shaken with ice, served in a classic salt-rimmed martini glass.",
        image: cocktailsImg,
        isPopular: true
      },
      {
        name: "Iced Mocha",
        price: "Rs. 370",
        description: "Double-shot Nepalese organic espresso blended with rich chocolate syrup, cold whole milk, and topped with thick fresh whipped cream and cocoa dusting.",
        image: icedMochaImg,
        isPopular: true
      },
      {
        name: "Signature Cocktails (Rosee Lee / Mango Brew)",
        price: "Rs. 900",
        description: "House recipes: Rosee Lee (sweet rose syrup, premium vodka, lime, egg white froth) or Mango Brew (spiced rum, fresh mango purée, cardamom, ginger beer). Other Signatures: Khukri Robusta (900), Cucumber Long Sour (900), Close to the Patio (1000).",
        isSignature: true
      },
      {
        name: "Artisanal Coffee & Tea Selection",
        price: "Rs. 190 - 400",
        description: "Full espresso bar: Single-origin local beans roasted perfectly. Espresso (190), Cappuccino (250), Café Latte (275), Caramel Macchiato (330), Hot Chocolate (250). Wide range of premium leaf teas (90 - 175) and iced options."
      },
      {
        name: "Specialty Mocktails",
        price: "Rs. 550",
        description: "Delicious non-alcoholic creations: Blue Hawaiian, Kiwi Club, Mango Mirchi (with a dash of hot chili salt), Guava Chili, or Barbies Blush."
      },
      {
        name: "Shakes, Lassis & Smoothies",
        price: "Rs. 290 - 350",
        description: "Rich blended treats: Thick Milkshakes (Vanilla, Chocolate, Strawberry - 325), Authentic Yogurt Lassis (Plain, Sweet, Banana - 290), or Fruit Smoothies (Mango, Papaya, Berry - 350)."
      },
      {
        name: "Premium Whiskies & Malts",
        price: "Rs. 475 - 690",
        description: "Selected imports (30ml pour): Chivas Regal 12Y (575), JW Black Label (625), JW Double Black (675), Glenfiddich 12Y (690), Glenlivet 12Y (650), Jack Daniel's (525)."
      },
      {
        name: "Craft & Imported Beers",
        price: "Rs. 270 - 750",
        description: "Chilled bottles: Barahsinghe Pilsner (725), Budweiser (750), Carlsberg (750), Gorkha Premium (700), Tuborg (700), Somersby Apple Cider (270)."
      },
      {
        name: "Wine Selection (By the Bottle)",
        price: "Rs. 2,854 / 3,600",
        description: "Elegant pairings: Jacob's Creek Shiraz/Chardonnay (3600) or Robertson Sweet Red Wine (2854). By the glass available upon request."
      }
    ]
  }
];
