import { useCheckAuth } from './hooks/useCheckAuth';
import  AppRoutes  from './routes/AppRoutes';

function App() {
  useCheckAuth(); // Kiểm tra auth khi app load

  return <AppRoutes />;
}

export default App;