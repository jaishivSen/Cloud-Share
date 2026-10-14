import React, { useContext, useRef, useState, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { useAuth, useUser } from "@clerk/clerk-react";
import { UserCreditsContext } from "../context/UserCreditsContext";
import { AlertCircle, Check, CreditCard, Loader2 } from "lucide-react";
import axios from "axios";
import { apiEndpoints } from "../util/apiEndpoints";

const Subscription = () => {
  const [processingPayment, setProcessingPayment] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const { getToken } = useAuth();
  const razorpayScriptRef = useRef(null);

  const { credits, setCredits,fetchUserCredits } = useContext(UserCreditsContext);
  const {user}=useUser();

  const plans = [
    {
      id: "premium",
      name: "Premium",
      credits: 500,
      price: 500,
      features: [
        "Upload up to 500 files",
        "Access to all basic features",
        "Priority support"
      ],
      recommended: false,
    },
    {
      id: "ultimate",
      name: "Ultimate",
      credits: 5000,
      price: 2500,
      features: [
        "Upload up to 5000 files",
        "Access to all premium features",
        "Priority support",
        "Advanced analytics"
      ],
      recommended: true,
    }
  ];

  // ---------------- Load Razorpay Script ----------------
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;

      script.onload = () => {
        setRazorpayLoaded(true);
      };

      script.onerror = () => {
        setMessage("Payment gateway failed to load. Please refresh the page and try again.");
        setMessageType("error");
      };

      document.body.appendChild(script);
      razorpayScriptRef.current = script;
    } else {
      setRazorpayLoaded(true);
    }

    return () => {
      if (razorpayScriptRef.current) {
        document.body.removeChild(razorpayScriptRef.current);
      }
    };
  }, []);

  // ---------------- Load User Credits ----------------
  useEffect(() => {
    const fetchUserCredits = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(apiEndpoints.GET_CREDITS, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCredits(response.data.credits);
      } catch (error) {
        setMessage("Failed to load your current credits. Please try again later.");
        setMessageType("error");
      }
    };

    fetchUserCredits();
  }, [getToken]);

  const handlePurchase = async (plan)=>{
    if(!razorpayLoaded){
      setMessage('Payment gateway is still loading. Please wait a moment and try again.');
      setMessageType("error");
      return;
    }

    setProcessingPayment(true);
    setMessage("");

    try {
      const token=await getToken();
       const response= await axios.post(
        apiEndpoints.CREATE_ORDER,
        {
          planId: plan.id,
          amount: plan.price * 100,
          currency: "INR",
          credits: plan.credits
        }, {
          headers:{
            'Authorization':`Bearer ${token}`
          }
        }
       );    
       
       const options={
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: plan.price * 100,
        currency: "INR",
        name: "SkySync",
        description:`Purchase ${plan.credits} credits`,
        order_id: response.data.orderId,

        handler: async function (response) {
  try {
    // 1. Send verification details to backend
    const verifyResponse = await axios.post(
      apiEndpoints.VERIFY_PAYMENT,
      {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        planId: plan.id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Verify response:", verifyResponse.data);

    // 2. If verification successful
    if (verifyResponse.data.success) {
      // If backend returned new credits directly
      if (verifyResponse.data.credits) {
        console.log(
          "Updating credits from response:",
          verifyResponse.data.credits
        );
        setCredits(verifyResponse.data.credits);
      } else {
        // Otherwise fetch credits from server
        console.log(
          "Credits not in response, fetching latest credits..."
        );
        await fetchUserCredits();
      }

      setMessage(`Payment successful! ${plan.name} plan activated.`);
      setMessageType("success");
    } else {
      setMessage(
        "Payment verification failed. Please contact support."
      );
      setMessageType("error");
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    setMessage("Payment verification failed. Please contact support.");
    setMessageType("error");
  }
},
    prefill:{
      name:user.fullName,
      email:user.primaryEmailAddress
    },

    theme:{
      color:"#3B82F6"
    }
    };
    if(window.Razorpay){
      const razorpay=new window.Razorpay(options);
      razorpay.open();
    }
    else{
      throw new Error('Razorpay SDK not loaded');
    }

    } catch (error) {
      console.error("Payment initation error:",error);
      setMessage("Failed to initiate payment. Please try again later.");
      setMessageType("error");
    }
   finally{
    setProcessingPayment(false);
   }
  }

  return (
    <DashboardLayout activeMenu="Subscription">
      <div className="p-6">

        {/* ---------------- Title ---------------- */}
        <h1 className="text-2xl font-bold mb-1">Subscription Plans</h1>
        <p className="text-gray-600 mb-6">Choose a plan that works for you</p>

        {/* ---------------- Message ---------------- */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              messageType === "error"
                ? "bg-red-50 text-red-700"
                : messageType === "success"
                ? "bg-green-50 text-green-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {messageType === "error" && <AlertCircle size={20} />}
            {message}
          </div>
        )}

        {/* ---------------- Current Credits Box ---------------- */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-10 w-full md:w-[420px]">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="text-purple-600" />
            <h2 className="text-lg font-semibold">
              Current Credits:{" "}
              <span className="font-bold text-purple-600">{credits}</span>
            </h2>
          </div>
          <p className="text-sm text-gray-600">
            You can upload {credits} more files with your current credits.
          </p>
        </div>

        {/* ---------------- Plan Cards ---------------- */}
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl p-6 border transition-all ${
                plan.recommended
                  ? "border-purple-300 bg-purple-50 shadow-lg"
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan.recommended && (
                <div className="px-3 py-1 inline-block bg-purple-600 text-white text-xs rounded-full mb-3">
                  RECOMMENDED
                </div>
              )}

              <h3 className="text-xl font-bold">{plan.name}</h3>

              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">₹{plan.price}</span>
                <span className="text-gray-500 ml-1">
                  for {plan.credits} credits
                </span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check size={18} className="text-green-500 mt-1 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(plan)}
                disabled={processingPayment}
                className={`w-full py-2 rounded-md font-medium flex items-center justify-center gap-2 transition ${
                  plan.recommended
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-white border border-purple-500 text-purple-600 hover:bg-purple-50"
                } disabled:opacity-50`}
              >
                {processingPayment ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Processing</span>
                  </>
                ) : (
                  "Purchase Plan"
                )}
              </button>
            </div>
          ))}
        </div>

        {/* ---------------- How Credits Work ---------------- */}
        <div className="mt-10 bg-gray-50 p-5 rounded-xl border border-gray-200">
          <h3 className="font-semibold mb-2 text-lg">How credits work</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Each file upload consumes 1 credit. New users start with 5 free credits.
            Credits never expire and can be used at any time. If you run out of credits,
            you can purchase more through one of our plans above.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
