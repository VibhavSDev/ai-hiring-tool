import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="mb-4 flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to="/"
            className="text-slate-500 hover:text-indigo-400 transition-colors"
          >
            <Home size={14} />
          </Link>
        </li>
        
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;

          return (
            <li key={to} className="flex items-center">
              <ChevronRight size={14} className="text-slate-600 mx-1" />
              {last ? (
                <span className="text-xs font-medium text-slate-300 capitalize">
                  {value.replace(/-/g, " ")}
                </span>
              ) : (
                <Link
                  to={to}
                  className="text-xs font-medium text-slate-500 hover:text-indigo-400 transition-colors capitalize"
                >
                  {value.replace(/-/g, " ")}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;