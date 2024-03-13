// In theme/theme.js
import { DefaultTheme } from 'react-native-paper';

const Theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: '#656CA7',
      accent: '#f1c40f',
      secondary: '#744248',
      info: '#A7658E', 
      button: '#65A77E'
    },
  };


//   #4F8EF7
export default Theme;
