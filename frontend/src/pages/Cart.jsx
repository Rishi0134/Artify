import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/api";
import { shopApi } from "../utils/shopApi";
import "./Shop.css";

const FALLBACK_ARTWORK_IMAGE = "https://via.placeholder.com/200x200?text=Artwork";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], amounts: { subtotal: 0, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await shopApi.getCart();
      setCart(response.data || { items: [], amounts: { subtotal: 0, total: 0 } });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const updateQuantity = async (artworkId, quantity) => {
    try {
      setError("");
      const response = await shopApi.updateCartItem(artworkId, quantity);
      setCart(response.data || cart);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to update quantity");
    }
  };

  const removeItem = async (artworkId) => {
    try {
      setError("");
      const response = await shopApi.removeCartItem(artworkId);
      setCart(response.data || cart);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Failed to remove item");
    }
  };

  const itemsCount = useMemo(
    () => cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cart.items]
  );

  return (
    <section className="shop-page">
      <h1>Cart</h1>
      {loading && <p>Loading cart...</p>}
      {error && <p className="shop-error">{error}</p>}

      {!loading && cart.items.length === 0 && (
        <p>
          Your cart is empty. <Link to="/gallery">Go to gallery</Link>
        </p>
      )}

      {!loading && cart.items.length > 0 && (
        <>
          <div className="shop-list">
            {cart.items.map((item) => (
              <article className="shop-item" key={item.artwork?._id || item._id}>
                <img
                  src={getImageUrl(item.artwork?.image) || FALLBACK_ARTWORK_IMAGE}
                  alt={item.artwork?.title || "Artwork"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_ARTWORK_IMAGE;
                  }}
                />
                <div className="shop-item-body">
                  <h3>{item.artwork?.title || "Artwork"}</h3>
                  <p>Rs. {item.price}</p>
                  <div className="shop-qty">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.artwork?._id, Number(item.quantity || 1) - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.artwork?._id, Number(item.quantity || 1) + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button type="button" className="shop-link-like" onClick={() => removeItem(item.artwork?._id)}>
                    Remove
                  </button>
                </div>
                <p className="shop-price">Rs. {item.subtotal}</p>
              </article>
            ))}
          </div>

          <div className="shop-summary">
            <p>Items: {itemsCount}</p>
            <p>Subtotal: Rs. {cart.amounts?.subtotal || 0}</p>
            <p>Total: Rs. {cart.amounts?.total || 0}</p>
            <button type="button" onClick={() => navigate("/checkout")}>
              Proceed To Checkout
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default Cart;
