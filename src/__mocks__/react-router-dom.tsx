import React from 'react';

export const BrowserRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Routes = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Route = ({ element }: { element: React.ReactNode }) => <>{element}</>;
export const NavLink = ({ children, to }: { children: React.ReactNode; to: string }) => (
  <a href={to}>{children}</a>
);
export const useLocation = () => ({ pathname: '/' });
export const useNavigate = () => jest.fn();
export const useParams = () => ({});
