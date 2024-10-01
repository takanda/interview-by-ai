import React, { ReactNode } from "react"

export default function Card({ children, className = "" }
    : { children: ReactNode; className?: string }) {
    return (
        <div className={`bg-white shadow-lg rounded-lg ${className}`}>
            {children}
        </div>
    )
};