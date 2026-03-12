import { useLocalSearchParams } from 'expo-router';
// Import your pages from outside the app folder
import {HomeScreen} from '../pages/Landing'
import {Shop} from '../pages/Shop';
import {Categories} from '../pages/Categories';
import {Cart} from '../pages/Cart';
import {SurveyForm} from '../pages/SurveyForm';
import {Checkout} from '../pages/Checkout';

export default function RouterGate() {
  const { screen } = useLocalSearchParams();

  // If the path is empty or just '/', show Home
  if (!screen || screen === 'index') return <HomeScreen />;

  // Switch based on the URL name
  switch (screen[0]) {
    case 'shop': return <Shop />;
    case 'categories': return <Categories />;
    case 'cart': return <Cart />;
    case 'survey': return <SurveyForm />;
    case 'checkout': return <Checkout />;
    default: return <HomeScreen />; // Default back to Home if route is wrong
  }
}