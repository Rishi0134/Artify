import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { shopApi } from "../utils/shopApi";
import "./Shop.css";

const initialAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], amounts: { total: 0 } });
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [address, setAddress] = useState(initialAddress);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await shopApi.getCart();
        const payload = response.data || { items: [], amounts: { total: 0 } };
        setCart(payload);
        if (!payload.items.length) {
          navigate("/cart", { replace: true });
        }
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load cart");
      }
    };

    loadCart();
  }, [navigate]);

  const placeOrder = async () => {
    try {
      setSubmitting(true);
      setError("");

      const initResponse = await shopApi.createCheckout({
        paymentMethod,
        shippingAddress: address,
      });

      if (!initResponse.data?.paymentRequired) {
        navigate("/my-orders", { replace: true });
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load");
      }

      const checkout = initResponse.data.checkout;

      const rzp = new window.Razorpay({
        key: checkout.key,
        amount: checkout.amount,
        currency: checkout.currency || "INR",
        order_id: checkout.gatewayOrderId,
        name: "Artify Virtual Art Gallery",
        description: "Painting purchase",
        handler: async (response) => {
          await shopApi.verifyCheckout({
            ...response,
            shippingAddress: address,
          });
          navigate("/my-orders", { replace: true });
        },
        prefill: {
          name: address.fullName,
          contact: address.phone,
        },
        theme: {
          color: "#ff4c60",
        },
      });

      rzp.on("payment.failed", (failedResponse) => {
        setError(
          failedResponse?.error?.description ||
            failedResponse?.error?.reason ||
            "Payment failed"
        );
      });

      rzp.open();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="shop-page">
      <h1>Checkout</h1>
      {error && <p className="shop-error">{error}</p>}

      <div className="checkout-grid">
        <div className="checkout-form">
          <h2>Shipping Address</h2>
          {Object.keys(initialAddress).map((key) => (
            <input
              key={key}
              value={address[key]}
              placeholder={key}
              onChange={(e) => setAddress((prev) => ({ ...prev, [key]: e.target.value }))}
            />
          ))}

          <h2>Payment Method</h2>
          <div className="shop-radio-row">
            <label>
              <input
                type="radio"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
              />
              Razorpay
            </label>
            <label>
              <input
                type="radio"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>
          </div>
        </div>

        <div className="shop-summary">
          <h2>Order Summary</h2>
          {cart.items.map((item) => (
            <p key={item.artwork?._id}>
              {item.artwork?.title} x {item.quantity} = Rs. {item.subtotal}
            </p>
          ))}
          <p>Subtotal: Rs. {cart.amounts?.subtotal || 0}</p>
          <p>Total: Rs. {cart.amounts?.total || 0}</p>
          <button type="button" onClick={placeOrder} disabled={submitting}>
            {submitting ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Checkout;
