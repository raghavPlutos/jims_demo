import './App.css';
import { Routes, Route, BrowserRouter} from 'react-router-dom';
import HomeScreen from './components/Chabot/homeScreen'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/" element = { <HomeScreen />} />
        <Route path = "*" element = { <HomeScreen />} />
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;
