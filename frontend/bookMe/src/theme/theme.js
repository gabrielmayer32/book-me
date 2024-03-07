// In theme/theme.js
import { DefaultTheme } from 'react-native-paper';

const Theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: '#424874',
      accent: '#f1c40f',
      secondary: '#744248',
    },
  };


//   #4F8EF7
export default Theme;
