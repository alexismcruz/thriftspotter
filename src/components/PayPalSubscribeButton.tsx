"use client";

import Script from "next/script";
import { useState } from "react";

const PAYPAL_CLIENT_ID =
  "BAASe-F62wm2E8H7o5JWvDNAHqYCdWQrVpjLIENsxBVtuk6SIk0bhL5Sagvg87xelUNhv6tDlBE_4iw7ZA";

declare global {
  interface Window {
    paypal: any;
  }
}

type Props = { planId: string; containerId: string; dark?: boolean };

export default function PayPalSubscribeButton({ planId, containerId, dark = false }: Props) {
  const [success, setSuccess] = useState(false);

  function initButton() {
    if (!window.paypal) return;
    window.paypal
      .Buttons({
        style: { shape: "rect", color: "blue", layout: "vertical", label: "subscribe" },
        createSubscription: (_data: any, actions: any) =>
          actions.subscription.create({ plan_id: planId }),
        onApprove: (_data: any) => setSuccess(true),
      })
      .render(`#${containerId}`);
  }

  if (success) {
    return (
      <div className="text-center py-4 px-2">
        <p className="text-3xl mb-2">🎉</p>
        <p className={`font-bold ${dark ? "text-brand-700" : "text-white"}`}>You&apos;re subscribed!</p>
        <p className={`text-sm mt-1 ${dark ? "text-stone-500" : "text-brand-100"}`}>
          We&apos;ll get your listing featured within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <>
      <div id={containerId} className="mt-1" />
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`}
        data-sdk-integration-source="button-factory"
        onLoad={initButton}
      />
    </>
  );
}
