import React from 'react';
import { getStoredCompanyProfile } from '../utils/companyStorage';

interface OfficialCorporateSealBadgeProps {
  size?: number;
  color?: string;
  showDirectorStamp?: boolean;
  directorName?: string;
  className?: string;
}

export const OfficialCorporateSealBadge: React.FC<OfficialCorporateSealBadgeProps> = ({
  size = 120,
  color = '#4c1d95',
  showDirectorStamp = true,
  directorName = 'AMIT KUMAR',
  className = '',
}) => {
  const profile = getStoredCompanyProfile();
  const companyName = (profile.companyName || 'GCAP PRIVATE LIMITED').toUpperCase();
  const cinNumber = (profile.cin || 'U66190BR2026OPC088307').toUpperCase();
  const city = (profile.sealCity || 'SASARAM (BIHAR)').toUpperCase();

  return (
    <div className={`flex flex-col items-center justify-center gap-1.5 ${className}`}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 300 300"
          width={size}
          height={size}
          className="drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Top Text Path */}
            <path
              id="sealTopPath"
              d="M 35,150 A 115,115 0 1,1 265,150"
              fill="none"
            />
            {/* Bottom Text Path */}
            <path
              id="sealBottomPath"
              d="M 265,150 A 115,115 0 1,1 35,150"
              fill="none"
            />
          </defs>

          {/* Outer Thick Border Circle */}
          <circle cx="150" cy="150" r="142" fill="none" stroke={color} strokeWidth="6" />
          {/* Outer Thin Border Circle */}
          <circle cx="150" cy="150" r="134" fill="none" stroke={color} strokeWidth="2" />
          {/* Inner Border Circle */}
          <circle cx="150" cy="150" r="92" fill="none" stroke={color} strokeWidth="3" />
          {/* Inner Thin Circle */}
          <circle cx="150" cy="150" r="85" fill="none" stroke={color} strokeWidth="1.5" />

          {/* Top Arc Text: Company Name */}
          <text fill={color} fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="0.8">
            <textPath href="#sealTopPath" startOffset="50%" textAnchor="middle">
              {companyName}
            </textPath>
          </text>

          {/* Bottom Arc Text: City & CIN */}
          <text fill={color} fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="0.8">
            <textPath href="#sealBottomPath" startOffset="50%" textAnchor="middle">
              ★ {city} ★ CIN: {cinNumber}
            </textPath>
          </text>

          {/* Center Text / Emblem */}
          <text x="150" y="125" textAnchor="middle" fill={color} fontSize="22" fontWeight="900" fontFamily="Arial, sans-serif">
            GCAP
          </text>
          <text x="150" y="145" textAnchor="middle" fill={color} fontSize="13">
            ★ ★ ★
          </text>
          <text x="150" y="165" textAnchor="middle" fill={color} fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif">
            CORPORATE SEAL
          </text>
          <text x="150" y="182" textAnchor="middle" fill={color} fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">
            REGISTERED COMPANY
          </text>
        </svg>

        {/* Cursive Signature Overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-12deg]"
          style={{ color }}
        >
          <span className="text-xl sm:text-2xl font-bold italic font-serif opacity-90 underline decoration-wavy">
            {directorName.split(' ')[0]}
          </span>
        </div>
      </div>

      {showDirectorStamp && (
        <div
          className="px-2.5 py-1 rounded border border-dashed text-[9px] font-bold text-center leading-tight uppercase"
          style={{ borderColor: color, color }}
        >
          <div>FOR GCAP PRIVATE LIMITED</div>
          <div className="font-extrabold text-[10px] my-0.5">{directorName}</div>
          <div className="text-[8px] opacity-90">DIRECTOR / AUTHORIZED SIGNATORY</div>
        </div>
      )}
    </div>
  );
};
