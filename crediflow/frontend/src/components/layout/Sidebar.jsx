import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();

  const commonMenu = [
    { name: "Dashboard", path: "/" },
    { name: "Loans", path: "/loans" },
  ];

  const customerMenu = [
    { name: "Create Loan", path: "/loans/create" },
    { name: "Payments", path: "/payments" },
  ];

  const adminMenu = [
    { name: "Loan Approvals", path: "/admin/loans" },
  ];

  const menu =
    user?.role === "admin"
      ? [...commonMenu, ...adminMenu]
      : [...commonMenu, ...customerMenu];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-50 inset-y-0 left-0 w-64 bg-[var(--color-primary)] transform transition-transform
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="h-16 flex items-center px-6">
          <span className="text-xl font-semibold text-[var(--color-text-primary)]">
            CredFlow
          </span>
        </div>

        <nav className="p-4 space-y-1">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`block rounded-md px-4 py-3 text-sm font-medium transition
                ${
                  location.pathname === item.path
                    ? "bg-[var(--color-surface)] text-[var(--color-accent)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-accent)]"
                }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
