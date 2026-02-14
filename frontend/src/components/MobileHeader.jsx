import React from 'react';
import NotificationIcon from "../assets/icon_notification.png";

export default function MobileHeader({
    onLeftClick,
    leftIcon,
    title,
    rightIcon
}) {
    return (
        <div className="w-full flex items-center justify-between p-4 bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
            <button onClick={onLeftClick} className="p-2 text-[#0D4E96]">
                {leftIcon ? leftIcon : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                )}
            </button>

            <div className="text-center">
                {title ? title : (
                    <h1 className="text-[24px] font-bold tracking-tight text-[#0D4E96]">
                        Authen<span className="text-[#2CA4D6]">tiks</span>
                    </h1>
                )}
            </div>

            <button className="p-2">
                {rightIcon ? rightIcon : (
                    <img src={NotificationIcon} alt="Notifications" className="w-6 h-6 object-contain" />
                )}
            </button>
        </div>
    );
}
