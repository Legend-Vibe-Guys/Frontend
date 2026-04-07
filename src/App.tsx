import { RouterProvider } from 'react-router-dom';
import router from './router/Path-Router';
import { AuthProvider } from './store/AuthContext';
import { AppDataProvider } from './store/AppDataContext';

function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <RouterProvider router={router} />
      </AppDataProvider>
    </AuthProvider>
  );
}

export default App;
