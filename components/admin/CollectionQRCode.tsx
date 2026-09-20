"use client";

import { QRCodeSVG } from "qrcode.react";

type CollectionQRCodeProps = {
  code: string;
  boothName: string;
  cardName: string;
};

export default function CollectionQRCode({
  code,
  boothName,
  cardName,
}: CollectionQRCodeProps) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="rounded-2xl border border-[#E7E5DF] bg-white p-5">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">
          <p className="text-base font-semibold text-[#20231F]">
            {boothName}
          </p>

          <p className="mt-1 text-sm text-[#77766F]">
            {cardName}
          </p>
        </div>

        {/* QR */}
        <div className="rounded-2xl border border-[#E8E5DE] bg-white p-4">
          <QRCodeSVG
            value={code}
            size={220}
            level="H"
            includeMargin
          />
        </div>

        {/* CODE */}
        <p className="mt-4 font-mono text-sm font-semibold tracking-wide text-[#20231F]">
          {code}
        </p>

        <p className="mt-1 text-xs text-[#99968D]">
          Scan this QR at the booth
        </p>

        {/* ACTION */}
        <button
          type="button"
          onClick={handlePrint}
          className="mt-5 rounded-full bg-[#20231F] px-5 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
        >
          Print QR
        </button>
      </div>
    </div>
  );
}