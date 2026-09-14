"use client";

import Script from "next/script";

/**
 * GoatCounter analytics (https://www.goatcounter.com) — EUPL-licensed,
 * cookie-free, and stores no personal data.
 *
 * Set NEXT_PUBLIC_GOATCOUNTER_CODE to your site code (the `YOURCODE` in
 * https://YOURCODE.goatcounter.com) to switch it on. While that variable is
 * unset this renders nothing and the site makes no analytics request at all,
 * so an unconfigured checkout stays completely tracker-free.
 *
 * The site code is public by design — it is the subdomain in the script URL —
 * so NEXT_PUBLIC_ is appropriate and no secret is exposed.
 *
 * To self-host instead, set NEXT_PUBLIC_GOATCOUNTER_URL to your own instance.
 */
const CODE = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;
const SELF_HOSTED_URL = process.env.NEXT_PUBLIC_GOATCOUNTER_URL;

export function GoatCounter() {
  if (!CODE) return null;

  const src = SELF_HOSTED_URL
    ? `${SELF_HOSTED_URL.replace(/\/$/, "")}/count.js`
    : "https://gc.zgo.at/count.js";

  return (
    <Script
      data-goatcounter={
        SELF_HOSTED_URL
          ? `${SELF_HOSTED_URL.replace(/\/$/, "")}/count`
          : `https://${CODE}.goatcounter.com/count`
      }
      src={src}
      strategy="afterInteractive"
    />
  );
}
