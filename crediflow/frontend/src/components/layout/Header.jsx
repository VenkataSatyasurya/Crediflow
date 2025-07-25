import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

const Header = ({ onMenuClick }) => {
  const { user, logoutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-[var(--color-primary)] flex items-center justify-between lg:justify-end px-4 lg:px-6">
      {/* Mobile menu */}
      <button className="lg:hidden text-gray-600 text-xl" onClick={onMenuClick}>
        ☰
      </button>

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 focus:outline-none cursor-pointer"
        >
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>

          {/* Name */}
          <span className="hidden sm:block text-sm font-medium text-[var(--color-text-muted)]">
            {user?.name}
          </span>
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-[var(--color-surface)] rounded-md shadow overflow-hidden z-50">
            <div className="px-4 py-2 border-b border-gray-800">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{user?.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {user?.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : "User"}
              </p>
            </div>

            <button
              onClick={logoutUser}
              className="w-full text-left px-4 py-2 text-sm text-red-600 cursor-pointer hover:bg-red-200 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
