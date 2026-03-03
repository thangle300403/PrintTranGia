
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Layout from './Layout';

const ProtectedRoute: React.FC = () => {
    const { currentUser } = useData();

    if (!currentUser) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them along to that page after they login.
        return <Navigate to="/login" replace />;
    }
    
    // If logged in, render the main layout which contains the Outlet for nested routes.
    return (
        <Layout>
            <Outlet />
        </Layout>
    );
};

export default ProtectedRoute;
