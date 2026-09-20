"use client";

import { QRCodeSVG } from "qrcode.react";

type PassportQRCodeProps = {
  value: string;
};

export default function PassportQRCode({
  value,
}: PassportQRCodeProps) {
  return (
    <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-ivory p-3 sm:h-32 sm:w-32">
      <div className="rounded-lg bg-white p-1">
        <QRCodeSVG
          value={value}
          size={104}
          bgColor="#FFFFFF"
          fgColor="#17382A"
          level="H"
          includeMargin
        />
      </div>
    </div>
  );
}