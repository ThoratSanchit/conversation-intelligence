import React, { createContext, useContext, useState, useEffect } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (to: string) => void;
  page: 'overview' | 'leads' | 'lead-detail' | 'import';
  params: { leadId?: string };
}

const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  navigate: () => {},
  page: 'overview',
  params: {},
});

function parsePath(path: string): { page: 'overview' | 'leads' | 'lead-detail' | 'import'; params: { leadId?: string } } {
  const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';
  
  if (cleanPath === '/' || cleanPath === '') {
    return { page: 'overview', params: {} };
  }
  if (cleanPath === '/leads') {
    return { page: 'leads', params: {} };
  }
  if (cleanPath.startsWith('/leads/')) {
    const leadId = cleanPath.replace('/leads/', '').trim();
    if (leadId) {
      return { page: 'lead-detail', params: { leadId } };
    }
  }
  if (cleanPath === '/import') {
    return { page: 'import', params: {} };
  }

  // Fallback to overview
  return { page: 'overview', params: {} };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to !== currentPath) {
      window.history.pushState({}, '', to);
      setCurrentPath(to);
      window.scrollTo(0, 0);
    }
  };

  const { page, params } = parsePath(currentPath);

  return (
    <RouterContext.Provider value={{ currentPath, navigate, page, params }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => useContext(RouterContext);

export const Link: React.FC<{
  to: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}> = ({ to, className, children, onClick }) => {
  const { navigate } = useRouter();

  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        if (onClick) onClick();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
};
