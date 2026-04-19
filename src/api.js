import { auth } from "./firebase";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function authHeaders() {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

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
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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
    items.map(async (item) =>
      fetch(`${API_BASE}/api/menus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeaders()),
        },
        body: JSON.stringify({
          restaurant_id: restaurantId,
          menu_name: item.menuName,
          description: item.description,
          price: Number(item.price),
          is_available: item.is_available,
          image_url: item.image_url ?? null,
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
  const response = await fetch(`${API_BASE}/api/restaurants`, {
    headers: { ...(await authHeaders()) },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch restaurants (${response.status})`);
  }
  return response.json();
}

export async function getRestaurantsWithMenus() {
  const response = await fetch(`${API_BASE}/api/restaurants/with-menus`, {
    headers: { ...(await authHeaders()) },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch restaurants with menus (${response.status})`,
    );
  }
  const data = await response.json();
  return data;
}

export async function deleteRestaurant(id) {
  const response = await fetch(`${API_BASE}/api/restaurants/${id}`, {
    method: "DELETE",
    headers: { ...(await authHeaders()) },
  });
  if (!response.ok) {
    throw new Error(`Failed to delete restaurant (${response.status})`);
  }
}

export async function deleteMenuItem(id) {
  const response = await fetch(`${API_BASE}/api/menus/items/${id}`, {
    method: "DELETE",
    headers: { ...(await authHeaders()) },
  });
  if (!response.ok) {
    throw new Error(`Failed to delete menu item (${response.status})`);
  }
}

export async function updateMenuItem(id, payload) {
  const response = await fetch(`${API_BASE}/api/menus/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
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

export async function getOrders() {
  const response = await fetch(`${API_BASE}/api/orders/all`, {
    headers: { ...(await authHeaders()) },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch orders (${response.status})`);
  }
  return response.json();
}

export async function getOrderSummary(orderId) {
  const response = await fetch(
    `${API_BASE}/api/orders/${orderId}/restaurant-summary`,
    { headers: { ...(await authHeaders()) } },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch order summary (${response.status})`);
  }
  return response.json();
}
