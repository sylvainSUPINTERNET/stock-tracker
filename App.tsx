import firebase from "firebase/compat";
import { NativeBaseProvider, extendTheme, Center, Box, HStack, Text, View, FormControl, Stack, Input, Container, Button, Icon} from "native-base";
import React, { useEffect } from "react";
import { firebaseConfig } from "./firebase/firebase";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
const newColorTheme = {
  brand: {
    900: "#8287af",
    800: "#7c83db",
    700: "#b3bef6",
  }
};
const customTheme = extendTheme({ colors: newColorTheme });

const addStock = (ev:any) => {
  console.log("addstock");
}

export default function App() {

  useEffect (() => {


    firebase.initializeApp(firebaseConfig);

    // firebase.firestore().collection("users").add({
    //   "name": "toto"
    // })

    firebase
    .firestore()
    .collection("XDe")
    .doc("TOTO").collection("stocks").add({ name: "toto" });

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

      <LinearGradient colors={['#8EC5FC', '#E0C3FC', '#FF8EF7']}>
        <Box style={{ padding: 20 }}>
            <Center>
              <Text fontSize="4xl" style={{fontWeight:"bold", color:"#fff"}}>STOCK TRACKER</Text>
            </Center>
        </Box>
      </LinearGradient>


      <Box style={{display:"flex", justifyContent: "center", marginTop: 20}}>
        <Button style={{"marginRight": 80, marginLeft: 80}} variant="outline" onPress={addStock} colorScheme="secondary">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon as={Ionicons} name="add" color={"purple.900"} size={6}/>
            <Text style={{ fontSize: 16, color: 'purple', fontWeight: 'bold', marginLeft: 3 }}>
              STOCK
            </Text>
          </View>
        </Button>
      </Box>




      {/* <Box>
        <Stack style={{marginRight:50, marginLeft:50, marginTop:40, marginBottom:40}}>
            <FormControl>
              <Input variant="outline" placeholder="Action name" style={{fontSize:26}}/>
            </FormControl>
        </Stack>
      </Box> */}

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
