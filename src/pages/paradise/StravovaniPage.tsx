import restaurantsJson from "../../data/restaurants.json";
import { PageAnchors } from "../../components/PageAnchors";
import { RestaurantCard } from "../../components/RestaurantCard";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import type { CanarianKitchenItem, Restaurant } from "../../types";

interface RestaurantsData {
  restaurants: Restaurant[];
  canarianKitchen: CanarianKitchenItem[];
}

const data = restaurantsJson as RestaurantsData;
const categoryLabels: Record<Restaurant["category"], string> = {
  okoli: "V okolí apartmánu",
  zazitkove: "Zážitkové (za výletem)",
  specializovane: "Specializované",
};
const restaurantCategories = ["okoli", "zazitkove", "specializovane"] as Restaurant["category"][];
const restaurantAnchors = [
  { href: "#okoli", label: "V okolí" },
  { href: "#zazitkove", label: "Zážitkové" },
  { href: "#specializovane", label: "Specializované" },
  { href: "#kanarska-kuchyne", label: "Kanárská kuchyně" },
];

export function StravovaniPage() {
  useDocumentTitle("paradise/stravovani");

  return (
    <>
      <section className="page-intro">
        <p className="eyebrow">Stravování</p>
        <h1>Náš výběr a kanárské klasiky</h1>
        <p>Restaurace jsou subjektivní výběr. Otevírací doby a ceny si pro jistotu před cestou ověř.</p>
      </section>
      <PageAnchors items={restaurantAnchors} />
      {restaurantCategories.map((category) => (
        <section className="section-block section-anchor" id={category} key={category}>
          <div className="section-heading">
            <h2>{categoryLabels[category]}</h2>
          </div>
          <div className="restaurant-grid">
            {data.restaurants
              .filter((restaurant) => restaurant.category === category)
              .map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
          </div>
        </section>
      ))}
      <section className="section-block section-anchor" id="kanarska-kuchyne">
        <div className="section-heading">
          <h2>Co ochutnat — kanárská kuchyně</h2>
        </div>
        <div className="kitchen-grid">
          {data.canarianKitchen.map((item) => (
            <article className="content-panel" key={item.id}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p className="muted">{item.whereToTry}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
