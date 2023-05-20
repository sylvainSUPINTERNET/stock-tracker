import firebase from "firebase/compat";
import { NativeBaseProvider, extendTheme, Center, Box, HStack, Text, View} from "native-base";
import { useEffect } from "react";
import { firebaseConfig } from "./firebase/firebase";

const newColorTheme = {
  brand: {
    900: "#8287af",
    800: "#7c83db",
    700: "#b3bef6",
  }
};
const customTheme = extendTheme({ colors: newColorTheme });

export default function App() {

  useEffect (() => {
    firebase.initializeApp(firebaseConfig);
    firebase.firestore().collection("users").add({
      "name": "toto"
    })
    // const usersRef = firebase.database().ref('users');

    // // Generate a unique key for the new user
    // const newUserKey = usersRef.push().key;
    
    // // Create the user object with the name "toto"
    // const user = {
    //   name: 'toto'
    // };
    
    // // Set the user object at the generated key
    // usersRef.child(newUserKey!).set(user)
    //   .then(() => {
    //     console.log('User inserted successfully!');
    //   })
    //   .catch((error:any) => {
    //     console.error('Error inserting user:', error);
    //   });
  });

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
