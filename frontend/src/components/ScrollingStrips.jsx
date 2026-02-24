// ============================================================
//  ScholarAgent — Vertical Scrolling Text Strips
//  Two vertical marquee strips (left & right) with colourful
//  segments and continuously flowing text.
// ============================================================

import React from 'react';

const STRIP_ITEMS = [
    { text: '✦ SCHOLARAGENT', color: '#e53e3e' },   // Red
    { text: 'AI GOVERNED', color: '#1a1a2e' },   // Dark navy
    { text: '✦ ZERO FRAUD', color: '#38a169' },   // Green
    { text: 'SMART CONTRACT', color: '#d69e2e' },   // Gold
    { text: '✦ MERIT BASED', color: '#805ad5' },   // Purple
    { text: 'ALGORAND CHAIN', color: '#2b6cb0' },   // Blue
    { text: '✦ PERA WALLET', color: '#e53e3e' },   // Red
    { text: 'INDIA FIRST', color: '#ff8c00' },   // Orange
    { text: '✦ SCHOLAR TOKEN', color: '#1a1a2e' },   // Dark navy
    { text: 'ZERO HUMANS', color: '#38a169' },   // Green
    { text: '✦ OPEN TREASURY', color: '#d69e2e' },   // Gold
    { text: 'POLICY CHECK', color: '#2b6cb0' },   // Blue
    { text: '✦ EMPOWER YOUTH', color: '#e53e3e' },   // Red
    { text: 'ON-CHAIN AUDIT', color: '#805ad5' },   // Purple
    { text: '✦ FAIR & FAST', color: '#38a169' },   // Green
    { text: 'IPFS VERIFIED', color: '#1a1a2e' },   // Dark navy
    { text: '✦ TRUSTLESS', color: '#ff8c00' },   // Orange
    { text: 'AUTO APPROVE', color: '#2b6cb0' },   // Blue
    { text: '✦ CHANGE INDIA', color: '#e53e3e' },   // Red
    { text: 'DECENTRALIZED', color: '#805ad5' },   // Purple
    { text: '✦ INCORRUPTIBLE', color: '#d69e2e' },   // Gold
    { text: 'ATOMIC TX', color: '#38a169' },   // Green
    { text: '✦ FUTURE SCHOLARS', color: '#1a1a2e' },   // Dark navy
    { text: 'BUILD DIFFERENT', color: '#ff8c00' },   // Orange
    { text: '✦ AGENTIC COMMERCE', color: '#2b6cb0' },   // Blue
    { text: 'NO MIDDLEMEN', color: '#e53e3e' },   // Red
    { text: '✦ PYTEAL RULES', color: '#805ad5' },   // Purple
    { text: 'DREAM BIG', color: '#d69e2e' },   // Gold
    { text: '✦ TECH FOR GOOD', color: '#38a169' },   // Green
    { text: 'REAL IMPACT', color: '#1a1a2e' },   // Dark navy
];

const StripContent = () => (
    <>
        {STRIP_ITEMS.map((item, i) => (
            <div
                key={i}
                className="strip-segment"
                style={{ backgroundColor: item.color }}
            >
                <span>{item.text}</span>
            </div>
        ))}
    </>
);

const ScrollingStrips = () => {
    return (
        <>
            {/* Left Strip — scrolls upward */}
            <div className="scrolling-strip strip-left" aria-hidden="true">
                <div className="strip-track strip-track-up">
                    <StripContent />
                    <StripContent />
                </div>
            </div>

            {/* Right Strip — scrolls downward */}
            <div className="scrolling-strip strip-right" aria-hidden="true">
                <div className="strip-track strip-track-down">
                    <StripContent />
                    <StripContent />
                </div>
            </div>
        </>
    );
};

export default ScrollingStrips;
