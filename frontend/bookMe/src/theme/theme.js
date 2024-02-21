// In theme/theme.js
import { DefaultTheme } from 'react-native-paper';

const Theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#3498db', // Customize your main theme color
        accent: '#f1c40f', // Customize your accent color
    },
};

export default Theme;
