import restaurantsJson from "../../data/restaurants.json";
import { RestaurantCard } from "../../components/RestaurantCard";
import { useDocumentTitle } from "../../lib/useDocumentTitle";
import type { CanarianKitchenItem, Restaurant } from "../../types";

interface RestaurantsData {
  restaurants: Restaurant[];
  canarianKitchen: CanarianKitchenItem[];
}

const data = restaurantsJson as RestaurantsData;
const categoryLabels: Record<Restaurant["category"], string> = {
  okoli: "V okoli",
  zazitkove: "Zazitkove",
  specializovane: "Specializovane",
};

export function StravovaniPage() {
  useDocumentTitle("Stravovani");

  return (
    <>
      <section className="page-intro">
        <p className="eyebrow">Stravovani</p>
        <h1>Kristinin vyber a kanarske klasiky</h1>
        <p>Restaurace jsou subjektivni vyber, provozni veci si pred cestou radeji over.</p>
      </section>
      {(["okoli", "zazitkove", "specializovane"] as Restaurant["category"][]).map((category) => (
        <section className="section-block" key={category}>
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
      <section className="section-block">
        <div className="section-heading">
          <h2>Co ochutnat</h2>
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
