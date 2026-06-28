import React, { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import MobileNavbar from "./MobileNavbar";

export default function MobileLayout() {
    const location = useLocation();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [location.pathname]);

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
                <Outlet />
            </div>
            <MobileNavbar />
        </div>
    );
}
