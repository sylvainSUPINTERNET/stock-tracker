import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider, extendTheme, Center, Box, HStack, VStack, Text, View} from "native-base";

const newColorTheme = {
  brand: {
    900: "#8287af",
    800: "#7c83db",
    700: "#b3bef6",
  }
};
const customTheme = extendTheme({ colors: newColorTheme });

export default function App() {
  return (
    <NativeBaseProvider theme={customTheme}>

      {/* <View style={styles.container}> */}

      <View style={{marginTop: 35}}>

        <HStack>
          <Box flex={1} bg={"amber.100"} style={{"padding": 20}}>
            <Center>
              <Text fontSize="4xl" >STOCK TRACKER</Text>
            </Center>
          </Box>
        </HStack>

      </View>

    </NativeBaseProvider>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
