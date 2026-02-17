import React from "react";
import { Outlet } from "react-router-dom";
import MobileNavbar from "./MobileNavbar";

export default function MobileLayout() {
    return (
        <div className="flex flex-col h-screen w-full overflow-hidden">
            <div className="flex-1 overflow-y-auto">
                <Outlet />
            </div>
            <MobileNavbar />
        </div>
    );
}
