"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Menu, X } from "lucide-react"

interface MobileNavProps {
  currentPath?: string
}

export default function MobileNav({ currentPath = "/" }: MobileNavProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: "/", label: "Today" },
    { href: "/calendar", label: "Calendar" },
    { href: "/analytics", label: "Analytics" },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Desktop Nav */}
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="text-lg sm:text-xl font-bold text-gray-900">
              One Last
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm ${
                    currentPath === link.href
                      ? "text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User Info and Mobile Menu Button */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="hidden sm:inline text-xs sm:text-sm text-gray-600 truncate max-w-[150px]">
              {session?.user?.email}
            </span>
            <Link
              href="/api/auth/signout"
              className="hidden sm:inline text-xs sm:text-sm text-gray-500 hover:text-gray-700"
            >
              Sign Out
            </Link>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 rounded-md text-base ${
                  currentPath === link.href
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 py-2 border-t border-gray-200 mt-3 pt-3">
              <div className="text-xs text-gray-500 mb-2 truncate">
                {session?.user?.email}
              </div>
              <Link
                href="/api/auth/signout"
                onClick={() => setIsOpen(false)}
                className="block text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

