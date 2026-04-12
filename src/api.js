const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function uploadToCloudinary(file, cloudName, uploadPreset) {
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body },
  );

  if (!response.ok) {
    throw new Error("Image upload to Cloudinary failed");
  }

  const data = await response.json();
  return data.secure_url;
}

export async function createRestaurant(payload) {
  const response = await fetch(`${API_BASE}/api/restaurants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to save restaurant (${response.status}): ${errorText || "Unknown server error"}`,
    );
  }

  return response.json();
}

export async function createMenuItems(restaurantId, items) {
  const results = await Promise.all(
    items.map((item) =>
      fetch(`${API_BASE}/api/menus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          menu_name: item.menuName,
          description: item.description,
          price: Number(item.price),
          is_available: item.is_available,
        }),
      }),
    ),
  );

  const failed = results.find((r) => !r.ok);
  if (failed) {
    const errorText = await failed.text();
    throw new Error(
      `Failed to save one or more menu items (${failed.status}): ${errorText || "Unknown server error"}`,
    );
  }
}

export async function getRestaurants() {
  const response = await fetch(`${API_BASE}/api/restaurants`);
  if (!response.ok) {
    throw new Error(`Failed to fetch restaurants (${response.status})`);
  }
  return response.json();
}

export async function getMenusByRestaurant(restaurantId) {
  const response = await fetch(
    `${API_BASE}/api/menus?restaurant_id=${restaurantId}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch menus (${response.status})`);
  }
  return response.json();
}

export async function deleteRestaurant(id) {
  const response = await fetch(`${API_BASE}/api/restaurants/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete restaurant (${response.status})`);
  }
}

export async function deleteMenuItem(id) {
  const response = await fetch(`${API_BASE}/api/menus/items/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`Failed to delete menu item (${response.status})`);
  }
}

export async function updateRestaurant(id, payload) {
  const response = await fetch(`${API_BASE}/api/restaurants/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update restaurant (${response.status}): ${errorText || "Unknown error"}`,
    );
  }
  return response.json();
}

export async function updateMenuItem(id, payload) {
  const response = await fetch(`${API_BASE}/api/menus/items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update menu item (${response.status}): ${errorText || "Unknown error"}`,
    );
  }
  return response.json();
}
