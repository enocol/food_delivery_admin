function MenuItemCard({ item, index, totalItems, onChange, onRemove }) {
  return (
    <div className="menu-item-card">
      <div className="menu-item-card-header">
        <span className="menu-item-label">Item {index + 1}</span>
        {totalItems > 1 && (
          <button type="button" className="remove-item-btn" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>

      <label htmlFor={`menuName-${index}`}>Menu Name</label>
      <input
        id={`menuName-${index}`}
        name="menuName"
        type="text"
        value={item.menuName}
        onChange={onChange}
        required
      />

      <label htmlFor={`description-${index}`}>Description</label>
      <textarea
        id={`description-${index}`}
        name="description"
        rows={3}
        value={item.description}
        onChange={onChange}
        required
      />

      <label htmlFor={`price-${index}`}>Price (XAF)</label>
      <input
        id={`price-${index}`}
        name="price"
        type="number"
        min="0"
        step="1"
        value={item.price}
        onChange={onChange}
        required
      />

      <label htmlFor={`image-${index}`}>Image</label>
      <input
        id={`image-${index}`}
        name="image"
        type="file"
        accept="image/*"
        onChange={onChange}
      />

      <div className="checkbox-row">
        <input
          id={`is_available-${index}`}
          name="is_available"
          type="checkbox"
          checked={item.is_available}
          onChange={onChange}
        />
        <label htmlFor={`is_available-${index}`}>Available</label>
      </div>
    </div>
  )
}

export default MenuItemCard
