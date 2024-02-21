// In App.js
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import Theme from './src/theme/theme';
import AppNavigator from './src/navigation/AppNavigator'; // Assuming you have a navigator
import { UserProvider } from './src/UserContext';

const App = () => (
  <PaperProvider theme={Theme}>
        <UserProvider>

    <AppNavigator />
    </UserProvider>

  </PaperProvider>
);

export default App;
