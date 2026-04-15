export default function CategoryRail({ categories, activeCategory, onSelect }) {
  return (
    <section className="category-rail">
      <div className="shell category-rail__inner">
        <button
          type="button"
          className={activeCategory ? "category-pill" : "category-pill active"}
          onClick={() => onSelect("")}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={activeCategory === category.slug ? "category-pill active" : "category-pill"}
            onClick={() => onSelect(category.slug)}
          >
            <span>{category.name}</span>
            <small>{category.productCount}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

